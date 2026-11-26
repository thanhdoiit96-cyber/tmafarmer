import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lakeElder,lakeElderFrame,lakeElderGreeting,lakeElderVoice,lakeEntry,lakeShelter} from '../public/lake-elder.mjs';
import {avatarDetails} from '../public/avatar-models.mjs';
import {features,maps,route,walkable,interactionRange} from '../public/world-layout.mjs';
import {newFarm,newRoom,snapshot,weather} from '../public/game.mjs';
import {lakeElderAtlas} from '../public/pixel/frames.mjs';

test('lake NPC has its own sprite and reachable approach without obstructing shore, well or docks',()=>{
  const room=newRoom(1000);room.farms.a=newFarm('a','Vườn A',1000);
  const view=snapshot(room,room.farms.a,1000),scene=features('lake',view);
  const elder=scene.actors.filter(a=>a.type===lakeElder.type),point=scene.hotspots.find(p=>p.type===lakeElder.type);
  assert.equal(elder.length,1);assert.equal(point.hitBox,lakeElder.hitBox);
  assert.ok(Math.hypot(point.x-lakeElder.x,point.y-lakeElder.y)<interactionRange);
  for(const target of [lakeElder.approach,lakeElder,{x:326,y:350},{x:217,y:339},{x:178,y:245},{x:590,y:245}]){
    assert.ok(walkable(scene,target.x,target.y));
    assert.ok(route(scene,maps.lake.spawn,[target.x,target.y])?.length);
  }
  assert.equal(scene.actors.filter(a=>a.type==='lake-shelter').length,1);
  assert.ok(!scene.actors.some(a=>a.type==='pavilion'));
  assert.equal(walkable(scene,lakeShelter.x-29,lakeShelter.y-8),false,'left post solid');
  assert.equal(walkable(scene,lakeElder.x,lakeElder.y),true,'open shelter floor');
  assert.deepEqual(maps.lake.spawn,lakeEntry);
  assert.deepEqual(maps.field.exits.find(e=>e.next==='lake').arrival,lakeEntry);
  for(const id of ['field','coop','market','neighbors'])assert.ok(!features(id,view).actors.some(a=>a.type===lakeElder.type));
  // NPC dialogue/animation are pure presentation: no reward or farm persistence.
  const afterSnapshot=JSON.stringify(room);
  for(const condition of weather)assert.ok(lakeElderGreeting(condition.id));
  assert.equal(JSON.stringify(room),afterSnapshot);
});

test('all avatars use age and gender appropriate address in every weather and reply',()=>{
  const expected={female:'cháu',male:'cháu','female-middle':'cô','male-middle':'chú','female-elder':'bà','male-elder':'ông'};
  for(const [avatar,detail]of Object.entries(avatarDetails)){
    assert.equal(lakeElderVoice(avatar).visitor,expected[avatar]);
    for(const condition of weather){
      const greeting=lakeElderGreeting(condition.id,avatar);
      assert.ok(greeting.toLowerCase().includes(expected[avatar]));
      assert.ok(!greeting.includes('{'));
      if(detail.age!=='young')assert.doesNotMatch(greeting,/cháu/iu);
    }
    if(detail.age!=='young')assert.doesNotMatch(lakeElderVoice(avatar).farewell,/cháu/iu);
  }
  assert.equal(lakeElderVoice('old-unknown').visitor,'cháu');
});

test('NPC idle freezes under reduced motion, blinks briefly and keeps a dedicated RGBA sheet',()=>{
  const frames=new Set();
  for(let t=0;t<6;t+=.05){frames.add(lakeElderFrame(t));assert.equal(lakeElderFrame(t,true),0);}
  assert.deepEqual([...frames].sort(),[0,1,2,3]);
  assert.match(lakeElderGreeting('storm'),/nghỉ thả câu/);
  assert.match(lakeElderGreeting('fog'),/khó gặp/);
  assert.equal(lakeElderGreeting('unknown'),lakeElderGreeting('sun'));
  const png=readFileSync(new URL('../public'+lakeElderAtlas.source,import.meta.url));
  assert.equal(png.readUInt32BE(16),48*4);assert.equal(png.readUInt32BE(20),64);
  assert.equal(png[25],6,'RGBA PNG');
});
