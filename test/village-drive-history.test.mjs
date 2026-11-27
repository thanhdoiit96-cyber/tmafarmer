import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoom,newFarm,advanceVillageDrive,apply,snapshot} from '../public/game.mjs';
import {driveResult} from '../public/village-drive-history.mjs';
const start=10000,period=48*3600;
function setup(){const r=newRoom(start);r.farms.a=newFarm('a','A',start);r.farms.b=newFarm('b','B',start);advanceVillageDrive(r,start);return r;}
const view=(r,time)=>snapshot(r,r.farms.a,time).villageDrive;
function donate(r,id,item,qty){r.farms[id].inventory[item]=qty;apply(r,id,{action:'villageGoods',index:start,item,qty},start);}

test('rollover archives personal paid receipts without granting any new rewards',()=>{
  const r=setup();donate(r,'b','wheat',2);donate(r,'a','wheat',10);donate(r,'a','carrot',9);donate(r,'a','corn',9);
  const before=[r.farms.a.coins,r.farms.a.xp,r.farms.a.decorVouchers];
  advanceVillageDrive(r,start+period);const history=view(r,start+period).history;
  assert.equal(history.length,1);assert.equal(history[0].id,start);
  assert.equal(history[0].mine.quantity,28);assert.equal(history[0].mine.coins,before[0]-100);
  assert.equal(history[0].mine.xp,12);assert.equal(history[0].mine.decorVoucher,true);
  assert.equal(driveResult(history[0]).label,'Đã nhận thưởng');
  assert.equal(history[0].receipts,undefined);assert.equal(history[0].mine.id,undefined);
  assert.deepEqual(Object.keys(history[0].contributors[0]),['name','quantity']);
  const b=snapshot(r,r.farms.b,start+period).villageDrive.history[0];
  assert.equal(b.mine.quantity,2);assert.equal(b.mine.paid,false);assert.equal(b.mine.coins,0);
  assert.equal(driveResult(b).label,'Chưa đủ mốc');
  assert.deepEqual([r.farms.a.coins,r.farms.a.xp,r.farms.a.decorVouchers],before);
  const bytes=JSON.stringify(r);snapshot(r,r.farms.a,start+period);assert.equal(JSON.stringify(r),bytes);
  assert.equal(advanceVillageDrive(r,start+period+1),false);assert.equal(r.villageDriveHistory.length,1);
});

test('expired contributions and no participation explain the outcome without refunds',()=>{
  const r=setup();donate(r,'a','wheat',3);const before=[r.farms.a.coins,r.farms.a.inventory.wheat];
  advanceVillageDrive(r,start+period);const receipt=view(r,start+period).history[0];
  assert.equal(receipt.mine.quantity,3);assert.equal(receipt.mine.paid,false);
  assert.equal(driveResult(receipt).label,'Chưa hoàn thành');assert.match(driveResult(receipt).reason,/không hoàn/);
  assert.equal(driveResult(snapshot(r,r.farms.b,start+period).villageDrive.history[0]).label,'Chưa góp');
  assert.deepEqual([r.farms.a.coins,r.farms.a.inventory.wheat],before);
});

test('six actual closed drives are retained, without invented offline periods or duplicate IDs',()=>{
  const r=setup();
  for(let i=1;i<=9;i++)advanceVillageDrive(r,start+period*i);
  assert.equal(r.villageDriveHistory.length,6);
  assert.deepEqual(r.villageDriveHistory.map(e=>e.id),[8,7,6,5,4,3].map(i=>start+period*i));
  const offline=setup();advanceVillageDrive(offline,start+period*20+5);
  assert.equal(offline.villageDriveHistory.length,1);assert.equal(offline.villageDriveHistory[0].id,start);
  const copy=JSON.parse(JSON.stringify(offline));assert.deepEqual(view(copy,start+period*20+5).history,view(offline,start+period*20+5).history);
});

test('legacy drives retain original requirements and do not manufacture older results',()=>{
  const r=setup();delete r.villageDrive.version;delete r.villageDrive.needs;delete r.villageDrive.memberCount;
  r.villageDrive.previous={title:'Đợt cũ',completed:true,top:null};
  assert.deepEqual(view(r,start).history,[]);
  advanceVillageDrive(r,start+period);const entry=view(r,start+period).history[0];
  assert.equal(entry.version,1);assert.equal(entry.memberCount,null);
  assert.deepEqual(entry.items.map(row=>row.required),[16,12,12]);assert.equal(r.villageDriveHistory.length,1);
});

test('history receipts are bounded to twelve farms present when closed, never reassigned by name',()=>{
  const r=setup();for(let i=0;i<25;i++)r.villageDrive.contributors['left'+i]={name:'Đã rời',quantity:3,value:18,paid:false};
  donate(r,'a','wheat',3);delete r.farms.a;
  r.farms.new=newFarm('new','A',start);advanceVillageDrive(r,start+period);
  assert.ok(r.villageDriveHistory[0].receipts.length<=12);
  const h=snapshot(r,r.farms.new,start+period).villageDrive.history[0];assert.equal(h.mine.quantity,0);
  assert.ok(h.contributors.length<=12);assert.equal(h.contributors.some(c=>c.name==='Đã rời'),true);
});
