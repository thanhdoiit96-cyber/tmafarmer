import {driveNeeds,driveTemplates} from './village-drive-demand.mjs';
import {fairItems,fairTitle,isFair} from './village-fair.mjs';

export const driveHistoryLimit=6;

export function archiveDrive(room,drive,{duration,minimum,rewardXp}){
  const fair=isFair(drive),needs=fair?null:driveNeeds(drive);
  const entry={id:drive.id,version:drive.version??1,template:drive.template,title:fair?fairTitle:driveTemplates[drive.template].title,
    memberCount:drive.memberCount??null,endsAt:drive.id+duration,completedAt:drive.completedAt??null,minimum,
    items:fair?fairItems(drive):Object.entries(needs).map(([item,required])=>({item,required,delivered:drive.delivered[item]??0})),
    contributors:Object.values(drive.contributors).map(({name,quantity})=>({name,quantity}))
      .sort((a,b)=>b.quantity-a.quantity||a.name.localeCompare(b.name,'vi')).slice(0,12),
    // Keep personal receipts for farms still in this room, at most its 12 members.
    receipts:Object.keys(room.farms).slice(0,12).flatMap(id=>{
      const c=drive.contributors[id];if(!c)return [];
      return [{id,name:c.name,quantity:c.quantity,paid:!!c.paid,
        coins:c.paid?(c.coins??Math.ceil(c.value*1.25)):0,xp:c.paid?(c.rewardXp??rewardXp):0,decorVoucher:!!c.decorVoucher}];
    })};
  room.villageDriveHistory=[entry,...(room.villageDriveHistory??[]).filter(e=>e.id!==entry.id)].slice(0,driveHistoryLimit);
}

export function driveHistoryFor(room,farm){
  return (room.villageDriveHistory??[]).slice(0,driveHistoryLimit).map(({receipts,...entry})=>{
    const receipt=receipts.find(r=>r.id===farm.id);
    const {id,name,...mine}=receipt??{quantity:0,paid:false,coins:0,xp:0,decorVoucher:false};
    return {...entry,mine};
  });
}

export function driveResult(entry){
  if(entry.mine.paid)return {label:'Đã nhận thưởng',reason:'Phần thưởng đã được cộng khi làng hoàn thành. Không cần nhận lại.'};
  if(!entry.mine.quantity)return {label:'Chưa góp',reason:'Bạn không có phần đóng góp trong đợt này.'};
  if(entry.completedAt===null)return {label:'Chưa hoàn thành',reason:'Làng chưa đủ hàng trước hạn. Hàng đã góp không hoàn lại.'};
  return {label:'Chưa đủ mốc',reason:'Bạn góp dưới '+entry.minimum+' món nên chưa đủ điều kiện nhận thưởng.'};
}
