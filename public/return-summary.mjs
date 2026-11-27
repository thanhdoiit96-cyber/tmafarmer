import {capacity,stock} from './game.mjs';
import {farmTasks} from './tasks.mjs';
import {goalStorageKey} from './next-goal.mjs';

export const returnAfter=10*60;
export const visitStorageKey=(snapshot,session)=>goalStorageKey(snapshot,session).replace('mua-vui-goal:1:','mua-vui-visit:1:');
const readyCounts=tasks=>Object.fromEntries(['plot','animal','pond'].map(kind=>[kind,tasks.filter(t=>t.type==='ready'&&t.kind===kind).length]));
export function visitMark(snapshot){
  return {version:1,at:snapshot.now,ready:readyCounts(farmTasks(snapshot))};
}
export function previousVisit(raw,snapshot){
  if(raw?.version!==1||!Number.isFinite(raw.at)||raw.at<0||snapshot.now-raw.at<returnAfter)return null;
  if(!raw.ready||!['plot','animal','pond'].every(k=>Number.isInteger(raw.ready[k])&&raw.ready[k]>=0))return null;
  return {version:1,at:raw.at,ready:{plot:raw.ready.plot,animal:raw.ready.animal,pond:raw.ready.pond}};
}
export function returnSummary(previous,snapshot,goal){
  if(!previous)return null;
  const tasks=farmTasks(snapshot),ready=readyCounts(tasks),total=Object.values(ready).reduce((a,b)=>a+b,0);
  const oldTotal=Object.values(previous.ready).reduce((a,b)=>a+b,0),delta=total-oldTotal;
  const labels=[ready.plot&&ready.plot+' ô cây',ready.animal&&ready.animal+' vật nuôi',ready.pond&&ready.pond+' lứa thủy sản'].filter(Boolean);
  const urgent=tasks.filter(t=>t.type==='urgent').length;
  const free=Math.max(0,capacity(snapshot.me)-stock(snapshot.me));
  return {minutes:Math.max(1,Math.floor((snapshot.now-previous.at)/60)),ready:total,urgent,free,capacity:capacity(snapshot.me),rows:[
    {kind:'tasks',title:total?'Đã sẵn sàng: '+labels.join(', '):'Chưa có vụ hoặc vật nuôi sẵn sàng thu',
      copy:(delta>0?'Tăng '+delta+' mục so với lần ghé trước. ':delta<0?'Giảm '+(-delta)+' mục so với lần ghé trước. ':'')+(urgent?urgent+' việc chăm sóc cần chú ý.':!delta?'Xem trạng thái hiện tại của vườn.':''),cta:'Xem việc cần làm'},
    {kind:'stock',title:free?'Kho còn '+free+' / '+capacity(snapshot.me)+' chỗ':'Kho đã đầy',
      copy:free?'Đủ chỗ nhận hay chưa còn tùy sản lượng từng lượt thu.':'Dọn chỗ hoặc nâng cấp kho trước khi nhận thêm nông sản.',cta:'Mở kho'},
    {kind:'goal',title:goal?'Đang ghim: '+goal.title:'Chọn một mục tiêu để tiếp tục',
      copy:goal?(goal.done?'Mục tiêu đã hoàn thành. Bạn có thể chọn mục tiêu khác.':goal.meta||goal.copy):'Ghim một cấp công trình hoặc theo dõi vòng trồng đầu tiên.',cta:goal?'Tiếp tục mục tiêu':'Chọn mục tiêu'},
  ]};
}
