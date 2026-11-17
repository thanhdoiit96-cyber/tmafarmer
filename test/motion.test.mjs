import test from 'node:test';
import assert from 'node:assert/strict';
import {pixelCharacter,pixelSlice} from '../public/pixel/frames.mjs';
import {animalMotion,facingFromDelta,playerSpeed,playerStride,spriteFlip,walkFrame} from '../public/world-motion.mjs';

test('the farmer holds each walk frame for one sixth of the traveled stride',()=>{
  const {frames}=pixelCharacter.states.walk;
  const duration=playerStride/playerSpeed;
  assert.equal(duration,1);
  const walk=Array.from({length:frames},(_,i)=>walkFrame((i+.5)/frames*playerSpeed*duration,playerStride,frames));
  assert.deepEqual(walk,[0,1,2,3,4,5]);
  assert.equal(walkFrame(playerStride,playerStride,frames),0);
  assert.equal(facingFromDelta(0,2),'down');
  assert.equal(facingFromDelta(-2,0),'left');
});

test('the chicken faces its direction of travel in both walking legs and while pecking',()=>{
  const {states}=pixelSlice.chicken;
  for(const [mid,pause] of [[2,4.6],[8.1,10.7]]){
    const walk=animalMotion(mid,0,15,'peck');
    const next=animalMotion(mid+.05,0,15,'peck');
    assert.equal(walk.facing,Math.sign(next.offset-walk.offset));
    assert.equal(spriteFlip(walk.facing,states.walk.sourceFacing),walk.facing===1);
    const peck=animalMotion(pause,0,15,'peck');
    assert.equal(peck.state,'peck');
    assert.equal(peck.facing,walk.facing);
    assert.equal(peck.offset,animalMotion(pause+.1,0,15,'peck').offset);
    assert.equal(spriteFlip(peck.facing,states.peck.sourceFacing),walk.facing===-1);
  }
});

test('animals pause inside their pen and honor reduced motion',()=>{
  const at=(time)=>animalMotion(time,2,11,'graze');
  assert.deepEqual(at(0),{offset:0,facing:1,state:'idle',elapsed:0,distance:0});
  for(let time=.01;time<25;time+=.10){
    const motion=at(time);
    assert.ok(Math.abs(motion.offset)<=11);
    if(motion.state==='graze')assert.equal(at(time+.01).offset,motion.offset);
  }
});
