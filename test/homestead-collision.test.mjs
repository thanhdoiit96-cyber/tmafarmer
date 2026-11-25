import test from 'node:test';
import assert from 'node:assert/strict';
import {newRoom,newFarm,snapshot} from '../public/game.mjs';
import {features,maps,walkable,route} from '../public/world-layout.mjs';
test('painted house, barn and workshop block feet while doors, exits and plots remain reachable',()=>{
  const room=newRoom(1000),farm=newFarm('a','A',1000);farm.workshop=1;room.farms.a=farm;
  const state=snapshot(room,farm,1000);
  for(const id of ['field','visit']){
    const scene=features(id,state,state.me);
    for(const point of [[133,90],[80,145],[180,140],[442,110],[480,170],[115,320],[145,370]])assert.equal(walkable(scene,...point),false,id+' blocks '+point);
    for(const point of [[133,177],[442,198],[115,404],maps[id].spawn])assert.ok(walkable(scene,...point),id+' allows '+point);
    for(const spot of scene.hotspots.filter(p=>['plot','house','barn','workshop','exit','pond'].includes(p.type))){
      const path=route(scene,maps[id].spawn,[spot.x,spot.y]);assert.ok(path?.length,id+' route '+spot.type);
      assert.ok(Math.hypot(path.at(-1)[0]-spot.x,path.at(-1)[1]-spot.y)<31);
      let from=maps[id].spawn;
      for(const to of path){const steps=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1]));for(let i=1;i<=steps;i++)assert.ok(walkable(scene,from[0]+(to[0]-from[0])*i/steps,from[1]+(to[1]-from[1])*i/steps));from=to;}
    }
  }
});
