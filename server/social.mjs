import {avatarOf,homesteadSize,speechRange} from './engine.mjs';
const directions=['up','right','down','left'];
const shared=['lake','market','neighbors'];
const privateScenes=['field','coop','home','workshop'];
const recentSeconds=9;

export function sceneKey(farms, player, area, host) {
  if(shared.includes(area))return area;
  if(area==='workshop'&&!(farms[player]?.workshop>0))return null;
  if(privateScenes.includes(area))return area+':'+player;
  if(area==='visit'&&typeof host==='string'&&Object.hasOwn(farms,host)&&host!==player)return 'field:'+host;
  return null;
}
function validPose(area,pose){
  const [w,h]=area==='field'||area==='visit'?[homesteadSize.width,homesteadSize.height]:area==='lake'?[720,432]:[480,288];
  return pose&&Number.isFinite(pose.x)&&Number.isFinite(pose.y)&&pose.x>=8&&pose.x<=w-8&&pose.y>=10&&pose.y<=h-9&&directions.includes(pose.facing)&&typeof pose.walking==='boolean';
}
export async function social(db,chat,room,farms,player,area,input,now){
  const time=Math.floor(now/1000);
  const scene=sceneKey(farms,player,input.area,input.host);
  if(!scene)return {status:400,error:'Khu vực không tồn tại.'};
  let message;
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
    message={text,nonce:input.nonce};
  }
  const positions=await db.prepare('SELECT player,x,y,facing,walking FROM farm_presence WHERE room=? AND scene=? AND seen>=? ORDER BY player')
    .bind(room,scene,time-recentSeconds).all();
  const here=positions.results.find(row=>row.player===player);
  if(message&&!here)return {status:409,error:'Hãy chờ kết nối lại với khu vực.'};
  const players=positions.results.filter(row=>row.player!==player&&Object.hasOwn(farms,row.player)).map(row=>({
    ...row,name:farms[row.player].name,avatar:avatarOf(farms[row.player].avatar),
  }));
  let messages=[], chatAvailable=!!chat;
  if(chat&&here){
    const nearby=[player,...players.filter(other=>Math.hypot(other.x-here.x,other.y-here.y)<=speechRange).map(other=>other.player)];
    try {
      const result=await chat.getByName(room+'/'+scene).exchange(player,nearby,now,message);
      if(result.error)return result;
      messages=result.messages.map(post=>({...post,name:farms[post.player]?.name??'Hàng xóm'}));
    } catch {
      chatAvailable=false;
    }
  }
  if(message&&!chatAvailable)return {status:503,error:'Chat gần đây chưa kết nối. Hãy thử lại.'};
  return {scene,players,messages,now,chatAvailable};
}
