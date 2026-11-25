import assert from 'node:assert/strict';
import test from 'node:test';
import {cropOutlook,cropGoal,newRoom,projectPlot,weatherAt} from '../public/game.mjs';

test('current-condition ETA agrees with engine progress before conditions change',()=>{
  const now=10000,room=newRoom(now),weather=weatherAt(room,now);
  for(const wet of [false,true])for(const pressure of [0,55])for(const fertilized of [false,true]){
    const plot={kind:'corn',goal:1500,progress:100,at:now,pests:pressure,
      protectedUntil:now+500,wetUntil:wet?now+500:0,fertilized};
    const before=structuredClone(plot),view=cropOutlook(plot,weather,now);
    const advanced=projectPlot(room,plot,now+10);
    assert.ok(Math.abs((advanced.progress-plot.progress)/10-view.rate)<1e-8);
    assert.equal(view.seconds,Math.ceil((cropGoal(plot)-plot.progress)/view.rate));
    assert.deepEqual(plot,before);
  }
});

test('weeding restores speed but does not restore accumulated yield loss',()=>{
  const weather={id:'sunny',crop:1,wet:false};
  const damaged={kind:'corn',goal:1500,progress:800,hazard:'weeds',weeds:75,weedPeak:75};
  const before=cropOutlook(damaged,weather,10000);
  const after=cropOutlook({...damaged,weeds:0},weather,10000);
  assert.ok(after.seconds<before.seconds);
  assert.equal(after.total,before.total);
  assert.ok(after.lost>0);
});

test('ripe legacy plots and partial harvest show remaining actual yield',()=>{
  const plot={kind:'corn',progress:175,pests:0,picked:2};
  const view=cropOutlook(plot,{id:'rain',crop:1,wet:true},10000);
  assert.equal(view.ripe,true);
  assert.equal(view.seconds,0);
  assert.equal(view.remaining,view.total-2);
  assert.equal(cropOutlook({...plot,picked:99},{id:'rain',crop:1,wet:true},10000).remaining,0);
});
