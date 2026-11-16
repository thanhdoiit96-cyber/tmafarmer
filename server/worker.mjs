import {social} from './social.mjs';
import {advanceVillage, apply, dayAt, GameError, has, newFarm, newRoom, snapshot, startSoilClock, startVillageSecurity, unixNow, upgradeCalendar} from './engine.mjs';

const reply=(value,status=200)=>new Response(JSON.stringify(value),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},
});
const readRoom=(db,code)=>db.prepare('SELECT revision, state FROM farm_rooms WHERE code = ?').bind(code).first();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const random=length=>hex(crypto.getRandomValues(new Uint8Array(length)));
const authToken=request=>request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
const authId=async token=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).slice(0,32);
const save=(db,code,revision,state)=>db.prepare('UPDATE farm_rooms SET state = ?, revision = revision + 1 WHERE code = ? AND revision = ?')
  .bind(JSON.stringify(state),code,revision).run();
const codePattern=/^[A-F0-9]{8}$/;
function validPayload(value) {
  return value&&typeof value==='object'&&!Array.isArray(value);
}
async function body(request) {
  if(!request.body) throw new GameError('Thiếu dữ liệu.');
  const reader=request.body.getReader();
  const decoder=new TextDecoder();
  let size=0, text='';
  while(true) {
    const {value,done}=await reader.read();
    if(done) break;
    size+=value.length;
    if(size>2048) {
      await reader.cancel();
      throw new GameError('Dữ liệu quá lớn.');
    }
    text+=decoder.decode(value,{stream:true});
  }
  try {
    const parsed=JSON.parse(text+decoder.decode());
    if(validPayload(parsed)) return parsed;
  } catch {}
  throw new GameError('Dữ liệu không hợp lệ.');
}
async function join(db,request) {
  const data=await body(request);
  const name=typeof data.name==='string'?data.name.trim().replace(/\s+/g,' '):'';
  const code=typeof data.code==='string'?data.code.trim().toUpperCase():'';
  if(name.length<2||name.length>24) return reply({error:'Tên vườn cần từ 2 đến 24 ký tự.'},400);
  if(code&&!codePattern.test(code)) return reply({error:'Mã gồm 8 ký tự từ A–F hoặc 0–9.'},400);
  const token=random(32), id=await authId(token);
  for(let round=0;round<8;round++) {
    const time=unixNow();
    if(!code) {
      const state=newRoom(time), newCode=random(4).toUpperCase();
      state.farms[id]=newFarm(id,name,time);
      const result=await db.prepare('INSERT OR IGNORE INTO farm_rooms(code,state) VALUES (?,?)').bind(newCode,JSON.stringify(state)).run();
      if(result.meta.changes===1) return reply({token,code:newCode,state:snapshot(state,state.farms[id],time)},201);
      continue;
    }
    const row=await readRoom(db,code);
    if(!row) return reply({error:'Không tìm thấy mã làng.'},404);
    const state=JSON.parse(row.state);
    if(Object.keys(state.farms).length>=12) return reply({error:'Làng đã đủ 12 vườn.'},409);
    upgradeCalendar(state,time);
    startVillageSecurity(state,dayAt(state,time));
    startSoilClock(state,time);
    state.farms[id]=newFarm(id,name,time);
    const result=await save(db,code,row.revision,state);
    if(result.meta.changes===1) return reply({token,code,state:snapshot(state,state.farms[id],time)},201);
  }
  return reply({error:'Làng đang bận. Thử lại sau vài giây.'},409);
}
export default {
  async fetch(request,env) {
    const {pathname}=new URL(request.url);
    const method=request.method;
    const db=env.DB;
    if(!pathname.startsWith('/api/')) return env.ASSETS?.fetch(request)??new Response('Not found',{status:404});
    if(pathname==='/api/health') return reply({ok:!!db},db?200:503);
    if(!db) return reply({error:'Máy chủ chưa kết nối cơ sở dữ liệu.'},503);
    try {
      if(pathname==='/api/join'&&method==='POST') return await join(db,request);
      const socialAction=pathname==='/api/scene'?'scene':pathname==='/api/chat'?'chat':null;
      if(!socialAction&&!['/api/state','/api/action'].includes(pathname)) return reply({error:'Đường dẫn không tồn tại.'},404);
      if(pathname==='/api/state'&&method!=='GET'||(socialAction||pathname==='/api/action')&&method!=='POST') return reply({error:'Phương thức không hợp lệ.'},405);
      const token=authToken(request), code=request.headers.get('x-room-code');
      if(!token||!codePattern.test(code)) return reply({error:'Phiên chơi không hợp lệ.'},401);
      const id=await authId(token);
      const input=method==='POST'?await body(request):null;
      if(socialAction){
        const row=await readRoom(db,code);
        if(!row)return reply({error:'Làng này không còn tồn tại.'},404);
        const {farms}=JSON.parse(row.state);
        if(!has(farms,id))return reply({error:'Phiên chơi không còn hiệu lực.'},401);
        const result=await social(db,code,farms,id,socialAction,input,unixNow());
        return reply(result,result.status??200);
      }
      if(input&&(!/^[a-f\d-]{36}$/.test(input.requestId)||typeof input.action!=='string'||
        ['item','target','source'].some(key=>key in input&&typeof input[key]!=='string'))) {
        return reply({error:'Thao tác không hợp lệ.'},400);
      }
      const catchRoll=input?.action==='reel'?crypto.getRandomValues(new Uint32Array(1))[0]/2**32:undefined;
      for(let round=0;round<8;round++) {
        const row=await readRoom(db,code);
        if(!row) return reply({error:'Làng này không còn tồn tại.'},404);
        const state=JSON.parse(row.state), time=unixNow();
        if(!has(state.farms,id)) return reply({error:'Phiên chơi không còn hiệu lực.'},401);
        const farm=state.farms[id];
        const calendarUpdated=upgradeCalendar(state,time);
        const securityStarted=startVillageSecurity(state,dayAt(state,time));
        const soilStarted=startSoilClock(state,time);
        if(!input) {
          const promoted=advanceVillage(state,dayAt(state,time));
          if(!calendarUpdated&&!promoted&&!securityStarted&&!soilStarted)return reply({state:snapshot(state,farm,time),revision:row.revision});
          const migrated=await save(db,code,row.revision,state);
          if(migrated.meta.changes===1)return reply({state:snapshot(state,farm,time),revision:row.revision+1});
          continue;
        }
        const prior=farm.recent.find(r=>r.id===input.requestId);
        if(prior) return reply({state:snapshot(state,farm,time),message:prior.message,revision:row.revision});
        let position;
        if(input.action==='rest'){
          const here=await db.prepare('SELECT scene,x,y,seen FROM farm_presence WHERE room=? AND player=?')
            .bind(code,id).first();
          if(here?.scene==='home:'+id&&here.seen>=time-9)position={area:'home',x:here.x,y:here.y};
        }
        const message=apply(state,id,input,time,catchRoll,position);
        farm.recent.push({id:input.requestId,message});
        farm.recent=farm.recent.slice(-64);
        const result=await save(db,code,row.revision,state);
        if(result.meta.changes===1) return reply({state:snapshot(state,farm,time),message,revision:row.revision+1});
      }
      return reply({error:'Làng đang bận. Thử thao tác lại sau vài giây.'},409);
    } catch(error) {
      if(error instanceof GameError) return reply({error:error.message},400);
      console.error('Farm request failed',error);
      return reply({error:'Máy chủ đang bận. Vui lòng thử lại.'},500);
    }
  },
};
