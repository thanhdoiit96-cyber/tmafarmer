import test from 'node:test';
import assert from 'node:assert/strict';
import {farmNavigation} from '../public/navigation.mjs';
test('farm navigation distinguishes personal ponds from village lake and adds storage without duplicating the coop',()=>{
  const entries=farmNavigation({workshop:0});
  assert.equal(entries.filter(e=>e.id==='coop').length,1);
  assert.equal(entries.find(e=>e.id==='ponds').panel,'ponds');
  assert.equal(entries.find(e=>e.id==='lake').area,'lake');
  assert.notEqual(entries.find(e=>e.id==='ponds').label,entries.find(e=>e.id==='lake').label);
  assert.equal(entries.find(e=>e.id==='stock').panel,'stock');
  assert.ok(!entries.some(e=>e.id==='workshop'));
  assert.ok(farmNavigation({workshop:1}).some(e=>e.id==='workshop'));
});
test('storage and ponds are the sole active shortcut in their panels and do not label a visit as the personal pond',()=>{
  for(const panel of ['stock','ponds'])assert.deepEqual(farmNavigation({}, {tab:'field',panel}).filter(e=>e.active).map(e=>e.id),[panel]);
  assert.deepEqual(farmNavigation({}, {tab:'coop',panel:'stock'}).filter(e=>e.active).map(e=>e.id),['stock']);
  assert.deepEqual(farmNavigation({}, {tab:'neighbors',panel:'ponds',visiting:true}).filter(e=>e.active).map(e=>e.id),['neighbors']);
});
