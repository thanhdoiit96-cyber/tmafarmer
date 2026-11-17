import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pixelCharacter,pixelSlice} from '../public/pixel/frames.mjs';
import {actionPoseSeconds,animalMotion,facingFromDelta,fishingBobber,playerSpeed,playerStride,spriteFlip,walkFrame} from '../public/world-motion.mjs';
import {features,walkable} from '../public/world-layout.mjs';
import {newFarm,newRoom,snapshot} from '../public/game.mjs';

test('the farmer steps through four walk poses per distance cycle and loops at the end',()=>{
  const {frames}=pixelCharacter.states.walk;
  const duration=playerStride/playerSpeed;
  const walk=Array.from({length:frames},(_,i)=>walkFrame((i+.5)/frames*playerSpeed*duration,playerStride,frames));
  assert.deepEqual(walk,[0,1,2,3]);
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

test('the farmer walk atlas has a full sized sprite for every frame and direction',()=>{
  const {cellWidth,cellHeight,directions,states}=pixelCharacter;
  const png=readFileSync(new URL('../public'+states.walk.source,import.meta.url));
  assert.equal(png.toString('ascii',12,16),'IHDR');
  assert.equal(png.readUInt32BE(16),cellWidth*states.walk.frames);
  assert.equal(png.readUInt32BE(20),cellHeight*Object.keys(directions).length);
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

test('the whole hoe sequence can play and fishing lines end in the connected water',()=>{
  assert.ok(actionPoseSeconds.till>=pixelCharacter.states.work.frames/pixelCharacter.states.work.fps);
  const room=newRoom(0);
  room.farms.a=newFarm('a','Vườn nhà',0);
  room.farms.b=newFarm('b','Hàng xóm',0);
  room.farms.b.land[0]={kind:'pond'};
  const data=snapshot(room,room.farms.a,0);
  for(const area of ['lake','visit']){
    const scene=features(area,data,data.neighbors[0]);
    const docks=scene.hotspots.filter(point=>point.type.endsWith('fishing'));
    assert.equal(docks.length,2);
    for(const dock of docks){
      const bobber=fishingBobber(dock);
      assert.equal(walkable({...scene,blocks:[]},bobber.x,bobber.y),false);
      assert.equal(walkable({...scene,blocks:[],water:[]},bobber.x,bobber.y),true);
    }
  }
});
