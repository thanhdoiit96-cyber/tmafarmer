import test from 'node:test';
import assert from 'node:assert/strict';
import {cropFrame,cropGrowthLabels,cropPlacement,cropTaskPosition} from '../public/pixel/crop-layout.mjs';
import {cropGoal,crops} from '../public/game.mjs';

test('crop stages share a centered footprint and keep their marker clear of the canopy',()=>{
  for(const kind of Object.keys(crops)){
    assert.equal(cropGrowthLabels[kind].length,4);
    for(const fraction of [0,.25,.5,1]){
      const data={kind};
      data.progress=fraction*cropGoal(data);
      const plot={x:176,y:106,data};
      const art=cropPlacement(plot);
      const badge=cropTaskPosition(plot);
      assert.ok(Math.abs(art.x+art.width/2-plot.x)<=.375);
      assert.ok(Math.abs(art.y+art.height-(plot.y+6))<=.375);
      assert.ok(badge.y+6.8<art.y);
    }
  }
  assert.equal(cropPlacement({x:176,y:106,data:{kind:'unknown'}}),null);
});

test('visitors see the actual growth stage and each new atlas row fits the 48 pixel cells',()=>{
  for(const kind of ['tomato','sunflower','strawberry','grape','tea','truffle','sweetPotato','pumpkin','peanut']){
    for(let stage=0;stage<4;stage++){
      const cell=cropFrame(kind,stage);
      const art=cropPlacement({x:176,y:106,data:{kind,stage},visit:true});
      assert.equal(cell.source,'/pixel/crop-stages-v2.png');
      assert.equal(art.sx,stage*48+cell.bounds[0]);
      assert.ok(cell.bounds.every(edge=>edge>=0&&edge<=48));
      assert.ok(cell.y+cell.bounds[3]<=432);
    }
  }
});
