import test from 'node:test';
import assert from 'node:assert/strict';
import { farmRanks, farmProgress, crops, animals } from '../public/game.mjs';
import { cropFrame } from '../public/pixel/crop-layout.mjs';
import { validateProgression } from '../scripts/progression.mjs';

test('farm ranks have continuous levels and strictly increasing XP thresholds', () => {
  assert.deepEqual(farmRanks.map(rank => rank.level), farmRanks.map((_, index) => index + 1));
  assert.ok(farmRanks.every((rank, index) => index === 0 || rank.xp > farmRanks[index - 1].xp));
  assert.equal(farmProgress({ xp: 15999 }).nextRank.level, 13);
  assert.equal(farmProgress({ xp: 16000 }).rank.level, 13);
  assert.equal(farmProgress({ xp: 20000 }).nextRank, null);
});

test('every crop and animal gate is covered by the progression art and content checks', () => {
  assert.deepEqual(validateProgression(), []);
  assert.ok(Object.keys(crops).includes('coffee'));
  assert.ok(Object.keys(animals).includes('buffalo'));
  for (const key of ['coffee', 'lotus', 'dragonfruit', 'blackRice']) {
    for (let stage = 0; stage < 4; stage++) assert.equal(cropFrame(key, stage).source, '/pixel/progression-crops-v2.png');
  }
});
