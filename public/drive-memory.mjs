// Display-only projection: never mutate a drive, grant a reward or persist an album.
export function driveMemory(drive,id){
  if(!drive)return null;
  const entry=id==='current'?drive:(drive.history??[]).find(e=>String(e.id)===String(id));
  if(!entry||(id==='current'?!entry.completed:entry.completedAt==null))return null;
  return {id:entry.id,title:entry.title,at:entry.completedAt??null,
    people:(entry.contributors??[]).slice(0,12).map(p=>({name:String(p.name??''),quantity:p.quantity})),
    mine:{quantity:entry.mine.quantity,paid:!!entry.mine.paid,coins:entry.mine.paid?entry.mine.coins:0,
      xp:entry.mine.paid?(entry.mine.xp??entry.rewardXp??0):0,decorVoucher:entry.mine.paid&&!!entry.mine.decorVoucher},
    minimum:entry.minimum};
}
