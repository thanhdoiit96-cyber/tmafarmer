import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {farmerActionAtlas,maleCharacter,pixelCharacter,pixelSlice} from '../public/pixel/frames.mjs';
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

test('world rendering keeps the walk-frame dependency and draws each animal from its selected atlas',()=>{
  const source=readFileSync(new URL('../public/world-art.mjs',import.meta.url),'utf8');
  assert.match(source,/spriteFlip,walkFrame\} from '\.\/world-motion\.mjs'/);
  assert.match(source,/c\.drawImage\(art,px,py,pw,ph/);
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

test('the male avatar atlases align with the walk and tool frames',()=>{
  const {cellWidth,cellHeight,directions,states}=pixelCharacter;
  for(const source of [maleCharacter.poses,maleCharacter.walk]){
    const png=readFileSync(new URL('../public'+source,import.meta.url));
    assert.equal(png.readUInt32BE(16),cellWidth*4);
    assert.equal(png.readUInt32BE(20),cellHeight*Object.keys(directions).length);
  }
  assert.equal(maleCharacter.workFrames.length,states.work.frames);
  assert.ok(maleCharacter.workFrames.every(frame=>frame>=1&&frame<=3));
});

test('farmer action atlases contain six full-body actions in four transparent directions',()=>{
  const actions=['water','fertilize','spray','plant','harvest','feed'];
  assert.deepEqual(Object.keys(farmerActionAtlas).filter(key=>actions.includes(key)),actions);
  assert.equal(actionPoseSeconds.spray,.8);
  assert.equal(actionPoseSeconds.plant,.85);
  actions.forEach((action,index)=>{
    assert.equal(farmerActionAtlas[action].first,index*4);
    assert.equal(farmerActionAtlas[action].frames,4);
  });
  for(const avatar of ['female','male']){
    const png=readFileSync(new URL('../public'+farmerActionAtlas[avatar],import.meta.url));
    assert.equal(png.toString('ascii',12,16),'IHDR');
    assert.equal(png.readUInt32BE(16),farmerActionAtlas.cellWidth*4*actions.length);
    assert.equal(png.readUInt32BE(20),farmerActionAtlas.cellHeight*Object.keys(farmerActionAtlas.directions).length);
    assert.equal(png[25],6,'action sprites keep real RGBA alpha');
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
