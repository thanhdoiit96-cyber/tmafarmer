import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {avatars,avatarOf,apply,newRoom,newFarm,snapshot} from '../public/game.mjs';
import {avatarDetails,avatarKey,ageCharacterAtlases} from '../public/avatar-models.mjs';

test('gender and age resolve six persistent avatars without changing old IDs or farm progress',()=>{
  assert.equal(Object.keys(avatars).length,6);
  assert.equal(avatarOf('male'),'male');assert.equal(avatarOf('female'),'female');
  assert.equal(avatarOf('invalid'),'female');assert.equal(avatarOf(undefined),'female');
  const room=newRoom(1000),farm=room.farms.a=newFarm('a','A',1000,'male');
  room.farms.b=newFarm('b','B',1000);
  const progress={xp:farm.xp,coins:farm.coins,plots:structuredClone(farm.plots),inventory:{...farm.inventory}};
  for(const [id,info] of Object.entries(avatarDetails)){
    assert.equal(avatarKey(info.gender,info.age),id);
    apply(room,'a',{action:'avatar',item:id},1000);
    assert.equal(snapshot(room,farm,1000).me.avatar,id);
    assert.equal(snapshot(room,room.farms.b,1000).neighbors[0].id,farm.id);
    assert.equal(JSON.parse(JSON.stringify(room)).farms.a.avatar,id);
    assert.deepEqual({xp:farm.xp,coins:farm.coins,plots:farm.plots,inventory:farm.inventory},progress);
  }
  assert.throws(()=>apply(room,'a',{action:'avatar',item:'invalid'},1000),/không hợp lệ/);
});
test('all age variants ship complete base and six-action RGBA atlases',()=>{
  for(const [id,info] of Object.entries(ageCharacterAtlases)){
    for(const [kind,columns] of [['base',12],['actions',24]]){
      const png=readFileSync(new URL('../public'+info[kind],import.meta.url));
      assert.equal(png.readUInt32BE(16),columns*48,id+' '+kind);
      assert.equal(png.readUInt32BE(20),256,id+' four directions');
      assert.equal(png[25],6,id+' RGBA');
    }
  }
});
