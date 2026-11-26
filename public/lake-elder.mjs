import {avatarDetails,avatarOf} from './avatar-models.mjs';
// One stationary NPC; no economic rewards or save state.
export const lakeEntry=[365,377];
export const lakeShelter={x:542,y:402,type:'lake-shelter',w:106,h:100,label:'Chòi Ông Sáu'};
export const lakeElder={
  name:'Ông Sáu',type:'lake-elder',x:542,y:398,
  approach:{x:520,y:414},hitBox:{x:526,y:354,w:32,h:48},
};
export const lakeElderLines={
  sun:'Nắng dịu rồi, {visitor} ghé bến câu nhé. Tiện tay dọn ít cỏ bờ ao cho lối đi sạch hơn.',
  rain:'Mưa tưới mát cả vườn. {Visitor} đi chậm trên cầu nhé; giỏ cá đẹp cũng cần một chút kiên nhẫn.',
  cloud:'Trời mát, đứng bên bờ nghe nước một lát cũng vui. {Visitor} muốn câu hay xem sổ cá?',
  heat:'Nắng gắt rồi, {visitor} nhớ uống nước. Câu được cá nhỏ cũng là một lần vui.',
  wind:'Gió đưa mặt nước lăn tăn. {Visitor} cứ thong thả, đừng chen nhau trên cầu nhé.',
  storm:'Dông lớn, mình nghỉ thả câu đã. Chờ trời yên rồi lại ra bến, {visitor} nhé.',
  fog:'Sương sớm phủ mặt ao, cứ thong thả thôi {visitor}. Cá chép vàng hôm nay khó gặp hơn một chút.',
};
export function lakeElderVoice(avatar){
  const {age,gender}=avatarDetails[avatarOf(avatar)];
  const visitor=age==='young'?'cháu':age==='middle'?(gender==='female'?'cô':'chú'):(gender==='female'?'bà':'ông');
  return {visitor,farewell:age==='young'?'Cháu chào ông, cháu đi nhé':age==='middle'?'Chào bác Sáu, tôi đi nhé':'Chào ông Sáu, tôi đi nhé'};
}
export function lakeElderGreeting(weather,avatar){
  const {visitor}=lakeElderVoice(avatar);
  return (lakeElderLines[weather]??lakeElderLines.sun).replaceAll('{visitor}',visitor).replaceAll('{Visitor}',visitor[0].toUpperCase()+visitor.slice(1));
}
export function lakeElderFrame(time,reduced=false){
  if(reduced)return 0;
  // A slow breath, one short blink, then settle. Feet stay registered.
  const phase=((time%6)+6)%6;
  return phase<2.4?0:phase<4?1:phase<4.2?2:phase<5?3:0;
}
