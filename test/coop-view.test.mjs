import test from 'node:test';
import assert from 'node:assert/strict';
import {coopPage} from '../public/coop-view.mjs';
import {animalImpacts,animalOutlook} from '../public/husbandry-outlook.mjs';
import {weather} from '../public/game.mjs';

const pens=()=>Array.from({length:14},(_,i)=>({id:'p'+i,kind:'sheep',age:100,progress:i%3===0?100:20,growGoal:100,productGoal:100,fedUntil:i%3===1?0:10000,...(i>=12?{lot:0}:{})}));
test('coop six-item pages preserve original index/ID and exclude other lots without mutating',()=>{
  const rows=pens(),before=JSON.stringify(rows),a=coopPage(rows,undefined,100),b=coopPage(rows,undefined,100,{page:1});
  assert.equal(a.count,2);assert.equal(a.entries.length,6);assert.equal(b.entries.length,6);
  assert.equal(new Set([...a.entries,...b.entries].map(e=>e.pen.id)).size,12);
  for(const e of [...a.entries,...b.entries])assert.equal(e.pen,rows[e.index]);
  assert.equal(coopPage(rows,0,100).total,2);assert.equal(JSON.stringify(rows),before);
});
test('filter, page clamp and task/map targeting handle index zero and stable late indices',()=>{
  const rows=pens();
  const ready=coopPage(rows,undefined,100,{filter:'ready',page:8});assert.equal(ready.index,0);assert.ok(ready.entries.every(e=>e.status==='ready'));
  for(const index of [0,7,11]){const page=coopPage(rows,undefined,100,{filter:'hungry',target:index});assert.equal(page.filter,'all');assert.ok(page.entries.some(e=>e.index===index));}
  const shrunk=coopPage(rows.slice(0,2),undefined,100,{page:1});assert.equal(shrunk.index,0);
  assert.equal(coopPage([],undefined,100).count,1);
});
test('management explains multiplicative weather/housing and actual rounded yield across conditions',()=>{
  const pen={kind:'sheep',age:100,progress:20,growGoal:100,productGoal:100,fedUntil:0,harvestCycles:70};
  for(const coop of [1,2,3])for(const w of weather){
    const impacts=animalImpacts({coop},pen,w,100),outlook=animalOutlook({coop},pen,w,100);
    assert.ok(Math.abs((1+impacts.weather)*(1+impacts.housing)-(1+impacts.total))<1e-12);
    assert.equal(impacts.total,outlook.rate-1);assert.equal(impacts.yield,-.5);
  }
});
