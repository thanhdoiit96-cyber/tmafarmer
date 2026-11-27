import test from 'node:test';
import assert from 'node:assert/strict';
import {createNotices} from '../public/notices.mjs';
function setup(){
  let time=0,id=0;const tasks=new Map(),node={};
  const notices=createNotices(node,{now:()=>time,setTimer:(fn,delay)=>{tasks.set(++id,{fn,at:time+delay});return id;},clearTimer:key=>tasks.delete(key)});
  const advance=ms=>{const end=time+ms;for(;;){const entry=[...tasks].sort((a,b)=>a[1].at-b[1].at).find(([,t])=>t.at<=end);if(!entry)break;time=entry[1].at;tasks.delete(entry[0]);entry[1].fn();}time=end;};
  return {node,notices,advance};
}
test('short notices expire quickly, repeated notices do not extend their life, and late cleanup cannot erase a new notice',()=>{
  const {node,notices,advance}=setup();notices.show('Đã tưới cây');advance(1000);notices.show('Đã tưới cây');advance(800);assert.equal(node.className,'leaving');
  notices.show('Đã thu hoạch');advance(180);assert.equal(node.textContent,'Đã thu hoạch');assert.equal(node.className,'show');
  advance(1620);assert.equal(node.className,'leaving');advance(180);assert.equal(node.textContent,'');assert.equal(node.className,'');
});
test('errors get reading time and survive normal messages; a new error replaces the old one',()=>{
  const {node,notices,advance}=setup();notices.show('Không đủ thức ăn',true);advance(2000);notices.show('Đã cập nhật');assert.equal(node.textContent,'Không đủ thức ăn');
  notices.show('Kho đã đầy',true);advance(1800);assert.equal(node.className,'show error');advance(4200);assert.equal(node.textContent,'');
  notices.show('');assert.equal(node.textContent,'');
});
