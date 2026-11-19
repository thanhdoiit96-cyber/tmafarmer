import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,crops,newFarm,newRoom,quickGardenPreview,quickGardenTargets,slotLength,snapshot,stock} from '../public/game.mjs';
import {plotOffset} from '../public/land.mjs';

const start=20_000;
function plot(kind,now,fields={}){
  return {kind,goal:crops[kind].time,progress:0,pests:0,at:now,wetUntil:0,protectedUntil:0,picked:0,...fields};
}
function setup(roomCreated=start){
  const room=newRoom(roomCreated);
  const farm=room.farms.a=newFarm('a','Vườn A',roomCreated);
  farm.land[0]={kind:'garden'};
  return {room,farm};
}
function send(room,item,plots,expectedSpace,now=start){
  return apply(room,'a',{action:'quickGarden',item,plots,expectedSpace},now);
}

test('watering covers primary and expansion plots, includes hot-weather costs and takes no storage',()=>{
  const {room,farm}=setup(start-6*slotLength);
  farm.plots[0]=plot('wheat',start);
  farm.plots[1]=plot('wheat',start,{wetUntil:start+60});
  farm.extraPlots[plotOffset]=plot('carrot',start);
  farm.inventory.wheat=30;
  const view=snapshot(room,farm,start);
  assert.equal(view.weather.id,'heat');
  const targets=quickGardenTargets(view.me,'water',view.weather,start);
  assert.deepEqual(targets.map(target=>target.index),[0,plotOffset]);
  const preview=quickGardenPreview(view.me,'water',targets,view.weather,start);
  assert.deepEqual(preview,{cost:{water:6,food:2,stamina:6},space:0,free:0,blocked:''});
  assert.match(send(room,'water',[0,plotOffset],0),/Đã tưới 2 ô/);
  assert.equal(farm.plots[0].wetUntil,start+Math.ceil(crops.wheat.time*1.15));
  assert.equal(farm.extraPlots[plotOffset].wetUntil,start+Math.ceil(crops.carrot.time*1.15));
  assert.equal(farm.wellness.stamina,94);
  assert.equal(farm.wellness.water,94);
  assert.equal(stock(farm),30);
  assert.deepEqual(farm.journal.done,['care']);
});

test('batch harvest includes damage and picked produce in its estimate and fills the remaining storage exactly',()=>{
  const {room,farm}=setup();
  farm.plots[0]=plot('wheat',start,{progress:crops.wheat.time,pests:20});
  farm.extraPlots[plotOffset]=plot('corn',start,{progress:crops.corn.time,fertilized:true,picked:1});
  farm.inventory.wheat=24;
  const view=snapshot(room,farm,start);
  const targets=quickGardenTargets(view.me,'harvest',view.weather,start);
  assert.deepEqual(targets.map(target=>target.space),[2,4]);
  assert.equal(quickGardenPreview(view.me,'harvest',targets,view.weather,start).space,6);
  assert.match(send(room,'harvest',[0,plotOffset],6),/Đã thu hoạch 2 ô · 6 nông sản/);
  assert.equal(farm.plots[0],null);
  assert.equal(farm.extraPlots[plotOffset],null);
  assert.equal(farm.inventory.wheat,26);
  assert.equal(farm.inventory.corn,4);
  assert.equal(farm.wellness.stamina,90);
  assert.equal(farm.xp,8);
  assert.deepEqual(farm.journal.done,['gather']);
});

test('a stale selection, duplicates, insufficient storage or total effort leave all plots and resources intact',()=>{
  const {room,farm}=setup();
  farm.inventory.wheat=25;
  for(const i of [0,1])farm.plots[i]=plot('wheat',start,{progress:crops.wheat.time});
  farm.plots[2]=plot('wheat',start);
  farm.wellness={water:100,food:100,stamina:9,at:start,until:{},restUntil:0};
  const unchanged=(fn,reason)=>{
    const before=structuredClone(farm);
    assert.throws(fn,reason);
    assert.deepEqual(farm,before);
  };
  unchanged(()=>send(room,'harvest',[0,0],6),/ô trùng/);
  unchanged(()=>send(room,'harvest',[0,999],6),/không thuộc vườn/);
  unchanged(()=>send(room,'harvest',[0,'1'],6),/không thuộc vườn/);
  unchanged(()=>send(room,'harvest',[0,2],6),/ô đã thay đổi/);
  unchanged(()=>send(room,'harvest',[0,1],5),/Sản lượng đã thay đổi/);
  unchanged(()=>send(room,'harvest',[0,1],6),/đã mệt/);
  farm.wellness.stamina=100;
  unchanged(()=>send(room,'harvest',[0,1],6),/Kho thiếu 1 chỗ/);
  farm.wellness.restUntil=start+30;
  unchanged(()=>send(room,'water',[2],0),/nghỉ xong/);
});

test('an unexpected rain slot prevents the entire watering batch',()=>{
  const {room,farm}=setup(start-slotLength);
  for(const i of [0,1])farm.plots[i]=plot('wheat',start);
  assert.throws(()=>send(room,'water',[0,1],0),/không còn phù hợp/);
  assert.equal(farm.plots[0].wetUntil,0);
  assert.equal(farm.plots[1].wetUntil,0);
  assert.equal(farm.wellness,undefined);
});
