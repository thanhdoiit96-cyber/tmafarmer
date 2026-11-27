import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeView} from '../public/recipe-view.mjs';
import {newFarm,newRoom,apply,craftRequirement} from '../public/game.mjs';
function setup(){const r=newRoom(1000);r.farms.a=newFarm('a','A',1000);Object.assign(r.farms.a,{workshop:10,xp:40000});r.farms.a.inventory={};return r;}
test('recipe states separate missing unlock from ingredients and preserve owned quantities',()=>{
  const r=setup(),f=r.farms.a;f.workshop=1;f.inventory.warmMilk=4;
  assert.equal(recipeView(f,'warmMilk').locked,true);assert.equal(recipeView(f,'warmMilk').owned,4);
  f.workshop=2;const v=recipeView(f,'warmMilk');assert.equal(v.locked,false);assert.equal(v.label,'Thiếu nguyên liệu');assert.equal(v.count,0);
});
test('craftable badges match sequential engine actions, including bag limits and shared ingredient bottlenecks',()=>{
  for(const [item,inventory,expected]of [['bread',{wheat:7},3],['bread',{wheat:7,bread:98},2],['milkTea',{tea:2,milk:5},2],['starchGlue',{corn:9,wheat:5},2]]){
    const r=setup(),f=r.farms.a;f.inventory={...inventory};const before=JSON.stringify(f);
    assert.equal(recipeView(f,item).count,expected);assert.equal(JSON.stringify(f),before);
    let actual=0;while(!craftRequirement(f,item)){apply(r,'a',{action:'craft',item},1000);actual++;if(actual>100)throw Error('Unbounded crafting');}
    assert.equal(actual,expected);assert.equal(recipeView(f,item).count,0);
  }
});
