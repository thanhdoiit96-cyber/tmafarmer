import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,buildings,crops,newFarm,newRoom,snapshot} from '../public/game.mjs';
import {goalAfterAction,goalStorageKey,goalView,loadGoal,noGoal,pinBuilding,pinIntro,reconcileGoal} from '../public/next-goal.mjs';

const now=100000;
function setup(){
  const room=newRoom(now),farm=newFarm('a','A',now);
  room.farms.a=farm;
  return {room,farm,view:()=>snapshot(room,farm,now)};
}
test('new-farm suggestions are opt-out, versioned and scoped by farm, mode and village',()=>{
  const {view}=setup(),s=view();
  assert.equal(loadGoal(null,s).kind,'intro');
  assert.equal(loadGoal(noGoal(),s).kind,'none');
  assert.equal(loadGoal({version:99,kind:'intro'},s).kind,'none');
  const old=structuredClone(s);old.me.xp=100;
  assert.equal(loadGoal(null,old).kind,'none');
  const keys=[goalStorageKey(s,null),goalStorageKey(s,{code:'AAAA'}),goalStorageKey(s,{code:'BBBB'}),goalStorageKey({...s,me:{...s.me,id:'b'}},null)];
  assert.equal(new Set(keys).size,4);
  assert.equal(goalStorageKey(s,{code:'AAAA',token:'first'}),goalStorageKey(s,{code:'AAAA',token:'other'}));
  assert.equal(loadGoal({version:1,kind:'building',building:'constructor',level:2},s).kind,'none');
});
test('a real first-crop loop requires successful harvest and quick sale, not viewing or listing',()=>{
  const {room,farm,view}=setup();let g=pinIntro(view());
  const run=input=>{const before=structuredClone(view());apply(room,'a',input,now);const after=view();g=reconcileGoal(goalAfterAction(g,input,before.me,after.me),after);};
  run({action:'plant',item:'wheat',index:0});
  assert.equal(g.crop.index,0);
  if(!view().weather.wet)run({action:'water',index:0});
  assert.equal(goalView(g,view()).route.kind,'weather');
  farm.plots[0].progress=crops.wheat.time;
  g=reconcileGoal(g,view());
  assert.equal(goalView(g,view()).route.kind,'plot');
  run({action:'harvest',index:0});
  assert.equal(g.stage,'sell');
  const saved=JSON.parse(JSON.stringify(g));
  assert.deepEqual(loadGoal(saved,view()),saved);
  run({action:'list',item:'wheat',qty:1,price:6});
  assert.equal(g.stage,'sell');
  run({action:'sell',item:'wheat',qty:1});
  assert.equal(g.stage,'done');
  assert.equal(goalView(g,view()).done,true);
});
test('missing seed, full storage and hardened beds change destinations without mutating farm data',()=>{
  const {farm,view}=setup();let s=view(),g=pinIntro(s);
  farm.inventory.wheatSeed=0;s=view();
  assert.equal(goalView(g,s).route.kind,'seed');
  farm.inventory.wheatSeed=2;farm.soilSince=now-40000;s=view();
  assert.match(goalView(g,s).title,/Cuốc/);
  farm.plots[0]={kind:'wheat',goal:crops.wheat.time,progress:crops.wheat.time,at:now,plantedAt:now,pests:0,picked:0,wetUntil:now+100};
  farm.inventory.carrot=30;s=view();g=pinIntro(s);g=reconcileGoal(g,s);
  const original=JSON.stringify(s);
  assert.equal(goalView(g,s).route.kind,'stock');
  assert.equal(JSON.stringify(s),original);
});
test('a disappeared or replaced crop is not a harvest; helper/offline harvest needs positive evidence',()=>{
  const {farm,view}=setup();
  farm.plots[0]={kind:'wheat',goal:crops.wheat.time,progress:100,at:now,plantedAt:now,pests:0,picked:0,wetUntil:now+100};
  const g=reconcileGoal(pinIntro(view()),view());
  const missing=view();missing.me.plots[0]=null;
  assert.equal(reconcileGoal(g,missing).stage,'plant');
  const replaced=view();replaced.me.plots[0].plantedAt=now+10;
  assert.equal(reconcileGoal(g,replaced).stage,'plant');
  const harvested=structuredClone(missing);harvested.me.xp+=4;harvested.me.inventory.wheat=3;
  assert.equal(reconcileGoal(g,harvested).stage,'sell');
  const seedOnly=structuredClone(missing);seedOnly.me.xp+=4;seedOnly.me.inventory.wheatSeed++;
  const next=reconcileGoal(g,seedOnly);
  assert.equal(next.stage,'sell');
  assert.equal(goalView(next,seedOnly).stage,0);
  assert.equal(goalAfterAction(g,{action:'harvest',index:1},view().me,harvested.me).stage,g.stage);
});
test('rain skips unnecessary watering; a legacy crop receives its stable timestamp without losing the goal',()=>{
  const {farm,view}=setup();farm.plots[0]={kind:'wheat',progress:100,goal:crops.wheat.time,at:now,pests:0,wetUntil:0};
  let s=view(),g=pinIntro(s);s.weather={...s.weather,wet:true};
  g=reconcileGoal(g,s);assert.equal(g.stage,'grow');
  s.me.plots[0].plantedAt=now-10;
  assert.equal(reconcileGoal(g,s).crop.plantedAt,now-10);
  assert.equal(g.crop.plantedAt,null);
});
test('building goals use engine costs/materials, survive reload and finish only at the selected level',()=>{
  const {farm,view}=setup();let s=view(),g=pinBuilding(farm,'workshop');
  assert.equal(g.level,1);assert.equal(goalView(g,s).done,undefined);
  assert.match(goalView(g,s).meta,/40/);assert.match(goalView(g,s).meta,/120/);
  assert.deepEqual(loadGoal(JSON.parse(JSON.stringify(g)),s),g);
  farm.workshop=1;s=view();assert.equal(goalView(g,s).done,true);
  farm.workshop=6;g=pinBuilding(farm,'workshop');s=view();
  assert.match(goalView(g,s).meta,/Keo tinh bột/);
  assert.match(goalView(g,s).meta,/Vải len dệt/);
  farm.workshop=(buildings.workshop.base??1)+buildings.workshop.costs.length;
  assert.equal(pinBuilding(farm,'workshop').kind,'none');
});
