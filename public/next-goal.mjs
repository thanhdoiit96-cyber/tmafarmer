import {buildingUpgrade,buildings,capacity,cropGoal,cropYield,crops,gameDay,goods,stock,xpRewards} from './game.mjs';
import {plotAt} from './land.mjs';

const version=1;
const stages=['plant','water','grow','sell','done'];
export const goalStorageKey=(snapshot,session)=>'mua-vui-goal:1:'+JSON.stringify([session?'online':'demo',session?.code??'',snapshot.me.id]);
export const noGoal=()=>({version,kind:'none'});
const observation=f=>({xp:f.xp??0,wheat:f.inventory.wheat??0,seed:f.inventory.wheatSeed??0});
const identity=(index,p)=>({index,plantedAt:p.plantedAt??null});
const sameCrop=(ref,p)=>p?.kind==='wheat'&&(p.plantedAt??null)===ref?.plantedAt;
export function pinIntro(snapshot){
  const f=snapshot.me,index=f.plotIndexes.find(i=>plotAt(f,i)?.kind==='wheat');
  return {version,kind:'intro',stage:index===undefined?'plant':'water',
    ...(index===undefined?{}:{crop:identity(index,plotAt(f,index))}),observed:observation(f)};
}
export function pinBuilding(farm,key){
  if(!Object.hasOwn(buildings,key))return noGoal();
  const step=buildingUpgrade(farm,key);
  return step.level>=step.max?noGoal():{version,kind:'building',building:key,level:step.level+1};
}
export function loadGoal(raw,snapshot){
  if(raw?.version===version){
    if(raw.kind==='none')return noGoal();
    if(raw.kind==='building'&&Object.hasOwn(buildings,raw.building)&&Number.isInteger(raw.level)&&raw.level>(buildings[raw.building].base??1)&&raw.level<=(buildings[raw.building].base??1)+buildings[raw.building].costs.length)return {...raw};
    if(raw.kind==='intro'&&stages.includes(raw.stage)&&(!raw.crop||(Number.isInteger(raw.crop.index)&&snapshot.me.plotIndexes.includes(raw.crop.index)&&(raw.crop.plantedAt===null||Number.isFinite(raw.crop.plantedAt)))))return {...raw};
    return noGoal();
  }
  if(raw)return noGoal(); // Future/invalid versions must not force a tutorial.
  const f=snapshot.me;
  const first=f.log?.length===1?f.log[0].time:null;
  const fresh=(f.xp??0)===0&&f.field===1&&(f.coop??0)===0&&(f.workshop??0)===0&&Number.isFinite(first)&&snapshot.now-first<gameDay;
  return fresh?pinIntro(snapshot):noGoal();
}

// Snapshot evidence handles a helper/another tab harvesting while this client
// is offline. A vanished/replanted crop alone is never a harvest receipt.
export function reconcileGoal(goal,snapshot){
  if(goal.kind!=='intro'||goal.stage==='done')return goal;
  const f=snapshot.me,g={...goal},p=g.crop&&plotAt(f,g.crop.index);
  if(g.crop&&['water','grow'].includes(g.stage)){
    if(!sameCrop(g.crop,p)){
      const before=g.observed,after=observation(f);
      if(before&&after.xp>=before.xp+xpRewards.harvest&&(after.wheat>before.wheat||after.seed>before.seed)){
        g.stage='sell';delete g.notice;
      }else if(p?.kind==='wheat'&&g.crop.plantedAt===null){
        g.crop=identity(g.crop.index,p); // legacy crop gained a stable timestamp
      }else{
        g.stage='plant';delete g.crop;
        g.notice='Vụ đang theo dõi đã thay đổi. Gieo lúa mì để tiếp tục mục tiêu.';
      }
    }else g.stage=p.wetUntil>snapshot.now||snapshot.weather.wet||p.progress>=cropGoal(p)?'grow':'water';
  }
  g.observed=observation(f);
  return g;
}
export function goalAfterAction(goal,input,before,after){
  if(goal.kind!=='intro'||goal.stage==='done')return goal;
  const g={...goal};
  const previous=g.crop&&plotAt(before,g.crop.index);
  if(input.action==='plant'&&input.item==='wheat'&&(g.stage==='plant'||g.stage==='sell'&&!(before.inventory.wheat>0))){
    const p=plotAt(after,input.index);
    if(p?.kind==='wheat'){g.crop=identity(input.index,p);g.stage='water';delete g.notice;}
  }else if(input.action==='harvest'&&input.index===g.crop?.index&&sameCrop(g.crop,previous)){
    g.stage='sell';delete g.notice;
  }else if(g.stage==='sell'&&input.action==='sell'&&input.item==='wheat'&&(after.inventory.wheat??0)<(before.inventory.wheat??0)){
    g.stage='done';
  }
  g.observed=observation(after);
  return g;
}

export function goalView(goal,snapshot){
  const f=snapshot.me;
  if(goal.kind==='none')return null;
  if(goal.kind==='building'){
    const def=buildings[goal.building],level=f[goal.building]??def.base??1;
    if(level>=goal.level)return {title:def.name+' cấp '+goal.level+' đã sẵn sàng!',copy:'Bạn đã hoàn thành mục tiêu công trình này.',meta:'Chọn điều mình muốn làm tiếp.',route:{kind:'choose'},cta:'Chọn mục tiêu khác',done:true};
    const step=buildingUpgrade(f,goal.building);
    const missing=[...(f.xp<step.xp?['XP '+f.xp+'/'+step.xp]:[]),...(f.coins<step.cost?['Xu '+f.coins+'/'+step.cost]:[]),...Object.entries(step.materials).filter(([k,n])=>(f.inventory[k]??0)<n).map(([k,n])=>goods[k].name+' '+(f.inventory[k]??0)+'/'+n)];
    return {title:'Mở '+def.name+' cấp '+goal.level,copy:missing.length?'Theo dõi những điều kiện còn thiếu.':'Đã đủ điều kiện. Bạn có thể xem và xác nhận xây.',meta:missing.join(' · ')||'Xu và vật liệu được dùng khi bạn xác nhận.',cta:'Xem điều kiện xây',route:{kind:'building',key:goal.building}};
  }
  if(goal.stage==='done')return {title:'Vụ đầu đã hoàn thành!',copy:'Bạn đã thu và bán nông sản. Hãy chọn điều mình muốn làm tiếp.',meta:'Phần thưởng vẫn theo các thao tác và Sổ việc hiện có.',stage:4,done:true,cta:'Chọn mục tiêu khác',route:{kind:'choose'}};
  const p=goal.crop&&plotAt(f,goal.crop.index);
  if(goal.stage==='plant'||goal.stage==='sell'&&!(f.inventory.wheat>0)){
    const index=f.plotIndexes.find(i=>!plotAt(f,i)),hasSeed=(f.inventory.wheatSeed??0)>0;
    if(!hasSeed)return {title:'Gieo lứa lúa mì đầu tiên',copy:'Bạn chưa có giống lúa mì. Mục tiêu được giữ lại để tiếp tục sau.',meta:'Giống lúa mì: '+goods.wheatSeed.buy+' xu · Bạn có '+f.coins+' xu',stage:0,blocked:true,cta:'Tìm giống ở chợ',route:{kind:'seed'}};
    if(index===undefined)return {title:'Gieo lứa lúa mì đầu tiên',copy:'Các ô đang có cây. Thu một vụ hoặc mở thêm luống rồi tiếp tục.',meta:'Không tự xóa cây đang trồng.',stage:0,blocked:true,cta:'Xem ruộng',route:{kind:'field'}};
    const hard=f.soilCompactsAt?.[index]<=snapshot.now;
    return {title:hard?'Cuốc đất để gieo lúa mì':'Gieo lứa lúa mì đầu tiên',copy:goal.notice||(goal.stage==='sell'?'Chưa còn lúa mì để bán. Gieo thêm một vụ để tiếp tục.':hard?'Ô trống đã chai. Cuốc trước rồi chọn giống.':'Chọn một ô trống và gieo 1 giống đang có.'),meta:'Trong túi có '+f.inventory.wheatSeed+' giống lúa mì',stage:0,cta:hard?'Đến ô cần cuốc':'Chọn ô trống',route:{kind:'plot',index}};
  }
  if(goal.stage==='sell')return {title:'Bán một phần lúa mì',copy:'Bán một phần nông sản đã thu, giữ lại hàng nếu cần gieo hoặc chế biến.',meta:'Trong kho có '+f.inventory.wheat+' lúa mì · '+goods.wheat.sell+' xu/món',stage:3,cta:'Tới Bán nhanh',route:{kind:'sell'}};
  if(!p)return {title:'Tiếp tục vụ lúa mì',copy:'Vụ đang theo dõi đã thay đổi. Chọn lại mục tiêu phù hợp.',meta:'Không tự đánh dấu đã thu hoạch.',stage:0,cta:'Chọn mục tiêu',route:{kind:'choose'}};
  if(p.progress>=cropGoal(p)){
    const amount=Math.max(0,cropYield(p)-(p.picked??0)),free=capacity(f)-stock(f),full=free<amount;
    return {title:'Thu lứa lúa mì đầu tiên',copy:full?'Kho thiếu chỗ nhận nông sản. Dọn chỗ rồi quay lại thu lứa này.':'Lúa mì đã chín. Bạn có thể thu hoặc giữ lại một giống.',meta:'Kho còn '+Math.max(0,free)+' chỗ · Vụ này còn '+amount+' nông sản',stage:2,blocked:full,cta:full?'Mở kho để dọn chỗ':'Đến ô lúa mì',route:full?{kind:'stock'}:{kind:'plot',index:goal.crop.index}};
  }
  if(goal.stage==='water')return {title:'Tưới cho lứa lúa mì',copy:'Đất đang khô. Tưới để cây lớn thuận lợi hơn.',meta:'Lúa mì · Đất chưa đủ ẩm',stage:1,cta:'Đến ô lúa mì',route:{kind:'plot',index:goal.crop.index}};
  return {title:'Chờ lúa mì đến kỳ thu',copy:'Đất đủ ẩm. Bạn có thể làm việc khác rồi quay lại.',meta:crops.wheat.time/60+' phút là thời gian cơ sở, không phải giờ thu chắc chắn.',stage:2,cta:'Xem dự báo',route:{kind:'weather'}};
}
