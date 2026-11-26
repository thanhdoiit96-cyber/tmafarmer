import {animalCondition,animalGrowthRate,animals,growthGoal,productGoal} from './game.mjs';
import {aquatic,pondYield} from './aqua.mjs';

function estimate(effort,ready,rate,fedUntil,now){
  const seconds=ready?0:Math.ceil(effort/rate);
  const feedSeconds=Math.max(0,fedUntil-now);
  return {ready,seconds,rate,feeding:feedSeconds>0,feedSeconds,
    needsMoreFood:!ready&&feedSeconds<seconds};
}
// The input is an already projected snapshot; do not advance clocks twice here.
export function animalOutlook(farm,pen,w,now){
  const def=animals[pen.kind],condition=animalCondition(pen,now);
  const ready=pen.progress>=productGoal(pen);
  const effort=Math.max(0,growthGoal(pen)-pen.age)+Math.max(0,productGoal(pen)-pen.progress);
  return {...estimate(effort,ready,animalGrowthRate(farm,w),pen.fedUntil,now),
    yield:condition.yield,yieldChange:condition.yield/def.yield-1};
}
export function pondOutlook(batch,w,now){
  const def=aquatic[batch.kind],ready=batch.progress>=def.time;
  return {...estimate(Math.max(0,def.time-batch.progress),ready,w.water,batch.fedUntil,now),
    yield:pondYield(batch),yieldChange:0};
}
