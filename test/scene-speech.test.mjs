import assert from 'node:assert/strict';
import test from 'node:test';
import {SceneSpeechBuffer} from '../server/scene-speech.mjs';

test('only the latest nearby message is visible for five seconds, and retries cannot revive it',()=>{
  const chat=new SceneSpeechBuffer();
  const post=(nonce,text,now)=>chat.exchange('a',['a'],now,{nonce,text});
  post('one','Chào làng!',1000);
  assert.deepEqual(chat.exchange('b',['b'],1001).messages,[]);
  assert.equal(chat.exchange('b',['a','b'],1001).messages[0].text,'Chào làng!');
  post('two','Ra hồ nhé!',2000);
  post('two','Lặp lại',3000);
  const notes=chat.exchange('b',['a','b'],6999).messages;
  assert.equal(notes.length,1);
  assert.equal(notes[0].text,'Ra hồ nhé!');
  assert.equal(notes[0].expires,7000);
  assert.deepEqual(chat.exchange('b',['a','b'],7000).messages,[]);
});

test('chat rate limiting expires without writing to storage',()=>{
  const chat=new SceneSpeechBuffer();
  const post=(nonce,now)=>chat.exchange('a',['a'],now,{nonce,text:'Chào!'});
  for(const nonce of ['one','two','three'])assert.ok(post(nonce,1000).messages.length);
  assert.equal(post('four',6999).status,429);
  assert.ok(post('four',7000).messages.length);
});
