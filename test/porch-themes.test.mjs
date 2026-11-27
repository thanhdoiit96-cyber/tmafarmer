import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,newRoom,newFarm,snapshot} from '../public/game.mjs';
import {features,walkable,route,clearDecorPosition,maps,interactionRange} from '../public/world-layout.mjs';
import {gardenDecorBlocks,gardenDecorSpots,gardenDecorItems,gardenDecorRecommendedSpots} from '../public/land.mjs';
import {decorPreviewFarm} from '../public/decor-preview.mjs';

const setup=()=>{const r=newRoom(1000),f=r.farms.a=newFarm('a','Chủ vườn Nguyễn Thị Minh Anh',1000);r.farms.b=newFarm('b','Hàng xóm',1000);f.coins=1000;return {r,f}};
test('regional style is free, persists, is public to neighbors and cannot grant props or wealth',()=>{
  const {r,f}=setup();const before=snapshot(r,f,1000).wealth;
  for(const item of ['north','central','south','classic']){
    apply(r,'a',{action:'porchTheme',item},1000);
    assert.equal(f.porchTheme,item);assert.equal(f.coins,1000);assert.deepEqual(f.gardenDecor??{},{});
    assert.equal(snapshot(r,r.farms.b,1000).neighbors.find(n=>n.id==='a').porchTheme,item);
    assert.deepEqual(snapshot(r,f,1000).wealth,before);
  }
  assert.throws(()=>apply(r,'a',{action:'porchTheme',item:'constructor'},1000));
});
test('style trial does not persist; confirmed placement applies style and charges exactly once',()=>{
  const {r,f}=setup();f.decorVouchers=1;
  assert.equal(decorPreviewFarm(f,'lotusPot','house','central').porchTheme,'central');assert.equal(f.porchTheme,undefined);
  apply(r,'a',{action:'placeGardenDecor',item:'lotusPot',target:'house',source:'voucher',porchTheme:'central'},1000);
  assert.equal(f.porchTheme,'central');assert.equal(f.decorVouchers,0);assert.equal(f.coins,1000);
  assert.throws(()=>apply(r,'a',{action:'placeGardenDecor',item:'giftTable',target:'house',source:'coins',porchTheme:'south'},1000));
  assert.equal(f.porchTheme,'central');assert.equal(f.coins,1000);
});
test('decor bases obstruct movement equally across styles, arches retain a passage and nearby player can escape',()=>{
  const {r,f}=setup();f.gardenDecor={lotusPot:'house',giftTable:'wellside',bambooLamp:'gate',flowerArch:'southPath'};
  const data=snapshot(r,f,1000);let blocks;
  for(const theme of ['classic','north','central','south']){
    const scene=features('field',{...data,me:{...data.me,porchTheme:theme}});
    if(blocks)assert.deepEqual(scene.blocks,blocks);blocks=scene.blocks;
    for(const [kind,key]of Object.entries(f.gardenDecor)){
      const spot=gardenDecorSpots[key];
      for(const b of gardenDecorBlocks(kind,spot.x,spot.y))assert.equal(walkable(scene,b.x+b.w/2,b.y+b.h/2),false);
    }
    assert.ok(walkable(scene,205,870),'central entrance remains open');
    assert.ok(route(scene,[205,850],[205,890]),'arch remains traversable');
    const safe=clearDecorPosition(scene,[95,184]);
    assert.ok(walkable(scene,...safe));assert.ok(Math.hypot(safe[0]-95,safe[1]-184)<=40);
  }
});
test('automatic arrangement keeps the new table separate from the old props',()=>{
  const {r,f}=setup();f.gardenDecor=Object.fromEntries(Object.keys(gardenDecorItems).slice(1).map((key,i)=>[key,Object.keys(gardenDecorSpots)[i]]));
  apply(r,'a',{action:'arrangeGardenDecor'},1000);
  assert.equal(new Set(Object.values(f.gardenDecor)).size,Object.keys(f.gardenDecor).length);
  assert.ok(Object.values(f.gardenDecor).every(key=>Object.hasOwn(gardenDecorSpots,key)));
});
test('a fully decorated garden keeps doors, plots and ponds reachable for owners and visitors',()=>{
  const {r,f}=setup();f.workshop=3;f.field=5;
  f.plots=Array.from({length:30},()=>null);
  f.gardenDecor={...gardenDecorRecommendedSpots};
  const own=snapshot(r,f,1000),guest=snapshot(r,r.farms.b,1000);
  for(const [id,data,neighbor]of [['field',own,undefined],['visit',guest,guest.neighbors.find(n=>n.id==='a')]]){
    const scene=features(id,data,neighbor);
    for(const point of scene.hotspots){
      const path=route(scene,maps[id].spawn,[point.x,point.y]);
      assert.ok(path,id+' '+point.type+' has a route');
      const end=path.at(-1);
      assert.ok(Math.hypot(end[0]-point.x,end[1]-point.y)<=interactionRange,id+' '+point.type+' remains in reach');
    }
  }
});
test('neighbor seasonal accents block their feet while preserving name-gate approaches for both pages',()=>{
  const {r,f}=setup();
  for(let i=0;i<12;i++){
    const home=i===0?f:i===1?r.farms.b:r.farms['n'+i]=newFarm('n'+i,'Tên chủ nhà rất dài '+i,1000);
    home.porchTheme=['north','central','south'][i%3];home.gardenDecor={lotusPot:'house'};
  }
  const data=snapshot(r,f,1000);
  for(const page of [0,1]){
    const scene=features('neighbors',data,undefined,page);
    const homes=scene.actors.filter(a=>a.type==='neighbor');assert.equal(homes.length,6);
    for(const home of homes){
      assert.equal(walkable(scene,home.x-78,home.y-35),false);
      const target=scene.hotspots.find(p=>p.id===home.id),path=route(scene,maps.neighbors.spawn,[target.x,target.y]);
      assert.ok(path);assert.ok(Math.hypot(path.at(-1)[0]-target.x,path.at(-1)[1]-target.y)<=interactionRange);
    }
  }
});
