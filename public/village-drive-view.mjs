export function driveItem(drive,farm,item,now){
  const row=drive?.items.find(row=>row.item===item);
  if(!row)return null;
  const remaining=Math.max(0,row.required-row.delivered),owned=farm.inventory[item]??0;
  const active=!drive.completed&&now<drive.endsAt;
  return {...row,remaining,owned,active,maximum:active?Math.min(remaining,owned):0};
}
