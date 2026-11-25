import test from 'node:test';
import assert from 'node:assert/strict';
import {newFarm,crops,cropRequirement} from '../public/game.mjs';
import {seedCatalog,seedPickerPage} from '../public/seed-picker.mjs';

test('seed grouping follows engine locks even when a locked seed is already in the bag',()=>{
  const farm=newFarm('a','A',100);farm.inventory.coffeeSeed=12;
  const before=structuredClone(farm),catalog=seedCatalog(farm);
  assert.equal(catalog.length,Object.keys(crops).length);
  for(const seed of catalog)assert.equal(seed.unlock.unlocked,!cropRequirement(farm,seed.key));
  const coffee=catalog.find(s=>s.key==='coffee');
  assert.equal(coffee.count,12);assert.equal(coffee.unlock.unlocked,false);
  assert.equal(coffee.unlock.rows.filter(r=>!r.ready).length,2);
  assert.deepEqual(farm,before);
});
test('pagination covers every seed once in both desktop and landscape and clamps after unlocking',()=>{
  const farm=newFarm('a','A',100);
  for(const size of [3,6]){
    const seen=[];
    for(const group of ['open','locked']){
      const first=seedPickerPage(farm,group,0,size);
      for(let page=0;page<first.pages;page++)seen.push(...seedPickerPage(farm,group,page,size).entries.map(s=>s.key));
    }
    assert.equal(new Set(seen).size,Object.keys(crops).length);assert.equal(seen.length,Object.keys(crops).length);
  }
  Object.assign(farm,{xp:16000,workshop:9});
  const page=seedPickerPage(farm,'locked',50,2);
  assert.equal(page.page,0);assert.equal(page.locked,0);assert.deepEqual(page.entries,[]);
});
test('unlocked seeds in stock appear before empty ones without treating empty stock as locked',()=>{
  const farm=newFarm('a','A',100);Object.assign(farm,{xp:16000,workshop:9});
  for(const crop of Object.values(crops))farm.inventory[crop.seed]=0;
  farm.inventory.blackRiceSeed=1;
  const first=seedPickerPage(farm,'open',0);
  assert.equal(first.entries[0].key,'blackRice');assert.equal(first.locked,0);
  assert.equal(first.entries[1].count,0);assert.equal(first.entries[1].unlock.unlocked,true);
});
