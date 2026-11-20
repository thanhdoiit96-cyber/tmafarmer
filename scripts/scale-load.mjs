import {performance} from 'node:perf_hooks';

const knownProductionHosts=new Set(['tmafarmer.thanhdoi-it96.workers.dev']);
const options={baseUrl:'',users:100,durationSeconds:60,rampSeconds:30,movingPercent:20,actionIntervalSeconds:60,provisionConcurrency:4,failP95Ms:500,max5xxPercent:0.5,confirmStaging:false};
const help=`Usage:
  node scripts/scale-load.mjs --base-url https://<staging-worker>/ --confirm-staging [options]

Options:
  --users N                    Virtual players (1..5000; default 100)
  --duration-seconds N         Steady-load duration after ramp (default 60)
  --ramp-seconds N             Spread virtual player arrivals over this period (default 30)
  --moving-percent N           Players that change position each heartbeat (default 20)
  --action-interval-seconds N  State-writing avatar action interval; 0 disables (default 60)
  --provision-concurrency N    Rooms provisioned concurrently (default 4)
  --help                       Show this help

Each room is filled to at most 12 players. Provisioning creates persistent test rooms,
so use an isolated staging D1 database and discard/recreate it after the run.`;

function readOptions(args){
  for(let i=0;i<args.length;i++){
    const arg=args[i];
    if(arg==='--help'){options.help=true;continue;}
    if(arg==='--confirm-staging'){options.confirmStaging=true;continue;}
    if(!arg.startsWith('--'))throw new Error(`Unexpected argument: ${arg}`);
    const key=arg.slice(2).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
    if(!(key in options))throw new Error(`Unknown option: ${arg}`);
    const value=args[++i];
    if(value===undefined||value.startsWith('--'))throw new Error(`Missing value for ${arg}`);
    options[key]=key==='baseUrl'?value:Number(value);
  }
  return options;
}

function percentile(samples,p){
  if(!samples.length)return null;
  const sorted=[...samples].sort((a,b)=>a-b);
  return Math.round(sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)]*10)/10;
}

function createMetric(){return {requests:0,failures:0,non2xx:0,d1Queries:0,seenDurations:0,seenAppDurations:0,seenD1Durations:0,statuses:{},durations:[],appDurations:[],d1Durations:[]};}
function remember(metric,countKey,samples,value){
  const maximum=50000;
  metric[countKey]++;
  if(samples.length<maximum)samples.push(value);
  else {
    const index=Math.floor(Math.random()*metric[countKey]);
    if(index<maximum)samples[index]=value;
  }
}

function summarize(metric){
  return {
    requests:metric.requests,
    failures:metric.failures,
    non2xx:metric.non2xx,
    statuses:metric.statuses,
    latencyMs:{p50:percentile(metric.durations,.50),p95:percentile(metric.durations,.95),p99:percentile(metric.durations,.99)},
    workerAppMs:{p50:percentile(metric.appDurations,.50),p95:percentile(metric.appDurations,.95),p99:percentile(metric.appDurations,.99)},
    d1:{queries:metric.d1Queries,aggregateQueryMs:{p50:percentile(metric.d1Durations,.50),p95:percentile(metric.d1Durations,.95),p99:percentile(metric.d1Durations,.99)}},
  };
}

async function main(){
  readOptions(process.argv.slice(2));
  if(options.help){process.stdout.write(help+'\n');return;}
  if(!options.baseUrl)throw new Error('--base-url is required.');
  if(!options.confirmStaging)throw new Error('Refusing to run without --confirm-staging. Use an isolated staging Worker and D1 database.');
  const base=new URL(options.baseUrl);
  if(!['http:','https:'].includes(base.protocol)||base.username||base.password)throw new Error('Invalid base URL.');
  if(base.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(base.hostname))throw new Error('Remote load tests must use HTTPS.');
  if(knownProductionHosts.has(base.hostname.toLowerCase()))throw new Error('The configured production Worker is blocked; use an isolated staging deployment.');
  if(!['localhost','127.0.0.1'].includes(base.hostname)&&!base.hostname.split('.').some(label=>label.toLowerCase().includes('staging')))throw new Error('Remote hostnames must visibly contain "staging".');
  if(!Number.isInteger(options.users)||options.users<1||options.users>5000)throw new Error('--users must be an integer from 1 to 5000.');
  if(!Number.isFinite(options.durationSeconds)||options.durationSeconds<1||options.durationSeconds>1800)throw new Error('--duration-seconds must be between 1 and 1800.');
  if(!Number.isFinite(options.rampSeconds)||options.rampSeconds<0||options.rampSeconds>1800)throw new Error('--ramp-seconds must be between 0 and 1800.');
  if(!Number.isFinite(options.movingPercent)||options.movingPercent<0||options.movingPercent>100)throw new Error('--moving-percent must be between 0 and 100.');
  if(!Number.isFinite(options.actionIntervalSeconds)||options.actionIntervalSeconds<0)throw new Error('--action-interval-seconds cannot be negative.');

  const apiUrl=new URL('/api/',base);
  const endpoint=path=>new URL(path,apiUrl);
  async function request(path,session,data){
    const started=performance.now();
    try {
      const response=await fetch(endpoint(path),{
        method:data?'POST':'GET',
        headers:{...(session?{authorization:`Bearer ${session.token}`,'x-room-code':session.code}:{}),...(data?{'content-type':'application/json'}:{})},
        body:data?JSON.stringify(data):undefined,
        signal:AbortSignal.timeout(15000),
      });
      const workerTiming=Number(response.headers.get('server-timing')?.match(/app;dur=([\d.]+)/)?.[1]);
      const d1Timing=Number(response.headers.get('server-timing')?.match(/db;dur=([\d.]+)/)?.[1]);
      const d1Queries=Number(response.headers.get('server-timing')?.match(/dbq;desc="(\d+)"/)?.[1]);
      let payload;
      try{payload=await response.json();}catch{payload={};}
      return {status:response.status,payload,latency:performance.now()-started,workerTiming:Number.isFinite(workerTiming)?workerTiming:null,d1Timing:Number.isFinite(d1Timing)?d1Timing:null,d1Queries:Number.isFinite(d1Queries)?d1Queries:null};
    } catch(error){return {status:0,payload:{error:error.message},latency:performance.now()-started,workerTiming:null,d1Timing:null,d1Queries:null};}
  }

  const health=await request('health');
  if(health.status!==200||health.payload.ok!==true)throw new Error(`Staging health check failed (HTTP ${health.status}).`);
  process.stdout.write(`Provisioning ${options.users} players across ${Math.ceil(options.users/12)} rooms...\n`);
  const players=new Array(options.users);
  const groups=Array.from({length:Math.ceil(options.users/12)},(_,group)=>({group,first:group*12,last:Math.min(options.users,(group+1)*12)}));
  let nextGroup=0;
  const provision=async()=>{
    while(nextGroup<groups.length){
      const group=groups[nextGroup++];
      let code;
      for(let index=group.first;index<group.last;index++){
        const joined=await request('join',undefined,{name:`Load ${String(index+1).padStart(4,'0')}`,...(code?{code}:{})});
        if(joined.status<200||joined.status>=300||!joined.payload.token||!joined.payload.code){
          throw new Error(`Could not provision player ${index+1}: HTTP ${joined.status} ${joined.payload.error??''}`);
        }
        code=joined.payload.code;
        players[index]={token:joined.payload.token,code,index,moving:Math.random()*100<options.movingPercent,x:120+(index%12)*8};
      }
      process.stdout.write(`  prepared ${group.last}/${options.users} players\n`);
    }
  };
  await Promise.all(Array.from({length:Math.min(options.provisionConcurrency,groups.length)},provision));

  const metrics=new Map();
  const total=createMetric();
  function record(path,result){
    const metric=metrics.get(path)??createMetric();
    metrics.set(path,metric);
    for(const bucket of [metric,total]){
      bucket.requests++;
      bucket.statuses[result.status]=(bucket.statuses[result.status]??0)+1;
      if(result.status===0||result.status>=500)bucket.failures++;
      if(result.status<200||result.status>=300)bucket.non2xx++;
      remember(bucket,'seenDurations',bucket.durations,result.latency);
      if(result.workerTiming!==null)remember(bucket,'seenAppDurations',bucket.appDurations,result.workerTiming);
      if(result.d1Timing!==null)remember(bucket,'seenD1Durations',bucket.d1Durations,result.d1Timing);
      if(result.d1Queries!==null)bucket.d1Queries+=result.d1Queries;
    }
  }
  async function measured(path,player,data){
    const result=await request(path,player,data);
    record(path,result);
  }

  const runStart=Date.now(),rampMs=options.rampSeconds*1000;
  const trafficStart=runStart+rampMs,runEnd=trafficStart+options.durationSeconds*1000;
  process.stdout.write(`Ramp ${options.rampSeconds}s, then hold ${options.users} players for ${options.durationSeconds}s...\n`);
  await Promise.all(players.map(async(player,index)=>{
    const arrival=runStart+(rampMs*index/options.users);
    if(arrival>Date.now())await new Promise(resolve=>setTimeout(resolve,arrival-Date.now()));
    let sceneAt=Date.now()+Math.random()*1200;
    let stateAt=Date.now()+Math.random()*4000;
    let actionAt=Date.now()+Math.random()*Math.max(1000,options.actionIntervalSeconds*1000);
    let facing='right',avatar='female';
    while(Date.now()<runEnd){
      const now=Date.now(),tasks=[];
      if(now>=sceneAt){
        if(player.moving){player.x=player.x>=300?120:player.x+2;facing=player.x>=300?'left':'right';}
        tasks.push(measured('scene',player,{area:'field',pose:{x:player.x,y:230,facing,walking:player.moving}}));
        sceneAt=now+1200+Math.random()*180;
      }
      if(now>=stateAt){tasks.push(measured('state',player));stateAt=now+4000+Math.random()*500;}
      if(options.actionIntervalSeconds>0&&now>=actionAt){
        avatar=avatar==='female'?'male':'female';
        tasks.push(measured('action',player,{requestId:crypto.randomUUID(),action:'avatar',item:avatar}));
        actionAt=now+options.actionIntervalSeconds*1000+Math.random()*5000;
      }
      if(tasks.length)await Promise.all(tasks);
      const next=Math.min(sceneAt,stateAt,options.actionIntervalSeconds>0?actionAt:runEnd,runEnd);
      if(next>Date.now())await new Promise(resolve=>setTimeout(resolve,Math.min(next-Date.now(),250)));
    }
  }));

  const elapsedSeconds=(Date.now()-runStart)/1000;
  const result={
    target:{users:options.users,rooms:Math.ceil(options.users/12),movingPercent:options.movingPercent},
    timing:{rampSeconds:options.rampSeconds,steadySeconds:options.durationSeconds,measuredSeconds:Math.round(elapsedSeconds*10)/10},
    requestsPerSecond:Math.round(total.requests/Math.max(elapsedSeconds,1)*10)/10,
    total:summarize(total),
    endpoints:Object.fromEntries([...metrics].map(([path,metric])=>[path,summarize(metric)])),
    criteria:{p95TargetMs:options.failP95Ms,max5xxPercent:options.max5xxPercent},
  };
  const fiveXx=Object.entries(total.statuses).reduce((sum,[status,count])=>sum+(Number(status)>=500?count:0),0);
  const fiveXxPercent=total.requests?fiveXx*100/total.requests:0;
  result.total.serverErrorPercent=Math.round(fiveXxPercent*100)/100;
  result.total.http4xx=Object.entries(total.statuses).reduce((sum,[status,count])=>sum+(Number(status)>=400&&Number(status)<500?count:0),0);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(fiveXxPercent>options.max5xxPercent||(total.statuses['0']??0)>0||result.total.http4xx>0||total.durations.length&&percentile(total.durations,.95)>options.failP95Ms)process.exitCode=1;
}

main().catch(error=>{process.stderr.write(`${error.message}\n\n${help}\n`);process.exitCode=1;});
