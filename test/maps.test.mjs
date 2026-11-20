import assert from 'node:assert/strict';
import test from 'node:test';
import {newFarm} from '../public/game.mjs';
import {houseDoor} from '../public/home-rules.mjs';
import {pixelSlice} from '../public/pixel/frames.mjs';
import {features,maps,neighborHouseTier,route,taskMarkers,walkable} from '../public/world-layout.mjs';

const neighbors=Array.from({length:11},(_,i)=>({id:String(i),name:'Vườn '+i,plots:Array(12).fill(null)}));
const me=newFarm('me','Vườn nhà',0);
me.plots=Array(12).fill(null);
const data={me,neighbors};
test('neighbor houses advance through the five wealth milestones',()=>{
  assert.deepEqual([0,500,501,1000,1001,5000,5001,20000,20001].map(neighborHouseTier),[0,0,1,1,2,2,3,3,4]);
});
test('all map entries and interaction points are reachable',()=>{
  for(const [id,map] of Object.entries(maps)){
    const scene=features(id,data,id==='visit'?neighbors[0]:undefined);
    assert.ok(walkable(scene,...map.spawn),id+' spawn');
    for(const action of scene.hotspots){
      const path=route(scene,map.spawn,[action.x,action.y]);
      assert.ok(path?.length,id+' '+action.label);
      const [x,y]=path.at(-1);
      assert.ok(Math.hypot(x-action.x,y-action.y)<31,id+' '+action.label+' distance');
    }
    for(const exit of map.exits){
      assert.ok(walkable(features(exit.next,data),...exit.arrival),id+' exits '+exit.next);
    }
  }
});
test('waypoints route around water and can reach neighbors on a second page',()=>{
  const field=features('field',data);
  const begin=[13,81];
  const path=route(field,begin,[81,155]);
  assert.ok(path.length>=2);
  let from=begin;
  for(const stop of path){
    const length=Math.max(1,Math.ceil(Math.hypot(stop[0]-from[0],stop[1]-from[1])));
    for(let step=0;step<=length;step++){
      const fraction=step/length;
      assert.ok(walkable(field,from[0]+fraction*(stop[0]-from[0]),from[1]+fraction*(stop[1]-from[1])));
    }
    from=stop;
  }
  const first=features('neighbors',data);
  assert.equal(first.hotspots.find(h=>h.type==='own-house')?.id,me.id);
  const next=features('neighbors',data,undefined,1);
  assert.deepEqual(next.hotspots.filter(h=>h.type==='neighbor').map(h=>h.id),['5','6','7','8','9','10']);
});

test('the farmhouse sprite clears every garden bed and its doorstep connects to the path',()=>{
  for(const id of ['field','visit']){
    const scene=features(id,data,id==='visit'?neighbors[0]:undefined);
    const house=scene.actors.find(a=>a.type==='house');
    assert.equal(house.w/house.h,pixelSlice.house.w/pixelSlice.house.h);
    assert.ok(house.y-house.h>=20);
    for(const bed of scene.ground.filter(a=>a.type==='garden-bed')){
      assert.ok(house.x+house.w/2+4<=bed.x,id+' house needs clearance from the garden');
    }
    assert.ok(maps[id].paths.some(path=>path.some(([x,y])=>x===houseDoor.x&&y===houseDoor.y)));
  }
  const field=features('field',data);
  assert.ok(walkable(field,houseDoor.x,houseDoor.y));
  assert.ok(route(field,maps.field.spawn,[houseDoor.x,houseDoor.y]));
  const homeExit=maps.home.exits[0];
  assert.equal(homeExit.arrival[0],houseDoor.x);
  assert.ok(walkable(field,...homeExit.arrival));
});

test('expanded maps expose reachable pond docks and keep shoreline water impassable',()=>{
  for(const id of ['field','lake','visit']){
    const scene=features(id,data,id==='visit'?neighbors[0]:undefined);
    assert.ok(scene.bounds.width>480);
    for(const dock of scene.hotspots.filter(h=>h.type==='pond'||h.type.endsWith('fishing'))){
      assert.ok(walkable(scene,dock.x,dock.y),dock.label);
      assert.ok(route(scene,maps[id].spawn,[dock.x,dock.y]));
    }
  }
  const lake=features('lake',data);
  assert.equal(walkable(lake,400,150),false);
  assert.equal(walkable(lake,179,67),true);
});

test('farm care markers include pond tasks at the dock, while coop markers stay local',()=>{
  const task={kind:'pond',index:0,type:'ready'};
  const field=features('field',data);
  const marker=taskMarkers('field',field.hotspots,[task]);
  assert.equal(marker.length,1);
  assert.equal(marker[0].point.type,'pond');
  assert.equal(marker[0].point.index,0);
  assert.equal(taskMarkers('coop',features('coop',data).hotspots,[task]).length,0);
  assert.equal(taskMarkers('neighbors',features('neighbors',data).hotspots,[task]).length,0);
});
