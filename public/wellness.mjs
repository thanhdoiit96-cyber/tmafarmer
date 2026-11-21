export const vitals = {
  water:{label:'Nước',icon:'drop',gain:48,cooldown:90,action:'drink'},
  food:{label:'No bụng',icon:'meal',gain:52,cooldown:300,action:'eat'},
  stamina:{label:'Thể lực',icon:'bolt',gain:75,action:'rest'},
};
const costs={
  till:[2,1,5],weed:[2,1,5],plant:[3,2,5], water:[2,1,3], fertilize:[2,2,4], spray:[2,2,4], harvest:[2,2,5],
  feed:[2,2,4],collect:[2,2,4],aquaStock:[3,3,6],aquaFeed:[2,2,4],aquaHarvest:[4,4,9],
  cast:[1,1,3],reel:[1,1,2],steal:[3,3,7],buildLand:[4,4,9],upgrade:[4,4,9],decorate:[2,2,4],
};
const resourceKeys=Object.keys(vitals);
export const restSeconds=60;
const legacyRestGain=46;
export function wellnessAt(farm,time){
  const current=farm.wellness??{water:100,food:100,stamina:100,at:time,until:{},restUntil:0};
  const clone={...current,until:{...current.until}};
  const elapsed=Math.max(0,time-current.at);
  const restRemaining=Math.max(0,(current.restUntil??0)-current.at);
  // Existing saves recorded a stamina cooldown whenever they started a rest.
  const legacyRest=Boolean(current.until?.stamina);
  const idleSeconds=legacyRest?elapsed:Math.max(0,elapsed-restRemaining);
  const gain=restRemaining&&elapsed>=restRemaining?(legacyRest?legacyRestGain:vitals.stamina.gain):0;
  clone.stamina=Math.min(100,current.stamina+idleSeconds/60+gain);
  clone.at=time;
  return clone;
}
export function workCost(action,condition){
  const base=costs[action];
  if(!base)return null;
  const [water,food,stamina]=base;
  return {water:water+(condition==='heat'?1:0),food,stamina};
}
export function workBlock(health,cost,time){
  if(!cost)return null;
  if(health.restUntil>time)return 'Hãy nghỉ xong rồi làm tiếp.';
  const missing=resourceKeys.find(key=>health[key]+1e-7<cost[key]);
  if(missing)return {water:'Bạn đang khát. Hãy uống nước.',food:'Bạn đang đói. Hãy ăn một bữa.',stamina:'Bạn đã mệt. Hãy nghỉ lấy sức.'}[missing];
  return null;
}
export function spendWork(health,cost){
  for(const key of resourceKeys)health[key]=Math.max(0,health[key]-cost[key]);
  return health;
}
