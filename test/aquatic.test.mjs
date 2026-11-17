import test from 'node:test';
import assert from 'node:assert/strict';
import {apply, aquatic, dayAt, fishing, gameDay, newFarm, newRoom, slotLength, snapshot, upgradeCalendar, weatherAt} from '../public/game.mjs';
import {publicCatch} from '../public/aqua.mjs';
import {pondCapacity} from '../public/land.mjs';

const start=20_000;
function setup(){
  const room=newRoom(start);
  for(const id of ['a','b','c'])room.farms[id]=newFarm(id,id,start);
  return room;
}
const send=(room,id,action,offset=0,props={},roll)=>apply(room,id,{action,...props},start+offset,roll);
test('new days last eight hours and old rooms migrate once without losing counts',()=>{
  const room=setup();
  assert.equal(gameDay,28800);
  assert.equal(slotLength,7200);
  assert.equal(dayAt(room,start+gameDay-1),0);
  assert.equal(dayAt(room,start+gameDay),1);
  assert.equal(weatherAt(room,start+slotLength).id,'rain');
  const legacy=setup();
  delete legacy.longDays;
  const migration=start+13*60;
  legacy.farms.a.daily={day:1,taken:1,lost:0,targets:['b']};
  assert.equal(upgradeCalendar(legacy,migration),true);
  assert.equal(upgradeCalendar(legacy,migration+40),false);
  assert.equal(dayAt(legacy,migration-2),1);
  assert.equal(dayAt(legacy,migration+gameDay),2);
  assert.equal(snapshot(legacy,legacy.farms.a,migration).me.daily.taken,1);
  assert.equal(snapshot(legacy,legacy.farms.a,migration).dayEnds,migration+gameDay);
});
test('shared ponds scale capacity, feed and harvest by the number of stocked seeds',()=>{
  const room=setup(), farm=room.farms.a;
  farm.land[0]={kind:'pond'};
  Object.assign(farm.inventory,{tilapiaSeed:5,prawnSeed:2,carpSeed:3,aquaFeed:7});
  assert.equal(pondCapacity(farm,0),6);
  assert.equal(pondCapacity(farm,2),2);
  assert.throws(()=>send(room,'a','aquaStock',0,{item:'tilapia',index:2,qty:3}),/2 chỗ/);
  send(room,'a','aquaStock',0,{item:'tilapia',index:0,qty:3});
  send(room,'a','aquaStock',0,{item:'prawn',index:0,qty:2});
  assert.throws(()=>send(room,'a','aquaStock',0,{item:'carp',index:0,qty:2}),/1 chỗ/);
  assert.throws(()=>send(room,'a','aquaHarvest',1300,{index:0,item:'tilapia'}),/đủ lớn/);
  send(room,'a','aquaFeed',1300,{index:0,item:'tilapia'});
  send(room,'a','aquaFeed',1300,{index:0,item:'prawn'});
  assert.equal(farm.inventory.aquaFeed,0);
  const fishReady=1300+aquatic.tilapia.time+1;
  send(room,'a','aquaHarvest',fishReady,{index:0,item:'tilapia'});
  assert.throws(()=>send(room,'a','aquaHarvest',fishReady,{index:0,item:'prawn'}),/đủ lớn/);
  const finish=1300+aquatic.prawn.time+1;
  send(room,'a','aquaHarvest',finish,{index:0,item:'prawn'});
  assert.deepEqual([farm.inventory.tilapia,farm.inventory.prawn],[15,10]);
  assert.throws(()=>send(room,'a','aquaHarvest',finish,{index:0}),/chưa thả/);
});
test('old fish and shrimp batches carry progress, feed and picked counts into the merged pond',()=>{
  const room=setup(), farm=room.farms.a;
  const old=(kind,picked)=>({kind,at:start,progress:250,fedUntil:start+1000,picked});
  farm.ponds=[old('tilapia',1),old('prawn',0),old('carp',0)];
  farm.land[0]={kind:'shrimp',fence:'wood'};
  const startState=snapshot(room,farm,start+50).me;
  assert.deepEqual(startState.pondIndexes,[0,2]);
  assert.deepEqual(startState.land[0],{kind:'pond',fence:'wood'});
  assert.deepEqual(startState.pondBatches[0].map(b=>[b.kind,b.progress,b.fedUntil,b.count,b.picked]),[
    ['tilapia',300,start+1000,1,1],['prawn',300,start+1000,1,0],
  ]);
  farm.inventory.carpSeed=1;
  send(room,'a','aquaStock',51,{item:'carp',index:0});
  assert.equal(farm.ponds[1],undefined);
  assert.equal(snapshot(room,farm,start+51).me.pondBatches[0].length,3);
  assert.equal(snapshot(room,farm,start+51).me.pondBatches[2][0].kind,'carp');
});
test('public fishing has a timer, cooldown, daily cap and low weather-dependent rare odds',()=>{
  const room=setup(), farm=room.farms.a;
  send(room,'a','cast',0,{source:'public'});
  assert.throws(()=>send(room,'a','reel',fishing.wait-1),/chưa cắn/);
  assert.match(send(room,'a','reel',fishing.wait,{},.01),/chép vàng/);
  assert.equal(farm.inventory.goldenCarp,1);
  assert.throws(()=>send(room,'a','cast',fishing.wait+1,{source:'public'}),/chờ hồi/);
  assert.equal(publicCatch(.035,{id:'rain'}),'goldenCarp');
  assert.equal(publicCatch(.035,{id:'sun'}),'tilapia');
  assert.equal(publicCatch(.8,{id:'sun'}),'minnow');
  farm.fishing.used=fishing.limit;
  assert.throws(()=>send(room,'a','cast',150,{source:'public'}),/hết lượt/);
  send(room,'a','cast',gameDay,{source:'public'});
  assert.throws(()=>send(room,'a','reel',gameDay+fishing.wait+fishing.window+1),/hết hạn/);
  assert.throws(()=>send(room,'c','cast',slotLength*7,{source:'public'}),/dông/);
});
test('neighbor fishing shares theft caps, preserves the batch and rechecks the gate',()=>{
  const room=setup(), owner=room.farms.b;
  owner.ponds[0]=[
    {kind:'prawn',at:start,progress:aquatic.prawn.time,fedUntil:0,picked:0},
    {kind:'carp',at:start,progress:aquatic.carp.time,fedUntil:0,picked:0},
  ];
  owner.inventory.carrot=6;
  send(room,'a','cast',0,{source:'pond',target:'b',index:0});
  send(room,'a','reel',fishing.wait);
  assert.equal(room.farms.a.inventory.carp,1);
  assert.deepEqual(owner.ponds[0].map(batch=>batch.picked),[0,1]);
  assert.throws(()=>send(room,'a','steal',fishing.wait,{target:'b',source:'barn',item:'carrot'}),/đã lấy/);
  send(room,'c','cast',fishing.wait,{source:'pond',target:'b',index:0});
  send(room,'b','shield',fishing.wait+1);
  assert.match(send(room,'c','reel',fishing.wait*2),/đóng cổng/);
  assert.equal(owner.ponds[0][1].picked,1);
  send(room,'b','aquaHarvest',fishing.wait*2,{index:0,item:'carp'});
  assert.equal(owner.inventory.carp,3);
});
