export const starterLots=2;
export const homesteadSize={width:820,height:640};
export const lotCount=8;
export const lotSize={w:190,h:48};
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
export const lotRect=i=>({x:260+(i%2)*246,y:375+Math.floor(i/2)*56,...lotSize});
// Livestock yards grow outward, preserving the central 56-unit access lane.
export const coopRect=i=>{const area=lotRect(i);return {...area,x:area.x-(i%2===0?30:0),w:area.w+30};};
export const plotOffset=12;
const upperFieldOffset=plotOffset+lotCount*3;
export const pondOffset=2;
export const mainPlotId=slot=>slot<plotOffset?slot:upperFieldOffset+slot-plotOffset;
export const mainPlotSlot=index=>index<plotOffset?index:index>=upperFieldOffset?index-upperFieldOffset+plotOffset:-1;
export function plotPosition(index){
  const slot=mainPlotSlot(index);
  if(slot>=0)return slot<plotOffset
    ?{x:255+(slot%3)*45,y:96+Math.floor(slot/3)*40}
    :{x:255+((slot-plotOffset)%6)*45,y:302+Math.floor((slot-plotOffset)/6)*26};
  const lot=lotRect(Math.floor((index-plotOffset)/3));
  return {x:lot.x+34+((index-plotOffset)%3)*61,y:lot.y+27};
}
export const plotAt=(farm,index)=>{
  const slot=mainPlotSlot(index);
  return slot<0?farm.extraPlots?.[index]:farm.plots[slot];
};
export function cropIndexes(farm){
  const result=farm.plots.map((_,slot)=>mainPlotId(slot));
  getLand(farm).forEach((lot,i)=>{
    if(lot?.kind==='garden')for(let j=0;j<3;j++)result.push(plotOffset+i*3+j);
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
  gate:{name:'Bên cổng vườn',x:154,y:599},
  pond:{name:'Bãi cỏ dưới ao',x:600,y:350},
  marketPath:{name:'Góc nghỉ dưới xưởng',x:154,y:445},
  wellside:{name:'Bãi cỏ cạnh giếng',x:157,y:298},
  westMeadow:{name:'Bãi cỏ phía tây',x:88,y:494},
  barnSide:{name:'Bờ cỏ cạnh ruộng',x:532,y:350},
  workshopPath:{name:'Sân hoa dưới xưởng',x:82,y:444},
  pondBank:{name:'Góc cỏ cạnh bờ ao',x:682,y:350},
  southPath:{name:'Bên đường xuống vườn',x:155,y:503},
  westLots:{name:'Vườn hoa phía tây',x:93,y:549},
  midLots:{name:'Góc nghỉ phía tây nam',x:152,y:552},
  eastLots:{name:'Góc cỏ cuối vườn',x:94,y:605},
};
export function gardenDecorAt(farm,spot){
  return Object.keys(gardenDecorItems).find(item=>farm.gardenDecor?.[item]===spot);
}
