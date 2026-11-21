import assert from 'node:assert/strict';
import test from 'node:test';
import {newFarm,newRoom,snapshot} from '../public/game.mjs';
import {features} from '../public/world-layout.mjs';

test('quail sprites keep their full visible footprint behind the main coop fence',()=>{
  const room=newRoom(1000),farm=newFarm('a','a',1000);
  room.farms.a=farm;
  farm.coop=8;
  farm.pens=Array.from({length:16},(_,id)=>({id,kind:'quail',lot:undefined,age:1000}));
  const scene=features('coop',snapshot(room,farm,1000));
  const birds=scene.hotspots.filter(spot=>spot.type==='animal');
  assert.equal(birds.length,16);
  for(const bird of birds){
    assert.ok(bird.x-12>=82&&bird.x+12<=340,`quail body must stay between side fences: ${bird.x}`);
    assert.ok(bird.y-21>=106&&bird.y<=195,`quail body must stay behind the fence: ${bird.y}`);
  }
});
