// Versioned, server-owned quotes. Never derive food value from missing goods.sell.
export const fairTheme='country-kitchen-v1';
export const fairTitle='Bếp quê ngày chợ';
const definitions=[
  {id:'bread',name:'Bánh quê',required:12,choices:[{item:'wheat',credit:1,value:6},{item:'bread',credit:2,value:12}]},
  {id:'garden',name:'Rau vườn',required:12,choices:[{item:'carrot',credit:1,value:10},{item:'corn',credit:1,value:15}]},
  {id:'drinks',name:'Quầy nước',required:8,choices:[{item:'carrot',credit:1,value:10},{item:'carrotJuice',credit:2,value:20}]},
];
export const isFair=drive=>drive?.version===3&&drive.themeId===fairTheme;
export function createFair(id,memberCount,previous){
  const factor=memberCount===1?.5:memberCount===2?.75:1;
  return {id,version:3,themeId:fairTheme,contentVersion:1,title:fairTitle,memberCount,
    stalls:definitions.map(s=>({...s,required:Math.ceil(s.required*factor),choices:s.choices.map(c=>({...c})),delivered:{}})),
    contributors:{},previous};
}
export function fairStalls(drive){
  return drive.stalls.map(s=>{
    const delivered=s.choices.reduce((n,c)=>n+(s.delivered[c.item]??0)*c.credit,0),remaining=Math.max(0,s.required-delivered);
    return {...s,delivered:{...s.delivered},credit:delivered,remaining,
      choices:s.choices.map(c=>({...c,delivered:s.delivered[c.item]??0,maximum:Math.floor(remaining/c.credit)}))};
  });
}
export function fairItems(drive){
  return fairStalls(drive).flatMap(s=>s.choices.map(c=>({item:c.item,stallId:s.id,stallName:s.name,required:null,delivered:c.delivered,remaining:c.maximum,credit:c.credit})));
}
export const fairComplete=drive=>fairStalls(drive).every(s=>s.remaining===0);
