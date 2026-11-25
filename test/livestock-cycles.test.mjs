import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,animalCondition,animals,newFarm,newRoom,snapshot,startLivestockClock} from '../public/game.mjs';
const now=100000,day=86400;
function setup(cycles=0){
  const room=newRoom(now),farm=room.farms.a=newFarm('a','A',now);farm.coop=2;farm.coins=1000;
  farm.land[0]={kind:'coop'};
  farm.pens=[{id:0,kind:'cow',acquiredAt:now,age:animals.cow.grow,progress:animals.cow.time,
    growGoal:animals.cow.grow,productGoal:animals.cow.time,at:now,fedUntil:0,harvestCycles:cycles,ageCycleOffset:0}];
  return {room,farm};
}
test('cycle boundaries are independent of elapsed calendar time for every species',()=>{
  for(const [kind,def] of Object.entries(animals))for(const [count,tier,multiplier] of [[0,'Sung sức',1],[29,'Sung sức',1],[30,'Lớn tuổi',.75],[69,'Lớn tuổi',.75],[70,'Già',.5]]){
    const pen={kind,harvestCycles:count,acquiredAt:now};
    const a=animalCondition(pen,now),b=animalCondition(pen,now+365*day);
    assert.equal(a.label,def.oneTime?'Sung sức':tier);
    assert.equal(a.yield,Math.max(1,Math.floor(def.yield*(def.oneTime?1:multiplier))));
    assert.equal(b.yield,a.yield);assert.equal(b.sale,a.sale);assert.equal(b.cycles,a.cycles);
  }
});
test('only a successful full harvest advances age and it prices that harvest before incrementing',()=>{
  const {room,farm}=setup(29);
  apply(room,'a',{action:'collect',target:'0'},now);
  assert.equal(farm.inventory.milk,3);assert.equal(farm.pens[0].harvestCycles,30);
  assert.equal(animalCondition(farm.pens[0],now).yield,2);
  assert.throws(()=>apply(room,'a',{action:'collect',target:'0'},now),/chưa sẵn sàng/);
  assert.equal(farm.pens[0].harvestCycles,30);
  apply(room,'a',{action:'feed',target:'0'},now);
  assert.equal(farm.pens[0].harvestCycles,30);
  apply(room,'a',{action:'moveAnimal',target:'0',index:0},now);
  assert.equal(farm.pens[0].harvestCycles,30);
  assert.equal(snapshot(room,farm,now+7*day).me.pens[0].harvestCycles,30);
});
test('a rejected harvest with full warehouse does not advance cycles or discard production',()=>{
  const {room,farm}=setup(69);farm.inventory.wheat=30;
  assert.throws(()=>apply(room,'a',{action:'collect',target:'0'},now),/Kho/);
  assert.equal(farm.pens[0].harvestCycles,69);assert.equal(farm.pens[0].progress,animals.cow.time);
});
test('old rooms preserve the current legacy tier at a durable cutoff and never migrate repeatedly',()=>{
  for(const [days,offset,yieldCount] of [[1,0,3],[3,30,2],[7,70,1]]){
    const {room,farm}=setup();delete room.livestockCycleSince;
    delete farm.pens[0].harvestCycles;delete farm.pens[0].ageCycleOffset;
    const cutoff=now+days*day;
    assert.equal(startLivestockClock(room,cutoff),true);
    assert.equal(startLivestockClock(room,cutoff+20*day),false);
    const first=snapshot(room,farm,cutoff).me.pens[0];
    assert.equal(first.ageCycleOffset,offset);assert.equal(first.harvestCycles,0);
    assert.equal(animalCondition(first,cutoff).yield,yieldCount);
    const loaded=JSON.parse(JSON.stringify(room));
    const later=snapshot(loaded,loaded.farms.a,cutoff+100*day).me.pens[0];
    assert.equal(later.ageCycleOffset,offset);assert.equal(animalCondition(later,cutoff+100*day).yield,yieldCount);
    apply(loaded,'a',{action:'collect',target:'0'},cutoff+100*day);
    assert.equal(loaded.farms.a.pens[0].ageCycleOffset,offset);
    assert.equal(loaded.farms.a.pens[0].harvestCycles,1);
  }
});
