import {homesteadSize} from './engine.mjs';
const directions=['up','right','down','left'];
const shared=['lake','market','neighbors'];
const privateScenes=['field','coop','home'];
const recentSeconds=9;
const chatSeconds=7*24*60*60;

export function sceneKey(farms, player, area, host) {
  if(shared.includes(area))return area;
  if(privateScenes.includes(area))return area+':'+player;
  if(area==='visit'&&typeof host==='string'&&Object.hasOwn(farms,host)&&host!==player)return 'field:'+host;
  return null;
}
function validPose(area,pose){
  const [w,h]=area==='field'||area==='visit'?[homesteadSize.width,homesteadSize.height]:area==='lake'?[720,432]:[480,288];
  return pose&&Number.isFinite(pose.x)&&Number.isFinite(pose.y)&&pose.x>=8&&pose.x<=w-8&&pose.y>=10&&pose.y<=h-9&&directions.includes(pose.facing)&&typeof pose.walking==='boolean';
}
export async function social(db,room,farms,player,area,input,time){
  const scene=sceneKey(farms,player,input.area,input.host);
  if(!scene)return {status:400,error:'Khu vực không tồn tại.'};
  if(area==='scene'){
    if(!validPose(input.area,input.pose))return {status:400,error:'Vị trí không hợp lệ.'};
    const {x,y,facing,walking}=input.pose;
    await db.prepare(`INSERT INTO farm_presence(room,player,scene,x,y,facing,walking,seen)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(room,player) DO UPDATE SET
      scene=excluded.scene,x=excluded.x,y=excluded.y,facing=excluded.facing,walking=excluded.walking,seen=excluded.seen
      WHERE scene<>excluded.scene OR x<>excluded.x OR y<>excluded.y OR facing<>excluded.facing
        OR walking<>excluded.walking OR seen<=excluded.seen-4`)
      .bind(room,player,scene,x,y,facing,Number(walking),time).run();
  } else {
    const text=typeof input.text==='string'?input.text.trim().replace(/\s+/gu,' '):'';
    if(!text||Array.from(text).length>180||typeof input.nonce!=='string'||!/^[a-f0-9-]{36}$/.test(input.nonce))return {status:400,error:'Tin nhắn cần từ 1 đến 180 ký tự.'};
    const here=await db.prepare('SELECT scene,seen FROM farm_presence WHERE room=? AND player=?').bind(room,player).first();
    if(here?.scene!==scene||here.seen<time-recentSeconds)return {status:409,error:'Hãy chờ kết nối lại với khu vực.'};
    const previous=await db.prepare('SELECT id FROM farm_chat WHERE room=? AND player=? AND nonce=?').bind(room,player,input.nonce).first();
    if(!previous){
      const inserted=await db.prepare(`INSERT OR IGNORE INTO farm_chat(room,player,scene,text,sent,nonce)
        SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM farm_chat WHERE room=? AND player=? AND sent>?)<3`)
        .bind(room,player,scene,text,time,input.nonce,room,player,time-6).run();
      if(!inserted.meta.changes){
        const accepted=await db.prepare('SELECT id FROM farm_chat WHERE room=? AND player=? AND nonce=?').bind(room,player,input.nonce).first();
        if(!accepted)return {status:429,error:'Bạn gửi hơi nhanh. Chờ vài giây rồi thử lại.'};
      }
      await db.prepare(`DELETE FROM farm_chat WHERE room=? AND
        (sent<? OR (scene=? AND id NOT IN (SELECT id FROM farm_chat WHERE room=? AND scene=? ORDER BY id DESC LIMIT 60)))`)
        .bind(room,time-chatSeconds,scene,room,scene).run();
    }
  }
  const positions=await db.prepare('SELECT player,x,y,facing,walking FROM farm_presence WHERE room=? AND scene=? AND seen>=? ORDER BY player')
    .bind(room,scene,time-recentSeconds).all();
  const notes=await db.prepare('SELECT id,player,text,sent FROM farm_chat WHERE room=? AND scene=? AND sent>=? ORDER BY id DESC LIMIT 24')
    .bind(room,scene,time-chatSeconds).all();
  const players=positions.results.filter(row=>row.player!==player&&farms[row.player]).map(row=>({...row,name:farms[row.player].name}));
  const messages=notes.results.reverse().map(row=>({...row,name:farms[row.player]?.name??'Hàng xóm'}));
  return {scene,players,messages};
}
