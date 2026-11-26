import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,newRoom,newFarm,snapshot,gameDay,capacity} from '../public/game.mjs';
import {playerLocationBlock,plotPosition,features,walkable} from '../public/world-layout.mjs';
import {gardenPlotId} from '../public/land.mjs';
const at=20_000;
function setup(){
  const room=newRoom(at);
  for(const id of ['a','b','c','d','e'])room.farms[id]=newFarm(id,id,at);
  return room;
}
const send=(room,action,offset=0,props={},id='a',roll=.5)=>apply(room,id,{action,...props},at+offset,roll);
function sow(room,index=0,id='b'){
  send(room,'plant',0,{item:'wheat',index},id);
}
test('help waters index zero with independent quotas and only helper vitals',()=>{
  const room=setup();sow(room);
  const before=structuredClone(room.farms.b),coins=room.farms.a.coins;
  send(room,'helpWater',1,{target:'b',index:0});
  assert.ok(room.farms.b.plots[0].wetUntil>at+1);
  assert.deepEqual(room.farms.b.inventory,before.inventory);
  assert.deepEqual(room.farms.b.wellness,before.wellness);
  assert.equal(room.farms.a.wellness.water,98);
  assert.equal(room.farms.a.wellness.food,99);
  assert.equal(room.farms.a.wellness.stamina,97);
  assert.equal(room.farms.a.coins,coins);
  assert.equal(room.farms.a.xp,0);
  assert.equal(snapshot(room,room.farms.a,at+1).me.daily.taken,0);
  assert.throws(()=>send(room,'helpWater',1,{target:'b',index:0},'c'),/đủ ẩm/);
  assert.equal(room.farms.c.neighborHelp,undefined);
  assert.equal(room.farms.c.wellness,undefined);
  sow(room,1);send(room,'helpWater',1,{target:'b',index:1});
  sow(room,2);assert.throws(()=>send(room,'helpWater',1,{target:'b',index:2}),/2 lượt/);
  sow(room,0,'c');send(room,'helpWater',1,{target:'c',index:0});
  sow(room,1,'c');assert.throws(()=>send(room,'helpWater',1,{target:'c',index:1}),/3 lượt/);
});
test('help guards preference, rain, ripe crops, self and received cap',()=>{
  const room=setup();sow(room);
  send(room,'helpPreference',0,{item:'off'},'b');
  assert.throws(()=>send(room,'helpWater',1,{target:'b',index:0}),/tắt/);
  send(room,'helpPreference',0,{item:'on'},'b');
  assert.throws(()=>send(room,'helpWater',7200,{target:'b',index:0}),/chín|đủ ẩm/);
  assert.throws(()=>send(room,'helpWater',1,{target:'a',index:0}),/hàng xóm/);
  room.farms.b.neighborHelp={day:0,given:0,received:6,targets:{}};
  assert.throws(()=>send(room,'helpWater',1,{target:'b',index:0}),/6 lượt/);
  assert.equal(snapshot(room,room.farms.a,at+gameDay).me.neighborHelp.given,0);
});
test('help supports expanded plot IDs and rain rejection preserves quotas',()=>{
  const room=setup(),owner=room.farms.b,index=gardenPlotId(0,3);
  owner.land[0]={kind:'garden',expanded:true};sow(room,index);
  send(room,'helpWater',1,{target:'b',index});
  assert.ok(owner.extraPlots[index].wetUntil>at);
  assert.equal(owner.plots[0],null);
  owner.plots[0]={kind:'wheat',goal:100000,progress:0,at:at+7200,wetUntil:0};
  assert.throws(()=>send(room,'helpWater',7200,{target:'b',index:0},'c'),/đủ ẩm/);
  assert.equal(room.farms.c.neighborHelp,undefined);
});
test('shore job needs ten connected seconds; rewards once; cancellation and midnight do not award',()=>{
  const room=setup(),farm=room.farms.a;
  assert.throws(()=>send(room,'shoreStart'),/cấp 2/);
  farm.xp=25;send(room,'shoreStart');
  send(room,'shoreTick',2);send(room,'shoreTick',4);send(room,'shoreCancel',5);
  assert.equal(farm.lakeMarks,undefined);
  send(room,'shoreStart',6);send(room,'shoreTick',11);
  assert.equal(farm.shoreJob,null);
  send(room,'shoreStart',12);
  for(const t of [14,16,18,20])send(room,'shoreTick',t);
  assert.equal(farm.lakeMarks,undefined);
  send(room,'shoreTick',22);assert.equal(farm.lakeMarks,2);
  assert.throws(()=>send(room,'shoreStart',23),/hôm nay/);
  assert.throws(()=>send(room,'shoreTick',23),/Chưa bắt đầu/);
  send(room,'shoreStart',gameDay*2-2);
  send(room,'shoreTick',gameDay*2);
  assert.equal(farm.lakeMarks,2);
  assert.equal(farm.shoreJob,null);
});
test('marks never overflow and exchanges respect daily and supply caps without losing marks',()=>{
  const room=setup(),farm=room.farms.a;farm.xp=25;farm.lakeMarks=5;
  assert.throws(()=>send(room,'shoreStart'),/6 dấu/);
  farm.inventory.aquaFeed=100;
  assert.throws(()=>send(room,'lakeExchange'),/đầy/);
  assert.equal(farm.lakeMarks,5);
  farm.inventory.aquaFeed=99;send(room,'lakeExchange');
  assert.equal(farm.inventory.aquaFeed,100);assert.equal(farm.lakeMarks,3);
  assert.throws(()=>send(room,'lakeExchange'),/hôm nay/);
  farm.inventory.aquaFeed=0;send(room,'lakeExchange',gameDay);
  assert.equal(farm.lakeMarks,1);
  assert.throws(()=>send(room,'lakeExchange',gameDay*2),/2 dấu/);
});
test('fish book records successful public catches only and claim is farm-owned and one-time',()=>{
  const room=setup(),farm=room.farms.a;
  farm.inventory.goldenCarp=1;
  assert.equal(snapshot(room,farm,at).me.fishBook.goldenCarp.count,0);
  assert.throws(()=>send(room,'claimFishBook'),/3 loài/);
  for(const [offset,roll] of [[0,.5],[60,.1],[120,.01]]){
    send(room,'cast',offset,{source:'public'});
    assert.throws(()=>send(room,'reel',offset+1,{},'a',roll),/chưa cắn/);
    send(room,'reel',offset+6,{},'a',roll);
  }
  assert.deepEqual(Object.keys(farm.fishBook).sort(),['goldenCarp','minnow','tilapia']);
  const first=farm.fishBook.minnow.firstAt;
  send(room,'claimFishBook',127);assert.equal(farm.decorVouchers,1);
  assert.throws(()=>send(room,'claimFishBook',gameDay),/đã nhận/);
  send(room,'cast',180,{source:'public'});
  farm.inventory.wheat=capacity(farm);
  assert.throws(()=>send(room,'reel',186),/Kho đầy/);
  assert.equal(farm.fishBook.minnow.count,1);assert.equal(farm.fishBook.minnow.firstAt,first);
});
test('new actions enforce public bank and exact visited plot location',()=>{
  const plot=plotPosition(0);
  assert.equal(playerLocationBlock({action:'helpWater',index:0},'visit',{x:plot.x,y:plot.y+8}),'');
  assert.ok(playerLocationBlock({action:'helpWater',index:0},'field',plot));
  assert.ok(playerLocationBlock({action:'shoreStart'},'lake',{x:326,y:350,walking:true}));
  assert.equal(playerLocationBlock({action:'shoreTick'},'lake',{x:326,y:350,walking:false}),'');
  assert.ok(playerLocationBlock({action:'lakeExchange'},'field',plot));
  const room=setup(),scene=features('lake',snapshot(room,room.farms.a,at));
  assert.ok(scene.hotspots.some(p=>p.type==='shore-work'));
  assert.ok(walkable(scene,326,350));
});
