import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,newRoom,newFarm,snapshot,animalRelocation} from '../public/game.mjs';
import {coopCapacity,coopRect,parcelCoopUpgrade} from '../public/land.mjs';
import {features,maps,route} from '../public/world-layout.mjs';
import {animalMotion} from '../public/world-motion.mjs';
import {parcelShelter} from '../public/pixel/homestead-buildings.mjs';

const now=1000;
function setup(){
  const room=newRoom(now);room.farms.a=newFarm('a','A',now);room.farms.b=newFarm('b','B',now);
  Object.assign(room.farms.a,{coins:1000,coop:2});
  room.farms.a.land[0]={kind:'coop',fence:'bamboo'};
  return room;
}
const act=(room,action,input={})=>apply(room,'a',{action,...input},now);
test('legacy parcel coops upgrade independently and preserve animals, fences and saved state',()=>{
  const room=setup(),farm=room.farms.a;
  assert.equal(coopCapacity(farm,0),2);
  for(let i=0;i<2;i++)act(room,'animal',{index:0,item:'chicken'});
  const pens=structuredClone(farm.pens),coins=farm.coins;
  act(room,'upgradeParcelCoop',{index:0});
  assert.equal(farm.coins,coins-160);assert.equal(farm.land[0].fence,'bamboo');
  assert.deepEqual(farm.pens,pens);assert.equal(coopCapacity(farm,0),4);
  assert.equal(coopCapacity(farm,undefined),4);
  for(let i=0;i<2;i++)act(room,'animal',{index:0,item:'chicken'});
  assert.throws(()=>act(room,'animal',{index:0,item:'chicken'}),/hết chỗ/);
  const saved=JSON.parse(JSON.stringify(room));
  assert.equal(coopCapacity(saved.farms.a,0),4);
  assert.equal(snapshot(saved,saved.farms.a,now).me.pens.length,4);
  const balance=farm.coins;
  assert.throws(()=>act(room,'upgradeParcelCoop',{index:0}),/tối đa/);
  assert.equal(farm.coins,balance);
});
test('upgrade rejects wrong parcels, invalid indexes, missing main coop level and missing funds',()=>{
  for(const index of [-1,1,8,.5,undefined])assert.throws(()=>act(setup(),'upgradeParcelCoop',{index}));
  const room=setup(),farm=room.farms.a;
  farm.coop=1;assert.match(parcelCoopUpgrade(farm,0).reason,/cấp 2/);
  assert.throws(()=>act(room,'upgradeParcelCoop',{index:0}),/cấp 2/);
  farm.coop=2;farm.coins=159;
  assert.throws(()=>act(room,'upgradeParcelCoop',{index:0}),/đủ xu/);
  assert.equal(coopCapacity(farm,0),2);assert.equal(farm.coins,159);
});
test('relocation uses the upgraded capacity, including parcel index zero',()=>{
  const room=setup(),farm=room.farms.a;
  for(let i=0;i<2;i++)act(room,'animal',{index:0,item:'chicken'});
  act(room,'animal',{item:'cow'});const pen=farm.pens.at(-1);
  assert.match(animalRelocation(farm,pen,0),/hết chỗ/);
  act(room,'upgradeParcelCoop',{index:0});
  assert.equal(animalRelocation(farm,pen,0),'');
  act(room,'moveAnimal',{target:String(pen.id),index:0});
  assert.equal(farm.pens.at(-1).lot,0);
});
test('four mature buffalo fit expanded yards with reachable positions in own and neighbor scenes',()=>{
  const room=setup(),farm=room.farms.a;farm.land[0].coopLevel=2;
  farm.pens=Array.from({length:4},()=>({kind:'buffalo',lot:0,age:100000}));
  const mine=snapshot(room,farm,now),guest=snapshot(room,room.farms.b,now);
  for(const [id,state,neighbor] of [['field',mine,undefined],['visit',guest,guest.neighbors[0]]]){
    const scene=features(id,state,neighbor),actors=scene.actors.filter(a=>a.type==='animal');
    assert.equal(actors.length,4);
    const area=coopRect(0),roof={left:area.x+parcelShelter.x-parcelShelter.w/2,right:area.x+parcelShelter.x+parcelShelter.w/2,bottom:area.y+parcelShelter.y};
    for(const a of actors){
      assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));assert.ok(route(scene,maps[id].spawn,[a.x,a.y]));
      for(let t=0;t<20;t+=.5){
        const x=a.x+animalMotion(t,a.index,a.roam).offset;
        assert.ok(x-23.5>area.x&&x+23.5<area.x+area.w);
        assert.ok(a.y-33>area.y&&a.y<area.y+area.h);
        assert.ok(a.y-33>roof.bottom||x-23.5>roof.right||x+23.5<roof.left);
      }
    }
    for(let t=0;t<20;t+=.5)for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){
      const a=actors[i],b=actors[j];
      const ax=a.x+animalMotion(t,a.index,a.roam).offset,bx=b.x+animalMotion(t,b.index,b.roam).offset;
      assert.ok(Math.abs(ax-bx)>47||Math.abs(a.y-b.y)>33,'mature bodies must not overlap');
    }
  }
});
