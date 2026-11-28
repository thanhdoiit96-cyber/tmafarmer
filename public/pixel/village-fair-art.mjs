export const fairArt={plate:'/pixel/village-fair-clean-v1.png',source:'/pixel/village-fair-props-v1.png',cell:64};
export const fairCounters=[
  {id:'bread',y:126,vendor:[90,119],slots:[{item:'wheat',x:69,empty:1,small:4,full:5},{item:'bread',x:111,empty:0,small:6,full:7}]},
  {id:'garden',y:117,vendor:[239,109],slots:[{item:'carrot',x:213,empty:2,small:8,full:9},{item:'corn',x:256,empty:2,small:10,full:11}]},
  {id:'drinks',y:126,vendor:[392,117],slots:[{item:'carrot',x:371,empty:2,small:8,full:9},{item:'carrotJuice',x:412,empty:3,small:12,full:13}]},
];
export function fairDisplayFrame(stall,slot){
  if(!(stall.delivered[slot.item]>0))return slot.empty;
  return stall.credit/stall.required>=.75?slot.full:slot.small;
}
