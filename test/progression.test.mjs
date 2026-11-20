import test from 'node:test';
import assert from 'node:assert/strict';
import { farmRanks, farmProgress, crops, animals, goods, recipes, xpUnlocks } from '../public/game.mjs';
import { cropFrame } from '../public/pixel/crop-layout.mjs';
import { validateProgression } from '../scripts/progression.mjs';

test('farm ranks have continuous levels and strictly increasing XP thresholds', () => {
  assert.deepEqual(farmRanks.map(rank => rank.level), farmRanks.map((_, index) => index + 1));
  assert.ok(farmRanks.every((rank, index) => index === 0 || rank.xp > farmRanks[index - 1].xp));
  assert.equal(farmProgress({ xp: 15999 }).nextRank.level, 13);
  assert.equal(farmProgress({ xp: 16000 }).rank.level, 13);
  assert.equal(farmProgress({ xp: 20000 }).nextRank, null);
});

test('next unlocks route players to the matching farm area or upgrade panel', () => {
  const destinations=xpUnlocks.map(entry=>entry.destination);
  assert.ok(destinations.every(target=>target?.label&&(target.tab||target.panel)));
  assert.ok(destinations.every(target=>!target.tab||['field','coop'].includes(target.tab)));
  assert.ok(destinations.every(target=>!target.panel||['ponds','buildings'].includes(target.panel)));
  assert.deepEqual(farmProgress({xp:0}).next.destination,{tab:'field',label:'Vườn nhà'});
  assert.ok(destinations.some(target=>target.tab==='coop'));
  assert.ok(destinations.some(target=>target.tab==='field'&&target.panel==='ponds'));
  assert.ok(destinations.some(target=>target.panel==='buildings'));
});

test('crop and animal unlocks show actual recipes or upgrades that use their products',()=>{
  const potato=xpUnlocks.find(entry=>entry.item==='sweetPotato');
  assert.ok(potato.uses.includes(goods.roastedSweetPotato.name));
  const goatMilk=xpUnlocks.find(entry=>entry.item==='goatMilk');
  assert.ok(goatMilk.uses.includes(goods.berrySmoothie.name));
  for(const entry of xpUnlocks){
    for(const use of entry.uses??[]){
      assert.ok(Object.values(goods).some(item=>item.name===use)||use.includes(' cấp '),entry.label+' → '+use);
    }
  }
  assert.ok(Object.values(recipes).some(recipe=>recipe.ingredients.sweetPotato));
});

test('every crop and animal gate is covered by the progression art and content checks', () => {
  assert.deepEqual(validateProgression(), []);
  assert.ok(Object.keys(crops).includes('coffee'));
  assert.ok(Object.keys(animals).includes('buffalo'));
  for (const key of ['coffee', 'lotus', 'dragonfruit', 'blackRice']) {
    for (let stage = 0; stage < 4; stage++) assert.equal(cropFrame(key, stage).source, '/pixel/progression-crops-v2.png');
  }
});
