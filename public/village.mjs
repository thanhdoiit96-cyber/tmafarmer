export const villageLevels=['Làng','Xã','Phường','Quận','Thành phố'];
const theftCaps=[12,8,5,3,1];
const milestones=[
  {id:'notice',name:'Bảng tin làng',cost:300,income:800,orders:12,theft:5,peaceDays:2},
  {id:'well',name:'Giếng công cộng',cost:850,income:2200,orders:30,theft:3,peaceDays:3},
  {id:'dock',name:'Bến cá',cost:1700,income:5000,orders:60,theft:2,peaceDays:4},
  {id:'hall',name:'Nhà sinh hoạt',cost:3200,income:9500,orders:108,theft:0,peaceDays:5},
];
const retention=1+Math.max(...milestones.map(goal=>goal.peaceDays));

const villageAt=room=>room.village??{level:0,income:0,orders:0,fund:0,built:[],thefts:{}};
const villageFor=room=>room.village??=villageAt(room);
export const hasVillageProject=(room,id)=>room.village?.built.includes(id)??false;
export const villageTheftCap=room=>theftCaps[villageAt(room).level];
export const villageTheftsToday=(room,day)=>villageAt(room).thefts[day]??0;
export const villageTheftsLeft=(room,day)=>Math.max(0,villageTheftCap(room)-villageTheftsToday(room,day));

export function startVillageSecurity(room,day){
  if(room.securityStartDay!==undefined)return false;
  room.securityStartDay=day;
  return true;
}

function peaceStreak(room,village,day,goal){
  let days=0;
  const earliest=room.securityStartDay??day;
  while(days<goal.peaceDays&&day-days-1>=earliest&&(village.thefts[day-days-1]??0)<=goal.theft)days++;
  return days;
}

export function villageSnapshot(room,day){
  const village=villageAt(room), milestone=milestones[village.level];
  return {
    level:village.level,name:villageLevels[village.level],income:village.income,orders:village.orders,
    theftsToday:villageTheftsToday(room,day),theftCap:villageTheftCap(room),fund:village.fund,
    built:milestones.filter(project=>village.built.includes(project.id)).map(({id,name})=>({id,name})),
    next:milestone?{...milestone,peaceStreak:peaceStreak(room,village,day,milestone),
      levelName:villageLevels[village.level+1],built:village.built.includes(milestone.id)}:null,
  };
}

export function advanceVillage(room,day){
  const village=villageAt(room), goal=milestones[village.level];
  if(!goal||!village.built.includes(goal.id)||village.income<goal.income||village.orders<goal.orders||
     villageTheftsToday(room,day)>goal.theft||peaceStreak(room,village,day,goal)<goal.peaceDays)return false;
  village.level++;
  return true;
}

export function addVillageIncome(room,amount,order=false){
  const village=villageFor(room);
  village.income+=amount;
  if(order)village.orders++;
}

export function recordVillageTheft(room,day){
  const village=villageFor(room);
  village.thefts=Object.fromEntries(Object.entries(village.thefts).filter(([key])=>Number(key)>day-retention&&Number(key)<=day));
  village.thefts[day]=(village.thefts[day]??0)+1;
}

export function contributeVillage(room,farm,item,amount){
  const village=villageAt(room), project=milestones[village.level];
  if(!project||project.id!==item||village.built.includes(item))return {error:'Dự án này đã kết thúc. Hãy xem dự án hiện tại.'};
  if(!Number.isSafeInteger(amount)||amount<1||amount>project.cost-village.fund)return {error:'Số xu góp phải nằm trong phần kinh phí còn thiếu.'};
  if(farm.coins<amount)return {error:'Bạn chưa đủ xu để góp.'};
  room.village=village;
  farm.coins-=amount;
  village.fund+=amount;
  if(village.fund<project.cost)return {message:'Đã góp '+amount+' xu cho '+project.name+'.'};
  village.fund=0;
  village.built.push(project.id);
  return {message:'Đã góp '+amount+' xu. Hoàn thành '+project.name+'!'};
}
