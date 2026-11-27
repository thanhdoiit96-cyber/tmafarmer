import test from 'node:test';
import assert from 'node:assert/strict';
import {newFarm,newRoom,snapshot,crops,productGoal} from '../public/game.mjs';
import {aquatic} from '../public/aqua.mjs';
import {farmTasks} from '../public/tasks.mjs';
import {returnAfter,returnSummary,previousVisit,visitMark,visitStorageKey} from '../public/return-summary.mjs';
const now=100000;
function setup(){const room=newRoom(now),farm=newFarm('a','A',now);room.farms.a=farm;return {room,farm,view:()=>snapshot(room,farm,now)};}

test('return checkpoint validates schema, absence and clock changes without saving a farm',()=>{
  const {view}=setup(),s=view(),mark=visitMark(s);
  assert.deepEqual(Object.keys(mark).sort(),['at','ready','version']);
  assert.equal(previousVisit(mark,s),null);
  assert.ok(previousVisit({...mark,at:now-returnAfter},{...s}));
  for(const raw of [null,{}, {...mark,version:2},{...mark,at:now+1},{...mark,at:-1},{...mark,at:now-returnAfter,ready:{plot:-1,animal:0,pond:0}},{...mark,at:now-returnAfter,ready:{plot:0.5,animal:0,pond:0}}])assert.equal(previousVisit(raw,s),null);
  assert.equal(returnSummary(null,s,null),null);
  const keys=[visitStorageKey(s,null),visitStorageKey(s,{code:'A',token:'one'}),visitStorageKey(s,{code:'B'}),visitStorageKey({...s,me:{...s.me,id:'b'}},null)];
  assert.equal(new Set(keys).size,4);assert.equal(keys[1],visitStorageKey(s,{code:'A',token:'two'}));
});
test('summary counts ready work rather than yield and calculates net change and barn room',()=>{
  const {farm,view}=setup(),empty=view(),prior={...visitMark(empty),at:now-3600};
  farm.plots[0]={kind:'wheat',progress:crops.wheat.time,at:now,wetUntil:now,pests:0,picked:0};
  farm.inventory.wheat=30;
  const s=view(),before=structuredClone(s),summary=returnSummary(prior,s,{title:'Xưởng máy cấp 1',copy:'Thiếu xu.',done:false});
  assert.equal(summary.rows.length,3);assert.match(summary.rows[0].title,/1 ô cây/);assert.match(summary.rows[0].copy,/Tăng 1/);
  assert.equal(summary.rows[1].title,'Kho đã đầy');assert.match(summary.rows[2].title,/Xưởng/);assert.equal(summary.minutes,60);
  assert.equal(summary.ready,1);assert.equal(summary.free,0);assert.equal(summary.capacity,30);
  assert.equal(summary.urgent,farmTasks(s).filter(t=>t.type==='urgent').length);
  assert.deepEqual(s,before);
  const readyMark=visitMark(s);farm.plots[0]=null;
  assert.match(returnSummary({...readyMark,at:now-600},view(),null).rows[0].copy,/Giảm 1/);
});
test('empty, long absence and no pinned goal remain actionable without invented rewards',()=>{
  const {view}=setup(),s=view(),p={...visitMark(s),at:now-86400};
  const v=returnSummary(p,s,null);
  assert.match(v.rows[0].title,/Chưa có/);assert.match(v.rows[1].title,/30/);assert.equal(v.rows[2].cta,'Chọn mục tiêu');
  assert.equal(v.minutes,1440);
  assert.match(returnSummary(p,s,{title:'Hoàn thành',copy:'',done:true}).rows[2].copy,/đã hoàn thành/);
});
test('ready livestock and pond batches are counted separately and rain suppresses watering work',()=>{
  const {view}=setup(),s=view(),prior={...visitMark(s),at:now-600};
  s.me.pens=[{kind:'chicken',progress:productGoal({kind:'chicken'}),fedUntil:0}];
  s.me.pondBatches={0:[{kind:'tilapia',count:8,progress:aquatic.tilapia.time,fedUntil:0,picked:0}]};
  const mark=visitMark(s);assert.equal(mark.ready.animal,1);assert.equal(mark.ready.pond,1);
  const v=returnSummary(prior,s,null);assert.match(v.rows[0].title,/1 vật nuôi/);assert.match(v.rows[0].title,/1 lứa thủy sản/);
  s.me.plots[0]={kind:'wheat',progress:1,wetUntil:0,pests:0};s.weather={...s.weather,wet:false};
  assert.ok(farmTasks(s).some(t=>t.title==='Tưới nước'));
  s.weather={...s.weather,wet:true};assert.ok(!farmTasks(s).some(t=>t.title==='Tưới nước'));
  assert.deepEqual(visitMark(s).ready,mark.ready);
});
