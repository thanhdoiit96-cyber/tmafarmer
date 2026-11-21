import test from 'node:test';
import assert from 'node:assert/strict';
import {newFarm} from '../public/game.mjs';
import {features,maps,route,walkable} from '../public/world-layout.mjs';
import {marketShoppers,marketShopperPose} from '../public/market-life.mjs';

const scene=features('market',{me:newFarm('a','a',0),neighbors:[]});
test('market counters and well stay solid while all interaction points remain outside and reachable',()=>{
  for(const point of scene.hotspots){
    assert.ok(walkable(scene,point.x,point.y),point.label);
    assert.ok(route(scene,maps.market.spawn,[point.x,point.y])?.length,point.label);
  }
  for(const [x,y] of [[85,100],[240,80],[395,105],[239,210]])assert.equal(walkable(scene,x,y),false);
});
test('market shoppers walk in clear foreground lanes and pause without teleporting',()=>{
  for(const shopper of marketShoppers){
    const frames=new Set();
    let previous;
    for(let t=0;t<80;t+=.05){
      const pose=marketShopperPose(shopper,t);
      assert.ok(walkable(scene,pose.x,pose.y));
      assert.ok(pose.y-40>=154,'full head below the baked stalls');
      assert.ok(pose.x>=shopper.x&&pose.x<=shopper.end);
      if(previous)assert.ok(Math.abs(pose.x-previous.x)<=.601);
      frames.add(pose.frame);previous=pose;
    }
    assert.equal(frames.size,4);
    assert.deepEqual(marketShopperPose(shopper,0,true),marketShopperPose(shopper,80,true));
  }
});
