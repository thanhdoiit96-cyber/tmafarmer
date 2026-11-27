import assert from 'node:assert/strict';
import test from 'node:test';
import {scaleDriveNeeds} from '../public/village-drive-demand.mjs';
import {advanceVillageDrive,apply,newFarm,newRoom,snapshot} from '../public/game.mjs';

const start=10000,period=48*60*60;
function setup(count){
  const room=newRoom(start);
  for(let i=0;i<count;i++)room.farms['p'+i]=newFarm('p'+i,'Vườn '+i,start);
  advanceVillageDrive(room,start);return room;
}
const view=(room,time=start)=>snapshot(room,room.farms.p0,time).villageDrive;
function finish(room,time=start){
  const farm=room.farms.p0,drive=view(room,time);
  for(const row of drive.items){
    const qty=row.required-row.delivered;if(!qty)continue;
    farm.inventory[row.item]=(farm.inventory[row.item]??0)+qty;
    apply(room,farm.id,{action:'villageGoods',index:drive.id,item:row.item,qty},time);
  }
}

test('new drives freeze solo/two/full needs and copy quantities rather than sharing templates',()=>{
  for(const [count,expected]of [[1,[8,6,6]],[2,[12,9,9]],[3,[16,12,12]],[12,[16,12,12]]]){
    const room=setup(count),v=view(room);
    assert.deepEqual(v.items.map(r=>r.required),expected);
    assert.equal(v.version,2);assert.equal(v.memberCount,count);
    assert.equal(v.endsAt,start+period);
  }
  const base={egg:9,meat:7};assert.deepEqual(scaleDriveNeeds(base,1),{egg:5,meat:4});
  assert.deepEqual(scaleDriveNeeds(base,2),{egg:7,meat:6});assert.deepEqual(base,{egg:9,meat:7});
  assert.throws(()=>scaleDriveNeeds(base,0),RangeError);
});

test('empty rooms do not open a drive and reads do not initialize or migrate one',()=>{
  const room=newRoom(start);assert.equal(room.villageDrive,undefined);
  assert.equal(advanceVillageDrive(room,start),false);
  room.farms.p0=newFarm('p0','Vườn',start);
  assert.equal(view(room),null);assert.equal(room.villageDrive,undefined);
  advanceVillageDrive(room,start+10);assert.equal(view(room,start+10).id,start+10);
  assert.deepEqual(view(room,start+10).items.map(r=>r.required),[8,6,6]);
});

test('joining, leaving and upgrading cannot resize a drive; rollover uses new membership',()=>{
  const room=setup(1),fixed=JSON.stringify(room.villageDrive);
  room.farms.p1=newFarm('p1','Bạn',start);
  Object.assign(room.farms.p0,{xp:160,coop:3,workshop:1});
  assert.equal(advanceVillageDrive(room,start+period-1),false);
  assert.equal(JSON.stringify(room.villageDrive),fixed);
  delete room.farms.p1;assert.equal(advanceVillageDrive(room,start+100),false);
  assert.equal(JSON.stringify(room.villageDrive),fixed);
  room.farms.p1=newFarm('p1','Bạn',start);
  advanceVillageDrive(room,start+period);
  assert.equal(view(room,start+period).memberCount,2);
  assert.equal(view(room,start+period).title,'Bếp làng');
  assert.deepEqual(view(room,start+period).items.map(r=>r.required),[18,9,7]);
});

test('solo completion pays actual contributed value once, not the full template value',()=>{
  const room=setup(1),farm=room.farms.p0;finish(room);
  assert.equal(view(room).completed,true);assert.equal(view(room).mine.paid,true);
  assert.equal(farm.coins,100+Math.ceil((8*6+6*10+6*15)*1.25));
  assert.equal(farm.xp,12);assert.equal(farm.decorVouchers,1);
  const saved=JSON.stringify(farm);
  assert.throws(()=>apply(room,'p0',{action:'villageGoods',index:start,item:'corn',qty:1},start),/đã góp đủ/);
  assert.equal(JSON.stringify(farm),saved);
});

test('legacy partially donated and paid drives retain original requirements and reward state',()=>{
  const room=setup(1),farm=room.farms.p0;
  delete room.villageDrive.version;delete room.villageDrive.memberCount;delete room.villageDrive.needs;
  farm.inventory.wheat=16;apply(room,'p0',{action:'villageGoods',index:start,item:'wheat',qty:2},start);
  assert.deepEqual(view(room).items.map(r=>r.required),[16,12,12]);
  assert.equal(view(room).version,1);assert.equal(view(room).memberCount,null);
  assert.equal(advanceVillageDrive(room,start+1),false);assert.equal(room.villageDrive.needs,undefined);
  finish(room);assert.equal(farm.coins,100+Math.ceil((16*6+12*10+12*15)*1.25));
  const paid=[farm.coins,farm.xp,farm.decorVouchers];
  const restored=JSON.parse(JSON.stringify(room));assert.equal(view(restored).mine.paid,true);
  assert.equal(advanceVillageDrive(restored,start+period-1),false);
  assert.deepEqual([restored.farms.p0.coins,restored.farms.p0.xp,restored.farms.p0.decorVouchers],paid);
  advanceVillageDrive(restored,start+period);assert.equal(view(restored,start+period).version,2);
  assert.equal(view(restored,start+period).previous.completed,true);
  assert.deepEqual(view(restored,start+period).items.map(r=>r.required),[8,6,6]);
});

test('expiry, long absence, stale donations and sub-minimum participants stay protected',()=>{
  const room=setup(1);room.farms.p1=newFarm('p1','Bạn',start);
  room.farms.p1.inventory.wheat=2;
  apply(room,'p1',{action:'villageGoods',index:start,item:'wheat',qty:2},start);finish(room);
  assert.equal(room.farms.p1.coins,100);assert.equal(room.farms.p1.decorVouchers,undefined);
  const coins=room.farms.p0.coins;
  assert.throws(()=>apply(room,'p0',{action:'villageGoods',index:start,item:'wheat',qty:1},start+period),/hết hạn/);
  assert.equal(room.farms.p0.coins,coins);
  advanceVillageDrive(room,start+period*5+20);
  assert.equal(view(room,start+period*5+20).id,start+period*5);
  assert.equal(view(room,start+period*5+20).memberCount,2);
  assert.equal(room.farms.p0.coins,coins);
  assert.equal(view(room,start+period*5+20).mine.quantity,0);
  assert.equal(view(room,start+period*5+20).title,'Giỏ nông sản');
});
