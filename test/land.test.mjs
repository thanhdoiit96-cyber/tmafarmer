import assert from 'node:assert/strict';
import test from 'node:test';
import {apply, aquatic, fishing, crops, newFarm, newRoom, snapshot} from '../public/game.mjs';
import {optionalIndex} from '../public/action-input.mjs';
import {getLand,lotPrice,mainPlotId,plotPosition,pondCapacity,coopRect,gardenDecorSpots,mainPond,gardenDecorItems,gardenDecorRecommendedSpots} from '../public/land.mjs';
import {features, lotRect, maps, route, walkable} from '../public/world-layout.mjs';
import {homesteadWorkshop,parcelShelter} from '../public/pixel/homestead-buildings.mjs';
import {animalMotion} from '../public/world-motion.mjs';
import {cropPlacement} from '../public/pixel/crop-layout.mjs';
import {gardenDecorAtlas} from '../public/pixel/frames.mjs';

const now=1000;
const setup=()=>{
  const room=newRoom(now);
  for(const id of ['a','b'])room.farms[id]=newFarm(id,id,now);
  return room;
};
const act=(world,id,action,index,item,elapsed=0)=>apply(world,id,{action,index,item},now+elapsed);
test('all growth stages from bed thirteen clear the painted horizontal stone path',()=>{
  for(let slot=12;slot<30;slot++){
    const p=plotPosition(mainPlotId(slot));
    assert.ok(p.y-13>=274,'soil clears the road');
    for(const kind of Object.keys(crops))for(let stage=0;stage<4;stage++){
      const crop=cropPlacement({...p,data:{kind,stage},visit:true});
      assert.ok(crop.y>=274,`${kind} stage ${stage}, bed ${slot+1} clears the road`);
    }
  }
});
test('recommended decor clusters clear crops and pens while framing the entrance',()=>{
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const reserved=[mainPond,...Array.from({length:8},(_,i)=>coopRect(i)),
    ...Array.from({length:30},(_,slot)=>{const p=plotPosition(mainPlotId(slot));return {x:p.x-20,y:p.y-13,w:40,h:26};})];
  const decorations=Object.entries(gardenDecorRecommendedSpots).map(([kind,key])=>{
    const p=gardenDecorSpots[key],width=gardenDecorItems[kind].width,scale=width/56;
    const [left,top,right,bottom]=gardenDecorAtlas.bounds[kind];
    return {kind,x:p.x-width/2+left*scale,y:p.y+(top-45)*scale,w:(right-left)*scale,h:(bottom-top)*scale};
  });
  for(const decor of decorations){
    assert.ok(reserved.every(r=>!overlaps(decor,r)),decor.kind+' clears production areas');
    assert.ok(decorations.every(other=>decor===other||!overlaps(decor,other)),decor.kind+' clears other decorations');
    if(decor.kind==='flowerArch')assert.equal(gardenDecorSpots.southPath.x,205,'arch frames the stone entrance');
    else if(decor.y>=238)assert.ok(decor.x+decor.w<190||decor.x>221,decor.kind+' clears stone lane');
  }
});
test('larger parcel shelters leave room for two moving buffalo and the workshop door stays reachable',()=>{
  const room=setup(),farm=room.farms.a;
  farm.workshop=3;
  farm.land=Array.from({length:8},()=>({kind:'coop'}));
  farm.pens=farm.land.flatMap((_,lot)=>Array.from({length:2},()=>({kind:'buffalo',lot,age:10000})));
  const own=snapshot(room,farm,now),guest=snapshot(room,room.farms.b,now);
  for(const [id,state,neighbor] of [['field',own,undefined],['visit',guest,guest.neighbors[0]]]){
    const scene=features(id,state,neighbor);
    for(const animal of scene.actors.filter(a=>a.type==='animal')){
      const area=coopRect(animal.data.lot);
      const shelterRight=area.x+parcelShelter.x+parcelShelter.w/2;
      for(let t=0;t<25;t+=.25){
        const motion=animalMotion(t,animal.index,animal.roam,'graze');
        assert.ok(animal.x+motion.offset-47/2>shelterRight);
        assert.ok(animal.x+motion.offset+47/2<area.x+area.w);
        assert.ok(animal.y-33>area.y&&animal.y<area.y+area.h);
      }
      assert.ok(route(scene,maps[id].spawn,[animal.x,animal.y]));
    }
    const workshop=scene.actors.find(a=>a.type==='workshop');
    assert.equal(workshop.w,110);
    assert.ok(workshop.x-workshop.w/2>40&&workshop.x+workshop.w/2<190);
    assert.equal(walkable(scene,workshop.x,workshop.y-20),false);
    const arrival=maps.workshop.exits[0].arrival;
    assert.deepEqual(arrival,[homesteadWorkshop.x,homesteadWorkshop.y+18]);
    assert.ok(walkable(scene,...arrival));
  }
  const scene=features('field',own);
  const door=scene.hotspots.find(a=>a.type==='workshop');
  const path=route(scene,maps.field.spawn,[door.x,door.y]);
  assert.ok(path?.length);
  assert.ok(Math.hypot(path.at(-1)[0]-door.x,path.at(-1)[1]-door.y)<31);
});
test('homestead parcels clear the stone lane and every maximum-level bed stays outside parcels',()=>{
  const room=setup(), farm=room.farms.a;
  farm.plots=Array(30).fill(null);
  farm.land=Array.from({length:8},(_,i)=>({kind:i%2?'pond':'coop'}));
  const areas=Array.from({length:8},(_,i)=>lotRect(i));
  assert.equal(new Set(areas.map(a=>a.x)).size,2);
  assert.equal(new Set(areas.map(a=>a.y)).size,4);
  for(const area of areas){
    assert.ok(area.x>=250&&area.x+area.w<=710);
    assert.ok(area.y>=375&&area.y+area.h<=596);
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
test('ponds never render decorative fences and expanded yards preserve the central lane',()=>{
  const room=setup(),farm=room.farms.a;
  farm.decor={[-2]:'white'};
  farm.land=[{kind:'pond',fence:'bamboo'},{kind:'pond',fence:'white'},...Array.from({length:6},()=>({kind:'coop',fence:'wood'}))];
  const state=snapshot(room,farm,now),scene=features('field',state);
  const fences=scene.ground.filter(a=>a.type==='fence');
  assert.equal(fences.length,6);
  for(const fence of fences)assert.ok(fence.y>=coopRect(2).y);
  assert.ok(!scene.actors.some(a=>a.type==='wildlife'));
  for(let row=0;row<4;row++){
    const left=coopRect(row*2),right=coopRect(row*2+1);
    assert.equal(right.x-(left.x+left.w),56);
    assert.ok(left.x>=230&&right.x+right.w<=726);
  }
  // Old paid decoration metadata is retained rather than rewriting saved farms.
  assert.equal(farm.decor[-2],'white');
  assert.equal(farm.land[0].fence,'bamboo');
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
