import assert from 'node:assert/strict';
import test from 'node:test';
import {advanceVillageDrive,apply,newFarm,newRoom,snapshot} from '../public/game.mjs';
import {fairStalls} from '../public/village-fair.mjs';
import {goalView,pinVillageGoods} from '../public/next-goal.mjs';
import {fairCounters,fairDisplayFrame} from '../public/pixel/village-fair-art.mjs';
const start=10000,period=48*60*60;
function setup(count=1){const room=newRoom(start);for(let i=0;i<count;i++)room.farms['p'+i]=newFarm('p'+i,'Người '+i,start);advanceVillageDrive(room,start,{fairEnabled:true});return room;}
const give=(r,item,qty,stallId,id='p0')=>apply(r,id,{action:'villageGoods',index:start,item,qty,stallId},start);
test('fair alternatives use fixed quotes, scope carrots to a stall and pay once',()=>{
 const r=setup(),f=r.farms.p0;Object.assign(f.inventory,{wheat:2,bread:2,carrot:6,corn:4,carrotJuice:2});
 give(r,'bread',2,'bread');give(r,'wheat',2,'bread');give(r,'corn',4,'garden');give(r,'carrot',2,'garden');
 assert.equal(fairStalls(r.villageDrive)[2].credit,0);
 const view=snapshot(r,f,start),g=pinVillageGoods(view,'carrotJuice','drinks');assert.equal(g.stallId,'drinks');assert.match(goalView(g,view).meta,/2/);
 give(r,'carrotJuice',2,'drinks');
 assert.equal(f.coins,295);assert.equal(f.xp,12);assert.equal(f.decorVouchers,1);
 assert.equal(r.villageDrive.contributors.p0.quantity,12);
 assert.equal(r.villageDrive.contributors.p0.value,156);
 assert.throws(()=>give(r,'wheat',1,'bread'),/đủ hàng/);assert.equal(f.coins,295);
 advanceVillageDrive(r,start+period);assert.equal(r.villageDrive.version,2);
 const history=snapshot(r,f,start+period).villageDrive.history[0];assert.equal(history.title,'Bếp quê ngày chợ');assert.equal(history.mine.coins,195);assert.equal(history.items.filter(i=>i.item==='carrot').length,2);
});
test('fair validates wrong/missing stall, units, overfill and expiry before consuming stock',()=>{
 const r=setup(),f=r.farms.p0;Object.assign(f.inventory,{wheat:10,bread:10,carrot:10,carrotJuice:10});
 for(const [item,qty,stall] of [['bread',1,undefined],['bread',1,'garden'],['bread',0,'bread'],['bread',.5,'bread'],['bread',4,'bread']]){
  const before=structuredClone(f.inventory);assert.throws(()=>give(r,item,qty,stall));assert.deepEqual(f.inventory,before);
 }
 give(r,'carrot',3,'drinks');assert.throws(()=>give(r,'carrotJuice',1,'drinks'),/còn cần 0/);assert.equal(f.inventory.carrotJuice,10);
 assert.throws(()=>apply(r,f.id,{action:'villageGoods',index:start,item:'wheat',qty:1,stallId:'bread'},start+period),/hết hạn/);
 assert.equal(f.inventory.wheat,10);assert.equal(f.coins,100);
});
test('legacy drives freeze until next opening; fair needs freeze across membership and toggle',()=>{
 const r=newRoom(start);r.farms.p0=newFarm('p0','Bạn',start);advanceVillageDrive(r,start);const before=structuredClone(r.villageDrive);
 advanceVillageDrive(r,start+1,{fairEnabled:true});assert.deepEqual(r.villageDrive,before);
 advanceVillageDrive(r,start+period,{fairEnabled:true});assert.equal(r.villageDrive.version,3);assert.deepEqual(r.villageDrive.stalls.map(s=>s.required),[6,6,4]);
 r.farms.p1=newFarm('p1','Bạn khác',start);advanceVillageDrive(r,start+period+1);assert.deepEqual(r.villageDrive.stalls.map(s=>s.required),[6,6,4]);
 const two=setup(2),three=setup(3);assert.deepEqual(two.villageDrive.stalls.map(s=>s.required),[9,9,6]);assert.deepEqual(three.villageDrive.stalls.map(s=>s.required),[12,12,8]);
});
test('counter art never invents food for an unsubmitted alternative, including completed stalls',()=>{
 const r=setup(),f=r.farms.p0;f.inventory.carrot=6;give(r,'carrot',6,'garden');
 const stall=fairStalls(r.villageDrive)[1],[carrot,corn]=fairCounters[1].slots;
 assert.equal(fairDisplayFrame(stall,carrot),carrot.full);
 assert.equal(fairDisplayFrame(stall,corn),corn.empty);
 const view=snapshot(r,f,start),g=pinVillageGoods(view,'carrot','drinks');
 assert.equal(goalView(g,view).done,undefined);
 assert.equal(pinVillageGoods(view,'carrot','garden').kind,'none');
});
