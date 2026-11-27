import assert from 'node:assert/strict';
import test from 'node:test';
import {createCoopHerd} from '../public/coop-motion.mjs';
import {coopPosition,coopAnimalScale,coopYards} from '../public/coop-layout.mjs';
import {additionalLivestockAtlas} from '../public/pixel/frames.mjs';
import {spriteFlip} from '../public/world-motion.mjs';

const actors=(kind='buffalo',count=16)=>Array.from({length:count},(_,index)=>({
  ...coopPosition(index),type:'animal',index,visualScale:coopAnimalScale(kind),data:{id:index,kind},
}));
const snap=n=>Math.round(n/.75)*.75;

test('pig and duck authored left-facing poses turn toward the actual horizontal stroll',()=>{
  for(const kind of ['pig','duck']){
    const source=additionalLivestockAtlas.sourceFacing[kind];assert.equal(source,-1);
    const herd=createCoopHerd(),input=actors(kind,2),seen=new Set();let previous;
    for(let step=0;step<1600;step++){
      const output=herd.update(input,step/20);
      if(previous)output.forEach((a,i)=>{
        const dx=a.x-previous[i].x;if(Math.abs(dx)<.0001)return;
        const heading=spriteFlip(a.motion.facing,source)?-source:source;
        assert.equal(heading,Math.sign(dx));seen.add(heading);
      });
      previous=output;
    }
    assert.deepEqual([...seen].sort(),[-1,1]);
  }
});

test('full coop animals stroll across the yard without leaving it or overlapping rendered bodies',()=>{
  for(const [kind,width,height,speed] of [['buffalo',47,33,10],['quail',23,21,14]]){
    const herd=createCoopHerd(),input=actors(kind),before=JSON.stringify(input),ranges=input.map(()=>({xs:[],ys:[],states:new Set()}));
    let previous;
    for(let step=0;step<=2400;step++){
      const output=herd.update(input,step/20);
      const boxes=output.map((a,i)=>{
        const range=ranges[i];range.xs.push(a.x);range.ys.push(a.y);range.states.add(a.motion.state);
        if(previous)assert.ok(Math.hypot(a.x-previous[i].x,a.y-previous[i].y)<=speed/20+.001,'no teleport or sliding speed spike');
        const yard=coopYards[a.x<240?0:1],w=width*a.visualScale,h=height*a.visualScale;
        const box={x:snap(a.x)-w/2,y:snap(a.y)-h-.5,w,h:h+.5};
        assert.ok(box.x>=yard.x&&box.x+w<=yard.x+yard.w,kind+' clears sides and central path');
        assert.ok(box.y>=yard.y&&box.y+box.h<=yard.y+yard.h,kind+' clears both fence lines');
        return box;
      });
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i],b=boxes[j];
        assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,kind+' bodies stay separate while crossing');
      }
      previous=output;
    }
    for(const range of ranges){
      assert.ok(Math.max(...range.xs)-Math.min(...range.xs)>=44,'every animal takes a real horizontal stroll');
      assert.ok(Math.max(...range.ys)-Math.min(...range.ys)>=27,'every animal changes rows');
      for(const state of ['walk','idle',kind==='quail'?'peck':'graze'])assert.ok(range.states.has(state),state);
    }
    assert.equal(JSON.stringify(input),before,'presentation does not mutate farm or layout data');
  }
});

test('an approached animal holds still, snapshots keep its position, and it resumes afterward',()=>{
  const herd=createCoopHerd();let input=actors(),output;
  for(let t=0;t<=200;t++){
    output=herd.update(input,t/20);
    if(output[0].motion.state==='walk'&&output[0].motion.distance>4)break;
  }
  const before={x:output[0].x,y:output[0].y},others=output.slice(1),held=new Set([0]);
  for(let step=0;step<60;step++){
    input=structuredClone(input);input[0].data.fedUntil=12345;
    output=herd.update(input,20+step/20,{held});
    assert.equal(output[0].x,before.x);assert.equal(output[0].y,before.y);
    assert.equal(output[0].motion.state,'idle');
  }
  assert.ok(output.slice(1).some((a,i)=>Math.hypot(a.x-others[i].x,a.y-others[i].y)>5),'other animals continue moving');
  for(let step=0;step<150;step++)output=herd.update(input,23+step/20);
  assert.ok(Math.hypot(output[0].x-before.x,output[0].y-before.y)>10);
});

test('a sparse yard permits diagonal strolls without moving animals into the central path',()=>{
  const herd=createCoopHerd(),input=actors('sheep',2);let previous,diagonal=false;
  for(let step=0;step<1200;step++){
    const output=herd.update(input,step/20);
    if(previous)for(let i=0;i<output.length;i++){
      const a=output[i],old=previous[i];
      if(Math.abs(a.x-old.x)>.01&&Math.abs(a.y-old.y)>.01)diagonal=true;
      assert.ok(a.x<215||a.x>265);
    }
    previous=output;
  }
  assert.ok(diagonal);
});

test('reduced motion freezes poses and adoption/removal preserves surviving animal identities',()=>{
  const herd=createCoopHerd();let input=actors('quail',8),output;
  for(let step=0;step<100;step++)output=herd.update(input,step/20);
  const before=output.map(a=>({id:a.data.id,x:a.x,y:a.y}));
  for(let step=0;step<60;step++){
    output=herd.update(input,5+step/20,{reduced:true});
    assert.deepEqual(output.map(a=>({id:a.data.id,x:a.x,y:a.y})),before);
    assert.ok(output.every(a=>a.motion.state==='idle'));
  }
  input=input.slice(1).map((a,index)=>({...a,index}));
  input.push({...actors('quail',1)[0],index:7,data:{id:99,kind:'quail'}});
  output=herd.update(input,8,{reduced:true});
  for(const a of output.filter(a=>a.data.id!==99)){
    const old=before.find(b=>b.id===a.data.id);
    assert.equal(a.x,old.x);assert.equal(a.y,old.y);
  }
  assert.ok(output.some(a=>a.data.id===99));
});
