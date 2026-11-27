import test from 'node:test';
import assert from 'node:assert/strict';
import {taskGroups,taskKey,farmTasks} from '../public/tasks.mjs';
import {newRoom,newFarm,snapshot} from '../public/game.mjs';

test('task groups combine animal species but separate care, harvest and pond batches',()=>{
  const tasks=[
    {kind:'animal',target:'sheep',index:0,type:'urgent',title:'Cho cừu ăn'},
    {kind:'animal',target:'cow',index:1,type:'urgent',title:'Cho bò ăn'},
    {kind:'plot',index:0,type:'ready',title:'Thu hoạch'},
    {kind:'animal',target:'hen',index:2,type:'ready',title:'Thu trứng'},
    {kind:'pond',index:0,batch:'tilapia',type:'urgent',title:'Cho cá ăn'},
    {kind:'pond',index:0,batch:'prawn',type:'urgent',title:'Cho tôm ăn'},
  ];
  const groups=taskGroups(tasks);
  assert.deepEqual(groups.map(g=>[g.title,g.tasks.length,g.unit]),[['Cho ăn',2,'vật nuôi'],['Thu cây',1,'ô cây'],['Thu sản phẩm',1,'vật nuôi'],['Cho thủy sản ăn',2,'lứa']]);
  assert.equal(new Set(tasks.map(taskKey)).size,6);
  assert.equal(taskKey(tasks[0]),taskKey({...tasks[0],index:12}),'animal identity survives a list reorder');
  assert.notEqual(taskKey(tasks[0]),taskKey({...tasks[0],type:'ready',title:'Thu lông'}),'changed work is not the same stale action');
  assert.deepEqual(taskGroups([]),[]);
});

test('snapshot tasks retain index zero and stable animal identities through a changed pen order',()=>{
  const now=1000,room=newRoom(now),farm=room.farms.a=newFarm('a','A',now);
  farm.pens=[{id:'cow-id',kind:'cow',progress:0,fedUntil:0,at:now},{id:'sheep-id',kind:'sheep',progress:0,fedUntil:0,at:now}];
  const first=farmTasks(snapshot(room,farm,now)).find(t=>t.kind==='animal'&&t.index===0);
  farm.pens.reverse();
  const second=farmTasks(snapshot(room,farm,now)).find(t=>t.target==='cow-id');
  assert.equal(first.index,0);assert.equal(second.index,1);assert.equal(taskKey(first),taskKey(second));
  assert.equal(taskGroups(farmTasks(snapshot(room,farm,now))).find(g=>g.title==='Cho ăn').tasks.length,2);
});
