import test from 'node:test';
import assert from 'node:assert/strict';
import {stockLayout} from '../public/stock-layout.mjs';

test('inventory grows with the available panel area instead of the adoption dialog limit',()=>{
  const short=stockLayout({width:328,height:306,chrome:130});
  const tall=stockLayout({width:328,height:396,chrome:130});
  assert.equal(short.size,6);
  assert.equal(tall.size,9);
  assert.equal(stockLayout({width:248,height:236,chrome:100,rowHeight:60}).size,4);
});

test('inventory reserves its header and pager before adding complete rows',()=>{
  for(const width of [240,280,328])for(const height of [180,236,306,396,500]){
    const chrome=100,rowHeight=64,layout=stockLayout({width,height,chrome,rowHeight});
    assert.ok(layout.rows*rowHeight+(layout.rows-1)*4<=height-chrome);
    assert.equal(layout.size%layout.columns,0);
    assert.ok(layout.size<=12);
  }
});
