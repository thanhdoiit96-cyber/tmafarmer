import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,gameDay,goods,mealCooldown,newFarm,newRoom,orderList,recipes,snapshot,stock,workshopFoodOrders} from '../public/game.mjs';
import {features} from '../public/world-layout.mjs';
import {gardenDecorItems,gardenDecorSpots,homesteadSize} from '../public/land.mjs';
import {gardenDecorAtlas} from '../public/pixel/frames.mjs';

const start=10_000;
function setup(){
  const room=newRoom(start);
  for(const [id,name] of [['a','Vườn Sen'],['b','Vườn Lúa']])room.farms[id]=newFarm(id,name,start);
  return room;
}
const send=(room,id,input,time=start)=>apply(room,id,input,time);

test('seasonal recipes use local produce, restore stated stats, and share the meal cooldown',()=>{
  const room=setup(), farm=room.farms.a;
  const craft=item=>send(room,'a',{action:'craft',item});
  farm.workshop=1;
  Object.assign(farm.inventory,{sweetPotato:2,pumpkin:2,milk:1,peanut:2});
  assert.throws(()=>craft('pumpkinSoup'),/cấp 2/);
  assert.throws(()=>craft('roastedPeanuts'),/cấp 2/);
  craft('roastedSweetPotato');
  farm.workshop=2;
  craft('pumpkinSoup');
  craft('roastedPeanuts');
  assert.equal(stock(farm),0);
  for(const item of ['sweetPotato','pumpkin','milk','peanut'])assert.equal(farm.inventory[item],0);
  for(const [i,{item}] of workshopFoodOrders.entries()){
    const time=start+i*mealCooldown;
    farm.wellness={water:20,food:20,stamina:20,at:time,until:{},restUntil:0};
    send(room,'a',{action:'consume',item},time);
    for(const [stat,gain] of Object.entries(recipes[item].gain))assert.equal(farm.wellness[stat],20+gain);
    assert.equal(farm.inventory[item],0);
    if(i===0)assert.throws(()=>send(room,'a',{action:'consume',item:'pumpkinSoup'},time+1),/lượt ăn uống tiếp theo/);
  }
});

test('food orders keep a stable rotation with one shared fulfillment each',()=>{
  const room=setup(), {a,b}=room.farms;
  const lookup=(day,item)=>orderList(day,room).find(order=>order.items[0].item===item);
  assert.equal(lookup(0,'roastedSweetPotato'),undefined);
  Object.assign(a,{xp:100,workshop:1});
  assert.ok(lookup(0,'roastedSweetPotato'));
  assert.equal(lookup(1,'pumpkinSoup'),undefined);
  assert.equal(lookup(2,'roastedPeanuts'),undefined);
  a.workshop=2;
  for(const [day,{item}] of workshopFoodOrders.entries()){
    const order=lookup(day,item), time=start+day*gameDay;
    const cost=Object.entries(recipes[item].ingredients).reduce((sum,[key,count])=>sum+goods[key].sell*count,0);
    assert.deepEqual(order.items,[{item,qty:2}]);
    assert.equal(order.category,'workshop');
    assert.equal(order.reward,Math.ceil(cost*2*1.25));
    a.inventory[item]=2;
    b.inventory[item]=2;
    send(room,'a',{action:'order',index:order.id},time);
    assert.equal(a.inventory[item],0);
    assert.equal(snapshot(room,b,time).orders.some(active=>active.id===order.id),false);
    assert.throws(()=>send(room,'b',{action:'order',index:order.id},time),/đã giao/);
    assert.equal(b.inventory[item],2);
  }
});

test('decor is owned by the paying farm and only placed items appear for visitors',()=>{
  const room=setup(),{a,b}=room.farms;
  const place=(item,target,source)=>send(room,'a',{action:'placeGardenDecor',item,target,source});
  const view=()=>snapshot(room,b,start);
  const host=()=>view().neighbors.find(farm=>farm.id==='a');
  const visible=()=>features('visit',view(),host()).actors.filter(actor=>actor.type==='garden-decor');
  assert.throws(()=>place('bambooLamp','gate','voucher'),/chưa có phiếu/);
  assert.throws(()=>place('flowerPot','a','coins'),/Vị trí trang trí không hợp lệ/);
  place('flowerPot','house','coins');
  assert.equal(a.coins,55);
  assert.throws(()=>place('bambooLamp','house','voucher'),/đã có món/);
  a.decorVouchers=1;
  place('bambooLamp','pond','voucher');
  assert.equal(a.coins,55);
  assert.equal(a.decorVouchers,0);
  assert.throws(()=>place('gardenSign','gate','coins'),/chưa đủ xu/);
  a.coins+=10;
  place('gardenSign','gate','coins');
  assert.deepEqual(visible().map(({kind,name})=>[kind,name]),[['flowerPot','Vườn Sen'],['gardenSign','Vườn Sen'],['bambooLamp','Vườn Sen']]);
  assert.deepEqual(features('field',snapshot(room,a,start)).actors.filter(actor=>actor.type==='garden-decor'),visible());
  assert.equal(features('field',view()).actors.some(actor=>actor.type==='garden-decor'),false);
  send(room,'a',{action:'stowGardenDecor',item:'bambooLamp'});
  assert.equal(a.gardenDecor.bambooLamp,null);
  assert.equal(Object.hasOwn(host().gardenDecor,'bambooLamp'),false);
  assert.equal(Object.hasOwn(host(),'decorVouchers'),false);
  place('flowerPot','pond');
  place('bambooLamp','house');
  assert.deepEqual([a.coins,a.decorVouchers,b.coins],[5,0,100]);
  assert.deepEqual(visible().map(actor=>actor.kind),['bambooLamp','gardenSign','flowerPot']);
});

test('all thirteen decorations can be placed together and render at the same points for visitors',()=>{
  const room=setup(),{a,b}=room.farms;
  a.coins=1000;
  const spots=Object.entries(gardenDecorSpots);
  const items=Object.entries(gardenDecorItems);
  assert.equal(items.length,13);
  assert.equal(spots.length,13);
  assert.deepEqual(Object.keys(gardenDecorAtlas.frames),items.map(([kind])=>kind));
  for(const [i,[item,definition]] of items.entries()){
    const [target,{x,y}]=spots[i];
    assert.ok(x-definition.width/2>=0&&x+definition.width/2<=homesteadSize.width);
    assert.ok(y-definition.width*48/56>=0&&y<=homesteadSize.height);
    send(room,'a',{action:'placeGardenDecor',item,target,source:'coins'});
  }
  const view=snapshot(room,b,start), host=view.neighbors.find(farm=>farm.id==='a');
  const ownerActors=features('field',snapshot(room,a,start)).actors.filter(actor=>actor.type==='garden-decor');
  assert.deepEqual(features('visit',view,host).actors.filter(actor=>actor.type==='garden-decor'),ownerActors);
  assert.deepEqual(ownerActors.map(actor=>actor.kind),items.map(([item])=>item));
  assert.equal(a.coins,1000-items.reduce((total,[,item])=>total+item.cost,0));
});
