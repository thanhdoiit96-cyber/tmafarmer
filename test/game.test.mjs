import assert from 'node:assert/strict';
import test from 'node:test';
import {farmTasks} from '../public/tasks.mjs';
import { gameDay, slotLength, apply, cropYield, farmProgress, newFarm, newRoom, orderList, projectAnimal, projectPlot, snapshot, xpUnlocks } from '../public/game.mjs';

const start=10_000;
function world() {
  const room=newRoom(start);
  for(const id of ['a','b','c','d','e','f']) room.farms[id]=newFarm(id,id,start);
  return room;
}
const action=(room,id,action,input={},offset=0)=>apply(room,id,{action,...input},start+offset);
test('care speeds up crops and rain increases pests without manual watering',()=>{
  const r=world(), plot={kind:'corn',at:start+slotLength,progress:0,pests:0,wetUntil:0,protectedUntil:0};
  const rain=projectPlot(r,plot,start+slotLength+90);
  const dry=projectPlot(r,{...plot,at:start},start+90);
  assert.ok(rain.progress>dry.progress);
  assert.ok(rain.pests>dry.pests);
  const treated=projectPlot(r,{...plot,fertilized:true,protectedUntil:start+slotLength+105},start+slotLength+90);
  assert.ok(treated.progress>rain.progress);
  assert.equal(treated.pests,0);
  const one=projectPlot(r,plot,start+slotLength+130);
  const split=projectPlot(r,projectPlot(r,plot,start+slotLength+99),start+slotLength+130);
  assert.ok(Math.abs(one.progress-split.progress)<1e-7);
  assert.ok(Math.abs(one.pests-split.pests)<1e-7);
});
test('farming, harvest, sales, and orders conserve stock and reject repeated harvest',()=>{
  const r=world(), a=r.farms.a;
  action(r,'a','plant',{item:'wheat',index:0});
  action(r,'a','water',{index:0});
  action(r,'a','fertilize',{index:0});
  assert.throws(()=>action(r,'a','harvest',{index:0},15),/chưa đến/);
  action(r,'a','harvest',{index:0},280);
  assert.equal(a.inventory.wheat,4);
  assert.throws(()=>action(r,'a','harvest',{index:0},280),/gieo hạt/);
  action(r,'a','order',{index:0},280);
  assert.equal(a.coins,136);
  assert.throws(()=>action(r,'a','order',{index:0},280),/đã giao/);
});
test('feeding and better shelter matter for growth and producing goods',()=>{
  const r=world(), a=r.farms.a;
  assert.throws(()=>action(r,'a','animal',{item:'chicken'}),/chuồng cấp/);
  action(r,'a','upgrade',{item:'coop'});
  action(r,'a','animal',{item:'chicken'});
  assert.equal(projectAnimal(r,a,a.pens[0],start+100).age,0);
  action(r,'a','feed',{index:0});
  assert.equal(projectAnimal(r,a,a.pens[0],start+100).age,100);
  assert.throws(()=>action(r,'a','collect',{index:0},100),/chưa sẵn/);
  action(r,'a','collect',{index:0},2101);
  assert.equal(a.inventory.egg,3);
  const pen={kind:'chicken',at:start+6*slotLength,age:0,progress:0,fedUntil:start+6*slotLength+110};
  assert.ok(projectAnimal(r,{coop:2},pen,start+6*slotLength+60).age>projectAnimal(r,{coop:1},pen,start+6*slotLength+60).age);
});
test('experience and workshop levels unlock new crops and animals',()=>{
  const r=world(),farm=r.farms.a;
  farm.coins=2000;
  farm.inventory.tomatoSeed=1;
  assert.throws(()=>action(r,'a','plant',{item:'tomato',index:0}),/25 XP/);
  farm.xp=25;
  action(r,'a','plant',{item:'tomato',index:0});
  assert.equal(farm.plots[0].kind,'tomato');

  farm.xp=0;
  action(r,'a','upgrade',{item:'coop'});
  assert.throws(()=>action(r,'a','animal',{item:'duck'}),/20 XP/);
  farm.xp=20;
  action(r,'a','animal',{item:'duck'});
  farm.xp=40;
  action(r,'a','upgrade',{item:'workshop'});
  assert.equal(farm.workshop,1);
  action(r,'a','buy',{item:'strawberrySeed'});
  action(r,'a','plant',{item:'strawberry',index:1});
  assert.equal(farm.plots[1].kind,'strawberry');
  assert.throws(()=>action(r,'a','buy',{item:'grapeSeed'}),/Xưởng máy cấp 2/);
});
test('farm progression shows real XP thresholds and upgrades never spend XP',()=>{
  const room=world(), farm=room.farms.a;
  assert.equal(farmProgress(farm).rank.name,'Tân nông');
  assert.equal(farmProgress(farm).next.xp,20);
  assert.deepEqual(xpUnlocks.map(unlock=>unlock.xp),[20,25,40,50,70,100,130,180,350]);
  farm.coins=150;
  farm.xp=40;
  assert.match(action(room,'a','upgrade',{item:'workshop'}),/\+10 XP/);
  assert.equal(farm.xp,50);
  assert.equal(farm.coins,30);
  assert.equal(farmProgress(farm).next.xp,70);
  assert.equal(farmProgress({xp:350}).next,null);
});
test('garden and barn theft keep reserves, share caps, reset daily, and respect upgrades',()=>{
  const r=world(), b=r.farms.b;
  b.inventory.carrot=5;
  action(r,'b','plant',{item:'wheat',index:0});
  action(r,'b','water',{index:0});
  action(r,'a','steal',{target:'b',source:'garden',index:0},600);
  assert.throws(()=>action(r,'a','steal',{target:'b',source:'barn',item:'carrot'},601),/đã lấy/);
  action(r,'b','upgrade',{item:'fence'},601);
  action(r,'c','steal',{target:'b',source:'barn',item:'carrot'},601);
  assert.throws(()=>action(r,'d','steal',{target:'b',source:'barn',item:'carrot'},602),/giới hạn/);
  action(r,'b','harvest',{index:0},602);
  assert.equal(b.inventory.wheat,2);
  action(r,'b','shield',{},gameDay);
  assert.throws(()=>action(r,'a','steal',{target:'b',source:'barn',item:'carrot'},gameDay+1),/đóng cổng/);
  for(const id of ['c','d','e','f']) r.farms[id].inventory.corn=4;
  action(r,'a','steal',{target:'c',source:'barn',item:'corn'},gameDay+1);
  action(r,'a','steal',{target:'d',source:'barn',item:'corn'},gameDay+1);
  assert.throws(()=>action(r,'a','steal',{target:'e',source:'barn',item:'corn'},gameDay+2),/hết lượt/);
  action(r,'a','upgrade',{item:'bag'},gameDay+3);
  action(r,'a','steal',{target:'e',source:'barn',item:'corn'},gameDay+4);
  assert.equal(r.farms.e.inventory.corn,3);
  assert.throws(()=>action(r,'f','steal',{target:'e',source:'barn',item:'corn'},gameDay+5),/ít nhất 3/);
  assert.equal(snapshot(r,r.farms.a,start+gameDay+5).me.daily.taken,3);
});

test('dry soil slows growth in the same weather and pest damage reduces the actual harvest',()=>{
  const r=world(), farm=r.farms.a;
  const plot={kind:'corn',goal:1500,at:start,progress:0,pests:0,wetUntil:0,protectedUntil:0,picked:0};
  const dry=projectPlot(r,plot,start+100);
  const wet=projectPlot(r,{...plot,wetUntil:start+40},start+100);
  assert.equal(dry.progress,65);
  assert.ok(Math.abs(wet.progress-(40*1.38+60*.65))<1e-7);
  for(const [index,pests,expected] of [[0,0,4],[1,22,3],[2,42,2],[3,79,1]]){
    farm.plots[index]={...plot,pests,progress:1500};
    const before=farm.inventory.corn??0;
    assert.equal(cropYield(farm.plots[index]),expected);
    action(r,'a','harvest',{index});
    assert.equal(farm.inventory.corn-before,expected);
  }
  farm.plots[4]={...plot,pests:45};
  action(r,'a','spray',{index:4});
  assert.equal(farm.plots[4].pests,0);
  assert.equal(cropYield(farm.plots[4]),2);
});

test('pork orders accept meat and the market locks truffle seed behind workshop and XP',()=>{
  const r=world(), farm=r.farms.a;
  farm.coins=500; farm.inventory.truffle=3;
  const day=3;
  const order=orderList(day).find(row=>row.items.some(item=>item.item==='pork'));
  assert.ok(order);
  assert.throws(()=>action(r,'a','order',{index:order.id},day*gameDay),/chưa có đủ hàng/);
  farm.inventory.pork=4;
  action(r,'a','order',{index:order.id},day*gameDay);
  assert.equal(farm.inventory.pork,2);
  assert.equal(farm.inventory.truffle,3);
  assert.throws(()=>action(r,'a','buy',{item:'truffleSeed'}),/Xưởng máy cấp 3/);
  farm.workshop=3;
  assert.throws(()=>action(r,'a','buy',{item:'truffleSeed'}),/350 XP/);
  farm.xp=350;
  const coins=farm.coins;
  action(r,'a','buy',{item:'truffleSeed'});
  assert.equal(farm.coins,coins-180);
  action(r,'a','plant',{item:'truffle',index:0});
  assert.equal(farm.plots[0].kind,'truffle');
});
test('market escrow transfers goods and coins once',()=>{
  const r=world(), a=r.farms.a,b=r.farms.b;
  a.inventory.carrot=6;
  action(r,'a','list',{item:'carrot',qty:3,price:15});
  assert.equal(a.inventory.carrot,3);
  assert.throws(()=>action(r,'b','delist',{index:1}),/chỉ được/);
  action(r,'b','deal',{index:1});
  assert.throws(()=>action(r,'c','deal',{index:1}),/đã đóng/);
  assert.equal(a.coins,145);
  assert.equal(b.coins,55);
  assert.equal(b.inventory.carrot,3);
});

test('fallow ground compacts after eight hours and tilling restores the next planting',()=>{
  const r=world(), farm=r.farms.a;
  assert.throws(()=>action(r,'a','till',{index:0}),/Đất còn tơi/);
  const compact=snapshot(r,farm,start+gameDay);
  assert.equal(compact.me.soilCompactsAt[0],start+gameDay);
  assert.equal(farmTasks(compact).find(t=>t.index===0)?.title,'Cuốc đất');
  assert.throws(()=>action(r,'a','plant',{index:0,item:'wheat'},gameDay),/Đất đã chai/);
  assert.equal(farm.inventory.wheatSeed,5);
  action(r,'a','till',{index:0},gameDay);
  assert.equal(farm.wellness.stamina,95);
  action(r,'a','plant',{index:0,item:'wheat'},gameDay);
  assert.throws(()=>action(r,'a','till',{index:0},gameDay),/ô trống/);
  farm.plots[0].progress=farm.plots[0].goal;
  action(r,'a','harvest',{index:0},gameDay+1);
  action(r,'a','plant',{index:0,item:'wheat'},gameDay+1);
  action(r,'a','buildLand',{index:0,item:'garden'},gameDay+1);
  action(r,'a','plant',{index:12,item:'wheat'},gameDay+1);
});

test('post-rain pests rise faster until the damp window ends and respect treatment',()=>{
  const r=world(), now=start+slotLength*2;
  const plot={kind:'corn',goal:1500,at:now,progress:0,pests:0,wetUntil:0,protectedUntil:0};
  assert.equal(snapshot(r,r.farms.a,now).afterRainUntil,now+1200);
  assert.equal(snapshot(r,r.farms.a,now+1200).afterRainUntil,0);
  // Compare two plots in the same weather slot, before and after the damp period.
  const exposed=projectPlot(r,plot,now+120);
  const later=projectPlot(r,{...plot,at:now+1200},now+1320);
  assert.ok(exposed.pests>later.pests*3);
  assert.equal(projectPlot(r,{...plot,protectedUntil:now+200},now+120).pests,0);
  const one=projectPlot(r,plot,now+1260);
  const split=projectPlot(r,projectPlot(r,plot,now+1100),now+1260);
  assert.ok(Math.abs(one.pests-split.pests)<1e-7);
});

test('selling all values the whole current stack and leaves other inventory alone',()=>{
  const r=world(), farm=r.farms.a;
  farm.inventory.wheat=27;farm.inventory.carrot=1;
  action(r,'a','sell',{item:'wheat',source:'all'});
  assert.deepEqual([farm.inventory.wheat,farm.inventory.carrot,farm.coins],[0,1,262]);
  assert.equal(snapshot(r,farm,start).village.income,162);
  assert.throws(()=>action(r,'a','sell',{item:'wheat',source:'all'}),/Kho không còn/);
  farm.inventory.wheat=27;
  action(r,'a','sell',{item:'wheat',qty:24});
  assert.equal(farm.inventory.wheat,3);
  assert.throws(()=>action(r,'a','list',{item:'wheat',price:6,qty:24}),/Số lượng/);
  assert.throws(()=>action(r,'a','buy',{item:'wheatSeed',qty:101}),/Số lượng/);
});
