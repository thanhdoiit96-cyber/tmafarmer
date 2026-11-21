import assert from 'node:assert/strict';
import test from 'node:test';
import {apply, aquatic, fishing, newFarm, newRoom, snapshot} from '../public/game.mjs';
import {optionalIndex} from '../public/action-input.mjs';
import {getLand,lotPrice,mainPlotId,plotPosition,pondCapacity} from '../public/land.mjs';
import {features, lotRect, maps, route, walkable} from '../public/world-layout.mjs';

const now=1000;
const setup=()=>{
  const room=newRoom(now);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,now);
  return room;
};
const act=(world,id,action,index,item,elapsed=0)=>apply(world,id,{action,index,item},now+elapsed);
test('homestead parcels clear the stone lane and every maximum-level bed stays outside parcels',()=>{
  const room=setup(), farm=room.farms.a;
  farm.plots=Array(30).fill(null);
  farm.land=Array.from({length:8},(_,i)=>({kind:i%2?'pond':'coop'}));
  const areas=Array.from({length:8},(_,i)=>lotRect(i));
  assert.equal(new Set(areas.map(a=>a.x)).size,2);
  assert.equal(new Set(areas.map(a=>a.y)).size,4);
  for(const area of areas){
    assert.ok(area.x>=250&&area.x+area.w<=710);
    assert.ok(area.y>=365&&area.y+area.h<=590);
    for(let slot=0;slot<30;slot++){
      const p=plotPosition(mainPlotId(slot));
      assert.ok(p.y+13<area.y||p.y-13>area.y+area.h||p.x+20<area.x||p.x-20>area.x+area.w);
    }
  }
  assert.equal(pondCapacity(farm,0),6);
  assert.equal(pondCapacity(farm,3),2);
  const scene=features('field',snapshot(room,farm,now));
  for(const spot of scene.hotspots.filter(p=>['land','pond','plot'].includes(p.type))){
    assert.ok(route(scene,maps.field.spawn,[spot.x,spot.y]),spot.label);
  }
});
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
test('higher main field levels preserve garden plot IDs and add reachable beds for owners and visitors',()=>{
  const room=setup(),a=room.farms.a,b=room.farms.b;
  Object.assign(a,{coins:5000,xp:1850,field:3,plots:Array(12).fill(null)});
  Object.assign(a.inventory,{starchGlue:2,insulationMat:2});
  act(room,'a','buildLand',0,'garden');
  act(room,'a','plant',12,'wheat');
  for(let level=4;level<=6;level++)act(room,'a','upgrade',undefined,'field');
  const upper=mainPlotId(12), last=mainPlotId(20);
  act(room,'a','plant',upper,'carrot');
  const own=snapshot(room,a,now), guest=snapshot(room,b,now);
  const view=guest.neighbors[0];
  assert.equal(own.me.plots.length,21);
  assert.equal(new Set(own.me.plotIndexes).size,24);
  assert.equal(own.me.extraPlots[12].kind,'wheat');
  assert.equal(own.me.plots[12].kind,'carrot');
  assert.equal(view.extraPlots[12].kind,'wheat');
  assert.equal(view.plots[12].kind,'carrot');
  assert.equal(own.me.soilCompactsAt[last],now+8*60*60);
  for(const [id,state,neighbor] of [['field',own,undefined],['visit',guest,view]]){
    const scene=features(id,state,neighbor);
    for(const plot of scene.hotspots.filter(row=>row.type==='plot')){
      const path=route(scene,maps[id].spawn,[plot.x,plot.y]);
      assert.ok(path?.length,plot.label);
      assert.ok(Math.hypot(path.at(-1)[0]-plot.x,path.at(-1)[1]-plot.y)<31,plot.label);
    }
  }
});
test('upgraded main coop seats sixteen reachable animals inside the pen without changing parcel capacity',()=>{
  const room=setup(),a=room.farms.a;
  Object.assign(a,{coins:50000,xp:20000,coop:3});
  Object.assign(a.inventory,{woolCloth:10,insulationMat:20,starchGlue:10});
  for(let level=4;level<=8;level++)act(room,'a','upgrade',undefined,'coop');
  for(let i=0;i<16;i++)act(room,'a','animal',undefined,'chicken');
  assert.throws(()=>act(room,'a','animal',undefined,'chicken'),/hết chỗ/);
  const scene=features('coop',snapshot(room,a,now));
  const seats=scene.hotspots.filter(spot=>spot.type==='animal');
  assert.equal(new Set(seats.map(spot=>spot.x+','+spot.y)).size,16);
  for(const spot of seats){
    assert.ok(spot.x>=82&&spot.x<=340&&spot.y>=106&&spot.y<=190,`animal seat must stay inside pen: ${spot.x},${spot.y}`);
    assert.ok(route(scene,maps.coop.spawn,[spot.x,spot.y]));
  }
  act(room,'a','buildLand',0,'coop');
  for(let i=0;i<2;i++)act(room,'a','animal',0,'chicken');
  assert.throws(()=>act(room,'a','animal',0,'chicken'),/hết chỗ/);
});
