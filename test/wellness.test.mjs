import assert from 'node:assert/strict';
import test from 'node:test';
import {animals,apply,cropGoal,dayReward,gameDay,growthGoal,mealCooldown,newFarm,newRoom,productGoal,snapshot,stock} from '../public/game.mjs';
import {homeBed} from '../public/home-rules.mjs';
import {features,maps,route,walkable} from '../public/world-layout.mjs';
import {farmTasks} from '../public/tasks.mjs';

const start=100000;
const world=()=>{
  const room=newRoom(start);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,start);
  return room;
};
const act=(room,action,options={},offset=0,id='a')=>apply(room,id,{action,...options},start+offset);
test('new work spends energy once, rejected actions preserve it, and rest blocks work until complete',()=>{
  const room=world(), farm=room.farms.a;
  act(room,'plant',{item:'wheat',index:0});
  assert.equal(farm.wellness.stamina,95);
  assert.equal(farm.wellness.water,97);
  assert.throws(()=>act(room,'plant',{item:'wheat',index:0}),/ô trống/);
  assert.equal(farm.wellness.stamina,95);
  farm.wellness={water:0,food:0,stamina:1,at:start,until:{},restUntil:0};
  assert.throws(()=>act(room,'water',{index:0}),/khát/);
  act(room,'drink');
  assert.throws(()=>act(room,'water',{index:0}),/đói/);
  act(room,'eat');
  assert.throws(()=>act(room,'water',{index:0}),/mệt/);
  const rest=area=>apply(room,'a',{action:'rest'},start,.5,{area,...homeBed});
  assert.throws(()=>rest('field'),/gần giường/);
  assert.throws(()=>apply(room,'a',{action:'rest'},start,.5,{area:'home',x:238,y:242}),/gần giường/);
  rest('home');
  assert.throws(()=>act(room,'water',{index:0},29),/nghỉ xong/);
  assert.ok(snapshot(room,farm,start+30).me.wellness.stamina>=47);
  act(room,'water',{index:0},30);
  assert.ok(farm.wellness.stamina<48);
  assert.throws(()=>act(room,'drink',{},31),/vừa hồi phục/);
});

test('workshop recipes consume produce once and meals recover stats under a shared cooldown',()=>{
  const room=world(), farm=room.farms.a;
  Object.assign(farm.inventory,{wheat:2,carrot:2,milk:1});
  assert.throws(()=>act(room,'craft',{item:'bread'}),/cấp 1/);
  farm.workshop=1;
  assert.throws(()=>act(room,'craft',{item:'warmMilk'}),/cấp 2/);
  assert.throws(()=>act(room,'craft',{item:'bread',qty:2}),/một phần/);
  act(room,'craft',{item:'bread'});
  act(room,'craft',{item:'carrotJuice'});
  assert.equal(stock(farm),1);
  assert.equal(farm.inventory.bread,1);
  assert.throws(()=>act(room,'craft',{item:'bread'}),/nguyên liệu/);
  assert.throws(()=>act(room,'consume',{item:'bread'}),/đã đầy/);
  farm.wellness={water:30,food:85,stamina:60,at:start,until:{},restUntil:0};
  act(room,'consume',{item:'bread'});
  assert.deepEqual([farm.wellness.water,farm.wellness.food,farm.wellness.stamina],[30,100,82]);
  assert.equal(farm.inventory.bread,0);
  assert.throws(()=>act(room,'consume',{item:'carrotJuice'},mealCooldown-1),/tiếp theo/);
  assert.equal(farm.inventory.carrotJuice,1);
  act(room,'consume',{item:'carrotJuice'},mealCooldown);
  assert.equal(snapshot(room,farm,start+mealCooldown).me.wellness.stamina,100);
  assert.equal(farm.wellness.water,62);
  farm.workshop=2;
  act(room,'craft',{item:'warmMilk'},mealCooldown);
  assert.equal(farm.inventory.warmMilk,1);
});

test('older stock completes its old goal and new animals use separate growth and production clocks',()=>{
  const room=world(), farm=room.farms.a;
  farm.coins=500;
  farm.coop=2;
  farm.plots[0]={kind:'wheat',at:start,progress:60,pests:0,wetUntil:0,protectedUntil:0,picked:0};
  act(room,'harvest',{index:0});
  act(room,'plant',{item:'wheat',index:0});
  assert.equal(cropGoal(farm.plots[0]),480);
  act(room,'animal',{item:'pig'});
  assert.equal(growthGoal(farm.pens[0]),3600);
  assert.equal(productGoal(farm.pens[0]),2400);
  act(room,'feed',{index:0});
  assert.throws(()=>act(room,'collect',{index:0},5500),/chưa sẵn/);
  act(room,'collect',{index:0},animals.pig.grow+animals.pig.time+10);
  assert.equal(farm.inventory.pork,4);
  assert.equal(farm.pens.length,0);
  const time=animals.pig.grow+animals.pig.time+11;
  act(room,'animal',{item:'chicken'},time);
  assert.throws(()=>act(room,'feed',{index:0,target:'0'},time),/không tồn tại/);
  act(room,'feed',{index:0,target:String(farm.pens[0].id)},time);
});

test('task priorities and wealth use current status and system prices',()=>{
  const room=world(), farm=room.farms.a;
  farm.coop=2;
  farm.inventory.wheat=6;
  act(room,'animal',{item:'cow'});
  act(room,'plant',{item:'carrot',index:0});
  const state=snapshot(room,farm,start);
  assert.deepEqual(farmTasks(state).map(t=>[t.kind,t.type]),[['animal','urgent'],['plot','care']]);
  const before=state.wealth.find(r=>r.id==='a').total;
  act(room,'list',{item:'wheat',qty:3,price:18});
  assert.equal(snapshot(room,farm,start).wealth.find(r=>r.id==='a').total,before);
  assert.equal(snapshot(room,farm,start).wealth[0].id,'a');
});


test('house, bed and exit are reachable and the home stays private from farm visitors',()=>{
  const room=world(), data=snapshot(room,room.farms.a,start);
  const field=features('field',data), home=features('home',data);
  const door=field.hotspots.find(spot=>spot.type==='house');
  assert.ok(route(field,maps.field.spawn,[door.x,door.y]));
  assert.ok(route(home,maps.home.spawn,[homeBed.x,homeBed.y]));
  assert.ok(walkable(home,homeBed.x,homeBed.y));
  assert.equal(walkable(home,390,119),false);
  const exit=home.hotspots.find(spot=>spot.type==='exit');
  assert.ok(route(home,[homeBed.x,homeBed.y],[exit.x,exit.y]));
  assert.ok(walkable(field,...exit.arrival));
  assert.ok(!features('visit',data,data.neighbors[0]).hotspots.some(spot=>spot.type==='house'));
});

test('a journal records completed work once and its reward resets on a new day',()=>{
  const room=world(), farm=room.farms.a;
  assert.throws(()=>act(room,'claimDay'),/hoàn thành/);
  assert.throws(()=>act(room,'harvest',{index:0}));
  assert.deepEqual(snapshot(room,farm,start).me.journal.done,[]);
  act(room,'plant',{item:'wheat',index:0});
  act(room,'water',{index:0});
  assert.deepEqual(snapshot(room,farm,start).me.journal.done,['care']);
  farm.plots[0].progress=cropGoal(farm.plots[0]);
  act(room,'harvest',{index:0});
  act(room,'sell',{item:'wheat'});
  const {coins,xp}=farm;
  act(room,'claimDay');
  assert.equal(farm.coins,coins+dayReward.coins);
  assert.equal(farm.xp,xp+dayReward.xp);
  assert.throws(()=>act(room,'claimDay'),/đã nhận/);
  const tomorrow=snapshot(room,farm,start+gameDay);
  assert.deepEqual(tomorrow.me.journal.done,[]);
  assert.equal(tomorrow.me.journal.claimed,false);
  act(room,'till',{index:0},gameDay);
  act(room,'plant',{item:'wheat',index:0},gameDay);
  assert.deepEqual(snapshot(room,farm,start+gameDay).me.journal.done,['care']);
});
