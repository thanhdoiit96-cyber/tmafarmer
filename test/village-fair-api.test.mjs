import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../server/worker.mjs';
import {localSpeechNamespace} from '../server/scene-speech.mjs';

test('fair flag, authoritative position, retry and concurrent last contribution preserve stock/rewards',async()=>{
 const db=new DatabaseSync(':memory:');
 try{
  for(const name of ['0000_rooms','0001_scene_social','0002_accounts'])db.exec(readFileSync(new URL('../drizzle/'+name+'.sql',import.meta.url),'utf8'));
  const DB={prepare(sql){const q=db.prepare(sql);return {bind(...args){return {first:async()=>q.get(...args),all:async()=>({results:q.all(...args)}),run:async()=>({meta:q.run(...args)})}}}}};
  const env={DB,CHAT:localSpeechNamespace()};
  const api=async(path,data,s)=>{const r=await worker.fetch(new Request('https://fair.test/api/'+path,{method:data?'POST':'GET',headers:s?{authorization:'Bearer '+s.token,'x-room-code':s.code}:{},body:data?JSON.stringify(data):undefined}),env);return {status:r.status,...await r.json()}};
  const legacy=await api('join',{name:'Cũ'});assert.equal(legacy.state.villageDrive.version,2);
  env.VILLAGE_FAIR_ENABLED='true';assert.equal((await api('state',null,legacy)).state.villageDrive.version,2);
  const a=await api('join',{name:'Vườn A'}),b=await api('join',{name:'Vườn B',code:a.code});assert.equal(a.state.villageDrive.version,3);
  const row=db.prepare('SELECT state FROM farm_rooms WHERE code=?').get(a.code),room=JSON.parse(row.state);
  for(const f of Object.values(room.farms))Object.assign(f.inventory,{wheat:6,carrot:10,bread:6,carrotJuice:4});
  db.prepare('UPDATE farm_rooms SET state=? WHERE code=?').run(JSON.stringify(room),a.code);
  const index=a.state.villageDrive.id;
  const action=(s,item,qty,stallId,requestId=crypto.randomUUID())=>api('action',{action:'villageGoods',index,item,qty,stallId,requestId},s);
  assert.equal((await action(a,'wheat',1,'bread')).status,400);
  const enter=(s,x,y)=>api('scene',{area:'market',pose:{x,y,facing:'up',walking:false}},s);
  await enter(a,88,170);await enter(b,88,170);
  const key=crypto.randomUUID();const first=await action(a,'wheat',5,'bread',key);assert.equal(first.status,200);
  assert.equal((await action(a,'wheat',5,'bread',key)).status,200);
  assert.equal((await api('state',null,a)).state.me.inventory.wheat,1);
  await enter(a,296,160);assert.equal((await action(a,'carrot',6,'garden')).status,200);
  await enter(a,392,179);assert.equal((await action(a,'carrotJuice',2,'drinks')).status,200);
  await enter(a,88,170);
  const results=await Promise.all([action(a,'wheat',1,'bread'),action(b,'wheat',1,'bread')]);
  assert.equal(results.filter(r=>r.status===200).length,1);
  const view=(await api('state',null,a)).state;assert.equal(view.villageDrive.completed,true);assert.equal(view.me.decorVouchers,1);
  assert.equal(view.villageDrive.mine.quantity,results[0].status===200?14:13);
  env.VILLAGE_FAIR_ENABLED='false';assert.equal((await api('state',null,a)).state.villageDrive.version,3);
 }finally{db.close()}
});
