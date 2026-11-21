import {coopWalkColumns,coopWalkRows} from './coop-layout.mjs';

const keyOf=a=>a.data.id===undefined?'slot:'+a.index:'id:'+a.data.id;
const bird=kind=>['chicken','duck','quail'].includes(kind);
const hash=value=>Array.from(value).reduce((seed,char)=>(Math.imul(seed,31)+char.charCodeAt(0))>>>0,2166136261);
const cellPoint=(side,cell)=>({x:coopWalkColumns[side][cell%4],y:coopWalkRows[Math.floor(cell/4)]});

// Local presentation only. Reserve both ends of each step so animals never
// exchange occupied cells or cut through another animal on a crossing.
export function createCoopHerd(){
  const agents=new Map();let previousTime,clock=0;
  const random=agent=>{agent.seed=(Math.imul(agent.seed,1664525)+1013904223)>>>0;return agent.seed/4294967296;};
  function update(actors,time,{reduced=false,held=new Set()}={}){
    const dt=previousTime===undefined?0:Math.max(0,Math.min(.1,time-previousTime));
    previousTime=time;if(!reduced)clock+=dt;
    const present=new Set(actors.map(keyOf));
    for(const key of agents.keys())if(!present.has(key))agents.delete(key);
    const reserved=[new Set(),new Set()],counts=[0,0];
    for(const agent of agents.values()){
      counts[agent.side]++;reserved[agent.side].add(agent.cell);
      if(agent.trip)for(const cell of agent.trip.cells)reserved[agent.side].add(cell);
    }
    for(const actor of actors){
      const key=keyOf(actor);if(agents.has(key))continue;
      let side=actor.x<240?0:1;if(counts[side]>=8)side=1-side;
      const free=Array.from({length:12},(_,cell)=>cell).filter(cell=>!reserved[side].has(cell));
      free.sort((a,b)=>{
        const pa=cellPoint(side,a),pb=cellPoint(side,b);
        return Math.hypot(pa.x-actor.x,pa.y-actor.y)-Math.hypot(pb.x-actor.x,pb.y-actor.y);
      });
      const cell=free[0];if(cell===undefined)continue;
      const seed=hash(key),point=cellPoint(side,cell);
      agents.set(key,{side,cell,...point,seed,facing:seed%2?1:-1,next:clock+.8+seed%19/5,rest:clock,distance:0,last:-1});
      reserved[side].add(cell);counts[side]++;
    }
    return actors.map(actor=>{
      const agent=agents.get(keyOf(actor));if(!agent)return actor;
      const heldStill=held.has(actor.index)||reduced;
      if(!heldStill&&agent.trip){
        const trip=agent.trip;
        trip.elapsed=Math.min(trip.duration,trip.elapsed+dt);
        const fraction=trip.elapsed/trip.duration,progress=fraction*fraction*(3-2*fraction);
        agent.x=trip.fromX+(trip.toX-trip.fromX)*progress;
        agent.y=trip.fromY+(trip.toY-trip.fromY)*progress;
        if(fraction===1){
          reserved[agent.side].delete(agent.cell);agent.last=agent.cell;agent.cell=trip.to;
          for(const cell of trip.cells)if(cell!==trip.to)reserved[agent.side].delete(cell);
          agent.distance+=trip.length;agent.trip=null;agent.rest=clock;agent.next=clock+1.6+random(agent)*4;
        }
      }
      if(!heldStill&&!agent.trip&&clock>=agent.next){
        const cell=agent.cell,row=Math.floor(cell/4),col=cell%4;
        const choices=[...(col>0?[cell-1]:[]),...(col<3?[cell+1]:[]),...(row>0?[cell-4]:[]),...(row<2?[cell+4]:[])]
          .filter(next=>!reserved[agent.side].has(next)).map(to=>({to,cells:[to]}));
        // Diagonal strolls are allowed only when the entire corner is empty.
        // Reserve that corner too, so another animal cannot cut across it.
        for(const dr of [-1,1])for(const dc of [-1,1]){
          if(row+dr<0||row+dr>2||col+dc<0||col+dc>3)continue;
          const to=cell+dr*4+dc,cells=[to,cell+dr*4,cell+dc];
          if(cells.every(next=>!reserved[agent.side].has(next)))choices.push({to,cells});
        }
        // Prefer a new direction instead of repeatedly undoing the last step.
        const forward=choices.filter(next=>next.to!==agent.last),pool=forward.length?forward:choices;
        if(pool.length){
          const {to,cells}=pool[Math.floor(random(agent)*pool.length)],point=cellPoint(agent.side,to);
          const length=Math.hypot(point.x-agent.x,point.y-agent.y);
          agent.trip={to,cells,fromX:agent.x,fromY:agent.y,toX:point.x,toY:point.y,length,elapsed:0,duration:length/(bird(actor.data.kind)?8.5:6)};
          if(point.x!==agent.x)agent.facing=point.x>agent.x?1:-1;
          for(const cell of cells)reserved[agent.side].add(cell);
        }else agent.next=clock+.5+random(agent)*.6;
      }
      const trip=agent.trip,elapsed=clock-agent.rest;
      const state=heldStill?'idle':trip?'walk':elapsed>.6&&clock<agent.next-.35?(bird(actor.data.kind)?'peck':actor.data.kind==='rabbit'?'idle':'graze'):'idle';
      const fraction=trip?trip.elapsed/trip.duration:0,progress=fraction*fraction*(3-2*fraction);
      return {...actor,x:agent.x,y:agent.y,motion:{offset:0,facing:agent.facing,state,
        distance:agent.distance+(trip?trip.length*progress:0),elapsed:trip?.elapsed??elapsed}};
    });
  }
  return {update};
}
