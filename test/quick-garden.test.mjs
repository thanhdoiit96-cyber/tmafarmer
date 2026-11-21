import assert from 'node:assert/strict';
import test from 'node:test';
import {advanceGardenHelpers,apply,crops,gardenHelperPreview,gardenHelperTargets,newFarm,newRoom,slotLength,snapshot,stock,supplyLimit} from '../public/game.mjs';
import {gardenHelperPosition,gardenHelperStart} from '../public/garden-helper.mjs';
import {plotOffset} from '../public/land.mjs';
import {gardenHelperPose} from '../public/world-motion.mjs';

const start=20_000;
function plot(kind,now,fields={}){
  return {kind,goal:crops[kind].time,progress:0,pests:0,at:now,wetUntil:0,protectedUntil:0,picked:0,...fields};
}
function setup(roomCreated=start){
  const room=newRoom(roomCreated), farm=room.farms.a=newFarm('a','Vườn A',roomCreated);
  room.farms.b=newFarm('b','Vườn B',roomCreated);
  farm.land[0]={kind:'garden'};
  return {room,farm};
}
const hire=(room,item,plots,expectedSpace,now=start)=>apply(room,'a',{action:'hireGardenHelper',item,plots,expectedSpace},now);

test('hiring covers primary and expansion plots and charges only coins, even while the player rests',()=>{
  const {room,farm}=setup(start-6*slotLength);
  farm.plots[0]=plot('wheat',start);
  farm.plots[1]=plot('wheat',start,{wetUntil:start+60});
  farm.extraPlots[plotOffset]=plot('carrot',start);
  farm.inventory.wheat=30;
  farm.wellness={water:0,food:0,stamina:0,at:start,until:{},restUntil:start+60};
  const before=structuredClone(farm.wellness);
  const view=snapshot(room,farm,start), targets=gardenHelperTargets(view.me,'water',view.weather,start);
  assert.deepEqual(targets.map(target=>target.index),[0,plotOffset]);
  const preview=gardenHelperPreview(view.me,'water',targets);
  assert.deepEqual(preview,{cost:4,space:0,seeds:0,free:0,duration:19,blocked:''});
  assert.match(hire(room,'water',[0,plotOffset],0),/Cô Lan làm 2 ô · 4 xu/);
  assert.equal(farm.coins,96);
  assert.equal(farm.plots[0].wetUntil,0);
  const job=farm.gardenHelperJob;
  assert.throws(()=>hire(room,'water',[0],0),/đang làm/);
  assert.equal(advanceGardenHelpers(room,job.steps[0].doneAt-1),false);
  assert.equal(advanceGardenHelpers(room,job.steps[0].doneAt),true);
  assert.equal(farm.plots[0].wetUntil,job.steps[0].doneAt+Math.ceil(crops.wheat.time*1.15));
  assert.equal(farm.extraPlots[plotOffset].wetUntil,0);
  const offline=JSON.parse(JSON.stringify(room));
  assert.equal(advanceGardenHelpers(offline,job.endsAt+3600),true);
  assert.equal(offline.farms.a.extraPlots[plotOffset].wetUntil,job.endsAt+Math.ceil(crops.carrot.time*1.15));
  assert.equal(advanceGardenHelpers(offline,job.endsAt+3600),false);
  assert.deepEqual(offline.farms.a.wellness,before);
  assert.deepEqual(offline.farms.a.journal.done,['care']);
  assert.equal(stock(offline.farms.a),30);
});

test('harvest settles one plot at a time with reduced yield and an automatic refund if the barn fills',()=>{
  const {room,farm}=setup();
  farm.plots[0]=plot('wheat',start,{progress:crops.wheat.time,pests:20});
  farm.extraPlots[plotOffset]=plot('corn',start,{progress:crops.corn.time,fertilized:true,picked:1});
  farm.inventory.wheat=24;
  const view=snapshot(room,farm,start);
  assert.deepEqual(gardenHelperTargets(view.me,'harvest',view.weather,start).map(target=>target.space),[2,4]);
  hire(room,'harvest',[0,plotOffset],6);
  const job=farm.gardenHelperJob, publicJob=snapshot(room,room.farms.b,start).neighbors[0].gardenHelperJob;
  // An older save has neither option nor seed count.
  delete job.keepSeeds;
  delete job.seeds;
  assert.deepEqual(Object.keys(publicJob.steps[0]),['index','arriveAt','doneAt']);
  advanceGardenHelpers(room,job.steps[0].doneAt);
  assert.equal(farm.plots[0],null);
  assert.equal(farm.inventory.wheat,26);
  farm.inventory.wheat++;
  advanceGardenHelpers(room,job.endsAt);
  assert.ok(farm.extraPlots[plotOffset]);
  assert.equal(farm.xp,4);
  assert.equal(farm.coins,96);
  assert.deepEqual(farm.journal.done,['gather']);
  assert.deepEqual(farm.gardenHelperReport,{action:'harvest',completed:1,total:2,skipped:1,produce:2,seeds:0,refund:4});
  assert.match(farm.log[0].message,/hoàn 4 xu/);
});

test('a helper can convert one harvested item per plot to seed, using less barn space',()=>{
  const {room,farm}=setup();
  farm.plots[0]=plot('wheat',start,{progress:crops.wheat.time,pests:80});
  farm.extraPlots[plotOffset]=plot('corn',start,{progress:crops.corn.time});
  farm.inventory.wheat=27;
  const {me,weather}=snapshot(room,farm,start);
  const targets=gardenHelperTargets(me,'harvest',weather,start);
  const plan=gardenHelperPreview(me,'harvest',targets,true);
  assert.deepEqual([plan.space,plan.seeds,plan.free,plan.blocked],[3,2,3,'']);
  const before=[farm.inventory.wheatSeed,farm.inventory.cornSeed];
  apply(room,'a',{action:'hireGardenHelper',item:'harvest',plots:[0,plotOffset],expectedSpace:3,source:'seed'},start);
  const saved=JSON.parse(JSON.stringify(room));
  const job=saved.farms.a.gardenHelperJob;
  assert.equal(job.keepSeeds,true);
  assert.equal(advanceGardenHelpers(saved,job.endsAt+3600),true);
  const result=saved.farms.a;
  assert.equal(stock(result),30);
  assert.equal(result.inventory.wheat,27);
  assert.equal(result.inventory.corn,3);
  assert.deepEqual([result.inventory.wheatSeed,result.inventory.cornSeed],before.map(count=>count+1));
  assert.equal(result.plots[0],null);
  assert.equal(result.extraPlots[plotOffset],null);
  assert.deepEqual(result.gardenHelperReport,{action:'harvest',completed:2,total:2,skipped:0,produce:3,seeds:2,refund:0});
  assert.match(result.log[0].message,/giữ 2 giống/);
  assert.equal(advanceGardenHelpers(saved,job.endsAt+3601),false);
});

test('seed capacity is checked per seed type at hire and again when each plot is due',()=>{
  const {room,farm}=setup();
  for(const i of [0,1])farm.plots[i]=plot('wheat',start,{progress:crops.wheat.time});
  farm.inventory.wheatSeed=supplyLimit-1;
  const request={action:'hireGardenHelper',item:'harvest',plots:[0,1],expectedSpace:4,source:'seed'};
  const before=structuredClone(farm);
  assert.throws(()=>apply(room,'a',request,start),/Túi không đủ chỗ/);
  assert.deepEqual(farm,before);
  farm.inventory.wheatSeed--;
  assert.throws(()=>apply(room,'a',{...request,source:'other'},start),/Cách thu hoạch không hợp lệ/);
  apply(room,'a',request,start);
  const job=farm.gardenHelperJob;
  advanceGardenHelpers(room,job.steps[0].doneAt);
  assert.equal(farm.inventory.wheatSeed,supplyLimit-1);
  apply(room,'a',{action:'buy',item:'wheatSeed',qty:1},job.steps[0].doneAt);
  advanceGardenHelpers(room,job.endsAt);
  assert.equal(farm.plots[0],null);
  assert.ok(farm.plots[1]);
  assert.equal(farm.inventory.wheatSeed,supplyLimit);
  assert.equal(farm.inventory.wheat,2);
  assert.equal(farm.gardenHelperReport.refund,4);
  assert.equal(farm.gardenHelperReport.seeds,1);
  apply(room,'a',{...request,plots:[1],source:'all',expectedSpace:3},job.endsAt+1);
  advanceGardenHelpers(room,farm.gardenHelperJob.endsAt);
  assert.equal(farm.inventory.wheatSeed,supplyLimit);
  assert.equal(farm.inventory.wheat,5);
  assert.equal(farm.gardenHelperReport.seeds,0);
});

test('an invalid initial quote or occupied plot list never charges the farm',()=>{
  const {room,farm}=setup();
  farm.inventory.wheat=25;
  for(const i of [0,1])farm.plots[i]=plot('wheat',start,{progress:crops.wheat.time});
  farm.plots[2]=plot('wheat',start);
  const unchanged=(fn,reason)=>{
    const before=structuredClone(farm);
    assert.throws(fn,reason);
    assert.deepEqual(farm,before);
  };
  unchanged(()=>hire(room,'harvest',[0,0],6),/ô trùng/);
  unchanged(()=>hire(room,'harvest',[0,999],6),/không thuộc vườn/);
  unchanged(()=>hire(room,'harvest',[0,2],6),/ô đã thay đổi/);
  unchanged(()=>hire(room,'harvest',[0,1],5),/Sản lượng đã thay đổi/);
  unchanged(()=>hire(room,'harvest',[0,1],6),/Kho thiếu 1 chỗ/);
  farm.coins=1;
  unchanged(()=>hire(room,'water',[2],0),/chưa đủ xu/);
});

test('weather or a different seedling can invalidate a later plot with a refund',()=>{
  const {room,farm}=setup(start-slotLength+7);
  for(const i of [0,1])farm.plots[i]=plot('wheat',start);
  hire(room,'water',[0,1],0);
  const job=farm.gardenHelperJob;
  assert.ok(job.steps.every(step=>step.doneAt>=start+7));
  advanceGardenHelpers(room,job.endsAt);
  assert.equal(farm.gardenHelperReport.skipped,2);
  assert.equal(farm.coins,100);

  const next=setup(), current=next.farm;
  current.plots[0]=plot('wheat',start);
  hire(next.room,'water',[0],0);
  const end=current.gardenHelperJob.endsAt;
  current.plots[0]=plot('wheat',start+1,{plantedAt:start+1});
  advanceGardenHelpers(next.room,end);
  assert.equal(current.plots[0].wetUntil,0);
  assert.equal(current.coins,100);
});

test('helper pose interpolates walking, works at each scheduled plot and disappears at completion',()=>{
  const {room,farm}=setup();
  farm.plots[0]=plot('wheat',start);
  hire(room,'water',[0],0);
  const job=farm.gardenHelperJob, [step]=job.steps;
  const point=gardenHelperPosition(0);
  const paths=[[gardenHelperStart,point]];
  const walking=gardenHelperPose(job,paths,step.arriveAt-1);
  assert.ok(walking.walkDistance>0);
  assert.notEqual(walking.x,point[0]);
  const working=gardenHelperPose(job,paths,step.arriveAt+.25);
  assert.deepEqual([working.x,working.y,working.action], [...point,'water']);
  assert.equal(gardenHelperPose(job,paths,step.doneAt),null);
});
