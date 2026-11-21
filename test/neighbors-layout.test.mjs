import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRoom,newFarm,snapshot} from '../public/game.mjs';
import {features,maps,route,walkable} from '../public/world-layout.mjs';
import {neighborPage,neighborHouseTier,fitGateName} from '../public/neighbors-layout.mjs';

function village(count=12){
  const room=newRoom(1000);
  for(let i=0;i<count;i++)room.farms['f'+i]=newFarm('f'+i,'Nguyễn Thanh Hương vườn '+i,1000);
  room.farms.f0.xp=3200;
  return snapshot(room,room.farms.f0,1000);
}
test('twelve residents appear once across two six-home areas, including the player',()=>{
  const state=village(),ids=[];
  for(let page=0;page<2;page++){
    const section=neighborPage(state,page);
    assert.equal(section.count,2);assert.equal(section.homes.length,6);
    ids.push(...section.homes.map(home=>home.id));
    for(const built of [[],[{id:'hall'}]]){
      const scene=features('neighbors',{...state,village:{built}},undefined,page);
      assert.equal(scene.actors.filter(a=>a.type==='neighbor').length,6);
      assert.equal(scene.actors.some(a=>a.type==='village-hall'),built.length>0);
      for(const point of scene.hotspots){
        assert.ok(walkable(scene,point.x,point.y),point.label);
        assert.ok(route(scene,maps.neighbors.spawn,[point.x,point.y])?.length,point.label);
      }
      for(const home of scene.actors.filter(a=>a.type==='neighbor')){
        assert.equal(walkable(scene,home.x,home.y-50),false);
        assert.equal(walkable(scene,home.x,home.y+16),true);
      }
    }
  }
  assert.equal(new Set(ids).size,12);
  assert.equal(neighborPage(state,0).homes.filter(h=>h.mine).length,1);
  assert.equal(neighborPage(state,1).homes.some(h=>h.mine),false);
  assert.equal(neighborPage(state,99).index,1);
  assert.equal(neighborPage(state,-1).index,0);
  assert.equal(neighborPage(village(1),1).index,0);
});
test('architecture uses total wealth independently of farm level and exact thresholds stay unchanged',()=>{
  assert.deepEqual([0,500,501,1000,1001,5000,5001,20000,20001].map(neighborHouseTier),[0,0,1,1,2,2,3,3,4]);
  const state=village(2);
  assert.equal(state.neighbors[0].level,1);
  state.wealth.find(e=>e.id===state.me.id).total=21000;
  const own=features('neighbors',state).actors.find(a=>a.id===state.me.id);
  assert.equal(own.tier,4);
  const frame=readFileSync(new URL('../public/pixel/neighbor-homes-v1.png',import.meta.url));
  assert.equal(frame.readUInt32BE(16),2100);assert.equal(frame.readUInt32BE(20),216);
  assert.equal(frame[25],6,'RGBA atlas with alpha');
});
test('gate names fit without breaking Vietnamese diacritics or emoji clusters',()=>{
  const measure=value=>[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(value)].length;
  assert.equal(fitGateName('Bác Sáu',measure,10),'Bác Sáu');
  const full='Nguyễn Thị Hương 👩‍🌾 vườn bên sông';
  const short=fitGateName(full,measure,18);
  assert.ok(measure(short)<=18);assert.ok(short.endsWith('…'));
  assert.equal(fitGateName('Nguyễn',measure,20),'Nguyễn');
});
