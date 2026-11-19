// Single source of truth for farm rank thresholds and display titles.
// Unlocks, crop and animal gates, recipes, and building costs remain authored
// with their gameplay definitions; the progression checker validates that data.
export const farmRanks = [
  {level:1,xp:0,name:'Tân nông'},
  {level:2,xp:25,name:'Người vun trồng'},
  {level:3,xp:70,name:'Nhà nông'},
  {level:4,xp:130,name:'Chủ trang trại'},
  {level:5,xp:350,name:'Bậc thầy canh tác'},
  {level:6,xp:560,name:'Chủ nông trại lớn'},
  {level:7,xp:1250,name:'Nông gia lão luyện'},
  {level:8,xp:2200,name:'Nông gia xuất sắc'},
  {level:9,xp:3200,name:'Nhà nông chuyên canh'},
  {level:10,xp:5000,name:'Nhà vườn trù phú'},
  {level:11,xp:7600,name:'Bậc thầy mùa vụ'},
  {level:12,xp:11200,name:'Nông gia tinh anh'},
  {level:13,xp:16000,name:'Nông gia di sản'},
];

export const progressionLevelForXp = xp => farmRanks.findLast(rank => rank.xp <= xp) ?? farmRanks[0];
