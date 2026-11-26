import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,newRoom,newFarm,snapshot,projectPlot,cropGrowthRate,cropOutlook,cropYield,dayAt,gameDay} from '../public/game.mjs';
import {gardenPlotId} from '../public/land.mjs';
import {prankRules,prankAccess,prankActive} from '../public/prank.mjs';
import {playerLocationBlock,plotPosition} from '../public/world-layout.mjs';
import {cropImpacts} from '../public/crop-impact.mjs';
const now=20_000;
const crop=(at=now)=>({kind:'wheat',goal:10000,progress:3000,at,pests:4,weeds:0,pestPeak:4,weedPeak:0,wetUntil:0,protectedUntil:now+1e7,weedProtectedUntil:now+1e7,picked:0});
function setup(){
  const room=newRoom(now);
  for(let i=0;i<12;i++){
    const id=String(i);room.farms[id]=newFarm(id,'Vườn '+id,now);
    Object.assign(room.farms[id],{xp:70,prankJars:2,prankEnabled:true});
    room.farms[id].plots[0]=crop();
  }
  return room;
}
const send=(r,id,action,time=now,props={})=>apply(r,id,{action,...props},time);
const release=(r,id='1',target='0',time=now,index=0)=>send(r,id,'releasePrank',time,{target,index});
test('prank defaults off, requires both ranks, permission, open gate, jar and appropriate crop',()=>{
  const r=setup(),owner=r.farms[0],actor=r.farms[1];
  delete owner.prankEnabled;assert.throws(()=>release(r),/chưa cho phép/);
  owner.prankEnabled=true;owner.xp=69;assert.throws(()=>release(r),/cấp 3/);
  owner.xp=70;actor.xp=69;assert.throws(()=>release(r),/cấp 3/);
  actor.xp=70;owner.shieldUntil=now+10;assert.throws(()=>release(r),/Cổng/);
  owner.shieldUntil=0;actor.prankJars=0;assert.throws(()=>release(r),/chưa có lọ/);
  actor.prankJars=2;
  for(const progress of [0,2499,9000,10000]){owner.plots[0].progress=progress;assert.throws(()=>release(r),/giai đoạn/);}
  owner.plots[0].progress=2500;owner.plots[0].weeds=20;assert.throws(()=>release(r),/tự nhiên/);
  owner.plots[0].weeds=0;owner.plots[0].pests=20;assert.throws(()=>release(r),/tự nhiên/);
  owner.plots[0]=null;assert.throws(()=>release(r),/chưa có cây/);
  assert.throws(()=>release(r,'1','1'),/hàng xóm/);
  assert.equal(actor.prankJars,2);assert.equal(actor.prankDaily,undefined);
});
test('twelve villagers cannot stack or exceed received quota and immunity survives midnight',()=>{
  const r=setup(),owner=r.farms[0],before=structuredClone(owner.plots[0]);
  release(r);assert.equal(r.farms[1].prankJars,1);
  for(let i=2;i<12;i++)assert.throws(()=>release(r,String(i)),/đang có sâu/);
  assert.equal(owner.prankDaily.received,1);assert.equal(owner.plots[0].pests,before.pests);
  assert.equal(owner.plots[0].pestPeak,before.pestPeak);
  send(r,'0','catchPrank',now+30,{index:0});
  const immunity=owner.prankImmuneUntil;
  assert.equal(immunity,now+180+1800);
  for(let i=2;i<12;i++)assert.throws(()=>release(r,String(i),'0',now+31),/miễn nhận/);
  send(r,'0','prankPreference',now+40,{item:'off'});send(r,'0','prankPreference',now+41,{item:'on'});
  assert.equal(owner.prankImmuneUntil,immunity);
  owner.plots[0]=crop(immunity);release(r,'2','0',immunity);
  owner.plots[0]=crop(immunity*2);assert.throws(()=>release(r,'3','0',now+4000),/2 lượt nghịch/);
  assert.equal(owner.prankDaily.received,2);
  const r2=setup(),boundary=now+gameDay;
  r2.farms[0].plots[0]=crop(boundary-10);release(r2,'1','0',boundary-10);
  assert.throws(()=>release(r2,'2','0',boundary+181),/miễn nhận/);
});
test('actor quotas remain independent from theft and help, including expanded IDs',()=>{
  const r=setup();release(r,'1','0');
  const a=r.farms[1],owner=r.farms[0];
  assert.equal(snapshot(r,a,now).me.daily.taken,0);assert.equal(snapshot(r,a,now).me.neighborHelp.given,0);
  assert.equal(a.xp,70);assert.equal(a.coins,100);assert.equal(a.wellness,undefined);
  owner.inventory.wheat=4;
  send(r,'1','steal',now,{target:'0',source:'barn',item:'wheat'});
  send(r,'1','helpWater',now,{target:'0',index:0});
  const social=snapshot(r,a,now).me;
  assert.equal(social.daily.taken,1);assert.equal(social.neighborHelp.given,1);assert.equal(social.prankDaily.given,1);
  owner.plots[0]=crop(now+2000);assert.throws(()=>release(r,'1','0',now+2000),/vườn này hôm nay/);
  const index=gardenPlotId(0,3);r.farms[2].land[0]={kind:'garden',expanded:true};r.farms[2].extraPlots[index]=crop();
  release(r,'1','2',now,index);assert.ok(r.farms[2].extraPlots[index].prank);assert.equal(r.farms[2].plots[0].prank,undefined);
  assert.throws(()=>release(r,'1','3'),/2 lượt nghịch/);
  assert.equal(a.prankJars,0);
});
test('growth is slowed only within absolute interval and never directly changes natural damage or yield',()=>{
  const r=setup(),base=crop();base.pests=0;base.pestPeak=0;
  const prank={...base,prank:{startedAt:now+50,until:now+230}};
  const normal=projectPlot(r,base,now+300),changed=projectPlot(r,prank,now+300);
  const weather={id:'sun',crop:1,pests:0,name:'Nắng'};
  const rate=cropGrowthRate(base,weather,false,0);
  assert.ok(Math.abs(normal.progress-changed.progress-rate*18)<1e-7);
  assert.equal(changed.pests,normal.pests);assert.equal(changed.weeds,normal.weeds);
  assert.equal(changed.pestPeak,normal.pestPeak);assert.equal(cropYield(changed),cropYield(normal));
  const active=projectPlot(r,prank,now+100),outlook=cropOutlook(active,weather,now+100);
  assert.equal(outlook.rate,rate*.9);assert.deepEqual(cropImpacts(active,weather,outlook).at(-1),{label:'Sâu nghịch · tạm thời',growth:-10,yield:0});
  assert.equal(prankActive(changed,now+300),false);
  const expiredOutlook=cropOutlook(changed,weather,now+300);assert.equal(expiredOutlook.rate,rate);
});
test('catch and opt out first settle elapsed progress then remove effect without rewriting past time',()=>{
  for(const action of ['catchPrank','prankPreference']){
    const r=setup();release(r);
    const owner=r.farms[0],before=structuredClone(owner.plots[0]);
    const expected=projectPlot(r,before,now+60);
    send(r,'0',action,now+60,{index:0,item:'off'});
    assert.equal(owner.plots[0].progress,expected.progress);assert.equal(owner.plots[0].prank.until,now+60);
    assert.equal(owner.prankActive,null);assert.equal(r.farms[1].prankJars,1);
    assert.equal(owner.inventory.spray,1);assert.equal(owner.xp,70);assert.equal(owner.wellness,undefined);
    const later=projectPlot(r,owner.plots[0],now+240),noPrank={...owner.plots[0]};delete noPrank.prank;
    assert.equal(later.progress,projectPlot(r,noPrank,now+240).progress);
  }
});
test('long absence agrees with continuous simulation across weather, wetness, fertilizer and hazards',()=>{
  for(const hazard of ['pests','weeds'])for(const fertilized of [false,true]){
    const r=setup(),at=now+7190;
    const p={...crop(at),hazard,goal:1000000,progress:300000,protectedUntil:at+61,weedProtectedUntil:at+61,wetUntil:at+75,fertilized,prank:{startedAt:at+1,until:at+181}};
    const end=at+7*86400;
    const once=projectPlot(r,p,end);let stepped=p;
    for(let t=at+60;t<end;t+=60)stepped=projectPlot(r,stepped,t);
    stepped=projectPlot(r,stepped,end);
    for(const key of ['progress','pests','weeds','pestPeak','weedPeak'])assert.ok(Math.abs(once[key]-stepped[key])<1e-5,key);
    assert.equal(cropYield(once),cropYield(stepped));
    assert.equal(once.prank.until,at+181);
  }
});
test('lake jar exchange shares daily package cap, respects rank and capacity and cannot enter market inventory',()=>{
  const r=setup(),a=r.farms[1];a.lakeMarks=6;
  assert.throws(()=>send(r,'1','lakeExchange',now,{item:'prankJar'}),/2 lọ/);
  a.prankJars=0;a.xp=69;assert.throws(()=>send(r,'1','lakeExchange',now,{item:'prankJar'}),/cấp 3/);
  assert.equal(a.lakeMarks,6);a.xp=70;send(r,'1','lakeExchange',now,{item:'prankJar'});
  assert.equal(a.lakeMarks,4);assert.equal(a.prankJars,1);assert.equal(a.inventory.prankJar,undefined);
  assert.throws(()=>send(r,'1','lakeExchange',now,{item:'aquaFeed'}),/hôm nay/);
  assert.throws(()=>send(r,'1','buy',now,{item:'prankJar'}));assert.throws(()=>send(r,'1','list',now,{item:'prankJar',price:1,qty:1}));
  send(r,'1','lakeExchange',now+gameDay,{item:'prankJar'});assert.equal(a.prankJars,2);
});
test('prank plot location distinguishes own and exact visited plots, including zero',()=>{
  const p=plotPosition(0),pose={x:p.x,y:p.y+8};
  assert.equal(playerLocationBlock({action:'releasePrank',index:0},'visit',pose),'');
  assert.ok(playerLocationBlock({action:'releasePrank',index:0},'field',pose));
  assert.equal(playerLocationBlock({action:'catchPrank',index:0},'field',pose),'');
  assert.ok(playerLocationBlock({action:'catchPrank',index:0},'visit',pose));
});
