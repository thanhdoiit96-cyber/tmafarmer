import {plotPosition} from './land.mjs';

export const gardenHelperName='Cô Lan';
export const gardenHelperLimit=12;
export const gardenHelperStart=[234,269];
export const gardenHelperActions={
  water:{label:'Thuê tưới cây',fee:2,work:5},
  harvest:{label:'Thuê thu hoạch',fee:4,work:7},
};
export function gardenHelperPosition(index){
  const {x,y}=plotPosition(index);
  return [x,y+22];
}
export function gardenHelperSchedule(action,indexes,start){
  let from=gardenHelperStart, time=start;
  const steps=indexes.map(index=>{
    const to=gardenHelperPosition(index);
    const travel=Math.max(2,Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/52));
    const arriveAt=time+travel, doneAt=arriveAt+gardenHelperActions[action].work;
    from=to;
    time=doneAt;
    return {index,arriveAt,doneAt};
  });
  return {startedAt:start,endsAt:time,steps};
}
