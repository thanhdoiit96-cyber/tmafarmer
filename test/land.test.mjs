import assert from 'node:assert/strict';
import test from 'node:test';
import {apply, aquatic, fishing, newFarm, newRoom, snapshot} from '../public/game.mjs';
import {getLand,lotPrice} from '../public/land.mjs';
import {features, lotRect, maps, route, walkable} from '../public/world-layout.mjs';

const now=1000;
const setup=()=>{
  const room=newRoom(now);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,now);
  return room;
};
const act=(world,id,action,index,item,elapsed=0)=>apply(world,id,{action,index,item},now+elapsed);
test('equal starter land, ownership checks and existing farm fallback',()=>{
  const room=setup(),a=room.farms.a,b=room.farms.b;
  delete b.land;
  assert.deepEqual(a.land,getLand(b));
  assert.equal(a.land.filter(Boolean).length,2);
  assert.throws(()=>act(room,'a','buildLand',2,'garden'),/đất trống đã mua/);
  act(room,'a','buyLand',2);
  assert.equal(a.coins,100-lotPrice(2));
  assert.throws(()=>act(room,'a','buyLand',2),/đã sở hữu/);
  assert.equal(a.land[2].kind,'empty');
  assert.equal(getLand(b)[2],null);
  assert.throws(()=>act(room,'b','decorate',0,'wood'),/đã xây/);
});

test('additional gardens, ponds and livestock work with existing game actions',()=>{
  const room=setup(),a=room.farms.a;
  a.coins=900;
  act(room,'a','buildLand',0,'garden');
  act(room,'a','buildLand',1,'fish');
  act(room,'a','buyLand',2);
  act(room,'a','buildLand',2,'coop');
  act(room,'a','decorate',0,'white');
  act(room,'a','decorate',1,'bamboo');
  act(room,'a','decorate',2,'wood');
  assert.throws(()=>act(room,'a','buildLand',0,'fish'),/đất trống/);
  act(room,'a','plant',12,'wheat');
  act(room,'a','water',12,'');
  act(room,'a','harvest',12,'',500);
  assert.equal(a.inventory.wheat,3);
  act(room,'a','aquaStock',3,'tilapia',500);
  act(room,'a','aquaFeed',3,'',500);
  const elapsed=500+aquatic.tilapia.time+1;
  const guest=snapshot(room,room.farms.b,now+elapsed);
  assert.equal(guest.neighbors[0].pondBatches[3][0].available,true);
  apply(room,'b',{action:'cast',index:3,source:'pond',target:'a'},now+elapsed);
  act(room,'b','reel',undefined,'',elapsed+fishing.wait);
  act(room,'a','aquaHarvest',3,'',elapsed+fishing.wait);
  assert.equal(a.inventory.tilapia,4);
  act(room,'a','animal',2,'chicken');
  act(room,'a','animal',2,'chicken');
  act(room,'a','feed',0);
  assert.equal(a.pens[0].lot,2);
  assert.throws(()=>act(room,'a','animal',2,'chicken'),/hết chỗ/);
  act(room,'a','decorate',0,'none');
  assert.equal(a.land[0].fence,undefined);
});

test('owners and visitors use the same parcel geometry and rectangular ponds stay impassable',()=>{
  const room=setup(),a=room.farms.a;
  a.coins=400;
  act(room,'a','buildLand',0,'fish');
  act(room,'a','decorate',0,'white');
  act(room,'a','buildLand',1,'coop');
  act(room,'a','animal',1,'chicken');
  const own=snapshot(room,a,now), guest=snapshot(room,room.farms.b,now);
  const yours=features('field',own), visited=features('visit',guest,guest.neighbors[0]);
  assert.deepEqual(yours.water,visited.water);
  const {x,y}=lotRect(0);
  assert.equal(walkable(yours,x+20,y+20),false);
  assert.deepEqual(yours.ground,visited.ground);
  assert.equal(yours.actors.filter(p=>p.type==='animal').length,1);
  assert.equal(visited.actors.filter(p=>p.type==='animal').length,1);
  for(const point of yours.hotspots.filter(point=>['land','pond'].includes(point.type))){
    const path=route(yours,maps.field.spawn,[point.x,point.y]);
    assert.ok(path,point.label);
    assert.ok(Math.hypot(path.at(-1)[0]-point.x,path.at(-1)[1]-point.y)<31,point.label);
  }
});
