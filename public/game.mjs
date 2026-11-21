import {addVillageIncome,advanceVillage,contributeVillage,hasVillageProject,recordVillageTheft,startVillageSecurity,villageLevels,villageSnapshot,villageTheftsLeft} from './village.mjs';
import {restSeconds,spendWork,vitals,wellnessAt,workBlock,workCost} from './wellness.mjs';
import {coopCapacity,cropIndexes,fenceAt,fences,gardenDecorAt,gardenDecorItems,gardenDecorRecommendedSpots,gardenDecorSpots,gardenPlotId,gardenUpgradeCost,getLand,landTypes,lotCount,lotPrice,mainPlotId,mainPlotSlot,plotAt,plotOffset,pondCapacity,pondIndexes,pondLotKind} from './land.mjs';
import {aquatic, aquaGoods, aquaRequirement, aquaSupplyRequirement, canCatch, fishing, fishingState, pondFood, pondReady, pondYield, projectPond, publicCatch} from './aqua.mjs';
import {gardenHelperActions,gardenHelperLimit,gardenHelperName,gardenHelperSchedule} from './garden-helper.mjs';
import {farmRanks} from './progression-levels.mjs';
export {homesteadSize} from './land.mjs';
export {coopSize} from './coop-layout.mjs';
export {aquatic, fishing, catchOdds} from './aqua.mjs';

export {advanceVillage,hasVillageProject,startVillageSecurity};
export {needsPlayerLocation,playerLocationBlock} from './world-layout.mjs';
export const publicFishingLimit=room=>fishing.limit+(hasVillageProject(room,'dock')?2:0);
export const gameDay = 8 * 60 * 60;
export const slotLength = 2 * 60 * 60;
const oldDay = 12 * 60;
const oldSlot = 180;
const barnCapacity=[30,55,90,145,220,320,460,620,820,1080];
export const visitLimit=farm=>(farm.bag??1)*2;
export const theftLossLimit=farm=>Math.max(1,3-(farm.fence??0));
export const gateMinutes=farm=>[30,30,30,45,60][Math.min(farm.fence??0,4)];
export const dryGrowthFactor=.65;
export const supplyLimit=100;
import {avatars,avatarOf} from './avatar-models.mjs';
export {avatars,avatarOf} from './avatar-models.mjs';
export const speechRange=110;
export const speechLifetime=5000;
export const xpRewards={harvest:4,collect:5,aquaHarvest:6,upgrade:10,order:15,basket:24,workshopOrder:30,journal:8};
export {farmRanks};
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
  truffleSeed:{name:'Giống nấm truffle',icon:'🍄',buy:85},
  coffeeSeed:{name:'Giống cà phê',icon:'☕',buy:95},
  lotusSeed:{name:'Giống sen',icon:'🪷',buy:125},
  dragonfruitSeed:{name:'Giống thanh long',icon:'🐉',buy:160},
  blackRiceSeed:{name:'Giống nếp cẩm',icon:'🌾',buy:210},
  sweetPotatoSeed:{name:'Giống khoai lang',icon:'🍠',buy:16},
  pumpkinSeed:{name:'Giống bí đỏ',icon:'🎃',buy:27},
  peanutSeed:{name:'Giống đậu phộng',icon:'🥜',buy:35},
  spray:{name:'Thuốc trừ sâu',icon:'🧴',buy:9}, feed:{name:'Thức ăn',icon:'🥣',buy:7},
  wheat:{name:'Lúa mì',icon:'🌾',sell:6}, carrot:{name:'Cà rốt',icon:'🥕',sell:10},
  corn:{name:'Bắp',icon:'🌽',sell:15}, tomato:{name:'Cà chua',icon:'🍅',sell:18}, sunflower:{name:'Hướng dương',icon:'🌻',sell:23},
  strawberry:{name:'Dâu chất lượng cao',icon:'🍓',sell:34}, grape:{name:'Nho chất lượng cao',icon:'🍇',sell:48}, tea:{name:'Trà thượng hạng',icon:'🍵',sell:65},
  egg:{name:'Trứng',icon:'🥚',sell:11}, duckEgg:{name:'Trứng vịt',icon:'🪺',sell:16},
  milk:{name:'Sữa',icon:'🥛',sell:22},
  goatMilk:{name:'Sữa dê',icon:'🍼',sell:30}, wool:{name:'Len cừu',icon:'🧶',sell:42},
  pork:{name:'Thịt lợn',icon:'🍖',sell:32}, truffle:{name:'Nấm truffle',icon:'🍄',sell:60},
  sweetPotato:{name:'Khoai lang',icon:'🍠',sell:12}, pumpkin:{name:'Bí đỏ',icon:'🎃',sell:21},
  peanut:{name:'Đậu phộng',icon:'🥜',sell:29}, gooseEgg:{name:'Trứng ngỗng',icon:'🥚',sell:26},
  rabbitMeat:{name:'Thịt thỏ',icon:'🍖',sell:38},
  coffee:{name:'Quả cà phê',icon:'🫘',sell:72}, lotus:{name:'Gương sen',icon:'🪷',sell:90}, dragonfruit:{name:'Thanh long',icon:'🐉',sell:125},
  blackRice:{name:'Nếp cẩm',icon:'🍚',sell:165},
  quailEgg:{name:'Trứng cút',icon:'🥚',sell:32}, buffaloMilk:{name:'Sữa trâu',icon:'🥛',sell:78},
  bread:{name:'Bánh mì',icon:'🍞'}, carrotJuice:{name:'Nước ép cà rốt',icon:'🥤'}, warmMilk:{name:'Sữa ấm',icon:'🥛'},
  berrySmoothie:{name:'Sinh tố dâu',icon:'🍓'}, grapeJuice:{name:'Nước ép nho',icon:'🍇'}, milkTea:{name:'Trà sữa',icon:'🫖'},
  roastedSweetPotato:{name:'Khoai lang nướng',icon:'🍠'},
  pumpkinSoup:{name:'Súp bí đỏ',icon:'🥣'},
  roastedPeanuts:{name:'Đậu phộng rang',icon:'🥜'},
  roastedCoffee:{name:'Cà phê rang',icon:'☕',sell:168}, lotusTea:{name:'Trà sen',icon:'🫖',sell:205}, dragonSmoothie:{name:'Sinh tố thanh long',icon:'🥤',sell:245},
  quailTart:{name:'Bánh trứng cút',icon:'🥧',sell:118}, buffaloCheese:{name:'Phô mai sữa trâu',icon:'🧀',sell:190},
  blackRicePudding:{name:'Chè nếp cẩm',icon:'🍨',sell:285},
  woolCloth:{name:'Vải len dệt',icon:'🧵',sell:92},
  starchGlue:{name:'Keo tinh bột',icon:'🫙',sell:64},
  insulationMat:{name:'Tấm cách nhiệt',icon:'🧶',sell:245},
  ...aquaGoods,
};
export const cropWeatherProfiles={
  grain:{label:'Ngũ cốc',note:'Lúa mì chịu thời tiết khá tốt; mưa nhẹ giúp tăng trưởng, dông làm giảm sản lượng.',
    growth:{rain:1.08,cloud:1.02,storm:.92},yield:{rain:1.20,storm:.78}},
  root:{label:'Củ rễ',note:'Cà rốt hợp đất ẩm và nhiều mây; nắng nóng kéo dài làm giảm tốc độ và sản lượng.',
    growth:{rain:1.10,cloud:1.06,heat:.88,storm:.92},yield:{rain:1.20,cloud:1.12,heat:.78,storm:.75}},
  sun:{label:'Ưa nắng',note:'Bắp, cà chua, hướng dương, bí đỏ và nho phát triển tốt khi nắng; dông làm giảm sản lượng.',
    growth:{sun:1.08,heat:1.08,rain:.95,cloud:.96,storm:.82},yield:{sun:1.18,heat:1.16,rain:.84,storm:.76}},
  cool:{label:'Ưa mát',note:'Dâu và trà hợp trời nhiều mây, sương sớm; nắng nóng làm giảm tốc độ và sản lượng.',
    growth:{cloud:1.10,fog:1.08,rain:1.03,heat:.82,storm:.88},yield:{cloud:1.16,fog:1.16,rain:1.12,heat:.76,storm:.74}},
  shade:{label:'Ưa sương',note:'Nấm truffle phát triển tốt khi trời mát, ẩm và có sương; nắng nóng hoặc dông làm giảm sản lượng.',
    growth:{fog:1.18,cloud:1.10,rain:1.06,heat:.72,sun:.92,storm:.82},yield:{fog:1.22,cloud:1.16,rain:1.12,heat:.68,sun:.84,storm:.72}},
  tropical:{label:'Nhiệt đới',note:'Khoai lang, đậu phộng và cà phê chịu nắng tốt; mưa vừa có lợi, dông mạnh gây bất lợi.',
    growth:{sun:1.06,heat:1.10,rain:1.03,storm:.88},yield:{sun:1.16,heat:1.18,rain:1.12,storm:.78}},
  wetland:{label:'Ưa nước',note:'Sen và nếp cẩm hợp mưa, sương và đất ẩm; nắng nóng kéo dài làm giảm sản lượng.',
    growth:{rain:1.18,fog:1.12,heat:.78,sun:.96,storm:1.02},yield:{rain:1.20,fog:1.16,heat:.74,storm:.90}},
  desert:{label:'Chịu hạn',note:'Thanh long ưa nắng nóng; mưa dông kéo dài làm giảm tốc độ và sản lượng.',
    growth:{sun:1.12,heat:1.22,rain:.84,fog:.88,storm:.68},yield:{sun:1.18,heat:1.20,rain:.76,fog:.80,storm:.65}},
};
export const cropWeatherEffect=(kind,condition)=>{
  const profile=cropWeatherProfiles[crops[kind]?.weather];
  return {growth:profile?.growth[condition]??1,yield:profile?.yield[condition]??1};
};
export const crops = {
  wheat:{seed:'wheatSeed',time:8*60,legacy:60,yield:3,weather:'grain'},
  carrot:{seed:'carrotSeed',time:15*60,legacy:110,yield:3,weather:'root'},
  corn:{seed:'cornSeed',time:25*60,legacy:175,yield:4,weather:'sun'},
  tomato:{seed:'tomatoSeed',time:32*60,yield:4,xp:25,weather:'sun'},
  sunflower:{seed:'sunflowerSeed',time:38*60,yield:4,xp:50,weather:'sun'},
  strawberry:{seed:'strawberrySeed',time:45*60,yield:5,workshop:1,quality:true,weather:'cool'},
  grape:{seed:'grapeSeed',time:60*60,yield:5,workshop:2,quality:true,weather:'sun'},
  tea:{seed:'teaSeed',time:75*60,yield:6,workshop:3,quality:true,weather:'cool'},
  truffle:{seed:'truffleSeed',time:120*60,yield:3,workshop:3,xp:2200,quality:true,weather:'shade'},
  sweetPotato:{seed:'sweetPotatoSeed',time:22*60,yield:4,xp:18,weather:'tropical'},
  pumpkin:{seed:'pumpkinSeed',time:40*60,yield:4,xp:60,weather:'sun'},
  peanut:{seed:'peanutSeed',time:50*60,yield:5,workshop:1,xp:100,weather:'tropical'},
  coffee:{seed:'coffeeSeed',time:95*60,yield:5,workshop:7,xp:3200,quality:true,weather:'tropical'},
  lotus:{seed:'lotusSeed',time:115*60,yield:5,workshop:8,xp:5600,quality:true,weather:'wetland'},
  dragonfruit:{seed:'dragonfruitSeed',time:145*60,yield:6,workshop:9,xp:9600,quality:true,weather:'desert'},
  blackRice:{seed:'blackRiceSeed',time:175*60,yield:6,workshop:9,xp:16000,quality:true,weather:'wetland'},
};
export const animals = {
  chicken:{name:'Gà mái',icon:'🐔',cost:35, grow:20*60, time:15*60,legacy:70, product:'egg', yield:3, food:1, level:1},
  duck:{name:'Vịt',icon:'🦆',cost:48,grow:28*60,time:20*60,product:'duckEgg',yield:3,food:1,level:1,xp:20},
  cow:{name:'Bò sữa',icon:'🐄',cost:65, grow:45*60, time:30*60,legacy:125, product:'milk', yield:3, food:2, level:2},
  pig:{name:'Lợn',icon:'🐖',cost:90, grow:60*60, time:40*60, product:'pork', yield:4, food:2, level:2, oneTime:true},
  goat:{name:'Dê sữa',icon:'🐐',cost:110,grow:55*60,time:35*60,product:'goatMilk',yield:3,food:2,level:2,xp:70},
  sheep:{name:'Cừu',icon:'🐑',cost:145,grow:70*60,time:50*60,product:'wool',yield:2,food:3,level:3,xp:130},
  goose:{name:'Ngỗng',icon:'🪿',cost:105,grow:50*60,time:30*60,product:'gooseEgg',yield:3,food:2,level:3,xp:100},
  rabbit:{name:'Thỏ',icon:'🐇',cost:110,grow:48*60,time:38*60,product:'rabbitMeat',yield:4,food:2,level:3,xp:160,oneTime:true},
  quail:{name:'Chim cút',icon:'🐦',cost:320,grow:70*60,time:48*60,product:'quailEgg',yield:4,food:3,level:7,xp:3600},
  buffalo:{name:'Trâu nước',icon:'🐃',cost:620,grow:105*60,time:68*60,product:'buffaloMilk',yield:3,food:5,level:8,xp:7200},
};
const livestockDay=24*60*60;
const livestockAges=[
  {since:0,label:'Sung sức',yield:1,sale:.5},
  {since:3*livestockDay,label:'Lớn tuổi',yield:.75,sale:.4},
  {since:7*livestockDay,label:'Già',yield:.5,sale:.25},
];
export function animalCondition(pen,now){
  const def=animals[pen.kind];
  const age=Math.max(0,now-(pen.acquiredAt??now));
  const tier=def.oneTime?livestockAges[0]:livestockAges.findLast(entry=>age>=entry.since);
  return {label:tier.label,days:Math.floor(age/livestockDay),
    yield:Math.max(1,Math.floor(def.yield*tier.yield)),sale:Math.floor(def.cost*tier.sale)};
}
export const recipes={
  bread:{level:1,ingredients:{wheat:2},gain:{stamina:22,food:28}},
  carrotJuice:{level:1,ingredients:{carrot:2},gain:{stamina:18,water:32}},
  roastedSweetPotato:{level:1,ingredients:{sweetPotato:2},gain:{stamina:26,food:32}},
  warmMilk:{level:2,ingredients:{milk:1},gain:{stamina:32,food:18}},
  pumpkinSoup:{level:2,ingredients:{pumpkin:2,milk:1},gain:{stamina:30,water:32,food:24}},
  roastedPeanuts:{level:2,ingredients:{peanut:2},gain:{stamina:18,food:50}},
  berrySmoothie:{level:4,ingredients:{strawberry:2,goatMilk:1},gain:{stamina:40,food:32,water:18}},
  grapeJuice:{level:5,ingredients:{grape:2,carrot:1},gain:{stamina:45,water:55}},
  milkTea:{level:6,ingredients:{tea:1,milk:1},gain:{stamina:55,water:40,food:28}},
  roastedCoffee:{level:7,ingredients:{coffee:2},gain:{stamina:58,food:18}},
  quailTart:{level:7,ingredients:{quailEgg:2,wheat:1},gain:{stamina:35,food:58}},
  lotusTea:{level:8,ingredients:{lotus:2,tea:1},gain:{stamina:52,water:62}},
  buffaloCheese:{level:8,ingredients:{buffaloMilk:2},gain:{stamina:48,food:62}},
  dragonSmoothie:{level:9,ingredients:{dragonfruit:2,buffaloMilk:1},gain:{stamina:62,water:48,food:32}},
  blackRicePudding:{level:9,ingredients:{blackRice:2,buffaloMilk:1},gain:{stamina:58,food:72}},
  woolCloth:{category:'materials',level:3,ingredients:{wool:2}},
  starchGlue:{category:'materials',level:4,ingredients:{corn:3,wheat:2}},
  insulationMat:{category:'materials',level:5,ingredients:{woolCloth:1,starchGlue:1,tea:1}},
};
export const recipeCategory=recipe=>recipe.category??'food';
const missingItems=(farm,items)=>Object.entries(items).filter(([key,count])=>own(farm,key)<count);
export const mealCooldown=90;
export function craftRequirement(farm,item){
  const recipe=Object.hasOwn(recipes,item)&&recipes[item];
  if(!recipe)return 'Công thức không tồn tại.';
  if((farm.workshop??0)<recipe.level)return 'Cần Xưởng máy cấp '+recipe.level+'.';
  if(missingItems(farm,recipe.ingredients).length)return 'Chưa đủ nguyên liệu.';
  if(goods[item].sell){
    const spent=Object.entries(recipe.ingredients).reduce((sum,[key,count])=>sum+(goods[key].sell?count:0),0);
    if(stock(farm)+1-spent>capacity(farm))return 'Kho đầy. Hãy bán hàng hoặc nâng cấp kho.';
  }else if(own(farm,item)>=supplyLimit)return 'Túi đã đầy món này.';
  return '';
}
export function mealRequirement(farm,item,health,now){
  const recipe=Object.hasOwn(recipes,item)&&recipes[item];
  if(!recipe?.gain||own(farm,item)<1)return 'Bạn chưa có thực phẩm này.';
  if(health.restUntil>now)return 'Hãy nghỉ xong trước khi dùng.';
  if((health.until.meal??0)>now)return 'Hãy chờ đến lượt ăn uống tiếp theo.';
  if(Object.keys(recipe.gain).every(key=>health[key]>=100))return 'Các chỉ số món này phục hồi đều đã đầy.';
  return '';
}
export const buildings = {
  barn:{name:'Kho',icon:'📦',costs:[50,110,320,850,1850,3250,5200,8600,13800],xp:[0,0,420,900,1650,2800,3600,6800,11200],
    materials:{5:{woolCloth:2},6:{insulationMat:2},7:{insulationMat:4,starchGlue:3},8:{insulationMat:5,roastedCoffee:2},9:{buffaloCheese:2,lotusTea:2}},
    notes:barnCapacity.map(count=>count+' nông sản')},
  field:{name:'Ruộng',icon:'🌱',costs:[50,105,380,950,2100,4200,7600,12500],xp:[0,0,470,1000,1850,3200,7000,11200],
    materials:{5:{starchGlue:2},6:{insulationMat:2},7:{insulationMat:3,roastedCoffee:1},8:{buffaloCheese:2,dragonSmoothie:1}},
    notes:[6,9,12,15,18,21,24,27,30].map(count=>count+' luống chính')},
  coop:{name:'Chuồng',icon:'🏡',base:0,costs:[45,80,145,450,1100,2400,4500,7800],xp:[0,0,0,500,1080,1950,3600,7200],
    materials:{5:{woolCloth:2},6:{insulationMat:2},7:{insulationMat:3,woolCloth:2},8:{insulationMat:5,starchGlue:4}},
    notes:['Chưa xây','Tối đa 2 con','Tối đa 4 con · mở bò và lợn · che nắng','Tối đa 6 con','Tối đa 8 con','Tối đa 10 con','Tối đa 12 con','Tối đa 14 con · mở chim cút','Tối đa 16 con · mở trâu nước']},
  fence:{name:'Hàng rào',icon:'🪵',base:0,costs:[40,160,450,1000],xp:[0,360,820,1520],
    notes:[0,1,2,3,4].map(fence=>'Mất tối đa '+theftLossLimit({fence})+' món/ngày · đóng cổng '+gateMinutes({fence})+' phút')},
  bag:{name:'Túi ghé vườn',icon:'🎒',costs:[55,110,290,680],xp:[0,0,440,950],
    notes:[1,2,3,4,5].map(bag=>visitLimit({bag})+' lượt/ngày, trong giới hạn của làng')},
  workshop:{name:'Xưởng máy',icon:'⚙️',base:0,costs:[120,260,520,600,1350,2800,4600,7400,11600],xp:[40,100,180,560,1220,2200,3000,5600,9600],
    materials:{7:{starchGlue:2,woolCloth:1},8:{insulationMat:2,coffee:2},9:{lotus:2,buffaloMilk:1}},
    notes:['Chưa xây','Dâu, bánh mì, nước ép cà rốt và khoai lang nướng','Nho, sữa ấm, súp bí đỏ và đậu phộng rang','Trà thượng hạng · truffle cần 2.200 XP','Sinh tố dâu','Nước ép nho','Trà sữa','Cà phê rang và bánh trứng cút','Trà sen và phô mai sữa trâu','Sinh tố thanh long']},
};
export function buildingUpgrade(farm,key){
  const definition=buildings[key], base=definition.base??1;
  const level=farm[key]??base, index=level-base;
  return {level,max:base+definition.costs.length,cost:definition.costs[index],xp:definition.xp[index]??0,
    benefit:definition.notes[index],nextBenefit:definition.notes[index+1],materials:definition.materials?.[level+1]??{}};
}
function progressionUses(item){
  if(!goods[item])return [];
  const recipesUsing=Object.entries(recipes).filter(([,recipe])=>recipe.ingredients[item]).map(([key])=>goods[key]?.name).filter(Boolean);
  const upgradesUsing=Object.values(buildings).flatMap(building=>Object.entries(building.materials??[])
    .filter(([,materials])=>materials[item]).map(([level])=>building.name+' cấp '+level));
  return [...new Set([...recipesUsing,...upgradesUsing])].slice(0,3);
}
export const xpUnlocks=[
  ...Object.entries(crops).filter(([,info])=>info.xp).map(([item,info])=>({
    xp:info.xp,item,uses:progressionUses(item),label:goods[item].name,requires:info.workshop?'Xưởng máy cấp '+info.workshop:'',
    destination:{tab:'field',label:'Vườn nhà'},
  })),
  ...Object.values(animals).filter(info=>info.xp).map(info=>({
    xp:info.xp,item:info.product,uses:progressionUses(info.product),label:info.name,requires:'Chuồng cấp '+info.level,
    destination:{tab:'coop',label:'Chuồng trại'},
  })),
  ...Object.entries(aquatic).filter(([,info])=>info.xp).map(([item,info])=>({
    xp:info.xp,item,uses:progressionUses(item),label:info.name,requires:info.barn?'Kho cấp '+info.barn:'',
    destination:{tab:'field',panel:'ponds',label:'Ao nuôi'},
  })),
  ...Object.values(buildings).flatMap(info=>info.xp.flatMap((xp,index)=>{
    const level=(info.base??1)+index;
    const materials=Object.entries(info.materials?.[level+1]??{}).map(([key,count])=>count+' '+goods[key].name.toLowerCase());
    return xp?[{xp,label:info.name+' cấp '+(level+1),requires:[level?info.name+' cấp '+level:'',info.costs[index]+' xu',...materials].filter(Boolean).join(' + '),
      destination:{panel:'buildings',label:'Công trình'},
      reward:info.notes[index+1]}]:[];
  })),
].sort((a,b)=>a.xp-b.xp);
export function farmProgress(farm){
  const xp=farm.xp??0;
  const rank=farmRanks.findLast(entry=>entry.xp<=xp)??farmRanks[0];
  return {xp,rank,nextRank:farmRanks.find(entry=>entry.xp>xp)??null,next:xpUnlocks.find(entry=>entry.xp>xp)??null};
}
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
  if(!has(buildings,key))return 'Công trình không tồn tại.';
  const {xp,materials}=buildingUpgrade(farm,key);
  if((farm.xp??0)<xp)return 'Cần '+xp+' XP.';
  const missing=missingItems(farm,materials);
  return missing.length?'Thiếu '+missing.map(([item,count])=>(count-own(farm,item))+' '+goods[item].name.toLowerCase()).join(', ')+'.':'';
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
export function startLivestockClock(room,time){
  if(room.livestockSince!==undefined)return false;
  room.livestockSince=time;
  return true;
}
function compactAt(room,farm,index,time){
  return (farm.soilAt?.[index]??farm.soilSince??room.soilSince??time)+soilIdleTime;
}
function setSoilTime(farm,index,time){
  (farm.soilAt??={})[index]=time;
}
export const capacity = (farm) => barnCapacity[Math.min((farm.barn??1)-1,barnCapacity.length-1)]??barnCapacity[0];
export const stock = (farm) => Object.keys(goods).filter(key=>goods[key].sell).reduce((sum,key)=>sum+(farm.inventory[key]||0),0);
export const has = (obj, key) => Object.hasOwn(obj, key);
export function newFarm(id, name, time, avatar) {
  return {
    id, name, avatar:avatarOf(avatar), soilSince:time, coins:100, xp:0, field:1, barn:1, coop:0, fence:0, bag:1, workshop:0, shieldUntil:0,
    inventory:{wheatSeed:5,carrotSeed:2,cornSeed:1,fertilizer:2,spray:1,feed:3,tilapiaSeed:1,prawnSeed:1,aquaFeed:3},
    plots:Array.from({length:6},()=>null), extraPlots:{}, pens:[], ponds:{0:[]}, land:getLand({}), decor:{}, daily:{day:-1,taken:0,lost:0,targets:[]},
    log:[{time, message:'Vườn mới đã sẵn sàng để gieo hạt.'}], recent:[],
  };
}
export function newRoom(time) {
  const room={created:time, soilSince:time, livestockSince:time, securityStartDay:0, longDays:true, weatherOffset:0, farms:{}, listings:{}, nextListing:1};
  advanceVillageDrive(room,time);
  return room;
}
export const villageOwner=room=>room.ownerId??Object.keys(room.farms)[0];
function eachWeather(room, from, to, visit) {
  for (let t=Math.max(from, to-4*gameDay);t<to;) {
    const next=Math.min(to,nextSlot(room,t));
    visit(weatherAt(room,t),t,next);
    t=next;
  }
}
export const cropGoal=plot=>plot.goal??crops[plot.kind].legacy??crops[plot.kind].time;
export const cropStage=plot=>Math.max(0,Math.min(3,Math.floor(4*(plot.progress??0)/cropGoal(plot))));
export const weedWeatherRate={sun:.14,rain:.46,cloud:.18,heat:.04,wind:.09,fog:.28,storm:.36};
export const cropHazard=plot=>plot?.hazard==='weeds'?'weeds':'pests';
function plantedHazard(farm,index,now,weather){
  const key=Array.from(farm.id).reduce((sum,char)=>Math.imul(sum,31)+char.codePointAt(0),0);
  const roll=((Math.imul(now,31)^Math.imul(index+1,2654435761)^key)>>>0)%10000/10000;
  const weeds=weedWeatherRate[weather.id]??.14;
  return roll<weeds/(weeds+weather.pests)?'weeds':'pests';
}
export const growthGoal=pen=>pen.growGoal??animals[pen.kind].legacy??animals[pen.kind].grow;
export const productGoal=pen=>pen.productGoal??animals[pen.kind].legacy??animals[pen.kind].time;
export function projectPlot(room, plot, now) {
  if (!plot) return null;
  const result={...plot,weeds:plot.weeds??0};
  const weatherExposure={...(plot.weatherExposure??{})};
  result.weatherExposure=weatherExposure;
  if (result.progress>=cropGoal(plot)) return result;
  eachWeather(room,plot.at,now,(w,from,to)=>{
    const goal=cropGoal(plot);
    if(result.progress>=goal) return;
    const dampUntil=afterRainUntil(room,from);
    for(let t=from;t<to&&result.progress<goal;) {
      const wet=w.wet||t<plot.wetUntil;
      const weeds=cropHazard(plot)==='weeds';
      const protection=weeds?(plot.weedProtectedUntil??0):(plot.protectedUntil??0);
      const exposed=t>=protection;
      const damp=t<dampUntil;
      const baseRisk=weeds?(weedWeatherRate[w.id]??.14):w.pests;
      const pestRate=(damp?Math.max(.44,baseRisk):baseRisk)*120/goal;
      const pressure=weeds?result.weeds:result.pests;
      const effect=cropWeatherEffect(plot.kind,w.id);
      const rate=w.crop*effect.growth*(wet?1.38:dryGrowthFactor)*(pressure>=40?.68:1)*(plot.fertilized?1.3:1);
      const end=Math.min(to,t<plot.wetUntil?plot.wetUntil:to,t<protection?protection:to,damp?dampUntil:to);
      const pestThreshold=exposed&&pressure<40?(40-pressure)/pestRate:Infinity;
      const duration=Math.min(end-t,pestThreshold,(goal-result.progress)/rate);
      if(duration<=1e-8) {
        if(pestThreshold<=1e-8) result[weeds?'weeds':'pests']=40;
        else result.progress=goal;
        continue;
      }
      weatherExposure[w.id]=(weatherExposure[w.id]??0)+duration;
      result.progress=duration===(goal-result.progress)/rate?goal:result.progress+duration*rate;
      if(exposed) result[weeds?'weeds':'pests']=duration===pestThreshold?40:Math.min(90,pressure+duration*pestRate);
      t+=duration;
    }
  });
  result.pestPeak=Math.max(plot.pestPeak??0,result.pests);
  result.weedPeak=Math.max(plot.weedPeak??0,result.weeds);
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
const workshopOrders=[
  {title:'Vải cho gian hàng',items:[{item:'woolCloth',qty:2},{item:'egg',qty:2}]},
  {title:'Keo cho thợ mộc',items:[{item:'starchGlue',qty:3},{item:'corn',qty:1}]},
  {title:'Tấm cách nhiệt cho kho làng',items:[{item:'insulationMat',qty:2},{item:'milk',qty:2}]},
];
export const workshopFoodOrders=[
  {item:'roastedSweetPotato',title:'Khoai nướng cho gánh chợ'},
  {item:'pumpkinSoup',title:'Súp bí đỏ cho bếp làng'},
  {item:'roastedPeanuts',title:'Đậu phộng rang cho quán trà'},
  {item:'roastedCoffee',title:'Cà phê rang cho quán sớm'},
  {item:'quailTart',title:'Bánh trứng cút cho phiên chợ'},
  {item:'lotusTea',title:'Trà sen cho nhà khách'},
  {item:'buffaloCheese',title:'Phô mai sữa trâu cho bếp làng'},
  {item:'dragonSmoothie',title:'Sinh tố thanh long cho hội mùa'},
  {item:'blackRicePudding',title:'Chè nếp cẩm cho lễ hội làng'},
];
export const varietyOrders=[
  {crop:'sweetPotato',title:'Khoai lang cho quán nướng',items:[{item:'sweetPotato',qty:4}]},
  {crop:'pumpkin',title:'Bí đỏ cho bếp làng',items:[{item:'pumpkin',qty:3}]},
  {crop:'peanut',title:'Đậu phộng cho sạp rang',items:[{item:'peanut',qty:4}]},
  {animal:'goose',title:'Trứng ngỗng cho chợ sáng',items:[{item:'gooseEgg',qty:3}]},
  {animal:'rabbit',title:'Thịt thỏ cho quán làng',items:[{item:'rabbitMeat',qty:3}]},
  {crop:'coffee',title:'Quả cà phê cho lò rang',items:[{item:'coffee',qty:4}]},
  {animal:'quail',title:'Trứng cút cho quán bánh',items:[{item:'quailEgg',qty:4}]},
  {crop:'lotus',title:'Gương sen cho nhà trà',items:[{item:'lotus',qty:4}]},
  {animal:'buffalo',title:'Sữa trâu cho lò phô mai',items:[{item:'buffaloMilk',qty:3}]},
  {crop:'dragonfruit',title:'Thanh long cho hội mùa',items:[{item:'dragonfruit',qty:4}]},
  {crop:'blackRice',title:'Nếp cẩm cho lễ hội mùa',items:[{item:'blackRice',qty:4}]},
];
export const aquaOrders=[
  {title:'Cá lóc cho quán nướng',items:[{item:'snakehead',qty:3}]},
  {title:'Cá trê cho bếp làng',items:[{item:'catfish',qty:3}]},
  {title:'Cua đồng cho quán bún',items:[{item:'fieldCrab',qty:3}]},
];
export function orderList(day,room) {
  const variants=[
    [['wheat',4,36],['carrot',3,45],['egg',2,34]],
    [['carrot',4,56],['corn',3,62],['egg',3,48]],
    [['wheat',5,43],['corn',3,64],['milk',2,60]],
    [['carrot',3,45],['egg',2,34],['pork',2,101]],
  ];
  const daily=variants[day%variants.length].map(([item,qty,reward],slot)=>({
    items:[{item,qty}],reward,xp:xpRewards.order,id:day*3+slot,slot:day*3+slot,
  }));
  if(day%3===2){
    const baskets=[
      {title:'Giỏ cá đồng',items:[{item:'minnow',qty:4},{item:'wheat',qty:4}],reward:52},
      {title:'Giỏ bữa sáng',items:[{item:'egg',qty:3},{item:'carrot',qty:3}],reward:105},
      {title:'Giỏ bữa xế',items:[{item:'milk',qty:2},{item:'corn',qty:3}],reward:145},
    ];
    daily[2]={...baskets[Math.floor(day/3)%baskets.length],xp:xpRewards.basket,id:-(day+1),slot:day*3+2};
  }
  const order=workshopOrders[day%workshopOrders.length];
  const farms=Object.values(room?.farms??{});
  const workshopLevel=Math.max(0,...farms.map(farm=>farm.workshop??0));
  // Keep the day's template stable when a farm upgrades its workshop.
  const required=order.items.map(({item})=>recipes[item]).filter(recipe=>recipe&&recipeCategory(recipe)!=='food');
  if(required.length&&required.every(recipe=>recipe.level<=workshopLevel)&&order.items.every(({item})=>goods[item]?.sell>0)){
    // Classic basket IDs are negative multiples of three.
    const id=-(day*3+1);
    const value=order.items.reduce((sum,{item,qty})=>sum+goods[item].sell*qty,0);
    daily.push({...order,category:'workshop',id,slot:id,reward:Math.ceil(value*1.25),xp:xpRewards.workshopOrder});
  }
  const food=workshopFoodOrders[day%workshopFoodOrders.length];
  const recipe=recipes[food.item];
  const ingredients=Object.entries(recipe.ingredients);
  if(farms.some(farm=>(farm.workshop??0)>=recipe.level&&ingredients.every(([key])=>{
    const crop=Object.hasOwn(crops,key)&&key;
    const animal=Object.entries(animals).find(([,info])=>info.product===key)?.[0];
    return crop?!cropRequirement(farm,crop):animal?!animalRequirement(farm,animal):true;
  }))){
    const id=2_000_000_000+day, qty=2;
    const value=ingredients.reduce((sum,[key,count])=>sum+goods[key].sell*count,0);
    daily.push({title:food.title,items:[{item:food.item,qty}],category:'workshop',id,slot:id,reward:Math.ceil(value*qty*1.25),xp:xpRewards.basket});
  }
  const {crop,animal,title,items}=varietyOrders[day%varietyOrders.length];
  if(farms.some(farm=>crop?!cropRequirement(farm,crop):!animalRequirement(farm,animal))){
    const id=-(day*3+2);
    const value=items.reduce((sum,{item,qty})=>sum+goods[item].sell*qty,0);
    daily.push({title,items,category:'variety',id,slot:id,reward:Math.ceil(value*1.25),xp:xpRewards.basket});
  }
  const seafood=aquaOrders[day%aquaOrders.length];
  const {item,qty}=seafood.items[0];
  if(farms.some(farm=>!aquaRequirement(farm,item))){
    const id=1_000_000_000+day;
    daily.push({...seafood,category:'aquatic',id,slot:id,reward:Math.ceil(goods[item].sell*qty*1.25),xp:xpRewards.basket});
  }
  return daily;
}
const driveDuration=48*60*60;
const driveMinimum=3;
const driveXp=12;
const driveTemplates=[
  {title:'Giỏ nông sản',needs:{wheat:16,carrot:12,corn:12}},
  {title:'Bếp làng',needs:{sweetPotato:24,pumpkin:12,gooseEgg:9}},
  {title:'Quầy đặc sản',needs:{peanut:12,pumpkin:8,rabbitMeat:8}},
];
function driveRanking(drive){
  return Object.values(drive.contributors).map(({name,quantity})=>({name,quantity}))
    .sort((a,b)=>b.quantity-a.quantity||a.name.localeCompare(b.name,'vi'));
}
export function advanceVillageDrive(room,time){
  const current=room.villageDrive;
  const steps=current?Math.floor((time-current.id)/driveDuration):0;
  if(current&&steps<=0)return false;
  const first=current?(current.template+steps)%driveTemplates.length:1;
  const farms=Object.values(room.farms);
  const rotation=driveTemplates.map((_,offset)=>(first+offset)%driveTemplates.length);
  const template=rotation.find(index=>index===0||Object.keys(driveTemplates[index].needs).every(item=>{
    if(has(crops,item))return farms.some(farm=>!cropRequirement(farm,item));
    const kind=Object.keys(animals).find(key=>animals[key].product===item);
    return farms.some(farm=>!animalRequirement(farm,kind));
  }));
  const previous=current?{
    title:driveTemplates[current.template].title,completed:current.completedAt!==undefined,top:driveRanking(current)[0]??null
  }:null;
  room.villageDrive={id:current?current.id+steps*driveDuration:time,template,delivered:{},contributors:{},previous};
  return true;
}
const driveReward=value=>Math.ceil(value*1.25);
function villageDriveSnapshot(room,farm,time){
  const drive=room.villageDrive;
  if(!drive||time>=drive.id+driveDuration)return null;
  const {title,needs}=driveTemplates[drive.template];
  const me=drive.contributors[farm.id];
  return {
    id:drive.id,title,endsAt:drive.id+driveDuration,completed:drive.completedAt!==undefined,
    items:Object.entries(needs).map(([item,required])=>({item,required,delivered:drive.delivered[item]??0})),
    minimum:driveMinimum,rewardXp:driveXp,contributors:driveRanking(drive),previous:drive.previous,
    mine:{quantity:me?.quantity??0,coins:me?.quantity>=driveMinimum?driveReward(me.value):0,paid:!!me?.paid,decorVoucher:!!me?.decorVoucher},
  };
}
function donateVillageGoods(room,farm,input,time){
  const drive=room.villageDrive;
  check(drive&&input.index===drive.id&&time<drive.id+driveDuration,'Đợt góp hàng đã hết hạn. Hãy xem đơn mới.');
  check(drive.completedAt===undefined,'Làng đã góp đủ hàng cho đợt này.');
  const {needs}=driveTemplates[drive.template];
  const {item,qty}=input;
  check(has(needs,item),'Mặt hàng này không thuộc đợt góp hàng.');
  check(Number.isSafeInteger(qty)&&qty>0,'Số lượng góp phải là số nguyên dương.');
  const remaining=needs[item]-(drive.delivered[item]??0);
  check(qty<=remaining,'Làng chỉ còn cần '+remaining+' món này.');
  use(farm,item,qty);
  drive.delivered[item]=(drive.delivered[item]??0)+qty;
  const entry=drive.contributors[farm.id]??={name:farm.name,quantity:0,value:0};
  entry.quantity+=qty;
  entry.value+=qty*goods[item].sell;
  if(!Object.entries(needs).every(([key,required])=>drive.delivered[key]===required)){
    return 'Đã góp '+qty+' '+goods[item].name.toLowerCase()+'.';
  }
  drive.completedAt=time;
  for(const [id,member] of Object.entries(room.farms)){
    const contribution=drive.contributors[id];
    if(!contribution||contribution.quantity<driveMinimum)continue;
    const coins=driveReward(contribution.value);
    member.coins+=coins;
    member.xp+=driveXp;
    member.decorVouchers=(member.decorVouchers??0)+1;
    contribution.decorVoucher=true;
    contribution.paid=true;
    record(member,time,'Hoàn thành đơn góp hàng · +'+coins+' xu · +'+driveXp+' XP · +1 phiếu trang trí.');
  }
  return entry.paid?'Làng đã góp đủ hàng. Bạn nhận '+driveReward(entry.value)+' xu, '+driveXp+' XP và 1 phiếu trang trí.':'Làng đã góp đủ hàng.';
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
export function cropPotentialYield(plot){
  const exposure=plot.weatherExposure??{};
  const duration=Object.values(exposure).reduce((sum,value)=>sum+value,0);
  const weatherYield=duration?Object.entries(exposure).reduce((sum,[condition,seconds])=>
    sum+seconds*cropWeatherEffect(plot.kind,condition).yield,0)/duration:1;
  return Math.max(1,Math.round((crops[plot.kind].yield+Number(!!plot.fertilized))*weatherYield));
}
export function cropYield(plot) {
  const normal=cropPotentialYield(plot);
  const damage=Math.max(plot.pestPeak??0,plot.pests??0,plot.weedPeak??0,plot.weeds??0);
  const lost=damage>=70?Math.ceil(normal*.60):damage>=40?Math.ceil(normal*.35):damage>=20?1:0;
  return Math.max(1,normal-lost);
}
function plotWorkBlock(action,plot,weather,time){
  if(!plot)return 'Hãy gieo hạt vào ô này trước.';
  const ripe=plot.progress>=cropGoal(plot);
  if(action==='harvest')return ripe?'':'Cây chưa đến lúc thu hoạch.';
  if(ripe)return 'Cây đã chín. Bạn có thể thu hoạch.';
  if(action==='weed'&&(cropHazard(plot)!=='weeds'||!(plot.weeds>0)))return 'Ô này không có cỏ dại cần nhổ.';
  if(action==='spray'&&cropHazard(plot)==='weeds')return 'Hãy nhổ cỏ dại; thuốc trừ sâu không xử lý được cỏ.';
  if(action==='water'&&(plot.wetUntil>time||weather.wet))return 'Đất đang đủ ẩm.';
  return '';
}
const harvestAmount=plot=>Math.max(0,cropYield(plot)-(plot.picked??0));

export function gardenHelperTargets(farm,action,weather,time){
  return cropIndexes(farm).flatMap(index=>{
    const plot=plotAt(farm,index);
    return plotWorkBlock(action,plot,weather,time)?[]:
      [{index,kind:plot.kind,space:action==='harvest'?harvestAmount(plot):0}];
  });
}

export function gardenHelperPreview(farm,action,targets,keepSeeds=false){
  const count=targets.length;
  const cost=count*gardenHelperActions[action].fee;
  const seedNeeds=new Map();
  let seeds=0, space=0;
  for(const target of targets){
    const reserve=keepSeeds&&action==='harvest'&&target.space>0?1:0;
    space+=target.space-reserve;
    if(reserve){
      const seed=crops[target.kind].seed;
      seedNeeds.set(seed,(seedNeeds.get(seed)??0)+1);
      seeds++;
    }
  }
  const fullSeed=[...seedNeeds].find(([seed,amount])=>own(farm,seed)+amount>supplyLimit)?.[0];
  const free=Math.max(0,capacity(farm)-stock(farm));
  const blocked=farm.gardenHelperJob?gardenHelperName+' đang làm một lượt khác.':
    count>gardenHelperLimit?'Chọn tối đa '+gardenHelperLimit+' ô mỗi lượt.':
    cost>farm.coins?'Bạn chưa đủ xu thuê người.':
    keepSeeds&&action==='harvest'&&seeds<count?'Có ô không còn nông sản để giữ giống.':
    fullSeed?'Túi không đủ chỗ cho '+goods[fullSeed].name.toLowerCase()+'. Hãy chọn ít ô hơn hoặc Thu hết.':
    space>free?'Kho thiếu '+(space-free)+' chỗ. Hãy giảm số ô hoặc dọn kho.':'';
  const {endsAt:duration}=gardenHelperSchedule(action,targets.map(target=>target.index),0);
  return {cost,space,seeds,free,duration,blocked};
}

function hireGardenHelper(room,farm,input,time){
  check(!farm.gardenHelperJob,gardenHelperName+' đang làm một lượt khác.');
  const {item:action,plots:indexes,source}=input;
  check(has(gardenHelperActions,action)&&Array.isArray(indexes)&&indexes.length>0&&indexes.length<=gardenHelperLimit,
    'Hãy chọn từ 1 đến '+gardenHelperLimit+' ô và công việc cần làm.');
  check(source===undefined||action==='harvest'&&(source==='seed'||source==='all'),'Cách thu hoạch không hợp lệ.');
  const keepSeeds=source==='seed';
  const valid=new Set(cropIndexes(farm)), weather=weatherAt(room,time);
  check(new Set(indexes).size===indexes.length&&indexes.every(index=>valid.has(index)),
    'Danh sách có ô trùng hoặc không thuộc vườn của bạn.');
  const targets=indexes.map(index=>{
    const raw=plotAt(farm,index), plot=projectPlot(room,raw,time);
    check(!plotWorkBlock(action,plot,weather,time),'Có ô đã thay đổi hoặc không còn phù hợp. Hãy kiểm tra lại lựa chọn.');
    return {index,raw,kind:plot.kind,space:action==='harvest'?harvestAmount(plot):0};
  });
  const preview=gardenHelperPreview(farm,action,targets,keepSeeds);
  check(input.expectedSpace===preview.space,'Sản lượng đã thay đổi. Hãy xem lại số chỗ kho cần dùng.');
  check(!preview.blocked,preview.blocked);
  spend(farm,preview.cost);
  const schedule=gardenHelperSchedule(action,indexes,time);
  const steps=schedule.steps.map((step,i)=>{
    const plot=targets[i].raw;
    plot.plantedAt??=plot.at;
    return {...step,kind:plot.kind,plantedAt:plot.plantedAt};
  });
  farm.gardenHelperJob={...schedule,action,keepSeeds,steps,processed:0,skipped:0,produce:0,seeds:0,refund:0};
  delete farm.gardenHelperReport;
  return 'Đã thuê '+gardenHelperName+' làm '+steps.length+' ô · '+preview.cost+' xu.';
}

function waterPlot(farm,index,plot,time){
  plot.wetUntil=time+Math.ceil(cropGoal(plot)*1.15);
  savePlot(farm,index,plot);
}
function harvestPlot(farm,index,plot,time,amount,reserve=0){
  if(amount>reserve)add(farm,plot.kind,amount-reserve);
  if(reserve)add(farm,crops[plot.kind].seed,1);
  savePlot(farm,index,null);
  setSoilTime(farm,index,time);
  farm.xp+=xpRewards.harvest;
}
// Resolve each plot at its own due time so hours offline do not shift crop or weather effects.
export function advanceGardenHelpers(room,time){
  let changed=false;
  for(const farm of Object.values(room.farms)){
    const job=farm.gardenHelperJob;
    if(!job)continue;
    const {action,steps}=job;
    const reserve=action==='harvest'&&job.keepSeeds?1:0;
    while(steps[job.processed]?.doneAt<=time){
      const {index,kind,plantedAt,doneAt}=steps[job.processed++];
      changed=true;
      const raw=plotAt(farm,index);
      const plot=raw?.kind===kind&&raw.plantedAt===plantedAt?projectPlot(room,raw,doneAt):null;
      const amount=plot&&action==='harvest'?harvestAmount(plot):0;
      const space=amount-reserve;
      const noSeedSpace=plot&&reserve&&(amount<1||own(farm,crops[plot.kind].seed)>=supplyLimit);
      if(plotWorkBlock(action,plot,weatherAt(room,doneAt),doneAt)||noSeedSpace||space>0&&stock(farm)+space>capacity(farm)){
        const refund=gardenHelperActions[action].fee;
        job.skipped++;
        job.refund+=refund;
        farm.coins+=refund;
        continue;
      }
      if(action==='water')waterPlot(farm,index,plot,doneAt);
      else{
        harvestPlot(farm,index,plot,doneAt,amount,reserve);
        job.produce+=space;
        job.seeds=(job.seeds??0)+reserve;
      }
      markDayGoal(farm,action,dayAt(room,doneAt));
    }
    if(job.processed!==steps.length)continue;
    const {skipped,produce,seeds=0,refund,endsAt}=job;
    const completed=steps.length-skipped;
    farm.gardenHelperReport={action,completed,total:steps.length,skipped,produce,seeds,refund};
    record(farm,endsAt,gardenHelperName+' đã '+(action==='water'?'tưới':'thu hoạch')+' '+completed+'/'+steps.length+' ô'+
      (produce?' · '+produce+' nông sản':'')+(seeds?' · giữ '+seeds+' giống':'')+(refund?' · hoàn '+refund+' xu':'')+'.');
    delete farm.gardenHelperJob;
  }
  return changed;
}
function visibleGardenHelper(job){
  return job?{action:job.action,startedAt:job.startedAt,endsAt:job.endsAt,
    steps:job.steps.map(({index,arriveAt,doneAt})=>({index,arriveAt,doneAt}))}:null;
}
function candidates(farm) {
  return Object.entries(goods).filter(([item,info])=>info.sell&&!has(recipes,item)&&own(farm,item)>=4).map(([key])=>key);
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
function savePlot(farm,index,plot){
  const slot=mainPlotSlot(index);
  if(slot<0)(farm.extraPlots??={})[index]=plot;
  else farm.plots[slot]=plot;
}
function penLevel(farm,pen){return pen.lot===undefined?farm.coop:Math.max(1,farm.coop);}
function projectedPen(room,farm,pen,time){
  return {...projectAnimal(room,{coop:penLevel(farm,pen)},pen,time),acquiredAt:pen.acquiredAt??room.livestockSince??time};
}
const penId=(pen,index)=>pen.id??index;
function removePen(farm,slot){
  farm.nextPenId=Math.max(farm.nextPenId??0,farm.pens.length);
  farm.pens.forEach((pen,i)=>{pen.id??=i;});
  farm.pens.splice(slot,1);
}
export function animalRelocation(farm,pen,lot){
  if(lot!==undefined&&!Number.isSafeInteger(lot))return 'Chuồng không tồn tại.';
  const limit=coopCapacity(farm,lot);
  if(!limit)return 'Chuồng không tồn tại.';
  if(pen.lot===lot)return 'Vật nuôi đang ở chuồng này.';
  if(farm.pens.filter(row=>row.lot===lot).length>=limit)return 'Chuồng đã hết chỗ.';
  return animalRequirement(farm,pen.kind,lot);
}

function theftAccess(room,farm,other,mine,theirs,time){
  if(villageTheftsLeft(room,mine.day)<1)return 'Đã chạm giới hạn vụ trộm của cả làng hôm nay.';
  if(other.shieldUntil>time)return 'Vườn đang đóng cổng.';
  if(mine.taken>=visitLimit(farm))return 'Bạn đã hết lượt ghé lấy hôm nay.';
  if(mine.targets.includes(other.id))return 'Bạn đã lấy một món ở vườn này hôm nay.';
  if(theirs.lost>=theftLossLimit(other))return 'Vườn này đã đạt giới hạn bị lấy hôm nay.';
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
      const base=info.base??1, improvements=(farm[key]??base)-base;
      return sum+info.costs.slice(0,Math.max(0,improvements)).reduce((a,b)=>a+b,0);
    },0);
    const lots=getLand(farm).filter(Boolean);
    const extra=lots.reduce((sum,lot)=>sum+(landTypes[lot.kind]?.cost??0)+(fences[lot.fence]?.cost??0)+(lot.kind==='garden'&&lot.expanded===true?gardenUpgradeCost:0),0);
    const land=lots.slice(2).reduce((sum,_,i)=>sum+lotPrice(i+2),0);
    const decorations=Object.values(farm.decor??{}).reduce((sum,style)=>sum+(fences[style]?.cost??0),0);
    const livestock=farm.pens.reduce((sum,pen)=>sum+animals[pen.kind].cost,0);
    const fixtures=Object.keys(farm.gardenDecor??{}).reduce((sum,item)=>sum+(gardenDecorItems[item]?.cost??0),0);
    const property=specs+extra+land+decorations+fixtures+livestock;
    return {id:farm.id,name:farm.name,coins:farm.coins,inventory,property,total:farm.coins+inventory+property};
  }).sort((a,b)=>b.total-a.total||b.coins-a.coins||a.id.localeCompare(b.id));
}
export const dayGoals=[
  {id:'care',label:'Chăm cây',actions:['till','plant','water','fertilize','spray','weed'],area:'field'},
  {id:'gather',label:'Thu hoạch hay lấy sản phẩm',actions:['harvest','collect','aquaHarvest'],panel:'tasks'},
  {id:'market',label:'Bán nông sản hoặc giao đơn',actions:['sell','order'],area:'market'},
];
export const dayReward={coins:25,xp:xpRewards.journal};
const journalAt=(farm,day)=>farm.journal?.day===day?farm.journal:{day,done:[],claimed:false};
function markDayGoal(farm,action,day){
  const goal=dayGoals.find(entry=>entry.actions.includes(action));
  if(!goal)return;
  const journal=journalAt(farm,day);
  if(!journal.done.includes(goal.id))journal.done.push(goal.id);
  farm.journal=journal;
}

export function snapshot(room, farm, time) {
  const day=dayAt(room,time);
  const plan=schedule(room,time);
  const next=nextSlot(room,time);
  const dayEnds=plan.anchor+(day-plan.base+1)*plan.dayLength;
  const plots=cropIndexes(farm);
  const pondBatches=pondsAt(room,farm,time);
  const me={...farm,avatar:avatarOf(farm.avatar),wellness:wellnessAt(farm,time),plots:farm.plots.map(p=>projectPlot(room,p,time)),pens:farm.pens.map((p,i)=>({...projectedPen(room,farm,p,time),id:penId(p,i)})),
    land:getLand(farm), plotIndexes:plots, pondIndexes:pondIndexes(farm),
    soilCompactsAt:Object.fromEntries(plots.filter(i=>!plotAt(farm,i)).map(i=>[i,compactAt(room,farm,i,time)])),
    extraPlots:Object.fromEntries(plots.filter(i=>mainPlotSlot(i)<0).map(i=>[i,projectPlot(room,plotAt(farm,i),time)])),
    ponds:Object.fromEntries(Object.entries(pondBatches).map(([i,batches])=>[i,batches[0]??null])),
    pondBatches, fishing:fishingState(farm,day,time),
    journal:journalAt(farm,day),daily:dailyAt(room,farm,time)};
  delete me.recent;
  delete me.orders;
  delete me.soilAt;
  delete me.soilSince;
  const fulfilled=townOrdersAt(room,day);
  const orders=orderList(day,room);
  const wealth=wealthRanking(room);
  const wealthByFarm=new Map(wealth.map(entry=>[entry.id,entry.total]));
  return {me,day,now:time,weather:weatherAt(room,time),forecast:weatherAt(room,next),next,afterRainUntil:afterRainUntil(room,time),
    dayEnds, dayLength:plan.dayLength, wealth, villageOwnerId:villageOwner(room),
    orders:orders.filter(order=>!fulfilled.done.includes(order.slot)), nextOrders:orderList(day+1,room), orderCount:orders.length,
    village:{...villageSnapshot(room,day),theftsLeft:villageTheftsLeft(room,day)},
    villageDrive:villageDriveSnapshot(room,farm,time),
    fishingLimit:publicFishingLimit(room),
    listings:Object.values(room.listings).map(listing=>({...listing,sellerName:room.farms[listing.seller].name})),
    neighbors:Object.values(room.farms).filter(f=>f.id!==farm.id).map(f=>{
      const items=candidates(f);
      const publicPlot=i=>{
        const p=projectPlot(room,plotAt(f,i),time);
        return p?{kind:p.kind,stage:cropStage(p),weeds:p.weeds??0,hazard:cropHazard(p),ripe:p.progress>=cropGoal(p),available:p.progress>=cropGoal(p)&&cropYield(p)-(p.picked||0)>=3}:null;
      };
      const indexes=cropIndexes(f);
      const plots=f.plots.map((_,slot)=>publicPlot(mainPlotId(slot)));
      const extraPlots=Object.fromEntries(indexes.filter(i=>mainPlotSlot(i)<0).map(i=>[i,publicPlot(i)]));
      const garden=indexes.flatMap(index=>{
        const p=plotAt({plots,extraPlots},index);
        return p?.available?[{kind:p.kind,index}]:[];
      });
      const pondBatches=Object.fromEntries(Object.entries(pondsAt(room,f,time)).map(([i,batches])=>[i,batches.map(batch=>({
        kind:batch.kind,ripe:pondReady(batch),available:canCatch(batch),
      }))]));
      const ponds=Object.fromEntries(Object.entries(pondBatches).map(([i,batches])=>[i,batches.find(batch=>batch.available)??batches[0]??null]));
      const gardenDecor=Object.fromEntries(Object.entries(f.gardenDecor??{}).filter(([,spot])=>spot!==null));
      return {ponds,pondBatches,land:getLand(f),decor:f.decor,gardenDecor,gardenHelperJob:visibleGardenHelper(f.gardenHelperJob),plots,extraPlots,plotIndexes:cropIndexes(f),pondIndexes:pondIndexes(f),wealth:wealthByFarm.get(f.id)??0,
        visiblePens:f.pens.map(p=>{
          const pen=projectedPen(room,f,p,time);
          return {kind:pen.kind,lot:pen.lot,age:pen.age,growGoal:growthGoal(pen)};
        }),id:f.id,name:f.name,level:farmProgress(f).rank.level,field:f.field,coop:f.coop,workshop:f.workshop??0,fence:f.fence,shieldUntil:f.shieldUntil,garden,items,animalCount:f.pens.length,
        available:Math.max(0,theftLossLimit(f)-dailyAt(room,f,time).lost)};
    })};
}
export function apply(room,id,input,now,catchRoll=0.5,{area,superAdmin=false}={}){
  advanceGardenHelpers(room,now);
  const farm=room.farms[id];
  startLivestockClock(room,now);
  if(input.action==='villageGoods'){
    advanceVillageDrive(room,now);
    return donateVillageGoods(room,farm,input,now);
  }
  if(input.action==='removeMember'){
    const {target}=input;
    const owner=villageOwner(room);
    check(id===owner||superAdmin,'Chỉ chủ làng hoặc super admin mới có thể mời thành viên ra.');
    check(target!==owner,'Chủ làng không thể bị mời ra.');
    check(target!==id&&has(room.farms,target),'Thành viên này không còn trong làng hoặc là vườn của bạn.');
    const name=room.farms[target].name;
    delete room.farms[target];
    for(const [key,listing] of Object.entries(room.listings)){
      if(listing.seller===target)delete room.listings[key];
    }
    for(const member of Object.values(room.farms)){
      if(member.fishing?.cast?.target===target)member.fishing.cast=null;
    }
    const message='Đã mời '+name+' ra khỏi làng.';
    record(farm,now,message);
    return message;
  }
  if(input.action==='avatar'){
    check(has(avatars,input.item),'Nhân vật không hợp lệ.');
    farm.avatar=input.item;
    return 'Đã chọn nhân vật '+avatars[input.item].toLowerCase()+'.';
  }
  const health=wellnessAt(farm,now);
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
    if(recovery==='stamina'){
      check(area==='home','Hãy vào Nhà vườn để bắt đầu nghỉ.');
      check(!(health.restUntil>now),'Bạn đang nghỉ. Hãy chờ lượt này kết thúc.');
      check(health.stamina<100,'Thể lực đã đầy.');
      health.restUntil=now+restSeconds;
      delete health.until.stamina;
      farm.wellness=health;
      return 'Đang nghỉ '+restSeconds+' giây để hồi thể lực.';
    }
    check((health.until[recovery]??0)<=now,'Bạn vừa hồi phục. Hãy chờ một chút.');
    check(health[recovery]<99,'Chỉ số này đã đầy.');
    health[recovery]=Math.min(100,health[recovery]+info.gain);
    health.until[recovery]=now+info.cooldown;
    farm.wellness=health;
    return {water:'Đã uống nước.',food:'Đã ăn cơm nắm.'}[recovery];
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
  const xpBefore=farm.xp;
  const message=applyAction(room,id,input,now,catchRoll);
  markDayGoal(farm,input.action,day);
  if(cost)farm.wellness=spendWork(health,cost);
  const xp=farm.xp-xpBefore;
  const feedback=message+(xp>0?' +'+xp+' XP.':'');
  return advanceVillage(room,day)?feedback+' Cả làng đã lên cấp '+villageLevels[room.village.level]+'!':feedback;
}
function applyAction(room,id,input,now,catchRoll){
  const farm=room.farms[id];
  const {action,item,index,target,source}=input;
  const qty=input.qty??1;
  const quantityLimit=action==='sell'?Infinity:action==='buy'?supplyLimit:20;
  check(Number.isSafeInteger(qty)&&qty>=1&&qty<=quantityLimit,'Số lượng không hợp lệ.');
  if(action==='hireGardenHelper')return hireGardenHelper(room,farm,input,now);
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
  if(action==='arrangeGardenDecor'){
    const owned=farm.gardenDecor??{};
    const placed=Object.keys(gardenDecorItems).filter(kind=>owned[kind]);
    check(placed.length>0,'Hãy đặt ít nhất một món trang trí trước.');
    for(const kind of placed)owned[kind]=gardenDecorRecommendedSpots[kind];
    return 'Đã sắp xếp đồ trang trí theo bối cảnh vườn.';
  }
  if(action==='placeGardenDecor'||action==='stowGardenDecor'){
    check(has(gardenDecorItems,item),'Món trang trí không tồn tại.');
    const owned=farm.gardenDecor??{};
    const name=gardenDecorItems[item].name.toLowerCase();
    if(action==='stowGardenDecor'){
      check(owned[item],'Món này chưa được đặt trong vườn.');
      owned[item]=null;
      return 'Đã cất '+name+'.';
    }
    check(has(gardenDecorSpots,target),'Vị trí trang trí không hợp lệ.');
    check(!gardenDecorAt(farm,target),'Vị trí này đã có món trang trí.');
    if(!has(owned,item)){
      check(source==='coins'||source==='voucher','Hãy chọn cách thanh toán.');
      if(source==='coins')spend(farm,gardenDecorItems[item].cost);
      else{
        check((farm.decorVouchers??0)>0,'Bạn chưa có phiếu trang trí.');
        farm.decorVouchers--;
      }
    }
    owned[item]=target;
    farm.gardenDecor=owned;
    return 'Đã đặt '+name+' ở '+gardenDecorSpots[target].name.toLowerCase()+'.';
  }
  if(action==='buyLand'||action==='buildLand'||action==='decorate'||action==='upgradeGarden'){
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
    if(action==='upgradeGarden'){
      check(land[index]?.kind==='garden','Hãy chọn mảnh đất đã làm vườn.');
      check(land[index].expanded!==true,'Vườn đã có đủ 6 ô trồng.');
      spend(farm,gardenUpgradeCost);
      land[index]={...land[index],expanded:true};farm.land=land;
      for(let slot=3;slot<6;slot++)setSoilTime(farm,gardenPlotId(index,slot),now);
      record(farm,now,'Mở thêm 3 ô trồng ở vườn ô '+(index+1)+'.');
      return 'Vườn ô '+(index+1)+' đã có 6 ô trồng.';
    }
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
      const reason=aquaRequirement(farm,item);
      check(!reason,reason);
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
    check(batch,'Hãy chọn lứa thủy sản cần chăm.');
    const def=aquatic[batch.kind];
    if(action==='aquaFeed'){
      check(!pondReady(batch)&&batch.fedUntil<=now,'Ao đang còn thức ăn hoặc đã tới kỳ thu hoạch.');
      use(farm,'aquaFeed',pondFood(batch));
      batch.fedUntil=now+Math.ceil(def.time*1.5);
      farm.ponds=ponds;
      return 'Đã cho lứa thủy sản ăn.';
    }
    check(pondReady(batch),'Lứa thủy sản chưa đủ lớn.');
    const amount=pondYield(batch);
    roomFor(farm,amount);
    add(farm,batch.kind,amount);
    ponds[key]=batches.filter(row=>row!==batch);farm.ponds=ponds;farm.xp+=xpRewards.aquaHarvest;
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
    const reason=crop?cropRequirement(farm,crop):aquaSupplyRequirement(farm,item);
    check(!reason,reason);
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
    const order=orderList(day,room).find(o=>o.id===index);
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
    const {level,cost,materials}=buildingUpgrade(farm,item);
    check(cost,'Công trình đã đạt cấp tối đa.');
    check(!upgradeRequirement(farm,item),upgradeRequirement(farm,item));
    spend(farm,cost);
    for(const [key,count] of Object.entries(materials))use(farm,key,count);
    if(item==='coop') farm.pens=farm.pens.map(p=>projectedPen(room,farm,p,now));
    farm[item]=level+1;
    if(item==='field'){
      const first=farm.plots.length;
      farm.plots.push(null,null,null);
      for(let slot=first;slot<farm.plots.length;slot++)setSoilTime(farm,mainPlotId(slot),now);
    }
    farm.xp+=xpRewards.upgrade;
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
    farm.pens.push({id:penId,kind:item,at:now,acquiredAt:now,age:0,progress:0,growGoal:info.grow,productGoal:info.time,fedUntil:0,...(lot===undefined?{}:{lot})});
    farm.nextPenId=penId+1;
    return 'Đã đón '+info.name.toLowerCase()+' về chuồng.';
  }
  if(['feed','collect','moveAnimal','sellAnimal'].includes(action)) {
    const slot=target===undefined?index:farm.pens.findIndex((pen,i)=>String(penId(pen,i))===target);
    check(Number.isInteger(slot)&&farm.pens[slot],'Vật nuôi không tồn tại.');
    const pen=projectedPen(room,farm,farm.pens[slot],now), info=animals[pen.kind];
    if(action==='moveAnimal'){
      check(target!==undefined&&Number.isSafeInteger(index),'Hãy chọn vật nuôi và chuồng đích.');
      const lot=index===-1?undefined:index;
      const reason=animalRelocation(farm,pen,lot);
      check(!reason,reason);
      if(lot===undefined)delete pen.lot;
      else pen.lot=lot;
      farm.pens[slot]=pen;
      const message='Đã chuyển '+info.name.toLowerCase()+' sang '+(lot===undefined?'chuồng chính':'chuồng ở ô '+(lot+1))+'.';
      record(farm,now,message);
      return message;
    }
    const condition=animalCondition(pen,now);
    if(action==='sellAnimal'){
      check(target!==undefined,'Hãy chọn vật nuôi cần bán.');
      removePen(farm,slot);
      farm.coins+=condition.sale;
      addVillageIncome(room,condition.sale);
      const message='Đã bán '+info.name.toLowerCase()+' · +'+condition.sale+' xu.';
      record(farm,now,message);
      return message;
    }
    if(action==='feed') {
      check(!info.oneTime||pen.progress<productGoal(pen),info.name+' đã sẵn sàng xuất chuồng.');
      check(pen.fedUntil<=now,'Vật nuôi vẫn còn thức ăn.');
      use(farm,'feed',info.food);
      pen.fedUntil=now+Math.ceil((growthGoal(pen)+productGoal(pen))*1.25);
    } else {
      check(pen.progress>=productGoal(pen),'Sản phẩm chưa sẵn sàng.');
      roomFor(farm,condition.yield);
      add(farm,info.product,condition.yield);
      farm.xp+=xpRewards.collect;
      if(info.oneTime){
        removePen(farm,slot);
        return 'Đã xuất chuồng, thu '+info.yield+' '+goods[info.product].name.toLowerCase()+'.';
      }
      pen.progress=0;
      pen.growGoal=info.grow;pen.age=info.grow;pen.productGoal=info.time;
    }
    farm.pens[slot]=pen;
    return action==='feed'?'Đã cho ăn.':'Đã thu '+condition.yield+' '+goods[info.product].name.toLowerCase()+'.';
  }
  if(action==='shield'){
    check(farm.shieldUntil<=now,'Vườn đang được bảo vệ.');
    spend(farm,12); farm.shieldUntil=now+gateMinutes(farm)*60;
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
  check(['till','plant','water','fertilize','spray','weed','harvest'].includes(action),'Thao tác không hợp lệ.');
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
    savePlot(farm,index,{kind:item,goal:crops[item].time,progress:0,pests:0,weeds:0,hazard:plantedHazard(farm,index,now,weatherAt(room,now)),at:now,plantedAt:now,wetUntil:0,protectedUntil:0,weedProtectedUntil:0,fertilized:false,picked:0});
    return 'Đã gieo '+goods[item].name.toLowerCase()+'.';
  }
  const blocked=plotWorkBlock(action,plot,action==='water'?weatherAt(room,now):null,now);
  check(!blocked,blocked);
  if(action==='harvest') {
    const amount=harvestAmount(plot);
    const seed=crops[plot.kind].seed;
    const reserve=input.source==='seed'?1:0;
    if(reserve){
      check(amount>=1,'Không còn nông sản để giữ giống.');
      check(own(farm,seed)<100,'Túi đã đầy giống này.');
    }
    roomFor(farm,amount-reserve);
    harvestPlot(farm,index,plot,now,amount,reserve);
    if(amount===reserve)return 'Đã giữ 1 '+goods[seed].name.toLowerCase()+' để gieo lại.';
    return 'Thu được '+(amount-reserve)+' '+goods[plot.kind].name.toLowerCase()+(reserve?' và giữ lại 1 giống.':'.');
  }
  if(action==='water'){
    waterPlot(farm,index,plot,now);
    return 'Đã tưới nước.';
  }
  if(action==='weed'){
    plot.weedPeak=Math.max(plot.weedPeak??0,plot.weeds);
    plot.weeds=0;plot.weedProtectedUntil=now+20*60;
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
  return {fertilize:'Đã bón phân.',spray:'Đã xử lý sâu bệnh.',weed:'Đã nhổ cỏ. Cỏ không mọc lại trong 20 phút; tổn thất đã xảy ra vẫn được giữ.'}[action];
}
