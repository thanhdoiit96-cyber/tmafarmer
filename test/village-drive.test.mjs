import assert from 'node:assert/strict';
import test from 'node:test';
import {advanceVillageDrive,apply,newFarm,newRoom,snapshot} from '../public/game.mjs';

const start=10_000;
const period=48*60*60;
function setup(){
  const room=newRoom(start);
  for(const id of ['a','b','c'])room.farms[id]=newFarm(id,id.toUpperCase(),start);
  return room;
}

test('village drive accepts partial contributions and pays qualifying farms once on completion',()=>{
  const room=setup(),{a,b,c}=room.farms;
  const donate=(farm,item,qty)=>apply(room,farm.id,{action:'villageGoods',index:start,item,qty},start);
  const view=farm=>snapshot(room,farm,start).villageDrive;
  Object.assign(a.inventory,{wheat:16,carrot:12});
  b.inventory.corn=12;
  c.inventory.wheat=2;
  assert.throws(()=>donate(a,'wheat',0),/số nguyên dương/);
  assert.throws(()=>donate(a,'wheat',1.5),/số nguyên dương/);
  assert.throws(()=>donate(a,'wheatSeed',1),/không thuộc/);
  assert.throws(()=>donate(a,'corn',1),/chưa có đủ/);
  donate(c,'wheat',2);
  assert.throws(()=>donate(a,'wheat',15),/còn cần 14/);
  assert.equal(a.inventory.wheat,16);
  donate(a,'wheat',14);
  donate(a,'carrot',12);
  assert.equal(view(b).items[0].delivered,16);
  assert.equal(view(a).mine.quantity,26);
  assert.equal(view(a).mine.paid,false);
  assert.equal(view(a).mine.decorVoucher,false);
  assert.equal(a.xp,0);
  assert.equal(a.coins,100);
  donate(b,'corn',12);
  assert.equal(view(a).completed,true);
  assert.deepEqual(view(a).contributors.map(({name,quantity})=>[name,quantity]),[['A',26],['B',12],['C',2]]);
  assert.equal(a.coins,355);
  assert.equal(b.coins,325);
  assert.equal(view(a).mine.paid,true);
  assert.equal(view(b).mine.paid,true);
  assert.equal(view(c).mine.paid,false);
  assert.deepEqual([a.xp,b.xp,c.xp],[12,12,0]);
  assert.equal(c.coins,100);
  assert.equal(view(a).mine.decorVoucher,true);
  assert.deepEqual([a.decorVouchers,b.decorVouchers,c.decorVouchers],[1,1,undefined]);
  assert.throws(()=>donate(b,'corn',1),/đã góp đủ/);
  assert.equal(a.coins,355);
  assert.deepEqual([a.decorVouchers,b.decorVouchers],[1,1]);
});

test('village drive rolls over after 48 real hours and freezes the chosen template',()=>{
  const room=setup(), farm=room.farms.a;
  const view=time=>snapshot(room,farm,time).villageDrive;
  const donate=(index,time)=>apply(room,'a',{action:'villageGoods',index,item:'wheat',qty:1},time);
  assert.equal(view(start).title,'Giỏ nông sản');
  assert.equal(view(start).endsAt,start+period);
  farm.inventory.wheat=4;
  donate(start,start);
  Object.assign(farm,{xp:160,coop:3,workshop:1});
  assert.equal(advanceVillageDrive(room,start+period-1),false);
  assert.equal(view(start+period-1).title,'Giỏ nông sản');
  assert.equal(advanceVillageDrive(room,start+period),true);
  assert.equal(view(start+period).title,'Bếp làng');
  assert.deepEqual(view(start+period).previous,{title:'Giỏ nông sản',completed:false,top:{name:'A',quantity:1}});
  assert.throws(()=>donate(start,start+period),/đã hết hạn/);
  assert.equal(farm.inventory.wheat,3);
  assert.equal(farm.coins,100);
  assert.equal(advanceVillageDrive(room,start+period*2),true);
  assert.equal(view(start+period*2).title,'Quầy đặc sản');
  const oldRoom=setup();
  delete oldRoom.villageDrive;
  assert.equal(advanceVillageDrive(oldRoom,start+100),true);
  assert.equal(snapshot(oldRoom,oldRoom.farms.a,start+100).villageDrive.endsAt,start+100+period);
  assert.equal(advanceVillageDrive(oldRoom,start+100),false);
});
