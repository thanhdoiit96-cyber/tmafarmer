import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeCohorts} from '../scripts/pilot-cohorts.mjs';

test('cohorts count unique people on exact UTC days, exclude QA/demo and immature days',()=>{
  const input={schema:1,players:[
    {id:'P01',mode:'online',firstPlay:'2026-11-01'},
    {id:'P02',mode:'online',firstPlay:'2026-11-01'},
    {id:'P03',mode:'online',firstPlay:'2026-11-07'},
    {id:'P04',mode:'demo',firstPlay:'2026-11-01'},
    {id:'P05',mode:'QA',firstPlay:'2026-11-01'}],sessions:[
    {id:'P01',date:'2026-11-02'},{id:'P01',date:'2026-11-02'},
    {id:'P02',date:'2026-11-03'},{id:'P01',date:'2026-11-08'}]};
  const report=analyzeCohorts(input,'2026-11-08');
  assert.equal(report.excluded,2);
  assert.deepEqual(report.cohorts[0].retention.D1,{eligible:2,returned:1,rate:.5});
  assert.deepEqual(report.cohorts[0].retention.D7,{eligible:2,returned:1,rate:.5});
  assert.equal(report.cohorts[1].retention.D7.rate,null);
  assert.equal(report.cohorts[0].retention.D30.rate,null);
  assert.ok(!JSON.stringify(report).includes('P01'));
});

test('invalid or inconsistent dates and identities fail rather than silently bias retention',()=>{
  const base={schema:1,players:[{id:'P01',mode:'online',firstPlay:'2026-11-01'}],sessions:[]};
  for(const date of ['2026-02-30','2026-11-01T12:00:00Z','bad'])assert.throws(()=>analyzeCohorts(base,date));
  assert.throws(()=>analyzeCohorts({...base,players:[...base.players,...base.players]},'2026-11-08'));
  for(const s of [{id:'P02',date:'2026-11-02'},{id:'P01',date:'2026-10-31'},{id:'P01',date:'2026-11-09'}])
    assert.throws(()=>analyzeCohorts({...base,sessions:[s]},'2026-11-08'));
  assert.throws(()=>analyzeCohorts({...base,players:[{...base.players[0],mode:'unknown'}]},'2026-11-08'));
});
