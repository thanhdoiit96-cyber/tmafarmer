import assert from 'node:assert/strict';
import test from 'node:test';
import {advanceVillage,apply,crops,gameDay,newFarm,newRoom,snapshot,startVillageSecurity} from '../public/game.mjs';
import {fishing} from '../public/aqua.mjs';
import {recordVillageTheft} from '../public/village.mjs';
import {features,maps,route} from '../public/world-layout.mjs';

const start=10_000;
function setup(){
  const room=newRoom(start);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,start);
  return room;
}
const act=(room,id,action,input={},day=0)=>apply(room,id,{action,...input},start+day*gameDay);
const view=(room,id='a',day=0)=>snapshot(room,room.farms[id],start+day*gameDay);

test('players can set aside harvest for their next planting or turn stored produce into seed',()=>{
  const room=setup(), farm=room.farms.a;
  farm.inventory.wheatSeed=0;
  farm.plots[0]={kind:'wheat',at:start,progress:crops.wheat.time,pests:0,picked:0};
  act(room,'a','harvest',{index:0,source:'seed'});
  assert.deepEqual([farm.inventory.wheat,farm.inventory.wheatSeed],[2,1]);
  act(room,'a','plant',{index:0,item:'wheat'});
  assert.equal(farm.inventory.wheatSeed,0);
  assert.throws(()=>act(room,'a','seedFromCrop',{item:'wheat',qty:3}),/đủ vật phẩm/);
  assert.throws(()=>act(room,'a','seedFromCrop',{item:'egg'}),/cây trồng/);
  act(room,'a','seedFromCrop',{item:'wheat',qty:2});
  assert.deepEqual([farm.inventory.wheat,farm.inventory.wheatSeed],[0,2]);
  farm.inventory.wheatSeed=100;
  farm.plots[1]={kind:'wheat',at:start,progress:crops.wheat.time,pests:0,picked:0};
  assert.throws(()=>act(room,'a','harvest',{index:1,source:'seed'}),/Túi đã đầy/);
  assert.equal(farm.plots[1].kind,'wheat');
});

test('legacy orders are hidden, shared ones pay a single winner and stale order IDs expire',()=>{
  const room=setup();
  const {a,b}=room.farms;
  a.orders={day:0,done:[0]};
  for(const farm of [a,b])farm.inventory.carrot=3;
  assert.deepEqual(view(room,'b').orders.map(o=>o.id),[1,2]);
  act(room,'a','order',{index:1});
  assert.deepEqual(view(room,'b').orders.map(o=>o.id),[2]);
  assert.throws(()=>act(room,'b','order',{index:1}),/đã giao/);
  assert.deepEqual([a.coins,b.coins,b.inventory.carrot],[145,100,3]);
  assert.equal(view(room).village.orders,1);
  assert.throws(()=>act(room,'b','order',{index:2},1),/hết hạn/);
  assert.equal(view(room,'b',1).orders.length,3);
});

test('villagers fund the current project, promotions honor rolling thefts and unlock all four projects',()=>{
  const room=setup();
  const {a,b}=room.farms;
  act(room,'a','villageFund',{item:'notice',amount:70});
  assert.equal(a.coins,30);
  assert.equal(view(room,'b').village.fund,70);
  assert.throws(()=>act(room,'b','villageFund',{item:'notice',amount:231}),/kinh phí còn thiếu/);
  assert.equal(b.coins,100);
  b.coins=230;
  act(room,'b','villageFund',{item:'notice',amount:230});
  assert.equal(view(room).village.next.built,true);
  assert.throws(()=>act(room,'b','villageFund',{item:'notice',amount:1}),/đã kết thúc/);
  assert.equal(view(room).village.name,'Làng');
  for(let day=0;day<4;day++){
    if(day===3)for(let i=0;i<6;i++)recordVillageTheft(room,day);
    for(const order of view(room,'a',day).orders){
      for(const {item,qty} of order.items)a.inventory[item]=qty;
      act(room,'a','order',{index:order.id},day);
    }
  }
  a.inventory.corn=20;
  act(room,'a','sell',{item:'corn',qty:20},3);
  assert.equal(view(room,'a',3).village.name,'Làng');
  assert.equal(view(room,'a',3).village.theftsToday,6);
  assert.equal(advanceVillage(room,4),false);
  assert.equal(advanceVillage(room,5),false);
  assert.equal(advanceVillage(room,6),true);
  assert.equal(view(room,'a',6).village.name,'Xã');
  assert.equal(view(room,'a',6).village.theftCap,8);

  for(let level=1;level<=3;level++){
    const day=level+6, goal=view(room,'a',day).village.next;
    room.village.income=goal.income;
    room.village.orders=goal.orders;
    a.coins=goal.cost;
    act(room,'a','villageFund',{item:goal.id,amount:goal.cost},day);
    assert.equal(view(room,'a',day).village.level,level+1);
  }
  const finished=view(room,'a',9);
  assert.equal(finished.village.name,'Thành phố');
  assert.equal(finished.village.built.length,4);
  assert.equal(finished.village.next,null);
  assert.equal(finished.fishingLimit,fishing.limit+2);
  for(const [area,type] of [['market','order-board'],['lake','village-well'],['neighbors','village-hall']]){
    const scene=features(area,finished);
    const spot=scene.hotspots.find(p=>p.type===type);
    assert.ok(spot&&route(scene,maps[area].spawn,[spot.x,spot.y]));
  }
});


test('city closes shared theft allowance after one success, and the count resets the next day',()=>{
  const room=setup(), {a,b}=room.farms;
  room.village={level:4,income:0,orders:0,fund:0,built:[],thefts:{}};
  a.inventory.corn=4;b.inventory.carrot=5;
  act(room,'a','steal',{item:'carrot',source:'barn',target:'b'});
  assert.equal(view(room).village.theftCap,1);
  assert.equal(view(room).village.theftsLeft,0);
  assert.throws(()=>act(room,'b','steal',{item:'corn',source:'barn',target:'a'}),/cả làng/);
  assert.equal(a.inventory.corn,4);
  act(room,'b','steal',{item:'corn',source:'barn',target:'a'},1);
  assert.equal(view(room,'a',1).village.theftsToday,1);
});

test('the market previews the basket and only takes goods after all its items are ready',()=>{
  const room=setup(), farm=room.farms.a;
  const order=view(room,'a',1).nextOrders.find(entry=>entry.title);
  assert.deepEqual(view(room,'a',2).orders.find(entry=>entry.id===order.id),order);
  farm.inventory.minnow=4;
  assert.throws(()=>act(room,'a','order',{index:order.id},2),/đủ hàng/);
  assert.equal(farm.inventory.minnow,4);
  farm.inventory.wheat=4;
  act(room,'a','order',{index:order.id},2);
  assert.deepEqual([farm.inventory.minnow,farm.inventory.wheat,farm.coins,farm.xp],[0,0,152,24]);
  assert.ok(view(room,'b',2).orders.every(entry=>entry.id!==order.id));
});

test('existing rooms preserve rank and only count completed security days after rollout',()=>{
  const room=setup();
  delete room.securityStartDay;
  room.village={level:2,income:4000,orders:55,fund:450,built:['notice','well'],thefts:{}};
  assert.equal(startVillageSecurity(room,30),true);
  assert.equal(startVillageSecurity(room,31),false);
  const town=view(room,'a',31).village;
  assert.equal(town.name,'Phường');
  assert.equal(town.fund,450);
  assert.equal(town.next.peaceStreak,1);
  assert.equal(view(room,'a',34).village.next.peaceStreak,4);
});
