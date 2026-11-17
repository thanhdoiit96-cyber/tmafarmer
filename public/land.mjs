export const starterLots=2;
export const homesteadSize={width:820,height:640};
export const lotCount=8;
export const lotSize={w:148,h:81};
export const mainPond={x:547,y:125,w:145,h:211,shape:'rect'};
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
export const plotOffset=12;
export const pondOffset=2;
export function cropIndexes(farm){
  const result=farm.plots.map((_,i)=>i);
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
  const area=index===0?mainPond.w*mainPond.h:(lotSize.w-lotPondInset.w)*(lotSize.h-lotPondInset.h);
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
