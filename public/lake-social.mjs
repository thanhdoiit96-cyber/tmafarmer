// Bounded, farm-owned progress; independent from theft and village security.
export const lakeSpecies=['minnow','tilapia','goldenCarp'];
export const shoreWork={x:326,y:350,seconds:10,pulseGap:4,marks:2,cap:6,minXp:25};
export const helpDay=(farm,day)=>farm.neighborHelp?.day===day?farm.neighborHelp:{day,given:0,received:0,targets:{}};
export const lakeDay=(farm,day)=>farm.lakeDaily?.day===day?farm.lakeDaily:{day,worked:false,exchanged:false};
export function fishBook(farm){
  return Object.fromEntries(lakeSpecies.map(key=>[key,{count:farm.fishBook?.[key]?.count??0,firstAt:farm.fishBook?.[key]?.firstAt??null}]));
}
export const fishBookComplete=farm=>lakeSpecies.every(key=>(farm.fishBook?.[key]?.count??0)>0);
export function recordLakeCatch(farm,item,time){
  if(!lakeSpecies.includes(item))return;
  const prior=farm.fishBook?.[item];
  farm.fishBook={...farm.fishBook,[item]:{count:(prior?.count??0)+1,firstAt:prior?.firstAt??time}};
}
