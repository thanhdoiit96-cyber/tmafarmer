import {productGoal} from './game.mjs';
export const coopPageSize=6;
export function coopPage(pens,lot,now,{filter='all',page=0,target}={}){
  if(!['all','ready','hungry'].includes(filter))filter='all';
  const status=p=>p.progress>=productGoal(p)?'ready':p.fedUntil<=now?'hungry':'growing';
  const all=pens.map((pen,index)=>({pen,index,status:status(pen)})).filter(e=>e.pen.lot===lot);
  const rank={ready:0,hungry:1,growing:2};
  all.sort((a,b)=>rank[a.status]-rank[b.status]||a.index-b.index);
  if(target!==undefined)filter='all';
  const entries=all.filter(e=>filter==='all'||e.status===filter);
  const count=Math.max(1,Math.ceil(entries.length/coopPageSize));
  const found=target===undefined?-1:entries.findIndex(e=>e.index===target);
  const index=found>=0?Math.floor(found/coopPageSize):Math.min(count-1,Math.max(0,Number.isInteger(page)?page:0));
  return {filter,index,count,total:all.length,ready:all.filter(e=>e.status==='ready').length,hungry:all.filter(e=>e.status==='hungry').length,entries:entries.slice(index*coopPageSize,(index+1)*coopPageSize)};
}
