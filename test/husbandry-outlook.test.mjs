import test from 'node:test';
import assert from 'node:assert/strict';
import {animalOutlook,pondOutlook} from '../public/husbandry-outlook.mjs';
import {animals,animalGrowthRate,newRoom,projectAnimal,weather,weatherAt,slotLength} from '../public/game.mjs';
import {aquatic,projectPond} from '../public/aqua.mjs';

test('animal ETA includes growth before production and matches engine across weather and shelter',()=>{
  for(const coop of [1,2,3])for(const w of weather)for(const kind of Object.keys(animals)){
    const def=animals[kind],now=1000,farm={coop};
    const pen={kind,age:20,progress:10,growGoal:100,productGoal:200,at:now,fedUntil:1e8};
    const result=animalOutlook(farm,pen,w,now);
    assert.equal(result.seconds,Math.ceil(270/animalGrowthRate(farm,w)));
    assert.equal(result.yield,def.yield);
    assert.equal(result.needsMoreFood,false);
  }
  const room=newRoom(1000),now=1000,w=weatherAt(room,now),farm={coop:2};
  const pen={kind:'chicken',age:90,progress:0,growGoal:100,productGoal:20,at:now,fedUntil:1e8};
  const eta=animalOutlook(farm,pen,w,now).seconds;
  assert.ok(eta<slotLength);
  assert.equal(projectAnimal(room,farm,pen,now+eta).progress,20);
  assert.ok(projectAnimal(room,farm,pen,now+eta-1).progress<20);
});

test('outlook distinguishes paused, insufficient food, ready, legacy goals and cycle loss without mutation',()=>{
  const pen={kind:'sheep',age:100,progress:20,growGoal:100,productGoal:100,at:1000,fedUntil:1000,harvestCycles:70};
  const original=JSON.stringify(pen),farm={coop:1},w=weather[0];
  const hungry=animalOutlook(farm,pen,w,1000);
  assert.equal(hungry.feeding,false);assert.equal(hungry.seconds,80);assert.equal(hungry.needsMoreFood,true);
  assert.ok(hungry.yieldChange<0);
  assert.equal(animalOutlook(farm,{...pen,fedUntil:1080},w,1000).needsMoreFood,false);
  assert.equal(animalOutlook(farm,{...pen,fedUntil:1079},w,1000).needsMoreFood,true);
  const ready=animalOutlook(farm,{...pen,progress:100},w,1000);
  assert.equal(ready.seconds,0);assert.equal(ready.needsMoreFood,false);
  assert.equal(JSON.stringify(pen),original);
});

test('pond ETA matches projection for every species/weather and preserves partial yield and batch count',()=>{
  for(const [kind,def]of Object.entries(aquatic))for(const w of weather){
    const batch={kind,progress:def.time-100,count:3,picked:2,at:1000,fedUntil:10000};
    const original=JSON.stringify(batch),o=pondOutlook(batch,w,1000);
    assert.equal(o.yield,def.yield*3-2);assert.equal(o.yieldChange,0);
    const projected=t=>projectPond(batch,t,(from,to,fn)=>fn(w,from,to));
    assert.equal(projected(1000+o.seconds).progress,def.time);
    assert.ok(projected(1000+o.seconds-1).progress<def.time);
    assert.equal(JSON.stringify(batch),original);
    assert.equal(pondOutlook({...batch,fedUntil:1000},w,1000).feeding,false);
    assert.equal(pondOutlook({...batch,progress:def.time,fedUntil:0},w,1000).seconds,0);
  }
});
