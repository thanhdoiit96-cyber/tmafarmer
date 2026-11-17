export const playerSpeed=76;
export const playerStride=76;

export function walkFrame(distance,stride,frames){
  return Math.floor((distance%stride)/stride*frames);
}

export function walkPose(distance,stride){
  const phase=(distance%stride)/stride;
  const stance=.62;
  function foot(cycle){
    if(cycle<stance)return {reach:1-2*cycle/stance,lift:0};
    const swing=(cycle-stance)/(1-stance);
    return {reach:-Math.cos(swing*Math.PI),lift:Math.sin(swing*Math.PI)};
  }
  return {left:foot(phase),right:foot((phase+.5)%1),rise:Math.abs(Math.sin(phase*Math.PI*2))};
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

export function spriteFlip(facing,sourceFacing){
  return facing!==sourceFacing;
}
