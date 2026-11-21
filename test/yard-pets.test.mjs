import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {newFarm,newRoom,snapshot} from '../public/game.mjs';
import {features,walkable} from '../public/world-layout.mjs';
import {yardPets,yardPetPose} from '../public/yard-pets.mjs';

test('yard pet sprites ship as transparent RGBA four-pose atlases',()=>{
  for(const pet of yardPets.filter(p=>p.source)){
    const png=readFileSync(new URL('../public'+pet.source,import.meta.url));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),112);
    assert.equal(png[25],6,'RGBA rather than opaque RGB');
  }
});

test('yard companions follow continuous walkable paths with distinct walking and resting states',()=>{
  const room=newRoom(1000),farm=newFarm('a','A',1000);room.farms.a=farm;farm.workshop=1;
  const scene=features('field',snapshot(room,farm,1000));
  assert.deepEqual(scene.actors.filter(a=>a.type==='yard-pet').map(a=>a.species),['dog','cat','chicken']);
  assert.equal(farm.pens.length,0);
  for(const pet of yardPets){
    const states=new Set();let previous;
    for(let t=0;t<120;t+=.1){
      const pose=yardPetPose(pet.species,t);states.add(pose.motion.state);
      assert.ok(walkable(scene,pose.x,pose.y),pet.species+' stays on accessible yard ground');
      if(previous)assert.ok(Math.hypot(pose.x-previous.x,pose.y-previous.y)<2,pet.species+' never teleports');
      previous=pose;
    }
    assert.ok(states.has('walk')&&states.has('idle'));
    assert.ok(states.has(pet.species==='chicken'?'peck':'sniff'));
    assert.deepEqual(yardPetPose(pet.species,0,true),yardPetPose(pet.species,100,true));
  }
  const resting=yardPets.map(p=>({...p,...yardPetPose(p.species,0,true)}));
  for(const a of resting)for(const b of resting)if(a!==b){
    assert.ok(Math.abs(a.x-b.x)>(a.w+b.w)/2||Math.abs(a.y-b.y)>Math.max(a.h,b.h),'resting companions remain separate');
  }
});

test('homestead front fence edges participate in sprite depth sorting',()=>{
  const room=newRoom(1000),farm=newFarm('a','A',1000);room.farms.a=farm;
  farm.plots=Array(30).fill(null);farm.decor={[-1]:'wood'};
  farm.land[0]={kind:'garden',fence:'white'};
  const scene=features('field',snapshot(room,farm,1000));
  const fences=scene.ground.filter(a=>a.type==='fence');
  const fronts=scene.actors.filter(a=>a.type==='fence-front');
  assert.equal(fronts.length,fences.length);
  for(const front of fronts){
    assert.equal(front.y,front.area.y+front.area.h);
    for(const plot of scene.actors.filter(a=>a.type==='plot'&&a.x>=front.area.x&&a.x<=front.area.x+front.area.w&&a.y>=front.area.y&&a.y<=front.y)){
      assert.ok(plot.y<front.y,'the front rail is drawn after the bed');
    }
  }
});
