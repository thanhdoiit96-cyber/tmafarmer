import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {additionalLivestockAtlas,livestockAtlas,progressionLivestockAtlas} from '../public/pixel/frames.mjs';
import {animals} from '../public/game.mjs';
import {animalPose} from '../public/world-motion.mjs';

const kinds=['chicken','cow','quail','buffalo'];

test('chicken, cow, quail and buffalo share a four-pose sheep-style atlas',()=>{
  const atlas=progressionLivestockAtlas;
  assert.equal(atlas.source,'/pixel/progression-livestock-v2.png');
  for(const kind of kinds){
    const poses=atlas.poses[kind];
    assert.deepEqual(Object.keys(poses),['idle','walkA','walkB','feed']);
    assert.deepEqual(Object.values(poses).map(([,y])=>y),[0,48,96,144]);
    assert.ok(Object.values(poses).every(([x,,w,h])=>x%56===0&&w===56&&h===48));
  }
  const png=readFileSync(new URL('../public/pixel/progression-livestock-v2.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),224);
  assert.equal(png.readUInt32BE(20),192);
  assert.equal(png[25],6,'livestock atlas must keep RGBA transparency');
});

test('livestock motion selects alternating walk poses and the shared feed pose',()=>{
  assert.equal(animalPose({state:'idle',elapsed:0}),'idle');
  assert.equal(animalPose({state:'walk',distance:1},9),'walkB');
  assert.equal(animalPose({state:'walk',distance:5},9),'walkA');
  assert.equal(animalPose({state:'peck',elapsed:.2}),'feed');
  assert.equal(animalPose({state:'graze',elapsed:.2}),'feed');
});

test('every farm animal has authored pixel art, including pig and duck',()=>{
  const atlases=[additionalLivestockAtlas,progressionLivestockAtlas,livestockAtlas];
  for(const kind of Object.keys(animals)){
    const atlas=atlases.find(candidate=>candidate.frames[kind]);
    assert.ok(atlas,`${kind} has an illustration`);
    if(atlas.poses?.[kind])assert.deepEqual(Object.keys(atlas.poses[kind]),['idle','walkA','walkB','feed']);
  }
  assert.equal(additionalLivestockAtlas.source,'/pixel/additional-livestock-v1.png');
  for(const kind of ['pig','duck']){
    assert.deepEqual(Object.keys(additionalLivestockAtlas.poses[kind]),['idle','walkA','walkB','feed']);
  }
  const png=readFileSync(new URL('../public/pixel/additional-livestock-v1.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),112);
  assert.equal(png.readUInt32BE(20),192);
  assert.equal(png[25],6,'pig and duck atlas must keep RGBA transparency');
});
