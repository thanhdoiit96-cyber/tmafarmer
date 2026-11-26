// One stationary NPC; no economic rewards or save state.
export const lakeElder={
  name:'Ông Sáu',type:'lake-elder',x:260,y:365,
  approach:{x:286,y:374},hitBox:{x:244,y:321,w:32,h:48},
};
export const lakeElderLines={
  sun:'Nắng dịu rồi, cháu ghé bến câu nhé. Tiện tay dọn ít cỏ bờ ao cho lối đi sạch hơn.',
  rain:'Mưa tưới mát cả vườn. Cháu đi chậm trên cầu nhé; giỏ cá đẹp cũng cần một chút kiên nhẫn.',
  cloud:'Trời mát, đứng bên bờ nghe nước một lát cũng vui. Cháu muốn câu hay xem sổ cá?',
  heat:'Nắng gắt rồi, cháu nhớ uống nước. Câu được cá nhỏ cũng là một lần vui.',
  wind:'Gió đưa mặt nước lăn tăn. Cháu cứ thong thả, đừng chen nhau trên cầu nhé.',
  storm:'Dông lớn, mình nghỉ thả câu đã. Chờ trời yên rồi lại ra bến, cháu nhé.',
  fog:'Sương sớm phủ mặt ao, cứ thong thả thôi cháu. Cá chép vàng hôm nay khó gặp hơn một chút.',
};
export const lakeElderGreeting=weather=>lakeElderLines[weather]??lakeElderLines.sun;
export function lakeElderFrame(time,reduced=false){
  if(reduced)return 0;
  // A slow breath, one short blink, then settle. Feet stay registered.
  const phase=((time%6)+6)%6;
  return phase<2.4?0:phase<4?1:phase<4.2?2:phase<5?3:0;
}
