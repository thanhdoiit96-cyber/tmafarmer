import {progressionLevelForXp} from './progression-levels.mjs';

export const prankRules={version:1,level:3,factor:.9,seconds:180,immunity:1800,given:2,received:2,jars:2};
export const prankDay=(farm,day)=>farm.prankDaily?.day===day?farm.prankDaily:{day,given:0,received:0,targets:[]};
export const prankUnlocked=farm=>progressionLevelForXp(farm.xp??0).level>=prankRules.level;
export const prankActive=(plot,time)=>!!(plot?.prank&&time>=plot.prank.startedAt&&time<plot.prank.until);
export function prankPlotBlock(plot,goal){
  if(!plot)return 'Ô này chưa có cây.';
  const progress=plot.progress/goal;
  if(progress<.25||progress>=.9)return 'Chỉ nghịch cây từ giai đoạn 2 và chưa lớn 90%.';
  if(Math.max(plot.pests??0,plot.weeds??0)>=20)return 'Cây đang có nhiều sâu hoặc cỏ tự nhiên.';
  return '';
}
export function prankAccess(actor,owner,day,time){
  if(!owner||actor.id===owner.id)return 'Hãy chọn vườn hàng xóm.';
  if(!prankUnlocked(actor)||!prankUnlocked(owner))return 'Cả hai nông trại cần đạt cấp 3.';
  if(owner.prankEnabled!==true)return 'Chủ vườn chưa cho phép nghịch vui.';
  if(owner.shieldUntil>time)return 'Cổng đang đóng.';
  if(owner.prankActive?.until>time)return 'Vườn đang có sâu nghịch; không thể thả thêm.';
  if(owner.prankImmuneUntil>time)return 'Vườn đang được miễn nhận sâu nghịch.';
  const mine=prankDay(actor,day),theirs=prankDay(owner,day);
  if(mine.given>=prankRules.given)return 'Bạn đã dùng đủ 2 lượt nghịch hôm nay.';
  if(mine.targets.includes(owner.id))return 'Bạn đã nghịch vườn này hôm nay.';
  if(theirs.received>=prankRules.received)return 'Vườn đã nhận đủ 2 lượt nghịch hôm nay.';
  if(!(actor.prankJars>0))return 'Bạn chưa có lọ sâu nghịch; đổi tại Hồ làng.';
  return '';
}
