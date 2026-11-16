export const starterLots=2;
export const homesteadSize={width:820,height:640};
export const lotCount=8;
export const landTypes={
  garden:{name:'Vườn',cost:45},
  fish:{name:'Ao cá',cost:55},
  shrimp:{name:'Ao tôm',cost:55},
  coop:{name:'Chuồng',cost:70},
};
export const fences={wood:{name:'Gỗ mật ong',cost:12},white:{name:'Gỗ sơn trắng',cost:16},bamboo:{name:'Tre xanh',cost:14}};
export const lotPrice=owned=>65+Math.max(0,owned-starterLots)*20;
export const getLand=farm=>farm.land??Array.from({length:lotCount},(_,i)=>i<starterLots?{kind:'empty'}:null);
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
  return [0,1,...getLand(farm).flatMap((lot,i)=>lot?.kind==='fish'||lot?.kind==='shrimp'?[pondOffset+i]:[])];
}
export function pondSpecies(farm,index){
  const kind=getLand(farm)[index-pondOffset]?.kind;
  if(index===0||kind==='fish')return ['tilapia','carp'];
  if(index===1||kind==='shrimp')return ['prawn'];
  return null;
}
export function coopCapacity(farm,lot){
  if(lot===undefined)return farm.coop*2;
  return getLand(farm)[lot]?.kind==='coop'?2:0;
}
export function fenceAt(farm,index){
  return index<0?farm.decor?.[index]:getLand(farm)[index]?.fence;
}
