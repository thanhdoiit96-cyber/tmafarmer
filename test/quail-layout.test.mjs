import assert from 'node:assert/strict';
import test from 'node:test';
import {newFarm,newRoom,snapshot} from '../public/game.mjs';
import {features} from '../public/world-layout.mjs';
import {animalMotion} from '../public/world-motion.mjs';

test('quail sprites keep their full visible footprint behind the main coop fence',()=>{
  const room=newRoom(1000),farm=newFarm('a','a',1000);
  room.farms.a=farm;
  farm.coop=8;
  farm.pens=Array.from({length:16},(_,id)=>({id,kind:'quail',lot:undefined,age:1000}));
  const scene=features('coop',snapshot(room,farm,1000));
  const birds=scene.actors.filter(spot=>spot.type==='animal');
  assert.equal(birds.length,16);
  for(const bird of birds){
    const left=bird.x<240?35:265,right=bird.x<240?215:445;
    for(let t=0;t<25;t+=.25){
      const motion=animalMotion(t,bird.index,bird.roam,'peck'),x=bird.x+motion.offset;
      assert.ok(x-23*bird.visualScale/2>=left&&x+23*bird.visualScale/2<=right,`moving quail stays between side fences: ${x}`);
      assert.ok(bird.y-21*bird.visualScale-.5>=141&&bird.y<=223,`quail body clears rear and front fence: ${bird.y}`);
    }
  }
});
