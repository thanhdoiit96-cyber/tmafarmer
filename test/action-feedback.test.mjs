import test from 'node:test';
import assert from 'node:assert/strict';
import {createActionFeedback,requestTiming} from '../public/action-feedback.mjs';
test('feedback transitions immediately, times independent stages and cannot clear a newer operation',()=>{
  let now=0;const node={dataset:{}},f=createActionFeedback(node,{clock:()=>now});
  const a=f.start('plant','online');assert.match(node.textContent,/Đang tới/);assert.equal(node.hidden,false);
  now=300;a.stage('arrived');assert.match(node.textContent,/Đang thực hiện/);
  now=400;a.stage('positionQueueReady');a.request('scene',{requestMs:200,status:200});
  now=600;a.stage('action');a.request('action',{requestMs:500,status:200});
  now=1100;a.stage('render');now=1108;a.stage('rendered');a.finish('success');
  assert.equal(node.hidden,true);const record=f.recent()[0];assert.equal(record.totalMs,1108);
  assert.deepEqual(record.durations,{travelMs:300,positionQueueMs:100,sceneRequestMs:200,actionRequestMs:500,renderMs:8});
  const b=f.start('water','demo'),c=f.start('feed','online');b.finish('failed');assert.equal(node.hidden,false);
  c.finish('failed');assert.equal(node.hidden,true);assert.equal(f.recent().length,3);
  record.requests.length=0;assert.equal(f.recent()[0].requests.length,2);
});
test('diagnostics are bounded, omit payloads and handle unavailable server timing',()=>{
  const f=createActionFeedback(null);assert.equal(f.start('buy','online'),null);
  for(let i=0;i<60;i++)f.start('harvest','demo').finish('cancelled');assert.equal(f.recent().length,40);
  assert.deepEqual(requestTiming(10,210,new Response('',{headers:{'server-timing':'app;dur=30.2, db;dur=12.1, dbq;desc="4"'}})),
    {requestMs:200,status:200,serverMs:30.2,databaseMs:12.1,outsideServerMs:169.8});
  assert.equal(requestTiming(0,10,null).serverMs,null);assert.equal(requestTiming(0,10,null).status,0);
  f.clear();assert.deepEqual(f.recent(),[]);
});
