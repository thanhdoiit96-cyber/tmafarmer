export function farmNavigation(farm,{tab='field',panel='area',visiting=false}={}){
  const place=(id,label,icon)=>({id,label,icon,area:id});
  const entries=[place('field','Vườn nhà','leaf'),place('home','Nhà vườn','home')];
  if((farm.workshop??0)>0)entries.push(place('workshop','Xưởng máy','build'));
  entries.push({id:'stock',label:'Kho',icon:'warehouse',panel:'stock'},place('coop','Chuồng trại','livestock'),{id:'ponds',label:'Ao nuôi',icon:'pond',panel:'ponds'},place('lake','Ao làng','fish'),place('market','Chợ làng','market'),place('neighbors','Hàng xóm','users'));
  const active=!visiting&&['stock','ponds'].includes(panel)?panel:tab;
  return entries.map(entry=>({...entry,active:entry.id===active}));
}
