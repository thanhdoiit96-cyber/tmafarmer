import assert from 'node:assert/strict';
import test from 'node:test';
import {decorPreviewFarm} from '../public/decor-preview.mjs';
import {apply,newFarm,newRoom,snapshot} from '../public/game.mjs';
import {features} from '../public/world-layout.mjs';

test('preview and confirmed placement use identical actors without changing saved resources or collision',()=>{
  const room=newRoom(1000),farm=room.farms.a=newFarm('a','Vườn thử',1000);
  farm.coins=1000;farm.decorVouchers=2;farm.gardenDecor={flowerPot:'house'};
  const before=structuredClone(farm),data=snapshot(room,farm,1000);
  const trial=decorPreviewFarm(data.me,'flowerPot','wellside');
  const preview=features('field',{...data,me:trial}),current=features('field',data);
  assert.deepEqual(farm,before);
  assert.deepEqual(data.me.gardenDecor,{flowerPot:'house'});
  assert.deepEqual(preview.blocks,current.blocks,'visual trial must preserve walkability');
  assert.equal(preview.actors.filter(a=>a.type==='garden-decor'&&a.kind==='flowerPot').length,1,'moving must not duplicate a prop');
  apply(room,'a',{action:'placeGardenDecor',item:'flowerPot',target:'wellside'},1000);
  const confirmed=features('field',snapshot(room,farm,1000));
  assert.deepEqual(preview.actors.filter(a=>a.type==='garden-decor'),confirmed.actors.filter(a=>a.type==='garden-decor'));
  assert.equal(farm.coins,before.coins,'already owned props remain free');
  assert.equal(farm.decorVouchers,before.decorVouchers);
});

test('unowned props can be tried without money, but invalid or occupied spots cannot be previewed',()=>{
  const farm=newFarm('a','Vườn thử',1000);farm.coins=0;farm.decorVouchers=0;
  farm.gardenDecor={flowerPot:'house'};
  const before=structuredClone(farm);
  assert.ok(decorPreviewFarm(farm,'lotusPot','workshopPath'));
  for(const [item,target]of [['lotusPot','house'],['missing','gate'],['lotusPot','missing'],['constructor','gate']])assert.equal(decorPreviewFarm(farm,item,target),null);
  assert.deepEqual(farm,before);
});
