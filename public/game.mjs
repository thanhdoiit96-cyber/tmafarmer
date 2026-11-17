import {addVillageIncome,advanceVillage,contributeVillage,hasVillageProject,recordVillageTheft,startVillageSecurity,villageLevels,villageSnapshot,villageTheftsLeft} from './village.mjs';
import {atHomeBed} from './home-rules.mjs';
import {restSeconds,spendWork,vitals,wellnessAt,workBlock,workCost} from './wellness.mjs';
import {coopCapacity,cropIndexes,fenceAt,fences,getLand,landTypes,lotCount,lotPrice,plotOffset,pondCapacity,pondIndexes,pondLotKind} from './land.mjs';
import {aquatic, aquaGoods, fishing, fishingState, pondFood, pondReady, pondYield, projectPond, publicCatch} from './aqua.mjs';
export {homesteadSize} from './land.mjs';
export {aquatic, fishing, catchOdds} from './aqua.mjs';

export {advanceVillage,startVillageSecurity};
export const publicFishingLimit=room=>fishing.limit+(hasVillageProject(room,'dock')?2:0);
export const gameDay = 8 * 60 * 60;
export const slotLength = 2 * 60 * 60;
const oldDay = 12 * 60;
const oldSlot = 180;
const shieldDuration = 30 * 60;
export const dryGrowthFactor=.65;
export const supplyLimit=100;
export const soilIdleTime = gameDay;
const postRainTime = 20 * 60;
export const weather = [
  { id:'sun', name:'Nắng nhẹ', icon:'☀️', crop:1, animal:1, water:1, pests:.11, note:'Thời tiết dễ chịu cho cả vườn, chuồng và ao.' },
  { id:'rain', name:'Mưa rào', icon:'🌦️', crop:1.13, animal:.85, water:1.12, pests:.38, wet:true, note:'Mưa tưới cây và làm sâu tăng nhanh. Nguy cơ còn cao 20 phút sau khi tạnh. Cá tôm lớn nhanh hơn.' },
  { id:'cloud', name:'Nhiều mây', icon:'⛅', crop:.93, animal:1.06, water:1.03, pests:.11, note:'Cây lên chậm hơn một chút, vật nuôi dễ chịu.' },
  { id:'heat', name:'Nắng nóng', icon:'🌤️', crop:.74, animal:.72, water:.77, pests:.07, note:'Đất khô và ao ấm lên. Tưới cây, nâng cấp chuồng để giảm tác động của nắng.' },
  { id:'wind', name:'Gió mạnh', icon:'🍃', crop:.90, animal:.95, water:1.08, pests:.08, note:'Gió làm cây lớn chậm hơn, mặt ao nhiều ôxy hơn.' },
  { id:'fog', name:'Sương sớm', icon:'🌫️', crop:.93, animal:.97, water:.92, pests:.20, note:'Sương làm sâu tăng và tỷ lệ cá hiếm ở hồ làng giảm còn 2%.' },
  { id:'storm', name:'Dông lớn', icon:'⛈️', crop:.82, animal:.70, water:.80, pests:.31, wet:true, note:'Mưa tưới cây, cá tôm lớn chậm. Nguy cơ sâu còn cao 20 phút sau khi tạnh. Tạm dừng thả câu mới đến khi hết dông.' },
];
export const goods = {
  wheatSeed: {name:'Giống lúa mì', icon:'🌾', buy:8}, carrotSeed:{name:'Giống cà rốt', icon:'🥕', buy:14},
  cornSeed:{name:'Giống bắp', icon:'🌽', buy:21}, fertilizer:{name:'Phân bón',icon:'🧺',buy:12},
  tomatoSeed:{name:'Giống cà chua',icon:'🍅',buy:24}, sunflowerSeed:{name:'Giống hướng dương',icon:'🌻',buy:28},
  strawberrySeed:{name:'Giống dâu chất lượng cao',icon:'🍓',buy:38}, grapeSeed:{name:'Giống nho chất lượng cao',icon:'🍇',buy:55},
  teaSeed:{name:'Giống trà thượng hạng',icon:'🍵',buy:72},
  truffleSeed:{name:'Giống nấm truffle',icon:'🍄',buy:180},
  spray:{name:'Thuốc trừ sâu',icon:'🧴',buy:9}, feed:{name:'Thức ăn',icon:'🥣',buy:7},
  wheat:{name:'Lúa mì',icon:'🌾',sell:6}, carrot:{name:'Cà rốt',icon:'🥕',sell:10},
  corn:{name:'Bắp',icon:'🌽',sell:15}, tomato:{name:'Cà chua',icon:'🍅',sell:18}, sunflower:{name:'Hướng dương',icon:'🌻',sell:23},
  strawberry:{name:'Dâu chất lượng cao',icon:'🍓',sell:34}, grape:{name:'Nho chất lượng cao',icon:'🍇',sell:48}, tea:{name:'Trà thượng hạng',icon:'🍵',sell:65},
  egg:{name:'Trứng',icon:'🥚',sell:11}, duckEgg:{name:'Trứng vịt',icon:'🪺',sell:16},
  milk:{name:'Sữa',icon:'🥛',sell:22},
  goatMilk:{name:'Sữa dê',icon:'🍼',sell:30}, wool:{name:'Len cừu',icon:'🧶',sell:42},
  pork:{name:'Thịt lợn',icon:'🍖',sell:32}, truffle:{name:'Nấm truffle',icon:'🍄',sell:95},
  bread:{name:'Bánh mì',icon:'🍞'}, carrotJuice:{name:'Nước ép cà rốt',icon:'🥤'}, warmMilk:{name:'Sữa ấm',icon:'🥛'},
  ...aquaGoods,
};
export const crops = {
  wheat:{seed:'wheatSeed', time:8*60, legacy:60, yield:3}, carrot:{seed:'carrotSeed', time:15*60, legacy:110, yield:3},
  corn:{seed:'cornSeed', time:25*60, legacy:175, yield:4},
  tomato:{seed:'tomatoSeed',time:32*60,yield:4,xp:25}, sunflower:{seed:'sunflowerSeed',time:38*60,yield:4,xp:50},
  strawberry:{seed:'strawberrySeed',time:45*60,yield:5,workshop:1,quality:true},
  grape:{seed:'grapeSeed',time:60*60,yield:5,workshop:2,quality:true},
  tea:{seed:'teaSeed',time:75*60,yield:6,workshop:3,quality:true},
  truffle:{seed:'truffleSeed',time:120*60,yield:3,workshop:3,xp:350,quality:true},
};
export const animals = {
  chicken:{name:'Gà mái',icon:'🐔',cost:35, grow:20*60, time:15*60,legacy:70, product:'egg', yield:3, food:1, level:1},
  duck:{name:'Vịt',icon:'🦆',cost:48,grow:28*60,time:20*60,product:'duckEgg',yield:3,food:1,level:1,xp:20},
  cow:{name:'Bò sữa',icon:'🐄',cost:65, grow:45*60, time:30*60,legacy:125, product:'milk', yield:3, food:2, level:2},
  pig:{name:'Lợn',icon:'🐖',cost:90, grow:60*60, time:40*60, product:'pork', yield:4, food:2, level:2, oneTime:true},
  goat:{name:'Dê sữa',icon:'🐐',cost:110,grow:55*60,time:35*60,product:'goatMilk',yield:3,food:2,level:2,xp:70},
  sheep:{name:'Cừu',icon:'🐑',cost:145,grow:70*60,time:50*60,product:'wool',yield:2,food:3,level:3,xp:130},
};
export const recipes={
  bread:{level:1,ingredients:{wheat:2},gain:{stamina:22,food:28}},
  carrotJuice:{level:1,ingredients:{carrot:2},gain:{stamina:18,water:32}},
  warmMilk:{level:2,ingredients:{milk:1},gain:{stamina:32,food:18}},
};
export const mealCooldown=90;
export function craftRequirement(farm,item){
  const recipe=Object.hasOwn(recipes,item)&&recipes[item];
  if(!recipe)return 'Công thức không tồn tại.';
  if((farm.workshop??0)<recipe.level)return 'Cần Xưởng máy cấp '+recipe.level+'.';
  if(Object.entries(recipe.ingredients).some(([key,count])=>own(farm,key)<count))return 'Chưa đủ nguyên liệu.';
  if(own(farm,item)>=supplyLimit)return 'Túi đã đầy món này.';
  return '';
}
export function mealRequirement(farm,item,health,now){
  const recipe=Object.hasOwn(recipes,item)&&recipes[item];
  if(!recipe||own(farm,item)<1)return 'Bạn chưa có món này.';
  if(health.restUntil>now)return 'Hãy nghỉ xong trước khi dùng.';
  if((health.until.meal??0)>now)return 'Hãy chờ đến lượt ăn uống tiếp theo.';
  if(Object.keys(recipe.gain).every(key=>health[key]>=100))return 'Các chỉ số món này phục hồi đều đã đầy.';
  return '';
}
export const buildings = {
  field:{name:'Ruộng',icon:'🌱',costs:[50,105],notes:['6 ô đất','9 ô đất','12 ô đất']},
  coop:{name:'Chuồng',icon:'🏡',costs:[45,80,145],notes:['Chưa xây','2 gà mái','Tối đa 4 con · mở bò và lợn · che nắng','Tối đa 6 con']},
  barn:{name:'Kho',icon:'📦',costs:[50,110],notes:['30 nông sản','55 nông sản','90 nông sản']},
  fence:{name:'Hàng rào',icon:'🪵',costs:[40],notes:['Có thể mất 3 món/ngày','Có thể mất 2 món/ngày']},
  bag:{name:'Túi ghé vườn',icon:'🎒',costs:[55,110],notes:['2 món/ngày','4 món/ngày','6 món/ngày']},
  workshop:{name:'Xưởng máy',icon:'⚙️',base:0,costs:[120,260,520],xp:[40,100,180],notes:['Chưa xây · cần 40 XP','Cấp 1 · chế biến đồ ăn, mở dâu','Cấp 2 · mở sữa ấm và nho','Cấp 3 · mở trà và giống nấm truffle']},
};
export function cropRequirement(farm,key){
  const crop=crops[key];
  if(!crop)return 'Cây trồng không tồn tại.';
  if((farm.workshop??0)<(crop.workshop??0))return 'Cần Xưởng máy cấp '+crop.workshop+'.';
  if((farm.xp??0)<(crop.xp??0))return 'Cần '+crop.xp+' XP.';
  return '';
}
export function animalRequirement(farm,key,lot){
  const animal=animals[key];
  if(!animal)return 'Vật nuôi không tồn tại.';
  const level=lot===undefined?farm.coop:Math.max(1,farm.coop);
  if(level<animal.level)return 'Cần chuồng cấp '+animal.level+'.';
  if((farm.xp??0)<(animal.xp??0))return 'Cần '+animal.xp+' XP.';
  return '';
}
export function upgradeRequirement(farm,key){
  const definition=buildings[key],level=farm[key]??definition?.base??1;
  const needed=definition?.xp?.[level];
  return needed&&(farm.xp??0)<needed?'Cần '+needed+' XP.':'';
}
export const unixNow = () => Math.floor(Date.now() / 1000);
const oldSequence=[0,1,2,3,1,0,3,2,0,3,1,2,3,2,1,0];
const sequence=[0,1,4,5,2,0,3,6,5,0,2,1,4,3,0,2,1,6,4,0,2,5,3,4];
export function upgradeCalendar(room,time) {
  if(room.longDays||room.longDayStart!==undefined)return false;
  room.longDayStart=time;
  for(const farm of Object.values(room.farms)){
    farm.ponds??={0:[]};
    for(const [item,count] of Object.entries({tilapiaSeed:1,prawnSeed:1,aquaFeed:3})){
      farm.inventory[item]??=count;
    }
  }
  return true;
}
function schedule(room,time) {
  if(room.longDays)return {anchor:room.created,base:0,dayLength:gameDay,slot:slotLength,sequence};
  const rolloutAt=room.longDayStart;
  if(rolloutAt===undefined||time<rolloutAt)return {anchor:room.created,base:0,dayLength:oldDay,slot:oldSlot,sequence:oldSequence};
  return {anchor:rolloutAt,base:Math.max(0,Math.floor((rolloutAt-room.created)/oldDay)),dayLength:gameDay,slot:slotLength,sequence};
}
export function weatherAt(room,time) {
  const plan=schedule(room,time);
  const index=Math.floor(Math.max(0,time-plan.anchor)/plan.slot)+(room.weatherOffset??0);
  return weather[plan.sequence[index%plan.sequence.length]];
}
export function dayAt(room,time) {
  const plan=schedule(room,time);
  return plan.base+Math.floor(Math.max(0,time-plan.anchor)/plan.dayLength);
}
function nextSlot(room,time) {
  const plan=schedule(room,time);
  const edge=plan.anchor+(Math.floor(Math.max(0,time-plan.anchor)/plan.slot)+1)*plan.slot;
  return !room.longDays&&room.longDayStart>time?Math.min(room.longDayStart,edge):edge;
}
function afterRainUntil(room,time){
  if(weatherAt(room,time).wet)return 0;
  const plan=schedule(room,time);
  const edge=plan.anchor+Math.floor(Math.max(0,time-plan.anchor)/plan.slot)*plan.slot;
  if(edge<=room.created||time>=edge+postRainTime||!weatherAt(room,edge-1).wet)return 0;
  return edge+postRainTime;
}
export function startSoilClock(room,time){
  if(room.soilSince!==undefined)return false;
  room.soilSince=time;
  return true;
}
function compactAt(room,farm,index,time){
  return (farm.soilAt?.[index]??farm.soilSince??room.soilSince??time)+soilIdleTime;
}
function setSoilTime(farm,index,time){
  (farm.soilAt??={})[index]=time;
}
export const capacity = (farm) => [30,55,90][farm.barn-1];
export const stock = (farm) => Object.keys(goods).filter(key=>goods[key].sell).reduce((sum,key)=>sum+(farm.inventory[key]||0),0);
export const has = (obj, key) => Object.hasOwn(obj, key);
export function newFarm(id, name, time) {
  return {
    id, name, soilSince:time, coins:100, xp:0, field:1, barn:1, coop:0, fence:0, bag:1, workshop:0, shieldUntil:0,
    inventory:{wheatSeed:5,carrotSeed:2,cornSeed:1,fertilizer:2,spray:1,feed:3,tilapiaSeed:1,prawnSeed:1,aquaFeed:3},
    plots:Array.from({length:6},()=>null), extraPlots:{}, pens:[], ponds:{0:[]}, land:getLand({}), decor:{}, daily:{day:-1,taken:0,lost:0,targets:[]},
    log:[{time, message:'Vườn mới đã sẵn sàng để gieo hạt.'}], recent:[],
  };
}
export function newRoom(time) {
  return { created:time, soilSince:time, securityStartDay:0, longDays:true, weatherOffset:0, farms:{}, listings:{}, nextListing:1 };
}
function eachWeather(room, from, to, visit) {
  for (let t=Math.max(from, to-4*gameDay);t<to;) {
    const next=Math.min(to,nextSlot(room,t));
    visit(weatherAt(room,t),t,next);
    t=next;
  }
}
export const cropGoal=plot=>plot.goal??crops[plot.kind].legacy??crops[plot.kind].time;
export const growthGoal=pen=>pen.growGoal??animals[pen.kind].legacy??animals[pen.kind].grow;
export const productGoal=pen=>pen.productGoal??animals[pen.kind].legacy??animals[pen.kind].time;
export function projectPlot(room, plot, now) {
  if (!plot) return null;
  const result={...plot};
  if (result.progress>=cropGoal(plot)) return result;
  eachWeather(room,plot.at,now,(w,from,to)=>{
    const goal=cropGoal(plot);
    if(result.progress>=goal) return;
    const dampUntil=afterRainUntil(room,from);
    for(let t=from;t<to&&result.progress<goal;) {
      const wet=w.wet||t<plot.wetUntil;
      const exposed=t>=(plot.protectedUntil??0);
      const damp=t<dampUntil;
      const pestRate=(damp?Math.max(.44,w.pests):w.pests)*120/goal;
      const rate=w.crop*(wet?1.38:dryGrowthFactor)*(result.pests>=40?.68:1)*(plot.fertilized?1.3:1);
      const end=Math.min(to,t<plot.wetUntil?plot.wetUntil:to,t<plot.protectedUntil?plot.protectedUntil:to,damp?dampUntil:to);
      const pestThreshold=exposed&&result.pests<40?(40-result.pests)/pestRate:Infinity;
      const duration=Math.min(end-t,pestThreshold,(goal-result.progress)/rate);
      if(duration<=1e-8) {
        if(pestThreshold<=1e-8) result.pests=40;
        else result.progress=goal;
        continue;
      }
      result.progress=duration===(goal-result.progress)/rate?goal:result.progress+duration*rate;
      if(exposed) result.pests=duration===pestThreshold?40:Math.min(90,result.pests+duration*pestRate);
      t+=duration;
    }
  });
  result.pestPeak=Math.max(plot.pestPeak??0,result.pests);
  result.at=now;
  return result;
}
export function projectAnimal(room, farm, pen, now) {
  const result={...pen};
  if (pen.fedUntil>pen.at) {
    eachWeather(room,pen.at,Math.min(now,pen.fedUntil),(w,from,to)=>{
      const grow=growthGoal(pen), production=productGoal(pen);
      const shade=farm.coop>=2?Math.max(.95,w.animal):w.animal;
      const rate=shade*(w.wet&&farm.coop===1?.95:1);
      const effort=(to-from)*rate;
      if(result.age<grow) {
        const mature=Math.min(effort,grow-result.age);
        result.age+=mature;
        result.progress+=effort-mature;
      } else {
        result.progress+=effort;
      }
      result.progress=Math.min(production,result.progress);
    });
  }
  result.at=now;
  return result;
}
export function orderList(day) {
  const variants=[
    [['wheat',4,36],['carrot',3,45],['egg',2,34]],
    [['carrot',4,56],['corn',3,62],['egg',3,48]],
    [['wheat',5,43],['corn',3,64],['milk',2,60]],
    [['carrot',3,45],['egg',2,34],['pork',2,101]],
  ];
  const daily=variants[day%variants.length].map(([item,qty,reward],slot)=>({
    items:[{item,qty}],reward,xp:15,id:day*3+slot,slot:day*3+slot,
  }));
  if(day%3===2){
    const baskets=[
      {title:'Giỏ cá đồng',items:[{item:'minnow',qty:4},{item:'wheat',qty:4}],reward:52},
      {title:'Giỏ bữa sáng',items:[{item:'egg',qty:3},{item:'carrot',qty:3}],reward:105},
      {title:'Giỏ bữa xế',items:[{item:'milk',qty:2},{item:'corn',qty:3}],reward:145},
    ];
    daily[2]={...baskets[Math.floor(day/3)%baskets.length],xp:24,id:-(day+1),slot:day*3+2};
  }
  return daily;
}
function townOrdersAt(room,day){
  if(room.townOrders?.day===day)return room.townOrders;
  const legacy=Object.values(room.farms).flatMap(farm=>farm.orders?.day===day?farm.orders.done:[]);
  return {day,done:[...new Set(legacy.map(slot=>day*3+slot))]};
}
export function dailyAt(room,farm,time) {
  const day=dayAt(room,time);
  return farm.daily.day===day?farm.daily:{day,taken:0,lost:0,targets:[]};
}
const fail = message => { throw new GameError(message); };
export class GameError extends Error {}
const check = (condition,message) => { if(!condition) fail(message); };
const own = (farm,key) => farm.inventory[key]||0;
const add = (farm,key,qty) => { farm.inventory[key]=own(farm,key)+qty; };
const spend = (farm,amount) => {
  check(farm.coins>=amount,'Bạn chưa đủ xu.');
  farm.coins-=amount;
};
const use = (farm,key,qty=1) => {
  check(own(farm,key)>=qty,'Bạn chưa có đủ vật phẩm.');
  add(farm,key,-qty);
};
const roomFor = (farm,qty) => check(stock(farm)+qty<=capacity(farm),'Kho đầy. Hãy bán hàng hoặc nâng cấp kho.');
function record(farm,time,message) {
  farm.log.unshift({time,message});
  farm.log=farm.log.slice(0,14);
}
export function cropYield(plot) {
  const normal=crops[plot.kind].yield+Number(!!plot.fertilized);
  const damage=Math.max(plot.pestPeak??0,plot.pests??0);
  const lost=damage>=70?Math.ceil(normal*.60):damage>=40?Math.ceil(normal*.35):damage>=20?1:0;
  return Math.max(1,normal-lost);
}
function candidates(farm) {
  return Object.entries(goods).filter(([item,info])=>info.sell&&own(farm,item)>=4).map(([key])=>key);
}
const projectBatch=(room,batch,time)=>projectPond(batch,time,(from,to,project)=>eachWeather(room,from,to,project));
const storedBatches=entry=>Array.isArray(entry)?entry:entry?[entry]:[];
const pondIndex=index=>index===1?0:index;
function pondsAt(room,farm,time){
  return Object.fromEntries(pondIndexes(farm).map(index=>{
    const batches=storedBatches(farm.ponds?.[index]);
    const merged=index===0?[...batches,...storedBatches(farm.ponds?.[1])]:batches;
    return [index,merged.map(batch=>projectBatch(room,batch,time))];
  }));
}
const plotAt=(farm,index)=>index<12?farm.plots[index]:farm.extraPlots?.[index];
function savePlot(farm,index,plot){
  if(index<12)farm.plots[index]=plot;
  else (farm.extraPlots??={})[index]=plot;
}
function penLevel(farm,pen){return pen.lot===undefined?farm.coop:Math.max(1,farm.coop);}
function projectedPen(room,farm,pen,time){return projectAnimal(room,{coop:penLevel(farm,pen)},pen,time);}
const penId=(pen,index)=>pen.id??index;

const canCatch=batch=>batch.kind!=='prawn'&&pondReady(batch)&&pondYield(batch)>=3;
function theftAccess(room,farm,other,mine,theirs,time){
  if(villageTheftsLeft(room,mine.day)<1)return 'Đã chạm giới hạn vụ trộm của cả làng hôm nay.';
  if(other.shieldUntil>time)return 'Vườn đang đóng cổng.';
  if(mine.taken>=farm.bag*2)return 'Bạn đã hết lượt ghé lấy hôm nay.';
  if(mine.targets.includes(other.id))return 'Bạn đã lấy một món ở vườn này hôm nay.';
  if(theirs.lost>=3-other.fence)return 'Vườn này đã đạt giới hạn bị lấy hôm nay.';
  return '';
}
function theftCheck(room,farm,other,time){
  const mine=dailyAt(room,farm,time), theirs=dailyAt(room,other,time);
  const denied=theftAccess(room,farm,other,mine,theirs,time);
  check(!denied,denied);
  roomFor(farm,1);
  return {mine,theirs};
}
function takeFrom(room,farm,other,product,place,time,{mine,theirs}){
  recordVillageTheft(room,mine.day);
  add(farm,product,1);
  mine.taken++;mine.targets.push(other.id);theirs.lost++;
  farm.daily=mine;other.daily=theirs;
  record(other,time,farm.name+' đã lấy 1 '+goods[product].name.toLowerCase()+' ở '+place+'.');
  record(farm,time,'Đã lấy 1 '+goods[product].name.toLowerCase()+' từ vườn '+other.name+'.');
  return 'Lấy được 1 '+goods[product].name.toLowerCase()+'!';
}
function wealthRanking(room){
  const escrow={};
  for(const entry of Object.values(room.listings)){
    escrow[entry.seller]=(escrow[entry.seller]??0)+(goods[entry.item]?.sell??0)*entry.qty;
  }
  return Object.values(room.farms).map(farm=>{
    const inventory=Object.entries(farm.inventory).reduce((sum,[key,qty])=>sum+qty*(goods[key]?.sell??goods[key]?.buy??0),0)+(escrow[farm.id]??0);
    const specs=Object.entries(buildings).reduce((sum,[key,info])=>{
      const improvements=(farm[key]??info.base??1)-(info.base??(key==='fence'||key==='coop'?0:1));
      return sum+info.costs.slice(0,Math.max(0,improvements)).reduce((a,b)=>a+b,0);
    },0);
    const lots=getLand(farm).filter(Boolean);
    const extra=lots.reduce((sum,lot)=>sum+(landTypes[lot.kind]?.cost??0)+(fences[lot.fence]?.cost??0),0);
    const land=lots.slice(2).reduce((sum,_,i)=>sum+lotPrice(i+2),0);
    const decorations=Object.values(farm.decor??{}).reduce((sum,style)=>sum+(fences[style]?.cost??0),0);
    const livestock=farm.pens.reduce((sum,pen)=>sum+animals[pen.kind].cost,0);
    const property=specs+extra+land+decorations+livestock;
    return {id:farm.id,name:farm.name,coins:farm.coins,inventory,property,total:farm.coins+inventory+property};
  }).sort((a,b)=>b.total-a.total||b.coins-a.coins||a.id.localeCompare(b.id));
}
export const dayGoals=[
  {id:'care',label:'Chăm cây',actions:['till','plant','water','fertilize','spray'],area:'field'},
  {id:'gather',label:'Thu hoạch hay lấy sản phẩm',actions:['harvest','collect','aquaHarvest'],panel:'tasks'},
  {id:'market',label:'Bán nông sản hoặc giao đơn',actions:['sell','order'],area:'market'},
];
export const dayReward={coins:25,xp:8};
const journalAt=(farm,day)=>farm.journal?.day===day?farm.journal:{day,done:[],claimed:false};

export function snapshot(room, farm, time) {
  const day=dayAt(room,time);
  const plan=schedule(room,time);
  const next=nextSlot(room,time);
  const dayEnds=plan.anchor+(day-plan.base+1)*plan.dayLength;
  const plots=cropIndexes(farm);
  const pondBatches=pondsAt(room,farm,time);
  const me={...farm,wellness:wellnessAt(farm,time),plots:farm.plots.map(p=>projectPlot(room,p,time)),pens:farm.pens.map((p,i)=>({...projectedPen(room,farm,p,time),id:penId(p,i)})),
    land:getLand(farm), plotIndexes:plots, pondIndexes:pondIndexes(farm),
    soilCompactsAt:Object.fromEntries(plots.filter(i=>!plotAt(farm,i)).map(i=>[i,compactAt(room,farm,i,time)])),
    extraPlots:Object.fromEntries(plots.filter(i=>i>=12).map(i=>[i,projectPlot(room,plotAt(farm,i),time)])),
    ponds:Object.fromEntries(Object.entries(pondBatches).map(([i,batches])=>[i,batches[0]??null])),
    pondBatches, fishing:fishingState(farm,day,time),
    journal:journalAt(farm,day),daily:dailyAt(room,farm,time)};
  delete me.recent;
  delete me.orders;
  delete me.soilAt;
  delete me.soilSince;
  const fulfilled=townOrdersAt(room,day);
  const wealth=wealthRanking(room);
  const wealthByFarm=new Map(wealth.map(entry=>[entry.id,entry.total]));
  return {me,day,now:time,weather:weatherAt(room,time),forecast:weatherAt(room,next),next,afterRainUntil:afterRainUntil(room,time),
    dayEnds, dayLength:plan.dayLength, wealth,
    orders:orderList(day).filter(order=>!fulfilled.done.includes(order.slot)), nextOrders:orderList(day+1),
    village:{...villageSnapshot(room,day),theftsLeft:villageTheftsLeft(room,day)},
    fishingLimit:publicFishingLimit(room),
    listings:Object.values(room.listings).map(listing=>({...listing,sellerName:room.farms[listing.seller].name})),
    neighbors:Object.values(room.farms).filter(f=>f.id!==farm.id).map(f=>{
      const items=candidates(f);
      const publicPlot=i=>{
        const p=projectPlot(room,plotAt(f,i),time);
        return p?{kind:p.kind,ripe:p.progress>=cropGoal(p),available:p.progress>=cropGoal(p)&&cropYield(p)-(p.picked||0)>=3}:null;
      };
      const plots=f.plots.map((_,i)=>publicPlot(i));
      const extraPlots=Object.fromEntries(cropIndexes(f).filter(i=>i>=12).map(i=>[i,publicPlot(i)]));
      const garden=cropIndexes(f).flatMap(index=>{
        const p=index<12?plots[index]:extraPlots[index];
        return p?.available?[{kind:p.kind,index}]:[];
      });
      const pondBatches=Object.fromEntries(Object.entries(pondsAt(room,f,time)).map(([i,batches])=>[i,batches.map(batch=>({
        kind:batch.kind,ripe:pondReady(batch),available:canCatch(batch),
      }))]));
      const ponds=Object.fromEntries(Object.entries(pondBatches).map(([i,batches])=>[i,batches.find(batch=>batch.available)??batches[0]??null]));
      return {ponds,pondBatches,land:getLand(f),decor:f.decor,plots,extraPlots,plotIndexes:cropIndexes(f),pondIndexes:pondIndexes(f),wealth:wealthByFarm.get(f.id)??0,
        visiblePens:f.pens.map(p=>{
          const pen=projectedPen(room,f,p,time);
          return {kind:pen.kind,lot:pen.lot,age:pen.age,growGoal:growthGoal(pen)};
        }),id:f.id,name:f.name,field:f.field,coop:f.coop,workshop:f.workshop??0,fence:f.fence,shieldUntil:f.shieldUntil,garden,items,animalCount:f.pens.length,
        available:Math.max(0,3-f.fence-dailyAt(room,f,time).lost)};
    })};
}
export function apply(room,id,input,now,catchRoll=0.5,location){
  const farm=room.farms[id], health=wellnessAt(farm,now);
  if(input.action==='consume'){
    const reason=mealRequirement(farm,input.item,health,now);
    check(!reason,reason);
    use(farm,input.item);
    for(const [key,gain] of Object.entries(recipes[input.item].gain))health[key]=Math.min(100,health[key]+gain);
    health.until.meal=now+mealCooldown;
    farm.wellness=health;
    return 'Đã dùng '+goods[input.item].name.toLowerCase()+'.';
  }
  const recovery=Object.keys(vitals).find(key=>vitals[key].action===input.action);
  if(recovery){
    const info=vitals[recovery];
    if(recovery==='stamina')check(atHomeBed(location),'Hãy về nhà vườn và tới gần giường để nghỉ.');
    check((health.until[recovery]??0)<=now,'Bạn vừa hồi phục. Hãy chờ một chút.');
    check(health[recovery]<99,'Chỉ số này đã đầy.');
    if(recovery==='stamina'){
      health.restUntil=now+restSeconds;
    } else {
      health[recovery]=Math.min(100,health[recovery]+info.gain);
    }
    health.until[recovery]=now+info.cooldown;
    farm.wellness=health;
    return {water:'Đã uống nước.',food:'Đã ăn cơm nắm.',stamina:'Đang nghỉ 30 giây để hồi thể lực.'}[recovery];
  }
  const cost=workCost(input.action,weatherAt(room,now).id);
  const blocked=workBlock(health,cost,now);
  check(!blocked,blocked);
  const day=dayAt(room,now);
  if(input.action==='claimDay'){
    const journal=journalAt(farm,day);
    check(dayGoals.every(goal=>journal.done.includes(goal.id)),'Hãy hoàn thành các việc trong sổ trước.');
    check(!journal.claimed,'Bạn đã nhận phần thưởng hôm nay.');
    journal.claimed=true;
    farm.journal=journal;
    farm.coins+=dayReward.coins;
    farm.xp+=dayReward.xp;
    return 'Đã nhận '+dayReward.coins+' xu và '+dayReward.xp+' XP từ Sổ việc hôm nay.';
  }
  const message=applyAction(room,id,input,now,catchRoll);
  const goal=dayGoals.find(entry=>entry.actions.includes(input.action));
  if(goal){
    const journal=journalAt(farm,day);
    if(!journal.done.includes(goal.id))journal.done.push(goal.id);
    farm.journal=journal;
  }
  if(cost)farm.wellness=spendWork(health,cost);
  return advanceVillage(room,day)?message+' Cả làng đã lên cấp '+villageLevels[room.village.level]+'!':message;
}
function applyAction(room,id,input,now,catchRoll){
  const farm=room.farms[id];
  const {action,item,index,target,source}=input;
  const qty=input.qty??1;
  const quantityLimit=action==='sell'?Infinity:action==='buy'?supplyLimit:20;
  check(Number.isSafeInteger(qty)&&qty>=1&&qty<=quantityLimit,'Số lượng không hợp lệ.');
  if(action==='craft'){
    const reason=craftRequirement(farm,item);
    check(!reason,reason);
    check(qty===1,'Chỉ chế biến một phần mỗi lượt.');
    for(const [key,count] of Object.entries(recipes[item].ingredients))use(farm,key,count);
    add(farm,item,1);
    return 'Đã làm '+goods[item].name.toLowerCase()+'.';
  }
  if(action==='villageFund'){
    const result=contributeVillage(room,farm,item,input.amount);
    check(!result.error,result.error);
    record(farm,now,result.message);
    return result.message;
  }
  if(action==='seedFromCrop'){
    check(has(crops,item),'Chỉ có thể giữ giống từ cây trồng.');
    const seed=crops[item].seed;
    check(own(farm,seed)+qty<=100,'Túi đã đầy giống này.');
    use(farm,item,qty);
    add(farm,seed,qty);
    return 'Đã giữ '+qty+' '+goods[seed].name.toLowerCase()+' để gieo lại.';
  }
  if(action==='buyLand'||action==='buildLand'||action==='decorate'){
    const land=getLand(farm);
    const inGrid=Number.isInteger(index)&&index>=0&&index<lotCount;
    if(action==='decorate'){
      check((inGrid&&land[index]&&land[index].kind!=='empty')||[-1,-2,-3].includes(index)||index===-4&&farm.coop>0,'Hãy chọn công trình đã xây.');
      check(has(fences,item)||item==='none','Kiểu hàng rào không tồn tại.');
      const holder=inGrid?land[index]:(farm.decor??={});
      const key=inGrid?'fence':index===-3?-2:index;
      const previous=inGrid?holder.fence:fenceAt(farm,key);
      check(item==='none'?!!previous:previous!==item,'Hãy chọn kiểu hàng rào khác.');
      if(item==='none')delete holder[key];
      else {spend(farm,fences[item].cost);holder[key]=item;}
      if(key===-2)delete holder[-3];
      farm.land=land;
      return item==='none'?'Đã gỡ hàng rào trang trí.':'Đã đặt hàng rào '+fences[item].name.toLowerCase()+'.';
    }
    check(inGrid,'Ô đất không tồn tại.');
    if(action==='buyLand'){
      check(!land[index],'Bạn đã sở hữu ô này.');
      spend(farm,lotPrice(land.filter(Boolean).length));
      land[index]={kind:'empty'};farm.land=land;
      return 'Đã mua ô đất '+(index+1)+'.';
    }
    const kind=pondLotKind(item);
    check(land[index]?.kind==='empty'&&has(landTypes,kind),'Hãy chọn ô đất trống đã mua và loại công trình.');
    spend(farm,landTypes[kind].cost);
    land[index]={kind};farm.land=land;
    if(kind==='garden'){
      const first=plotOffset+index*3;
      for(let plot=first;plot<first+3;plot++)setSoilTime(farm,plot,now);
    }
    record(farm,now,'Đã xây '+landTypes[kind].name.toLowerCase()+' ở ô đất '+(index+1)+'.');
    return 'Đã xây '+landTypes[kind].name.toLowerCase()+'.';
  }
  if(action==='aquaStock'||action==='aquaFeed'||action==='aquaHarvest'){
    const key=pondIndex(index);
    const capacity=pondCapacity(farm,key);
    check(capacity,'Ao không tồn tại.');
    const ponds=pondsAt(room,farm,now);
    const batches=ponds[key];
    if(action==='aquaStock'){
      check(has(aquatic,item),'Con giống không hợp lệ.');
      check(!batches.some(batch=>batch.kind===item),'Hãy thu hoạch lứa này trước khi thả giống cùng loài.');
      const used=batches.reduce((sum,batch)=>sum+batch.count,0);
      check(used+qty<=capacity,'Ao chỉ còn '+Math.max(0,capacity-used)+' chỗ thả giống.');
      use(farm,aquatic[item].seed,qty);
      batches.push({kind:item,count:qty,at:now,progress:0,fedUntil:0,picked:0});
      farm.ponds=ponds;
      return 'Đã thả '+qty+' '+goods[aquatic[item].seed].name.toLowerCase()+' vào ao.';
    }
    check(batches.length,'Ao này chưa thả giống.');
    const batch=item?batches.find(batch=>batch.kind===item):batches.length===1?batches[0]:null;
    check(batch,'Hãy chọn lứa cá hoặc tôm cần chăm.');
    const def=aquatic[batch.kind];
    if(action==='aquaFeed'){
      check(!pondReady(batch)&&batch.fedUntil<=now,'Ao đang còn thức ăn hoặc đã tới kỳ thu hoạch.');
      use(farm,'aquaFeed',pondFood(batch));
      batch.fedUntil=now+Math.ceil(def.time*1.5);
      farm.ponds=ponds;
      return 'Đã cho cá tôm ăn.';
    }
    check(pondReady(batch),'Cá tôm chưa đủ lớn.');
    const amount=pondYield(batch);
    roomFor(farm,amount);
    add(farm,batch.kind,amount);
    ponds[key]=batches.filter(row=>row!==batch);farm.ponds=ponds;farm.xp+=6;
    record(farm,now,'Thu hoạch '+amount+' '+goods[batch.kind].name.toLowerCase()+' từ ao.');
    return 'Thu được '+amount+' '+goods[batch.kind].name.toLowerCase()+'.';
  }
  if(action==='cast'||action==='reel'){
    const day=dayAt(room,now), info=fishingState(farm,day,now);
    if(action==='cast'){
      check(!info.cast,'Bạn còn một lượt thả câu đang chờ.');
      const sky=weatherAt(room,now);
      check(sky.id!=='storm','Đang có dông. Hãy chờ hết dông rồi thả câu.');
      let fish;
      if(source==='public'){
        check(info.nextAt<=now,'Hãy chờ hồi lượt ở hồ làng.');
        check(info.used<publicFishingLimit(room),'Đã hết lượt câu hồ làng hôm nay.');
        roomFor(farm,1);
      } else {
        check(source==='pond'&&target!==id&&has(room.farms,target),'Điểm câu không hợp lệ.');
        const owner=room.farms[target];
        theftCheck(room,farm,owner,now);
        fish=Number.isInteger(index)&&pondsAt(room,owner,now)[pondIndex(index)]?.find(canCatch);
        check(fish,'Ao chưa có cá đủ lớn để câu.');
      }
      const ready=now+fishing.wait;
      const cast={source,ready,expires:ready+fishing.window};
      if(source==='public')cast.weather=sky.id;
      else {cast.target=target;cast.index=pondIndex(index);cast.item=fish.kind;}
      farm.fishing={day,used:info.used,nextAt:info.nextAt,cast};
      return 'Đã thả câu. Kéo cần khi cá cắn.';
    }
    const cast=info.cast;
    check(cast,'Chưa thả câu hoặc lượt câu đã hết hạn.');
    check(now>=cast.ready,'Cá chưa cắn câu.');
    if(cast.source==='public'){
      check(info.used<publicFishingLimit(room),'Đã hết lượt câu hồ làng hôm nay.');
      roomFor(farm,1);
      const item=publicCatch(catchRoll,{id:cast.weather});
      add(farm,item,1);
      farm.fishing={day,used:info.used+1,nextAt:now+fishing.cooldown,cast:null};
      record(farm,now,'Câu được 1 '+goods[item].name.toLowerCase()+' ở hồ làng.');
      return 'Câu được '+goods[item].name.toLowerCase()+'!';
    }
    const owner=room.farms[cast.target];
    const mine=dailyAt(room,farm,now), theirs=dailyAt(room,owner,now);
    const denied=theftAccess(room,farm,owner,mine,theirs,now);
    if(denied){
      farm.fishing={day,used:info.used,nextAt:info.nextAt,cast:null};
      return 'Lượt câu kết thúc. '+denied;
    }
    const ponds=pondsAt(room,owner,now);
    const batch=ponds[pondIndex(cast.index)]?.find(row=>(!cast.item||row.kind===cast.item)&&canCatch(row));
    if(!batch){
      farm.fishing={day,used:info.used,nextAt:info.nextAt,cast:null};
      return 'Lượt câu kết thúc. Ao không còn đủ cá để câu.';
    }
    roomFor(farm,1);
    batch.picked++;owner.ponds=ponds;
    farm.fishing={day,used:info.used,nextAt:info.nextAt,cast:null};
    return takeFrom(room,farm,owner,batch.kind,'ao cá',now,{mine,theirs});
  }
  if(action==='buy') {
    check(has(goods,item)&&goods[item].buy,'Vật phẩm không có ở cửa hàng.');
    const crop=Object.keys(crops).find(key=>crops[key].seed===item);
    if(crop)check(!cropRequirement(farm,crop),cropRequirement(farm,crop));
    check(own(farm,item)+qty<=supplyLimit,'Túi vật tư chỉ chứa '+supplyLimit+' món mỗi loại.');
    spend(farm,goods[item].buy*qty);
    add(farm,item,qty);
    return 'Đã mua '+qty+' '+goods[item].name.toLowerCase()+'.';
  }
  if(action==='sell') {
    check(has(goods,item)&&goods[item].sell,'Mặt hàng không bán được.');
    const amount=source==='all'?own(farm,item):qty;
    check(amount>0,'Kho không còn mặt hàng này.');
    use(farm,item,amount);
    const revenue=goods[item].sell*amount;
    farm.coins+=revenue;
    addVillageIncome(room,revenue);
    return 'Đã bán '+amount+' '+goods[item].name.toLowerCase()+' · +'+revenue+' xu.';
  }
  if(action==='list') {
    const info=has(goods,item)&&goods[item];
    check(info?.sell,'Chỉ nông sản mới được đăng bán.');
    check(Object.values(room.listings).filter(l=>l.seller===id).length<3,'Bạn chỉ được mở 3 gian hàng.');
    const price=input.price;
    check(Number.isInteger(price)&&price>=1&&price<=info.sell*3,'Giá niêm yết phải từ 1 đến '+info.sell*3+' xu/món.');
    use(farm,item,qty);
    const listingId=room.nextListing++;
    room.listings[listingId]={id:listingId,seller:id,item,qty,price};
    return 'Đã đăng '+qty+' '+info.name.toLowerCase()+' lên sạp.';
  }
  if(action==='deal'||action==='delist') {
    const listing=Number.isInteger(index)&&room.listings[index];
    check(listing,'Gian hàng đã đóng.');
    roomFor(farm,listing.qty);
    if(action==='delist') {
      check(listing.seller===id,'Bạn chỉ được gỡ món mình đăng.');
    } else {
      check(listing.seller!==id,'Bạn có thể gỡ gian hàng của mình.');
      const bill=listing.price*listing.qty;
      spend(farm,bill);
      const seller=room.farms[listing.seller];
      seller.coins+=bill;
      record(seller,now,farm.name+' đã mua hàng · +'+bill+' xu.');
    }
    add(farm,listing.item,listing.qty);
    delete room.listings[index];
    return action==='deal'?'Đã mua nông sản.':'Đã trả nông sản về kho.';
  }
  if(action==='order') {
    const day=dayAt(room,now);
    const order=orderList(day).find(o=>o.id===index);
    check(order,'Đơn hàng đã hết hạn. Hãy xem bảng hôm nay.');
    const shared=townOrdersAt(room,day);
    check(!shared.done.includes(order.slot),'Đơn này đã giao bởi một vườn trong làng.');
    check(order.items.every(({item,qty})=>own(farm,item)>=qty),'Bạn chưa có đủ hàng trong giỏ.');
    for(const {item,qty} of order.items)use(farm,item,qty);
    farm.coins+=order.reward; farm.xp+=order.xp;
    shared.done.push(order.slot);
    room.townOrders=shared;
    addVillageIncome(room,order.reward,true);
    record(farm,now,'Giao đơn cho chợ làng · +'+order.reward+' xu.');
    return 'Giao đơn thành công · +'+order.reward+' xu.';
  }
  if(action==='upgrade') {
    check(has(buildings,item),'Công trình không tồn tại.');
    const definition=buildings[item],level=farm[item]??definition.base??1;
    const base=definition.base??(item==='fence'||item==='coop'?0:1),cost=definition.costs[level-base];
    check(cost,'Công trình đã đạt cấp tối đa.');
    check(!upgradeRequirement(farm,item),upgradeRequirement(farm,item));
    spend(farm,cost);
    if(item==='coop') farm.pens=farm.pens.map(p=>projectedPen(room,farm,p,now));
    farm[item]=level+1;
    if(item==='field'){
      const first=farm.plots.length;
      farm.plots.push(null,null,null);
      for(let index=first;index<farm.plots.length;index++)setSoilTime(farm,index,now);
    }
    farm.xp+=10;
    record(farm,now,buildings[item].name+' lên cấp '+farm[item]+'.');
    return 'Đã nâng cấp '+buildings[item].name.toLowerCase()+'.';
  }
  if(action==='animal') {
    check(has(animals,item),'Vật nuôi không tồn tại.');
    const info=animals[item];
    const lot=index;
    const limit=coopCapacity(farm,lot);
    check(lot===undefined||Number.isInteger(lot)&&limit,'Chuồng không tồn tại.');
    check(!animalRequirement(farm,item,lot),animalRequirement(farm,item,lot));
    check(farm.pens.filter(p=>p.lot===lot).length<limit,'Chuồng đã hết chỗ.');
    spend(farm,info.cost);
    const penId=Math.max(farm.nextPenId??0,farm.pens.length);
    farm.pens.push({id:penId,kind:item,at:now,age:0,progress:0,growGoal:info.grow,productGoal:info.time,fedUntil:0,...(lot===undefined?{}:{lot})});
    farm.nextPenId=penId+1;
    return 'Đã đón '+info.name.toLowerCase()+' về chuồng.';
  }
  if(action==='feed'||action==='collect') {
    const slot=target===undefined?index:farm.pens.findIndex((pen,i)=>String(penId(pen,i))===target);
    check(Number.isInteger(slot)&&farm.pens[slot],'Vật nuôi không tồn tại.');
    const pen=projectedPen(room,farm,farm.pens[slot],now), info=animals[pen.kind];
    if(action==='feed') {
      check(!info.oneTime||pen.progress<productGoal(pen),'Lợn đã sẵn sàng xuất chuồng.');
      check(pen.fedUntil<=now,'Vật nuôi vẫn còn thức ăn.');
      use(farm,'feed',info.food);
      pen.fedUntil=now+Math.ceil((growthGoal(pen)+productGoal(pen))*1.25);
    } else {
      check(pen.progress>=productGoal(pen),'Sản phẩm chưa sẵn sàng.');
      roomFor(farm,info.yield);
      add(farm,info.product,info.yield);
      farm.xp+=5;
      if(info.oneTime){
        farm.nextPenId=Math.max(farm.nextPenId??0,farm.pens.length);
        farm.pens.forEach((row,i)=>{row.id??=i;});
        farm.pens.splice(slot,1);
        return 'Đã xuất chuồng, thu '+info.yield+' '+goods[info.product].name.toLowerCase()+'.';
      }
      pen.progress=0;
      pen.growGoal=info.grow;pen.age=info.grow;pen.productGoal=info.time;
    }
    farm.pens[slot]=pen;
    return action==='feed'?'Đã cho ăn.':'Đã thu '+info.yield+' '+goods[info.product].name.toLowerCase()+'.';
  }
  if(action==='shield'){
    check(farm.shieldUntil<=now,'Vườn đang được bảo vệ.');
    spend(farm,12); farm.shieldUntil=now+shieldDuration;
    return 'Đã đóng cổng trong 30 phút.';
  }
  if(action==='steal'){
    check(has(room.farms,target)&&target!==id,'Không tìm thấy vườn này.');
    check(source==='garden'||source==='barn','Nguồn vật phẩm không hợp lệ.');
    const other=room.farms[target];
    const limits=theftCheck(room,farm,other,now);
    let product=item;
    if(source==='garden') {
      const p=Number.isInteger(index)&&projectPlot(room,plotAt(other,index),now);
      check(p&&p.progress>=cropGoal(p)&&cropYield(p)-(p.picked||0)>=3,'Ô vườn chưa có phần có thể lấy.');
      p.picked=(p.picked||0)+1;
      savePlot(other,index,p);
      product=p.kind;
    } else {
      check(candidates(other).includes(item),'Kho phải còn lại ít nhất 3 món cùng loại.');
      use(other,item,1);
    }
    return takeFrom(room,farm,other,product,source==='garden'?'vườn':'kho',now,limits);
  }
  check(['till','plant','water','fertilize','spray','harvest'].includes(action),'Thao tác không hợp lệ.');
  check(Number.isInteger(index)&&cropIndexes(farm).includes(index),'Ô đất không tồn tại.');
  const plot=projectPlot(room,plotAt(farm,index),now);
  if(action==='till'){
    check(!plot,'Chỉ cuốc được đất ở ô trống.');
    check(now>=compactAt(room,farm,index,now),'Đất còn tơi, có thể gieo ngay.');
    setSoilTime(farm,index,now);
    return 'Đã cuốc đất. Bạn có thể gieo hạt.';
  }
  if(action==='plant') {
    check(!plot&&has(crops,item),'Hãy chọn một ô trống và giống cây.');
    check(!cropRequirement(farm,item),cropRequirement(farm,item));
    check(now<compactAt(room,farm,index,now),'Đất đã chai. Hãy cuốc đất trước khi gieo.');
    use(farm,crops[item].seed);
    savePlot(farm,index,{kind:item,goal:crops[item].time,progress:0,pests:0,at:now,wetUntil:0,protectedUntil:0,fertilized:false,picked:0});
    return 'Đã gieo '+goods[item].name.toLowerCase()+'.';
  }
  check(plot,'Hãy gieo hạt vào ô này trước.');
  const ripe=plot.progress>=cropGoal(plot);
  if(action==='harvest') {
    check(ripe,'Cây chưa đến lúc thu hoạch.');
    const amount=Math.max(0,cropYield(plot)-(plot.picked??0));
    const seed=crops[plot.kind].seed;
    const reserve=input.source==='seed'?1:0;
    if(reserve){
      check(amount>=1,'Không còn nông sản để giữ giống.');
      check(own(farm,seed)<100,'Túi đã đầy giống này.');
    }
    roomFor(farm,amount-reserve);
    if(amount>reserve)add(farm,plot.kind,amount-reserve);
    if(reserve)add(farm,seed,1);
    savePlot(farm,index,null);
    setSoilTime(farm,index,now);
    farm.xp+=4;
    if(amount===reserve)return 'Đã giữ 1 '+goods[seed].name.toLowerCase()+' để gieo lại.';
    return 'Thu được '+(amount-reserve)+' '+goods[plot.kind].name.toLowerCase()+(reserve?' và giữ lại 1 giống.':'.');
  }
  check(!ripe,'Cây đã chín. Bạn có thể thu hoạch.');
  if(action==='water') {
    check(plot.wetUntil<=now&&!weatherAt(room,now).wet,'Đất đang đủ ẩm.');
    plot.wetUntil=now+Math.ceil(cropGoal(plot)*1.15);
  } else if(action==='fertilize') {
    check(!plot.fertilized,'Bạn đã bón phân cho cây này.');
    use(farm,'fertilizer');
    plot.fertilized=true;
  } else {
    check(plot.protectedUntil<=now,'Thuốc vẫn đang có tác dụng.');
    use(farm,'spray');
    plot.pestPeak=Math.max(plot.pestPeak??0,plot.pests);
    plot.pests=0; plot.protectedUntil=now+Math.ceil(cropGoal(plot)*1.1);
  }
  savePlot(farm,index,plot);
  return {water:'Đã tưới nước.',fertilize:'Đã bón phân.',spray:'Đã xử lý sâu bệnh.'}[action];
}
