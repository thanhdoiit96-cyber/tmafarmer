export const playerSpeed=76;
export const playerStride=64;
export const actionPoseSeconds={
  till:.85,plant:.85,water:.8,fertilize:.8,spray:.8,harvest:.85,feed:.85,collect:.8,
  cast:.55,reel:.72,
};

export function fishingBobber(dock){
  if(dock.waterTarget)return {...dock.waterTarget};
  const dx=dock.side==='left'?-36:dock.side==='right'?36:19;
  return {x:dock.x+dx,y:dock.y-(dock.side==='up'?42:0)};
}

export function walkFrame(distance,stride,frames){
  return Math.floor((distance%stride)/stride*frames);
}

export function facingFromDelta(dx,dy){
  return Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
}

const travelTime=3.6;
const pauseTime=2.5;
const turnLength=travelTime+pauseTime;

export function animalMotion(time,index,range,forage='idle'){
  if(time===0)return {offset:0,facing:1,state:'idle',elapsed:0,distance:0};
  const cycle=(time+index*2.73)%(turnLength*2);
  const facing=cycle<turnLength?1:-1;
  const leg=cycle%turnLength;
  if(leg<travelTime){
    // Ease briefly around each stop, then keep an even pace between them.
    const ramp=.35;
    const ease=value=>value*value/(2*ramp);
    let progress=leg-ramp/2;
    if(leg<ramp)progress=ease(leg);
    if(leg>travelTime-ramp)progress=travelTime-ramp-ease(travelTime-leg);
    const distance=range*2*progress/(travelTime-ramp);
    return {offset:facing*(distance-range),facing,state:'walk',elapsed:leg,distance};
  }
  const elapsed=leg-travelTime;
  if(elapsed>=.55&&elapsed<1.9){
    return {offset:facing*range,facing,state:forage,elapsed:elapsed-.55,distance:0};
  }
  return {offset:facing*range,facing,state:'idle',elapsed,distance:0};
}

export function animalPose(motion,stride=9){
  if(motion.state==='walk')return Math.floor(motion.distance/stride*2)%2?'walkA':'walkB';
  if(motion.state==='peck'||motion.state==='graze')return 'feed';
  return 'idle';
}

export function spriteFlip(facing,sourceFacing){
  return facing!==sourceFacing;
}

export function gardenHelperPose(job,paths,time){
  if(!job||time<job.startedAt||time>=job.endsAt)return null;
  const index=job.steps.findIndex(step=>time<step.doneAt);
  const {index:plot,arriveAt}=job.steps[index], path=paths[index];
  const start=index===0?job.startedAt:job.steps[index-1].doneAt;
  if(time>=arriveAt){
    const [x,y]=path.at(-1);
    return {type:'garden-helper',x,y,facing:'up',plot,action:job.action,elapsed:time-arriveAt};
  }
  const lengths=path.slice(1).map(([x,y],i)=>Math.hypot(x-path[i][0],y-path[i][1]));
  const walkDistance=(time-start)/(arriveAt-start)*lengths.reduce((sum,distance)=>sum+distance,0);
  let distance=walkDistance;
  for(const [i,length] of lengths.entries()){
    if(length>0&&distance<=length){
      const [x,y]=path[i], dx=path[i+1][0]-x, dy=path[i+1][1]-y;
      const fraction=distance/length;
      return {type:'garden-helper',x:x+dx*fraction,y:y+dy*fraction,facing:facingFromDelta(dx,dy),walkDistance};
    }
    distance-=length;
  }
  const [x,y]=path.at(-1);
  return {type:'garden-helper',x,y,facing:'up'};
}
