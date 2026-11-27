import test from 'node:test';
import assert from 'node:assert/strict';
import {driveMemory} from '../public/drive-memory.mjs';

const completed={id:1,title:'Hiên làng',completed:true,completedAt:100,minimum:3,rewardXp:40,
  mine:{quantity:3,paid:true,coins:25,decorVoucher:true},contributors:[{name:'Cô Lan',quantity:3,id:'secret',chat:'private'}],history:[]};
test('current and archived memories are detached readonly projections without private fields',()=>{
  const drive=structuredClone(completed);drive.history=[{...completed,id:0,completedAt:0,mine:{...completed.mine,xp:32}}];
  const before=structuredClone(drive),current=driveMemory(drive,'current'),old=driveMemory(drive,0);
  assert.equal(current.mine.xp,40);assert.equal(old.mine.xp,32);assert.equal(old.at,0);
  assert.deepEqual(current.people,[{name:'Cô Lan',quantity:3}]);
  current.people[0].name='changed';current.mine.coins=10000;
  assert.deepEqual(drive,before);
});
test('unfinished/missing rounds cannot have a memory, and unpaid contributions cannot claim rewards',()=>{
  assert.equal(driveMemory(null,'current'),null);
  assert.equal(driveMemory({...completed,completed:false},'current'),null);
  assert.equal(driveMemory({...completed,history:[{...completed,id:0,completedAt:null}]},0),null);
  assert.equal(driveMemory(completed,999),null);
  const view=driveMemory({...completed,mine:{quantity:1,paid:false,coins:25,decorVoucher:true}},'current');
  assert.deepEqual(view.mine,{quantity:1,paid:false,coins:0,xp:0,decorVoucher:false});
});
