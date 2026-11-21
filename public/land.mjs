export const starterLots=2;
export const homesteadSize={width:820,height:640};
export const lotCount=8;
export const lotSize={w:148,h:81};
export const mainPond={x:500,y:110,w:320,h:250,shape:'rect'};
export const lotPondInset={x:9,y:8,w:18,h:24};
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
// Keep the four-column parcel grid regular so the two current rows can grow
// southward without changing saved land indexes.
export const lotRect=i=>({x:54+(i%4)*190,y:423+Math.floor(i/4)*108,...lotSize});
export const plotOffset=12;
const upperFieldOffset=plotOffset+lotCount*3;
export const pondOffset=2;
export const mainPlotId=slot=>slot<plotOffset?slot:upperFieldOffset+slot-plotOffset;
export const mainPlotSlot=index=>index<plotOffset?index:index>=upperFieldOffset?index-upperFieldOffset+plotOffset:-1;
export function plotPosition(index){
  const slot=mainPlotSlot(index);
  if(slot>=0)return {x:[260,318,376][slot%3],y:slot<plotOffset?80+Math.floor(slot/3)*56:300+Math.floor((slot-plotOffset)/3)*52};
  const lot=lotRect(Math.floor((index-plotOffset)/3));
  return {x:lot.x+25+(index%3)*49,y:lot.y+47};
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
  const area=(lotSize.w-lotPondInset.w)*(lotSize.h-lotPondInset.h);
  return Math.ceil(area/5500);
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
  house:{name:'Sân nhà',x:132,y:151},
  gate:{name:'Lối vào vườn',x:266,y:251},
  pond:{name:'Lối ra ao',x:553,y:370},
  marketPath:{name:'Lối sang chợ',x:264,y:44},
  wellside:{name:'Bên giếng',x:120,y:200},
  westMeadow:{name:'Bãi cỏ phía tây',x:115,y:277},
  barnSide:{name:'Trước kho',x:431,y:185},
  workshopPath:{name:'Lối cạnh xưởng',x:523,y:202},
  pondBank:{name:'Bờ ao phía đông',x:727,y:322},
  southPath:{name:'Lối xuống quỹ đất',x:126,y:386},
  westLots:{name:'Bờ đất phía tây',x:28,y:476},
  midLots:{name:'Lối giữa các ô đất',x:414,y:495},
  eastLots:{name:'Bờ đất phía đông',x:794,y:563},
};
export function gardenDecorAt(farm,spot){
  return Object.keys(gardenDecorItems).find(item=>farm.gardenDecor?.[item]===spot);
}
