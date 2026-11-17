import test from 'node:test';
import assert from 'node:assert/strict';
import {cropPlacement,cropTaskPosition} from '../public/pixel/crop-layout.mjs';
import {cropGoal} from '../public/game.mjs';

test('crop stages share a centered footprint and keep their marker clear of the canopy',()=>{
  for(const kind of ['wheat','carrot','corn']){
    for(const fraction of [0,.25,.5,1]){
      const data={kind};
      data.progress=fraction*cropGoal(data);
      const plot={x:176,y:106,data};
      const art=cropPlacement(plot);
      const badge=cropTaskPosition(plot,true);
      assert.ok(Math.abs(art.x+art.width/2-plot.x)<=.375);
      assert.ok(Math.abs(art.y+art.height-(plot.y+6))<=.375);
      assert.ok(badge.y+6.8<art.y);
    }
  }
  assert.equal(cropPlacement({x:176,y:106,data:{kind:'grape'}}),null);
});
