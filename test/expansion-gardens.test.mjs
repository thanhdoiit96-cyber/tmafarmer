import assert from 'node:assert/strict';
import test from 'node:test';
import {apply,newFarm,newRoom,snapshot,crops,gardenHelperTargets,advanceGardenHelpers} from '../public/game.mjs';
import {farmTasks} from '../public/tasks.mjs';
import {cropIndexes,gardenPlotId,gardenForPlot,gardenPlotSlot,gardenPlotCount,gardenUpgradeCost,mainPlotId,mainPlotSlot,lotRect,plotPosition} from '../public/land.mjs';
import {features,maps,route} from '../public/world-layout.mjs';

const now=1000;
function setup(){
  const room=newRoom(now);
  room.farms.a=newFarm('a','A',now);room.farms.b=newFarm('b','B',now);
  Object.assign(room.farms.a,{coins:5000,plots:Array(30).fill(null)});
  return room;
}
const act=(room,action,index,item,time=now)=>apply(room,'a',{action,index,item},time);

test('garden upgrade preserves all existing crop IDs and saved assets, and unlocks only the paid row',()=>{
  const room=setup(),farm=room.farms.a;
  act(room,'buildLand',0,'garden');act(room,'decorate',0,'bamboo');
  act(room,'plant',12,'wheat');act(room,'plant',mainPlotId(12),'carrot');
  const before=structuredClone(farm),newId=gardenPlotId(0,3);
  const wealthBefore=snapshot(room,farm,now).wealth.find(row=>row.id==='a').total;
  assert.throws(()=>act(room,'plant',newId,'wheat'),/Ô đất không tồn tại/);
  act(room,'upgradeGarden',0);
  assert.equal(farm.coins,before.coins-gardenUpgradeCost);
  assert.equal(snapshot(room,farm,now).wealth.find(row=>row.id==='a').total,wealthBefore);
  assert.equal(farm.land[0].fence,'bamboo');
  assert.deepEqual(farm.extraPlots[12],before.extraPlots[12]);
  assert.deepEqual(farm.plots,before.plots);
  assert.deepEqual(farm.inventory,before.inventory);
  assert.equal(gardenPlotCount(farm.land[0]),6);
  assert.equal(farm.soilAt[newId],now);
  const paidCoins=farm.coins;
  assert.throws(()=>act(room,'upgradeGarden',0),/đủ 6 ô/);
  assert.equal(farm.coins,paidCoins);
  act(room,'plant',newId,'wheat');act(room,'water',newId);
  const saved=JSON.parse(JSON.stringify(room));
  assert.equal(saved.farms.a.extraPlots[newId].kind,'wheat');
  assert.equal(cropIndexes(saved.farms.a).length,36);
  const own=snapshot(saved,saved.farms.a,now),guest=snapshot(saved,saved.farms.b,now);
  assert.equal(own.me.extraPlots[newId].kind,'wheat');
  assert.equal(guest.neighbors[0].extraPlots[newId].kind,'wheat');
  assert.ok(own.me.plotIndexes.includes(newId));
  assert.ok(guest.neighbors[0].plotIndexes.includes(newId));
  act(saved,'harvest',newId,undefined,now+crops.wheat.time*3);
  assert.equal(saved.farms.a.extraPlots[newId],null);
  assert.ok(saved.farms.a.inventory.wheat>0);
});

test('garden upgrades reject invalid, unowned and non-garden parcels without charging',()=>{
  const room=setup(),farm=room.farms.a;
  act(room,'buildLand',1,'coop');
  for(const index of [-1,8,1.5,undefined,0,1,7]){
    const before=JSON.stringify(farm);
    assert.throws(()=>act(room,'upgradeGarden',index));
    assert.equal(JSON.stringify(farm),before);
  }
  act(room,'buildLand',0,'garden');farm.coins=gardenUpgradeCost-1;
  assert.throws(()=>act(room,'upgradeGarden',0));
  assert.equal(farm.land[0].expanded,undefined);
  assert.equal(gardenPlotCount(farm.land[0]),3);
});

test('new parcel row uses correct task labels and the existing paid helper harvest flow',()=>{
  const room=setup(),farm=room.farms.a;
  farm.land[7]={kind:'garden',expanded:true};
  const index=gardenPlotId(7,5);
  farm.extraPlots[index]={kind:'wheat',goal:crops.wheat.time,progress:crops.wheat.time,at:now,pests:0,picked:0,wetUntil:now+1000,protectedUntil:0};
  const view=snapshot(room,farm,now);
  assert.match(farmTasks(view).find(task=>task.index===index).label,/Vườn ô 8 · luống 6/);
  const target=gardenHelperTargets(view.me,'harvest',view.weather,now).find(row=>row.index===index);
  assert.ok(target);
  apply(room,'a',{action:'hireGardenHelper',item:'harvest',plots:[index],expectedSpace:target.space},now);
  const ends=farm.gardenHelperJob.endsAt;
  assert.equal(advanceGardenHelpers(room,ends),true);
  assert.equal(farm.extraPlots[index],null);
  assert.equal(farm.gardenHelperReport.completed,1);
  assert.equal(farm.inventory.wheat,target.space);
});

test('all eight six-bed gardens have unique IDs, equal boundaries and reachable owner/visitor hotspots',()=>{
  const room=setup(),farm=room.farms.a;
  farm.land=Array.from({length:8},()=>({kind:'garden',expanded:true,fence:'wood'}));
  const indexes=cropIndexes(farm);
  assert.equal(indexes.length,78);
  assert.equal(new Set(indexes).size,78);
  for(let lot=0;lot<8;lot++)for(let slot=0;slot<6;slot++){
    const id=gardenPlotId(lot,slot),pos=plotPosition(id),area=lotRect(lot);
    assert.equal(gardenForPlot(id),lot);assert.equal(gardenPlotSlot(id),slot);
    assert.equal(mainPlotSlot(id),-1);
    if(slot<3)assert.equal(id,12+lot*3+slot);
    assert.ok(pos.x-20>area.x&&pos.x+20<area.x+area.w);
    assert.ok(pos.y-30>area.y&&pos.y+13<area.y+area.h);
  }
  for(let slot=0;slot<30;slot++)assert.equal(mainPlotSlot(mainPlotId(slot)),slot);
  const own=snapshot(room,farm,now),guest=snapshot(room,room.farms.b,now);
  for(const [id,state,neighbor] of [['field',own,undefined],['visit',guest,guest.neighbors[0]]]){
    const scene=features(id,state,neighbor);
    for(const point of scene.hotspots.filter(p=>p.type==='plot'||p.type==='land')){
      const path=route(scene,maps[id].spawn,[point.x,point.y]);
      assert.ok(path?.length,point.label);
      assert.ok(Math.hypot(path.at(-1)[0]-point.x,path.at(-1)[1]-point.y)<31,point.label);
    }
    assert.equal(scene.actors.filter(a=>a.type==='garden-reserve').length,0);
  }
  farm.land[0].expanded=false;
  assert.equal(features('field',snapshot(room,farm,now)).actors.filter(a=>a.type==='garden-reserve').length,3);
});
