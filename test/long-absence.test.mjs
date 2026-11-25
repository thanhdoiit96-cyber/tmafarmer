import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,animalCondition,animals,crops,cropGoal,cropPotentialYield,cropYield,dayAt,newFarm,newRoom,orderList,projectAnimal,projectPlot,snapshot} from '../public/game.mjs';
import {aquatic} from '../public/aqua.mjs';
import {farmTasks} from '../public/tasks.mjs';
import {previousVisit,returnSummary,visitMark} from '../public/return-summary.mjs';
import {coopCapacity} from '../public/land.mjs';

const start=100000,hour=3600;
function fixture(){
  const room=newRoom(start),farm=newFarm('a','A',start);room.farms.a=farm;
  Object.assign(farm,{coop:2,coins:1000,xp:200});
  farm.land[0]={kind:'coop',coopLevel:2,fence:'bamboo'};
  farm.plots[0]={kind:'corn',goal:crops.corn.time,progress:0,pests:0,weeds:0,hazard:'pests',at:start,plantedAt:start,wetUntil:0};
  farm.plots[1]={...farm.plots[0],hazard:'weeds'};
  farm.pens=['chicken','cow','pig'].map((kind,id)=>({id,kind,lot:0,age:animals[kind].grow,
    growGoal:animals[kind].grow,productGoal:animals[kind].time,progress:0,at:start,acquiredAt:start,
    fedUntil:start+(kind==='cow'?10:4*hour)}));
  farm.ponds[0]=[{kind:'tilapia',count:2,progress:0,at:start,fedUntil:start+2*hour,picked:0},
    {kind:'prawn',count:1,progress:0,at:start,fedUntil:start+10,picked:0}];
  return {room,farm};
}

for(const hours of [8,24,72,168]){
  test(`return after ${hours} real hours retains assets and gives truthful care/harvest tasks`,()=>{
    const {room,farm}=fixture(),initial=snapshot(room,farm,start),mark=visitMark(initial);
    const inventory=structuredClone(farm.inventory),now=start+hours*hour;
    const view=snapshot(room,farm,now),tasks=farmTasks(view);
    assert.equal(view.day,hours/8);assert.equal(view.me.coins,1000);assert.equal(view.me.xp,200);
    assert.deepEqual(view.me.inventory,inventory);assert.equal(view.me.pens.length,3);
    assert.ok(view.me.soilCompactsAt[2]<=now,'empty soil compacts after eight real hours');
    assert.equal(coopCapacity(view.me,0),4);assert.equal(view.me.land[0].fence,'bamboo');
    for(const index of [0,1]){
      const plot=view.me.plots[index];assert.equal(plot.progress,cropGoal(plot));
      assert.ok(cropYield(plot)>=1&&cropYield(plot)<=cropPotentialYield(plot));
      assert.ok(tasks.some(task=>task.kind==='plot'&&task.index===index&&task.type==='ready'));
    }
    assert.ok(view.me.plots[0].pestPeak>0);assert.ok(view.me.plots[1].weedPeak>=20);
    assert.equal(tasks.filter(task=>task.kind==='animal'&&task.type==='ready').length,2);
    assert.ok(tasks.some(task=>task.kind==='animal'&&task.index===1&&task.type==='urgent'));
    assert.equal(tasks.filter(task=>task.kind==='pond'&&task.type==='ready').length,1);
    assert.equal(tasks.filter(task=>task.kind==='pond'&&task.type==='urgent').length,1);
    assert.ok(view.me.pens.every(pen=>pen.fedUntil<now));
    const chicken=animalCondition(view.me.pens[0],now),pig=animalCondition(view.me.pens[2],now);
    assert.equal(chicken.label,'Sung sức');assert.equal(chicken.cycles,0);
    assert.equal(pig.yield,animals.pig.yield);
    const prior=previousVisit(mark,view),summary=returnSummary(prior,view,null);
    assert.equal(summary.minutes,hours*60);assert.deepEqual(visitMark(view).ready,{plot:2,animal:2,pond:1});
    assert.match(summary.rows[0].title,/2 ô cây/);
    assert.equal(view.me.pondBatches[0][0].progress,aquatic.tilapia.time);
    assert.ok(view.me.pondBatches[0][1].progress<aquatic.prawn.time);
    // Waiting longer never creates a second unattended production cycle.
    const later=snapshot(room,farm,now+24*hour);
    assert.equal(later.me.pens[0].progress,view.me.pens[0].progress);
    assert.equal(later.me.pens[1].progress,view.me.pens[1].progress);
    assert.equal(later.me.pondBatches[0][1].progress,view.me.pondBatches[0][1].progress);
    assert.equal(cropYield(later.me.plots[0]),cropYield(view.me.plots[0]));
  });
  test(`orders from before a ${hours} hour absence expire without taking goods or coins`,()=>{
    const {room,farm}=fixture(),old=orderList(dayAt(room,start),room)[0];
    const before=structuredClone(farm.inventory),coins=farm.coins;
    assert.throws(()=>apply(room,'a',{action:'order',index:old.id},start+hours*hour),/hết hạn/);
    assert.deepEqual(farm.inventory,before);assert.equal(farm.coins,coins);
    assert.ok(snapshot(room,farm,start+hours*hour).orders.every(order=>order.id!==old.id));
  });
}

test('seven-day catch-up and frequent projections agree without a hidden offline growth multiplier',()=>{
  const {room,farm}=fixture(),end=start+168*hour;
  for(const source of farm.plots.filter(Boolean)){
    const direct=projectPlot(room,source,end);let stepped=source;
    for(let time=start+300;time<=end;time+=300)stepped=projectPlot(room,stepped,time);
    assert.ok(Math.abs(direct.progress-stepped.progress)<1e-6);
    assert.ok(Math.abs(direct.pests-stepped.pests)<1e-6);
    assert.ok(Math.abs(direct.weeds-stepped.weeds)<1e-6);
    assert.equal(cropYield(direct),cropYield(stepped));
  }
  for(const source of farm.pens){
    const direct=projectAnimal(room,farm,source,end);let stepped=source;
    for(let time=start+300;time<=end;time+=300)stepped=projectAnimal(room,farm,stepped,time);
    assert.ok(Math.abs(direct.age-stepped.age)<1e-6);
    assert.ok(Math.abs(direct.progress-stepped.progress)<1e-6);
  }
});

test('all crop species survive a seven-day absence and retain ripe yield afterward',()=>{
  const {room}=fixture();
  for(const kind of Object.keys(crops))for(const hazard of ['pests','weeds']){
    const plot={kind,hazard,goal:crops[kind].time,progress:0,pests:0,weeds:0,at:start,wetUntil:0};
    const grown=projectPlot(room,plot,start+168*hour);
    assert.equal(grown.progress,cropGoal(grown),kind);
    assert.ok(Number.isFinite(cropYield(grown))&&cropYield(grown)>=1,kind);
    assert.deepEqual(projectPlot(room,grown,start+192*hour),grown);
  }
});

test('a full warehouse on return blocks harvest without deleting ripe crops or granting items',()=>{
  const {room,farm}=fixture(),now=start+168*hour;
  farm.inventory.wheat=30;
  const view=snapshot(room,farm,now),summary=returnSummary(visitMark(snapshot(room,farm,start)),view,null);
  assert.equal(summary.rows[1].title,'Kho đã đầy');
  const inventory=structuredClone(farm.inventory),coins=farm.coins;
  assert.throws(()=>apply(room,'a',{action:'harvest',index:0},now),/Kho/);
  assert.deepEqual(farm.inventory,inventory);assert.equal(farm.coins,coins);
  const after=snapshot(room,farm,now);
  assert.equal(after.me.plots[0].progress,cropGoal(after.me.plots[0]));
  assert.equal(after.me.plots[0].picked??0,0);
});
