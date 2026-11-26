import test from 'node:test';
import assert from 'node:assert/strict';
import {driveItem} from '../public/village-drive-view.mjs';
import {goalAfterAction,goalStorageKey,goalView,loadGoal,noGoal,pinVillageGoods,reconcileGoal} from '../public/next-goal.mjs';

const base=()=>({now:100,me:{id:'a',inventory:{wheat:4}},villageDrive:{id:80,endsAt:200,completed:false,items:[{item:'wheat',required:16,delivered:10}]}});
test('village item availability obeys inventory, remaining demand and exact deadline without mutation',()=>{
  const s=base(),before=JSON.stringify(s);
  assert.equal(driveItem(s.villageDrive,s.me,'wheat',100).maximum,4);
  assert.equal(JSON.stringify(s),before);
  s.villageDrive.items[0].delivered=15;
  assert.equal(driveItem(s.villageDrive,s.me,'wheat',100).maximum,1);
  assert.equal(driveItem(s.villageDrive,s.me,'wheat',200).maximum,0);
  s.villageDrive.completed=true;assert.equal(driveItem(s.villageDrive,s.me,'wheat',100).maximum,0);
  assert.equal(driveItem(null,s.me,'wheat',100),null);
  assert.equal(driveItem(s.villageDrive,s.me,'carrot',100),null);
});
test('pinned contribution survives reload and farm actions, resolves source or contribution without spending',()=>{
  const s=base(),before=JSON.stringify(s),g=pinVillageGoods(s,'wheat');
  assert.equal(g.kind,'villageGoods');assert.deepEqual(loadGoal(JSON.parse(JSON.stringify(g)),s),g);
  assert.deepEqual(reconcileGoal(g,s),g);assert.deepEqual(goalAfterAction(g,{action:'sell'},s.me,s.me),g);
  assert.equal(goalView(g,s).route.kind,'villageGoods');
  assert.equal(JSON.stringify(s),before);
  s.me.inventory.wheat=0;assert.deepEqual(goalView(g,s).route,{kind:'goodsSource',item:'wheat'});
  assert.notEqual(goalStorageKey(s,null),goalStorageKey(s,{code:'abc'}));
  assert.deepEqual(loadGoal({...g,item:'invalid'},s),noGoal());
});
test('pinned drive never silently switches after completion, item filled, expiry or new drive',()=>{
  const s=base(),g=pinVillageGoods(s,'wheat');
  s.villageDrive.items[0].delivered=16;
  assert.equal(goalView(g,s).done,true);assert.deepEqual(pinVillageGoods(s,'wheat'),noGoal());
  s.villageDrive.items[0].delivered=10;s.now=200;
  assert.equal(goalView(g,s).route.kind,'choose');assert.deepEqual(pinVillageGoods(s,'wheat'),noGoal());
  s.now=100;s.villageDrive.id=90;assert.equal(goalView(g,s).done,true);
  assert.deepEqual(reconcileGoal(g,s),g);
  s.villageDrive.id=80;s.villageDrive.completed=true;
  assert.equal(goalView(g,s).route.kind,'villageGoods');assert.deepEqual(pinVillageGoods(s,'wheat'),noGoal());
});
