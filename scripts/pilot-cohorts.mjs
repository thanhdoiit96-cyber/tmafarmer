import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const dayMs=86400000;
const milestones=[1,7,30];
function day(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Ngày phải có dạng YYYY-MM-DD (UTC).');
  const time=Date.parse(value+'T00:00:00Z');
  if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw new Error('Ngày không tồn tại.');
  return time/dayMs;
}

// Input is an explicit research ledger, not inferred from gameplay snapshots.
export function analyzeCohorts(input,asOf){
  const cutoff=day(asOf);
  if(!input||input.schema!==1||!Array.isArray(input.players)||!Array.isArray(input.sessions))throw new Error('Cần schema 1, players và sessions.');
  if(input.players.length>10000||input.sessions.length>100000)throw new Error('Vượt giới hạn dữ liệu pilot.');
  const players=new Map();
  for(const p of input.players){
    if(!p||typeof p.id!=='string'||!/^P\d{2,5}$/.test(p.id)||players.has(p.id))throw new Error('Mã người thử sai hoặc trùng.');
    if(!['online','demo','QA'].includes(p.mode))throw new Error('Mode phải là online, demo hoặc QA.');
    const first=day(p.firstPlay);
    if(first>cutoff)throw new Error('Ngày chơi đầu sau ngày chốt.');
    players.set(p.id,{first,mode:p.mode,dates:new Set()});
  }
  for(const s of input.sessions){
    const p=players.get(s?.id);
    if(!p)throw new Error('Phiên không có người thử đã đăng ký.');
    const date=day(s.date);
    if(date<p.first||date>cutoff)throw new Error('Phiên ngoài khoảng ngày hợp lệ.');
    p.dates.add(date);
  }
  const groups=new Map();let excluded=0;
  for(const p of players.values()){
    if(p.mode!=='online'){excluded++;continue;}
    const key=new Date(p.first*dayMs).toISOString().slice(0,10);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(p);
  }
  return {schema:1,asOf,definition:'Exact UTC day retention; asOf is the last fully observed day.',excluded,
    cohorts:[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([firstPlay,members])=>({firstPlay,players:members.length,
      retention:Object.fromEntries(milestones.map(n=>{
        const eligible=members.filter(p=>p.first+n<=cutoff);
        const returned=eligible.filter(p=>p.dates.has(p.first+n)).length;
        return ['D'+n,{eligible:eligible.length,returned,rate:eligible.length?returned/eligible.length:null}];
      }))}))};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const [source,asOf,output]=process.argv.slice(2);
    if(!source||!asOf||!output)throw new Error('Dùng: node scripts/pilot-cohorts.mjs input.json YYYY-MM-DD output.json');
    const raw=await readFile(source,'utf8');
    if(Buffer.byteLength(raw)>10*1024*1024)throw new Error('Tệp vượt 10 MB.');
    const report=analyzeCohorts(JSON.parse(raw),asOf);
    // Never overwrite source data or an existing report.
    await writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    console.log('Đã xuất báo cáo cohort, không chứa mã người thử.');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
