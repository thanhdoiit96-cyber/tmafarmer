import assert from 'node:assert/strict';
import test from 'node:test';
import {optionalIndex} from '../public/action-input.mjs';
import {apply,newFarm,newRoom} from '../public/game.mjs';

test('empty UI index keeps animal adoption in the main coop when a parcel coop is full',()=>{
  const now=1000,room=newRoom(now),farm=newFarm('a','a',now);
  room.farms.a=farm;
  farm.coop=6;
  farm.coins=1000;
  farm.land[0]={kind:'coop'};
  farm.pens=[
    ...Array.from({length:8},(_,id)=>({id,kind:'chicken'})),
    ...Array.from({length:2},(_,offset)=>({id:8+offset,kind:'chicken',lot:0}))
  ];

  assert.equal(optionalIndex(''),undefined);
  apply(room,'a',{action:'animal',item:'chicken',index:optionalIndex('')},now);

  assert.equal(farm.pens.filter(pen=>pen.lot===undefined).length,9);
  assert.equal(farm.pens.filter(pen=>pen.lot===0).length,2);
});
