import {recentSeconds,sceneKey,social} from './social.mjs';
import {advanceGardenHelpers, advanceVillage, advanceVillageDrive, apply, avatars, dayAt, GameError, has, newFarm, newRoom, snapshot, startLivestockClock, startSoilClock, startVillageSecurity, unixNow, upgradeCalendar, villageOwner} from './engine.mjs';

const reply=(value,status=200)=>new Response(JSON.stringify(value),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},
});
const readRoom=(db,code)=>db.prepare('SELECT revision, state FROM farm_rooms WHERE code = ?').bind(code).first();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const random=length=>hex(crypto.getRandomValues(new Uint8Array(length)));
const authToken=request=>request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
const authId=async token=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).slice(0,32);
const hashPassword=async password=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password+'@vuon-mua-vui'))));
const save=(db,code,revision,state)=>db.prepare('UPDATE farm_rooms SET state = ?, revision = revision + 1 WHERE code = ? AND revision = ?')
  .bind(JSON.stringify(state),code,revision).run();
const codePattern=/^[A-F0-9]{8}$/;
const accountSessionLifetime=30*24*60*60;
const isSuperAdmin=(session,accountId)=>Boolean(accountId&&session?.username==='ntdoi'&&session.account_id===accountId);
const runSql=async(db,statement,params=[] )=>{
  const prepared=db.prepare(statement);
  if(typeof prepared.run==='function') return await prepared.run(...params);
  return await prepared.bind(...params).run();
};
const ensureAccountTables=async db=>{
  const sql=[
    `CREATE TABLE IF NOT EXISTS farm_accounts (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS farm_account_sessions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      device_id TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY(account_id) REFERENCES farm_accounts(id)
    )`,
    `CREATE TABLE IF NOT EXISTS farm_account_links (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      room_code TEXT NOT NULL,
      farm_id TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      last_used_at INTEGER NOT NULL,
      UNIQUE(account_id, room_code, farm_id),
      FOREIGN KEY(account_id) REFERENCES farm_accounts(id)
    )`,
  ];
  for(const statement of sql) await runSql(db,statement);
};
const lookupAccountSession=async(db,token)=>{
  if(!token) return null;
  const now=unixNow();
  return await db.prepare(`SELECT s.token, s.account_id, a.username
    FROM farm_account_sessions s
    JOIN farm_accounts a ON a.id = s.account_id
    WHERE s.token = ? AND s.expires_at > ?`).bind(token,now).first();
};
const lookupOwnedRoom=async(db,accountId,roomCode)=>{
  if(!accountId||!roomCode) return null;
  return await db.prepare(`SELECT room_code, farm_id, is_primary, last_used_at
    FROM farm_account_links
    WHERE account_id = ? AND room_code = ?
    ORDER BY last_used_at DESC, is_primary DESC
    LIMIT 1`).bind(accountId,roomCode).first();
};
const ensurePrimaryRoom=async(db,accountId,roomCode,farmId)=>{
  const now=unixNow();
  const existing=await db.prepare(`SELECT id FROM farm_account_links WHERE account_id = ? AND room_code = ? AND farm_id = ?`).bind(accountId,roomCode,farmId).first();
  if(existing) {
    await db.prepare(`UPDATE farm_account_links SET last_used_at = ?, is_primary = 1 WHERE id = ?`).bind(now,existing.id).run();
    await db.prepare(`UPDATE farm_account_links SET is_primary = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE account_id = ?`).bind(existing.id,accountId).run();
    return;
  }
  const linkId=random(16);
  await db.prepare(`INSERT INTO farm_account_links(id,account_id,room_code,farm_id,is_primary,last_used_at)
    VALUES (?,?,?,?,1,?)`).bind(linkId,accountId,roomCode,farmId,now).run();
  await db.prepare(`UPDATE farm_account_links SET is_primary = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE account_id = ?`).bind(linkId,accountId).run();
};
const accountRooms=async(db,accountId)=>db.prepare(`SELECT l.room_code, l.farm_id, l.is_primary, l.last_used_at
  FROM farm_account_links l JOIN farm_rooms r ON r.code = l.room_code
  WHERE l.account_id = ? AND EXISTS (
    SELECT 1 FROM json_each(r.state, '$.farms') f WHERE f.key = l.farm_id
  ) ORDER BY last_used_at DESC, is_primary DESC`).bind(accountId).all();
const serializeAccountRooms=rows=>{
  const list=Array.isArray(rows)?rows:(rows?.results ?? []);
  return list.map(room=>({roomCode:room.room_code ?? room.roomCode, farmId:room.farm_id ?? room.farmId, isPrimary:Boolean(room.is_primary ?? room.isPrimary), lastUsedAt:room.last_used_at ?? room.lastUsedAt}));
};
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
async function registerAccount(db,request) {
  const data=await body(request);
  const username=typeof data.username==='string'?data.username.trim():'';
  const password=typeof data.password==='string'?data.password:'';
  const roomCode=typeof data.roomCode==='string'?data.roomCode.trim().toUpperCase():'';
  if(username.length<3||username.length>20||!/^[A-Za-z0-9_-]+$/.test(username)) return reply({error:'Tên tài khoản từ 3 đến 20 ký tự, chỉ chữ, số, gạch dưới hoặc gạch ngang.'},400);
  if(password.length<6||password.length>128) return reply({error:'Mật khẩu phải từ 6 đến 128 ký tự.'},400);
  let farmId, isOwner=false;
  if(roomCode){
    const proof=authToken(request);
    const row=proof&&codePattern.test(roomCode)?await readRoom(db,roomCode):null;
    const room=row&&JSON.parse(row.state);
    farmId=proof&&await authId(proof);
    if(!room||!farmId||!has(room.farms,farmId)) return reply({error:'Hãy dùng phiên chơi gốc của vườn để gắn vào tài khoản.'},403);
    isOwner=villageOwner(room)===farmId;
  }
  const existing=await db.prepare('SELECT id FROM farm_accounts WHERE username = ?').bind(username).first();
  if(existing) return reply({error:'Tên tài khoản đã tồn tại.'},409);
  const accountId=random(16), now=unixNow();
  const passwordHash=await hashPassword(password);
  await db.prepare('INSERT INTO farm_accounts(id,username,password_hash,created_at) VALUES (?,?,?,?)').bind(accountId,username,passwordHash,now).run();
  const token=random(32);
  const sessionId=random(16);
  await db.prepare('INSERT INTO farm_account_sessions(id,account_id,token,device_id,created_at,expires_at) VALUES (?,?,?,?,?,?)')
    .bind(sessionId,accountId,token,null,now,now+accountSessionLifetime).run();
  if(farmId) {
    await ensurePrimaryRoom(db,accountId,roomCode,farmId);
    if(isOwner)await db.prepare(`UPDATE farm_rooms
      SET state = json_set(state, '$.ownerAccountId', ?), revision = revision + 1
      WHERE code = ? AND json_extract(state, '$.ownerAccountId') IS NULL`)
      .bind(accountId,roomCode).run();
  }
  const rooms=await accountRooms(db,accountId);
  return reply({account:{id:accountId,username},token,rooms:serializeAccountRooms(rooms)},200);
}
async function loginAccount(db,request) {
  const data=await body(request);
  const username=typeof data.username==='string'?data.username.trim():'';
  const password=typeof data.password==='string'?data.password:'';
  if(!username||!password) return reply({error:'Tên tài khoản và mật khẩu không được để trống.'},400);
  const account=await db.prepare('SELECT id, username, password_hash FROM farm_accounts WHERE username = ?').bind(username).first();
  if(!account) return reply({error:'Tên tài khoản hoặc mật khẩu không đúng.'},401);
  const passwordHash=await hashPassword(password);
  if(account.password_hash!==passwordHash) return reply({error:'Tên tài khoản hoặc mật khẩu không đúng.'},401);
  const now=unixNow();
  const token=random(32);
  const sessionId=random(16);
  await db.prepare('INSERT INTO farm_account_sessions(id,account_id,token,device_id,created_at,expires_at) VALUES (?,?,?,?,?,?)')
    .bind(sessionId,account.id,token,null,now,now+accountSessionLifetime).run();
  const rooms=await accountRooms(db,account.id);
  return reply({account:{id:account.id,username:account.username},token,rooms:serializeAccountRooms(rooms)},200);
}
async function accountProfile(db,request) {
  const token=authToken(request);
  const session=token?await lookupAccountSession(db,token):null;
  if(!session) return reply({error:'Phiên đăng nhập tài khoản không hợp lệ.'},401);
  const rooms=await accountRooms(db,session.account_id);
  return reply({account:{id:session.account_id,username:session.username},rooms:serializeAccountRooms(rooms)},200);
}
async function logoutAccount(db,request) {
  const token=authToken(request);
  if(!token)return reply({error:'Phiên đăng nhập tài khoản không hợp lệ.'},401);
  await db.prepare('DELETE FROM farm_account_sessions WHERE token = ?').bind(token).run();
  return reply({ok:true});
}
async function join(db,request,superAdminAccountId) {
  const data=await body(request);
  const name=typeof data.name==='string'?data.name.trim().replace(/\s+/g,' '):'';
  const code=typeof data.code==='string'?data.code.trim().toUpperCase():'';
  if(name.length<2||name.length>24) return reply({error:'Tên vườn cần từ 2 đến 24 ký tự.'},400);
  if(code&&!codePattern.test(code)) return reply({error:'Mã gồm 8 ký tự từ A–F hoặc 0–9.'},400);
  const avatar=data.avatar;
  if(avatar!==undefined&&(typeof avatar!=='string'||!has(avatars,avatar)))return reply({error:'Nhân vật không hợp lệ.'},400);
  const account=await lookupAccountSession(db,authToken(request));
  const admin=isSuperAdmin(account,superAdminAccountId)?account:null;
  const token=admin?.token??random(32);
  const guestId=admin?null:await authId(token);
  const farmIdFor=roomCode=>admin?authId('admin-farm:'+admin.account_id+':'+roomCode):guestId;
  const linked=admin&&code?await lookupOwnedRoom(db,admin.account_id,code):null;
  const joined=async(state,roomCode,id,time,status)=>{
    if(admin)await ensurePrimaryRoom(db,admin.account_id,roomCode,id);
    return reply({token,code:roomCode,account:Boolean(admin),state:{
      ...snapshot(state,state.farms[id],time),canManageMembers:!!admin||id===villageOwner(state)
    }},status);
  };
  for(let round=0;round<8;round++) {
    const time=unixNow();
    if(!code) {
      const state=newRoom(time), newCode=random(4).toUpperCase();
      const id=await farmIdFor(newCode);
      state.ownerId=id;
      if(admin)state.ownerAccountId=admin.account_id;
      state.farms[id]=newFarm(id,name,time,avatar);
      const result=await db.prepare('INSERT OR IGNORE INTO farm_rooms(code,state) VALUES (?,?)').bind(newCode,JSON.stringify(state)).run();
      if(result.meta.changes===1) return joined(state,newCode,id,time,201);
      continue;
    }
    const row=await readRoom(db,code);
    if(!row) return reply({error:'Không tìm thấy mã làng.'},404);
    const state=JSON.parse(row.state);
    const id=linked&&has(state.farms,linked.farm_id)?linked.farm_id:await farmIdFor(code);
    const jobsUpdated=advanceGardenHelpers(state,time);
    if(admin&&has(state.farms,id)){
      if(advanceVillageDrive(state,time)||jobsUpdated){
        const saved=await save(db,code,row.revision,state);
        if(saved.meta.changes!==1)continue;
      }
      return joined(state,code,id,time,200);
    }
    if(Object.keys(state.farms).length>=12) return reply({error:'Làng đã đủ 12 vườn.'},409);
    upgradeCalendar(state,time);
    startVillageSecurity(state,dayAt(state,time));
    startSoilClock(state,time);
    startLivestockClock(state,time);
    state.farms[id]=newFarm(id,name,time,avatar);
    advanceVillageDrive(state,time);
    const result=await save(db,code,row.revision,state);
    if(result.meta.changes===1) return joined(state,code,id,time,201);
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
    await ensureAccountTables(db);
    try {
      if(pathname==='/api/account/register'&&method==='POST') return await registerAccount(db,request);
      if(pathname==='/api/account/login'&&method==='POST') return await loginAccount(db,request);
      if(pathname==='/api/account/logout'&&method==='POST') return await logoutAccount(db,request);
      if(pathname==='/api/account/me'&&method==='GET') return await accountProfile(db,request);
      if(pathname==='/api/join'&&method==='POST') return await join(db,request,env.SUPER_ADMIN_ACCOUNT_ID);
      const socialAction=pathname==='/api/scene'?'scene':pathname==='/api/chat'?'chat':null;
      if(!socialAction&&!['/api/state','/api/action'].includes(pathname)) return reply({error:'Đường dẫn không tồn tại.'},404);
      if(pathname==='/api/state'&&method!=='GET'||(socialAction||pathname==='/api/action')&&method!=='POST') return reply({error:'Phương thức không hợp lệ.'},405);
      const token=authToken(request), code=request.headers.get('x-room-code');
      if(!token||!codePattern.test(code)) return reply({error:'Phiên chơi không hợp lệ.'},401);
      const accountSession=token?await lookupAccountSession(db,token):null;
      const superAdmin=isSuperAdmin(accountSession,env.SUPER_ADMIN_ACCOUNT_ID);
      let id=await authId(token);
      if(accountSession) {
        const room=await lookupOwnedRoom(db,accountSession.account_id,code.toUpperCase());
        if(room) id=room.farm_id;
      }
      const input=method==='POST'?await body(request):null;
      if(socialAction){
        const row=await readRoom(db,code);
        if(!row)return reply({error:'Làng này không còn tồn tại.'},404);
        const {farms}=JSON.parse(row.state);
        if(!has(farms,id))return reply({error:'Bạn không còn là thành viên của làng này.'},401);
        const result=await social(db,env.CHAT,code,farms,id,socialAction,input,Date.now());
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
        if(!has(state.farms,id)) return reply({error:'Bạn không còn là thành viên của làng này.'},401);
        const farm=state.farms[id];
        // Old account links did not require proof of control over the guest farm.
        const canManageMembers=superAdmin||(id===villageOwner(state)&&(!accountSession||state.ownerAccountId===accountSession.account_id));
        const view=()=>({...snapshot(state,farm,time),canManageMembers});
        if(input?.action==='removeMember'&&!canManageMembers) return reply({error:'Chỉ chủ làng hoặc super admin mới có thể mời thành viên ra.'},403);
        const calendarUpdated=upgradeCalendar(state,time);
        const securityStarted=startVillageSecurity(state,dayAt(state,time));
        const soilStarted=startSoilClock(state,time);
        const livestockStarted=startLivestockClock(state,time);
        const driveUpdated=advanceVillageDrive(state,time);
        const prior=input&&farm.recent.find(r=>r.id===input.requestId);
        if(!input||prior) {
          const jobsUpdated=advanceGardenHelpers(state,time);
          const promoted=advanceVillage(state,dayAt(state,time));
          const payload=prior?{message:prior.message}:{};
          if(!calendarUpdated&&!promoted&&!securityStarted&&!soilStarted&&!livestockStarted&&!driveUpdated&&!jobsUpdated)return reply({...payload,state:view(),revision:row.revision});
          const migrated=await save(db,code,row.revision,state);
          if(migrated.meta.changes===1)return reply({...payload,state:view(),revision:row.revision+1});
          continue;
        }
        let area;
        if(input.action==='rest'){
          const here=await db.prepare('SELECT scene FROM farm_presence WHERE room=? AND player=? AND seen>=?')
            .bind(code,id,time-recentSeconds).first();
          if(here?.scene===sceneKey(state.farms,id,'home'))area='home';
        }
        const message=apply(state,id,input,time,catchRoll,{area,superAdmin});
        farm.recent.push({id:input.requestId,message});
        farm.recent=farm.recent.slice(-64);
        const result=await save(db,code,row.revision,state);
        if(result.meta.changes===1) return reply({state:view(),message,revision:row.revision+1});
      }
      return reply({error:'Làng đang bận. Thử thao tác lại sau vài giây.'},409);
    } catch(error) {
      if(error instanceof GameError) return reply({error:error.message},400);
      console.error('Farm request failed',error);
      return reply({error:'Máy chủ đang bận. Vui lòng thử lại.'},500);
    }
  },
};
