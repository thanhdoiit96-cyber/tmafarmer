import test from 'node:test';
import assert from 'node:assert/strict';
import {newFarm,crops,animals,buildings,buildingUpgrade,cropRequirement,animalRequirement,upgradeRequirement} from '../public/game.mjs';
import {aquatic,aquaRequirement} from '../public/aqua.mjs';
import {unlockGuide,itemUnlockTarget} from '../public/unlock-guide.mjs';

test('unlock rows agree with engine across catalogs and farm progression',()=>{
  for(const xp of [0,100,2200,16000])for(const level of [0,1,3,7,9]){
    const f=newFarm('a','A',100);Object.assign(f,{xp,workshop:level,coop:level,barn:Math.max(1,level)});
    const before=structuredClone(f);
    for(const [type,defs,check] of [['crop',crops,cropRequirement],['animal',animals,animalRequirement],['aqua',aquatic,aquaRequirement]])for(const key of Object.keys(defs)){
      const v=unlockGuide(f,type,key);
      assert.equal(v.unlocked,!check(f,key),type+' '+key);
      assert.equal(v.rows.every(r=>r.ready),v.unlocked,type+' '+key+' rows');
    }
    assert.deepEqual(f,before,'guidance cannot mutate a farm');
  }
});
test('building guide includes simultaneous XP, coins and material shortages',()=>{
  const f=newFarm('a','A',100);f.workshop=6;f.coins=0;
  const step=buildingUpgrade(f,'workshop'),v=unlockGuide(f,'building','workshop');
  assert.equal(v.unlocked,false);assert.ok(upgradeRequirement(f,'workshop'));
  assert.equal(v.rows.filter(r=>!r.ready).length,2+Object.keys(step.materials).length);
  f.xp=step.xp;f.coins=step.cost;Object.assign(f.inventory,step.materials);
  assert.equal(unlockGuide(f,'building','workshop').unlocked,true);
  for(const key of Object.keys(buildings)){
    f[key]=(buildings[key].base??1)+buildings[key].costs.length;
    assert.equal(unlockGuide(f,'building',key).max,true);
    assert.deepEqual(unlockGuide(f,'building',key).rows,[]);
  }
});
test('item links resolve seeds and produce consistently and parcel coop uses engine context',()=>{
  for(const [key,d] of Object.entries(crops))assert.deepEqual(itemUnlockTarget(d.seed),itemUnlockTarget(key));
  for(const [key,d] of Object.entries(aquatic))assert.deepEqual(itemUnlockTarget(d.seed),itemUnlockTarget(key));
  const f=newFarm('a','A',100);f.coop=0;
  for(const key of Object.keys(animals))assert.equal(unlockGuide(f,'animal',key,0).unlocked,!animalRequirement(f,key,0));
  assert.equal(unlockGuide(f,'crop','invalid'),null);assert.equal(itemUnlockTarget('invalid'),null);
});
