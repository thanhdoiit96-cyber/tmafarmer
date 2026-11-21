export const starterLots=2;
export const homesteadSize={width:820,height:900};
export const lotCount=8;
export const lotSize={w:190,h:100};
export const gardenUpgradeCost=120;
export const mainPond={x:500,y:160,w:280,h:145,shape:'rect'};
export const lotPondInset={x:9,y:8,w:18,h:16};
export const landTypes={
  garden:{name:'Vườn',cost:45},
  pond:{name:'Ao nuôi',cost:55},
  coop:{name:'Chuồng',cost:70},
};
export const fences={wood:{name:'Gỗ mật ong',cost:12},white:{name:'Gỗ sơn trắng',cost:16},bamboo:{name:'Tre xanh',cost:14}};
export const lotPrice=owned=>65+Math.max(0,owned-starterLots)*20;
export const pondLotKind=kind=>kind==='fish'||kind==='shrimp'?'pond':kind;
export function getLand(farm){
  if(!farm.land)return Array.from({length:lotCount},(_,i)=>i<starterLots?{kind:'empty'}:null);
  return farm.land.map(lot=>lot&&lot.kind!==pondLotKind(lot.kind)?{...lot,kind:'pond'}:lot);
}
// Saved parcel indexes stay stable; only their world placement changes.
// Keep all eight parcels east of the stone lane and inside the leafy border.
export const lotRect=i=>({x:260+(i%2)*246,y:395+Math.floor(i/2)*116,...lotSize});
export const coopRect=i=>lotRect(i);
export const plotOffset=12;
const upperFieldOffset=plotOffset+lotCount*3;
// Separate namespace: never reinterpret existing main-field or parcel IDs.
const upgradedPlotOffset=10000;
export const gardenPlotId=(lot,slot)=>slot<3?plotOffset+lot*3+slot:upgradedPlotOffset+lot*3+slot-3;
export function gardenForPlot(index){
  if(!Number.isInteger(index))return -1;
  if(index>=plotOffset&&index<upperFieldOffset)return Math.floor((index-plotOffset)/3);
  if(index>=upgradedPlotOffset&&index<upgradedPlotOffset+lotCount*3)return Math.floor((index-upgradedPlotOffset)/3);
  return -1;
}
export const gardenPlotSlot=index=>gardenForPlot(index)<0?-1:index>=upgradedPlotOffset?(index-upgradedPlotOffset)%3+3:(index-plotOffset)%3;
export const gardenPlotCount=lot=>lot?.kind==='garden'?(lot.expanded===true?6:3):0;
export const pondOffset=2;
export const mainPlotId=slot=>slot<plotOffset?slot:upperFieldOffset+slot-plotOffset;
export const mainPlotSlot=index=>index<plotOffset?index:index>=upperFieldOffset&&index<upgradedPlotOffset?index-upperFieldOffset+plotOffset:-1;
export function plotPosition(index){
  const slot=mainPlotSlot(index);
  if(slot>=0)return slot<plotOffset
    ?{x:255+(slot%3)*42,y:96+Math.floor(slot/3)*34}
    :{x:255+((slot-plotOffset)%6)*42,y:302+Math.floor((slot-plotOffset)/6)*26};
  const lot=lotRect(gardenForPlot(index)),cell=gardenPlotSlot(index);
  return {x:lot.x+49+(cell%3)*46,y:lot.y+36+Math.floor(cell/3)*38};
}
export const plotAt=(farm,index)=>{
  const slot=mainPlotSlot(index);
  return slot<0?farm.extraPlots?.[index]:farm.plots[slot];
};
export function cropIndexes(farm){
  const result=farm.plots.map((_,slot)=>mainPlotId(slot));
  getLand(farm).forEach((lot,i)=>{
    for(let j=0;j<gardenPlotCount(lot);j++)result.push(gardenPlotId(i,j));
  });
  return result;
}
export function pondIndexes(farm){
  return [0,...getLand(farm).flatMap((lot,i)=>lot?.kind==='pond'?[pondOffset+i]:[])];
}
export function pondCapacity(farm,index){
  if(!Number.isInteger(index)||!pondIndexes(farm).includes(index))return 0;
  // The starter pond keeps its existing six-slot gameplay capacity even as
  // the shoreline artwork grows to fill the redesigned right-side basin.
  if(index===0)return 6;
  // Capacity is a gameplay rule, independent of the visual parcel footprint.
  return 2;
}
export function coopCapacity(farm,lot){
  if(lot===undefined)return farm.coop*2;
  return getLand(farm)[lot]?.kind==='coop'?2:0;
}
export function fenceAt(farm,index){
  if(index===-2)return farm.decor?.[-2]??farm.decor?.[-3];
  return index<0?farm.decor?.[index]:getLand(farm)[index]?.fence;
}
export const gardenDecorItems={
  flowerPot:{name:'Chậu hoa',cost:45,width:33},
  bambooLamp:{name:'Đèn tre',cost:75,width:39},
  gardenSign:{name:'Bảng tên',cost:60,width:50},
  bambooBench:{name:'Ghế tre',cost:55,width:44},
  wheelbarrow:{name:'Xe cút kít gỗ',cost:70,width:46},
  waterJar:{name:'Lu nước',cost:50,width:37},
  scarecrow:{name:'Bù nhìn rơm',cost:65,width:42},
  lotusPot:{name:'Chậu sen',cost:75,width:41},
  windChime:{name:'Chuông gió tre',cost:60,width:38},
  flowerArch:{name:'Vòm hoa giấy',cost:110,width:48},
  wickerBasket:{name:'Giỏ mây',cost:35,width:39},
  hayBale:{name:'Kiện rơm',cost:40,width:45},
  birdFeeder:{name:'Máng chim',cost:85,width:40},
};
export const gardenDecorSpots={
  house:{name:'Bậc hiên bên trái nhà',x:95,y:184},
  gate:{name:'Đèn bên cổng vườn',x:154,y:830},
  pond:{name:'Bảng tên cạnh cổng',x:155,y:863},
  marketPath:{name:'Ghế nghỉ bên ao',x:600,y:334},
  wellside:{name:'Sân dụng cụ cạnh kho',x:474,y:210},
  westMeadow:{name:'Góc lu nước bên hiên',x:66,y:184},
  barnSide:{name:'Bờ cỏ cạnh ruộng',x:532,y:350},
  workshopPath:{name:'Chậu sen cạnh ghế nghỉ',x:640,y:341},
  pondBank:{name:'Chuông gió bên hiên',x:181,y:184},
  southPath:{name:'Cổng hoa trên lối vào',x:205,y:870},
  westLots:{name:'Giỏ mây bên xưởng',x:166,y:400},
  midLots:{name:'Góc rơm cạnh kho',x:386,y:210},
  eastLots:{name:'Máng chim dưới giếng',x:83,y:300},
};
export const gardenDecorRecommendedSpots={
  flowerPot:'house',bambooLamp:'gate',gardenSign:'pond',bambooBench:'marketPath',
  wheelbarrow:'wellside',waterJar:'westMeadow',scarecrow:'barnSide',lotusPot:'workshopPath',
  windChime:'pondBank',flowerArch:'southPath',wickerBasket:'westLots',hayBale:'midLots',birdFeeder:'eastLots',
};
export const gardenParcelRect=i=>lotRect(i);
export function gardenDecorAt(farm,spot){
  return Object.keys(gardenDecorItems).find(item=>farm.gardenDecor?.[item]===spot);
}
