import assert from 'node:assert/strict';
import test from 'node:test';
import {cropImpacts} from '../public/crop-impact.mjs';
import {cropOutlook} from '../public/game.mjs';

test('crop impact percentages agree with engine rate and actual rounded yield damage',()=>{
  const plot={kind:'corn',goal:1500,progress:100,pests:45,pestPeak:45,fertilized:true};
  const weather={id:'sun',name:'Nắng',crop:1.1,wet:false};
  const outlook=cropOutlook(plot,weather,10000),rows=cropImpacts(plot,weather,outlook);
  assert.deepEqual(rows.map(row=>row.growth),[19,-35,-32,30]);
  assert.equal(rows[0].yield,18);
  assert.equal(rows[2].yield,-Math.round((outlook.potential-outlook.total)/outlook.potential*100));
  assert.equal(rows[3].yield,25);
});

test('weeding clears the speed penalty but retains the displayed harvest loss',()=>{
  const plot={kind:'coffee',goal:5700,progress:100,hazard:'weeds',weeds:0,weedPeak:75};
  const weather={id:'rain',name:'Mưa',crop:1,wet:true};
  const rows=cropImpacts(plot,weather,cropOutlook(plot,weather,10000));
  assert.equal(rows[1].growth,38);
  assert.equal(rows[2].growth,0);
  assert.ok(rows[2].yield<0);
  assert.match(rows[2].label,/đã tích lũy/);
  assert.deepEqual(rows[3],{label:'Chưa bón phân',growth:0,yield:0});
});
