import test from 'node:test';
import assert from 'node:assert/strict';
import {visitPage,visitPlotPane} from '../public/neighbor-visit.mjs';
test('visit pagination covers each item once and clamps after stock changes',()=>{
  const rows=Array.from({length:25},(_,index)=>({index}));
  const pages=Array.from({length:5},(_,page)=>visitPage(rows,page));
  assert.deepEqual(pages.flatMap(page=>page.rows),rows);
  assert.ok(pages.every(page=>page.rows.length<=6));
  assert.equal(visitPage(rows.slice(0,2),4).index,0);
  assert.deepEqual(visitPage([],9),{index:0,count:1,rows:[]});
  for(const invalid of [NaN,-1,1.5,undefined])assert.equal(visitPage(rows,invalid).index,0);
});
test('clicking visited plots opens the correct action page including index zero and expanded IDs',()=>{
  const n={garden:[{index:0},{index:2}],helpPlots:Array.from({length:8},(_,i)=>({index:10000+i})),prankPlots:[{index:4}]};
  assert.deepEqual(visitPlotPane(n,0),{pane:'take',source:'garden',page:0});
  assert.deepEqual(visitPlotPane(n,10007),{pane:'help',source:'garden',page:1});
  assert.equal(visitPlotPane(n,4).pane,'prank');
  assert.equal(visitPlotPane(n,9).pane,'take');
  assert.equal(visitPlotPane(undefined,0).pane,'take');
});
