import assert from 'node:assert/strict';
import test from 'node:test';
import {newFarm,newRoom,snapshot} from '../public/game.mjs';
import {coopGate,coopYards} from '../public/coop-layout.mjs';
import {features,maps,route,walkable} from '../public/world-layout.mjs';
import {animalMotion} from '../public/world-motion.mjs';
import {backgroundOwnsActor} from '../public/pixel/scene-backgrounds.mjs';

function setup(kind='buffalo'){
  const room=newRoom(1000),farm=room.farms.a=newFarm('a','A',1000);
  farm.coop=8;
  farm.pens=Array.from({length:16},(_,id)=>({id,kind,age:100000,at:1000,progress:0,fedUntil:10000}));
  return {room,farm};
}

test('every coop entry uses the front gate and its path reaches all sixteen animals',()=>{
  const {room,farm}=setup(),before=JSON.stringify(farm),scene=features('coop',snapshot(room,farm,1000));
  assert.deepEqual(maps.coop.spawn,[240,268]);
  assert.equal(maps.coop.facing,'up');
  for(const map of Object.values(maps))for(const exit of map.exits){
    if(exit.next==='coop')assert.deepEqual(exit.arrival,coopGate);
  }
  assert.ok(walkable(scene,...coopGate));
  assert.equal(walkable(scene,240,80),false,'the painted barn is not walkable');
  assert.equal(walkable(scene,110,240),false,'the front fence cannot be crossed outside its gate');
  assert.equal(walkable(scene,240,240),true,'the central gate stays open');
  const animals=scene.hotspots.filter(point=>point.type==='animal');
  assert.equal(animals.length,16);
  assert.deepEqual(animals.map(point=>point.index),Array.from({length:16},(_,i)=>i));
  for(const point of animals){
    const path=route(scene,coopGate,[point.x,point.y]);
    assert.ok(path?.length);
    assert.ok(Math.hypot(path.at(-1)[0]-point.x,path.at(-1)[1]-point.y)<16);
    for(const [x,y] of path)assert.ok(walkable(scene,x,y));
  }
  assert.equal(JSON.stringify(farm),before,'layout does not rewrite saved animals');
});

test('sixteen mature buffalo and quail stay inside their yards and do not overlap while walking',()=>{
  for(const [kind,width,height] of [['buffalo',47,33],['quail',23,21]]){
    const {room,farm}=setup(kind),scene=features('coop',snapshot(room,farm,1000));
    const animals=scene.actors.filter(point=>point.type==='animal');
    assert.equal(animals.filter(a=>a.x<240).length,8);
    assert.equal(animals.filter(a=>a.x>240).length,8);
    for(let t=0;t<40;t+=.125){
      const boxes=animals.map(a=>{
        const motion=animalMotion(t,a.index,a.roam,'graze');
        const x=Math.round((a.x+motion.offset)/.75)*.75,w=width*a.visualScale,h=height*a.visualScale;
        const yard=coopYards[a.x<240?0:1];
        assert.ok(x-w/2>=yard.x&&x+w/2<=yard.x+yard.w,kind+' clears the side fence and central path');
        assert.ok(a.y-h-.75>=yard.y&&a.y+.75<=yard.y+yard.h,kind+' clears both fence lines');
        return {x:x-w/2,y:a.y-h,w,h};
      });
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i],b=boxes[j];
        assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,kind+' bodies stay separate');
      }
    }
  }
});

test('the painted coop owns its buildings and fence without old foundations or extra rails',()=>{
  const {room,farm}=setup();farm.decor={[-4]:'white'};
  const scene=features('coop',snapshot(room,farm,1000));
  assert.ok(!scene.ground.some(point=>point.type==='fence'));
  for(const type of ['coop','silo','foundation'])assert.ok(backgroundOwnsActor('coop',type));
  assert.equal(farm.decor[-4],'white','legacy paid metadata is retained');
  assert.equal(backgroundOwnsActor('coop','animal'),false);
  farm.coop=0;farm.pens=[];
  const empty=features('coop',snapshot(room,farm,1000));
  const door=empty.hotspots.find(point=>point.type==='coop');
  assert.ok(route(empty,coopGate,[door.x,door.y]));
});
