import assert from 'node:assert/strict';
import test from 'node:test';
import {apply, gameDay, newFarm, newRoom, orderList, snapshot, stock} from '../public/game.mjs';

const start=1000;
const setup=()=>{
  const room=newRoom(start);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,start);
  return room;
};

test('material recipes consume exact inputs, fit in the barn after consumption and cannot be eaten',()=>{
  const room=setup(), farm=room.farms.a;
  const craft=item=>apply(room,'a',{action:'craft',item},start);
  farm.workshop=2;
  Object.assign(farm.inventory,{wool:2,wheat:25,corn:3});
  assert.throws(()=>craft('woolCloth'),/cấp 3/);
  assert.equal(farm.inventory.wool,2);
  farm.workshop=3;
  craft('woolCloth');
  assert.equal(farm.inventory.wool,0);
  assert.equal(stock(farm),29);
  assert.throws(()=>apply(room,'a',{action:'consume',item:'woolCloth'},start),/thực phẩm/);
  farm.workshop=5;
  craft('starchGlue');
  assert.throws(()=>craft('insulationMat'),/Chưa đủ/);
  assert.equal(farm.inventory.woolCloth,1);
  assert.equal(farm.inventory.starchGlue,1);
  farm.inventory.tea=1;
  craft('insulationMat');
  assert.equal(farm.inventory.insulationMat,1);
  assert.equal(farm.inventory.starchGlue,0);
});

test('a stable workshop order supplements the regular board, with a single shared delivery',()=>{
  const room=setup(), {a,b}=room.farms;
  assert.equal(snapshot(room,a,start).orderCount,3);
  a.workshop=3;
  const board=snapshot(room,a,start);
  assert.deepEqual(board.orders.slice(0,3),orderList(0));
  assert.equal(board.orderCount,4);
  const bonus=board.orders.find(order=>order.category==='workshop');
  a.workshop=5;
  assert.deepEqual(snapshot(room,b,start).orders[3],bonus);
  const deliver=(id,time=start)=>apply(room,id,{action:'order',index:bonus.id},time);
  a.inventory.woolCloth=4;
  a.inventory.egg=1;
  assert.throws(()=>deliver('a'),/chưa có đủ/);
  assert.equal(a.inventory.woolCloth,4);
  assert.throws(()=>apply(room,'b',{action:'steal',target:'a',source:'barn',item:'woolCloth'},start),/Kho phải còn lại/);
  a.inventory.egg=2;
  deliver('a');
  assert.equal(a.coins,100+bonus.reward);
  assert.equal(a.xp,30);
  assert.equal(a.inventory.woolCloth,2);
  const remaining=snapshot(room,b,start);
  assert.equal(remaining.orders.length,3);
  assert.equal(remaining.orderCount,4);
  assert.throws(()=>deliver('b'),/đã giao/);
  assert.throws(()=>deliver('b',start+2*gameDay),/hết hạn/);
  const ids=Array.from({length:30},(_,day)=>orderList(day,room)).flat().map(order=>order.id);
  assert.equal(new Set(ids).size,ids.length);
});
