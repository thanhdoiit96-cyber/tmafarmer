import test from 'node:test';
import assert from 'node:assert/strict';
import {animalCondition,animals,apply,newFarm,newRoom,snapshot,startLivestockClock} from '../public/game.mjs';

const start=50_000;
const realDay=24*60*60;
function setup(){
  const room=newRoom(start);
  const farm=room.farms.a=newFarm('a','Vườn A',start);
  farm.coop=3;
  farm.coins=200;
  farm.land[0]={kind:'coop'};
  farm.land[1]={kind:'garden'};
  return {room,farm};
}

test('relocating livestock keeps a stable ID, feed and production and respects housing limits',()=>{
  const {room,farm}=setup();
  const send=(action,details,time=start)=>apply(room,'a',{action,...details},time);
  send('animal',{item:'chicken'});
  send('feed',{target:'0'});
  const moveAt=start+60;
  const before=snapshot(room,farm,moveAt).me.pens[0];
  assert.throws(()=>send('moveAnimal',{target:'0',index:1},moveAt),/Chuồng không tồn tại/);
  assert.throws(()=>send('moveAnimal',{target:'0',index:-1},moveAt),/đang ở chuồng này/);
  assert.throws(()=>send('moveAnimal',{index:0},moveAt),/chọn vật nuôi/);
  send('moveAnimal',{target:'0',index:0},moveAt);
  assert.deepEqual(farm.pens[0],{...before,lot:0});
  send('animal',{item:'chicken',index:0},moveAt);
  send('animal',{item:'chicken'},moveAt);
  assert.throws(()=>send('moveAnimal',{target:'2',index:0},moveAt),/hết chỗ/);
  send('moveAnimal',{target:'0',index:-1},moveAt);
  assert.equal(farm.pens[0].lot,undefined);
  assert.equal(farm.pens[0].acquiredAt,start);
});

test('legacy animals start aging at rollout and old animals actually produce and sell for less',()=>{
  const {room,farm}=setup();
  delete room.livestockSince;
  const chicken=animals.chicken;
  farm.pens.push({kind:'chicken',age:chicken.grow,progress:chicken.time,at:start,fedUntil:0});
  const rollout=start+10*realDay;
  assert.equal(startLivestockClock(room,rollout),true);
  assert.equal(startLivestockClock(room,rollout+realDay),false);
  const view=snapshot(room,farm,rollout).me.pens[0];
  assert.equal(view.acquiredAt,rollout);
  assert.equal(animalCondition(view,rollout+3*realDay-1).yield,3);
  assert.equal(animalCondition(view,rollout+3*realDay).yield,2);
  const oldTime=rollout+7*realDay;
  assert.equal(animalCondition(view,oldTime).yield,1);
  apply(room,'a',{action:'collect',target:'0'},oldTime);
  assert.equal(farm.inventory.egg,1);
  farm.pens.push({kind:'pig',age:3600,progress:2400,at:start,fedUntil:0});
  const coins=farm.coins;
  apply(room,'a',{action:'sellAnimal',target:'0'},oldTime);
  assert.equal(farm.coins,coins+Math.floor(chicken.cost*.25));
  assert.equal(farm.pens[0].id,1);
  assert.throws(()=>apply(room,'a',{action:'sellAnimal',target:'0'},oldTime),/không tồn tại/);
  apply(room,'a',{action:'collect',target:'1'},oldTime);
  assert.equal(farm.inventory.pork,animals.pig.yield);
  assert.equal(farm.pens.length,0);
});
