import {villageLevels} from './village.mjs';
import {atHomeBed} from './home-rules.mjs';
import {restSeconds,vitals,wellnessAt,workBlock,workCost} from './wellness.mjs';
import {farmTasks,taskStyles} from './tasks.mjs';
import {coopCapacity,fenceAt,fences,landTypes,lotPrice,plotOffset,pondCapacity,pondOffset} from './land.mjs';
import {aquatic,pondFood,pondReady,pondYield,visiblePondBatches} from './aqua.mjs';
import {createSceneChat} from './scene-chat.mjs';
import {createWorld} from './world.mjs';
import {maps} from './world-layout.mjs';
import {advanceVillage, animalRequirement, animals, apply, buildings, capacity, catchOdds, cropGoal, cropRequirement, crops, cropYield, dryGrowthFactor, dayAt, dayGoals, dayReward, growthGoal, productGoal, upgradeCalendar, upgradeRequirement, GameError, goods, newFarm, newRoom, snapshot, startSoilClock, startVillageSecurity, stock, unixNow} from './game.mjs';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={
  read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} },
};
const sessionKey='mua-vui-session:1', previousKey='mua-vui-previous:1', demoKey='mua-vui-demo:2', accountKey='mua-vui-account:1';
const tabs={
  field:['🌱','Vườn nhà','Gieo hạt, chăm vườn và thu hoạch theo thời tiết.'],
  home:['🏠','Nhà vườn','Vào nhà để nghỉ sức và xem Sổ việc hôm nay.'],
  workshop:['⚙️','Xưởng máy','Không gian chế tạo và nâng cấp vật phẩm của nông trại.'],
  coop:['🐔','Chuồng trại','Chăm vật nuôi để thu trứng, sữa hoặc xuất chuồng lợn.'],
  lake:['🐟','Hồ làng','Thả câu ở cầu gỗ. Cá nhỏ thường gặp, cá chép vàng rất hiếm.'],
  market:['🧺','Chợ làng','Mua vật tư, giao đơn và trao đổi nông sản với hàng xóm.'],
  neighbors:['🏘️','Hàng xóm','Ghé vườn, kho và ao cá của hàng xóm.'],
};
let session=store.read(sessionKey);
let accountSession=store.read(accountKey);
let demo;
let state, tab='field', selected=0, neighborId, busy=false, toastTimer, inviteCode='';
let revision=-1, receivedAt=Date.now(), villagePage=0, stockPage=0, panel='area', marketPane='orders', pondTab=0, selectedLot=0, plotGroup=-1, visitPond=0, baseDecorOpen=false, showTomorrow=false;
const areaIcons={field:'leaf',home:'home',workshop:'build',coop:'coop',market:'market',neighbors:'users',lake:'fish'};
const panels={area:['leaf','Khu vực'],land:['build','Đất'],ponds:['fish','Ao nuôi'],orders:['orders','Đơn hàng'],stock:['bag','Kho'],buildings:['build','Xây dựng'],log:['log','Nhật ký']};
const tabGroups={main:['area','tasks','rank'],farm:['land','ponds','stock'],village:['orders','villageLevel','buildings','log']};
const extraPanels={tasks:['orders','Việc cần làm'],rank:['trophy','Tài sản'],villageLevel:['build','Cấp làng']};
const icon=name=>'<svg aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const dialog=$('#dialog');
let lastPanelTime=0, composingMarketSearch=false;
const marketQueries={supplies:'',sales:'',stall:''};
const world=createWorld($('#world'),interactWithWorld);
const sceneChat=createSceneChat({api,world,showToast,context:()=>state&&{session,area:tab==='neighbors'&&neighborId?'visit':tab==='workshop'?'field':tab,host:neighborId}});
let tasks=[];
const cropAt=(farm,index)=>index<plotOffset?farm.plots[index]:farm.extraPlots[index];
const lotLabel=lot=>lot?.kind==='empty'?'Đất trống':landTypes[lot?.kind]?.name??'Chưa mua';
const gardenFor=index=>index<plotOffset?-1:Math.floor((index-plotOffset)/3);
const btn=(label,attrs='',kind='',disabled=false)=>'<button type="button" class="btn '+kind+'" '+attrs+(disabled?' disabled':'')+'>'+label+'</button>';
const act=(label,action,item='',index='',kind='',disabled=false,qty=1)=>btn(label,`data-action="${action}" data-item="${item}" data-index="${index}" data-qty="${qty}"`,kind,disabled);
const nice=(key)=>goods[key].icon+' '+goods[key].name;
const duration=seconds=>{
  const sec=Math.max(0,Math.ceil(seconds));
  if(sec>=3600)return Math.floor(sec/3600)+' giờ '+String(Math.floor(sec/60)%60).padStart(2,'0')+' phút';
  return sec>=60?Math.floor(sec/60)+'p '+String(sec%60).padStart(2,'0')+'s':sec+'s';
};
const progress=(value,max)=>Math.min(100,Math.floor(100*value/max));
const valueBar=(value,max)=>'<div class="progress"><i style="width:'+progress(value,max)+'%"></i></div>';
const currentTime=()=>state.now+Math.floor((Date.now()-receivedAt)/1000);
function setupDemo() {
  if(demo) return;
  demo=store.read(demoKey);
  const time=unixNow();
  if(demo?.farms?.demo){
    if(upgradeCalendar(demo,time))store.write(demoKey,demo);
    seedDemoPonds(time);
    return;
  }
  demo=newRoom(time);
  demo.farms.demo=newFarm('demo','Vườn nhà',time);
  demo.farms.sen=newFarm('sen','Vườn cô Sen',time);
  demo.farms.lua=newFarm('lua','Vườn chú Lúa',time);
  demo.farms.demo.plots[1]={kind:'wheat',progress:60,pests:0,at:time,wetUntil:0,protectedUntil:0,fertilized:false,picked:0};
  const plot=kind=>({kind,progress:crops[kind].time,pests:0,at:time,wetUntil:0,protectedUntil:0,fertilized:false,picked:0});
  demo.farms.sen.plots[2]=plot('carrot');
  demo.farms.sen.inventory.carrot=6;
  demo.farms.lua.plots[3]=plot('corn');
  demo.farms.lua.inventory.corn=6;
  demo.listings[1]={id:1,seller:'sen',item:'carrot',qty:3,price:8};
  demo.nextListing=2;
  seedDemoPonds(time);
}
function seedDemoPonds(time){
  if(demo.fishingTour)return;
  const examples={sen:'tilapia',lua:'carp'};
  for(const [id,kind] of Object.entries(examples)){
    const farm=demo.farms[id];
    if(farm&&!visiblePondBatches(farm,0).length)farm.ponds={...farm.ponds,0:[{kind,count:1,at:time,progress:aquatic[kind].time,fedUntil:0,picked:0}]};
  }
  demo.fishingTour=true;
  store.write(demoKey,demo);
}
function setState(next) {
  state=next;
  receivedAt=Date.now();
}
function updateDemo() {
  setupDemo();
  const time=unixNow();
  const day=dayAt(demo,time);
  const started=startVillageSecurity(demo,day);
  const soilStarted=startSoilClock(demo,time);
  if(advanceVillage(demo,day)||started||soilStarted)store.write(demoKey,demo);
  setState(snapshot(demo,demo.farms.demo,time));
}
async function api(path, payload, credentials=session) {
  const headers={};
  if(credentials) {
    headers.authorization='Bearer '+credentials.token;
    headers['x-room-code']=credentials.code;
  }
  let response;
  try {
    if(payload) headers['content-type']='application/json';
    response=await fetch('/api/'+path,{method:payload?'POST':'GET',headers,body:payload?JSON.stringify(payload):undefined,cache:'no-store',signal:AbortSignal.timeout(8500)});
  } catch {
    throw new Error('Không thể kết nối với làng. Kiểm tra mạng rồi thử lại.');
  }
  const result=await response.json().catch(()=>null);
  if(!result||!response.ok) {
    const error=new Error(result?.error||'Máy chủ làng chưa sẵn sàng.');
    error.status=response.status;
    throw error;
  }
  return result;
}
async function apiAccount(path,payload) {
  const headers={};
  if(accountSession?.token) headers.authorization='Bearer '+accountSession.token;
  let response;
  try {
    if(payload) headers['content-type']='application/json';
    response=await fetch('/api/account/'+path,{method:payload?'POST':'GET',headers,body:payload?JSON.stringify(payload):undefined,cache:'no-store',signal:AbortSignal.timeout(8500)});
  } catch {
    throw new Error('Không thể kết nối tài khoản. Kiểm tra mạng rồi thử lại.');
  }
  const result=await response.json().catch(()=>null);
  if(!result||!response.ok) {
    const error=new Error(result?.error||'Tài khoản chưa sẵn sàng.');
    error.status=response.status;
    throw error;
  }
  return result;
}
function showToast(message,error=false) {
  const toast=$('#toast');
  toast.textContent=message;
  toast.className='show'+(error?' error':'');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.className='',4200);
}
function boardBar(name,right='') {
  return '<div class="board-bar"><span class="label board-title">'+name+'</span><span class="label">'+right+'</span></div>';
}
function renderField(farm) {
  const gardens=farm.land.flatMap((lot,i)=>lot?.kind==='garden'?[i]:[]);
  const indices=farm.plotIndexes.filter(i=>gardenFor(i)===plotGroup);
  const group=gardens.length?'<label class="compact-label">Vườn <select data-crop-group><option value="-1"'+(plotGroup<0?' selected':'')+'>Ruộng chính</option>'+gardens.map(i=>'<option value="'+i+'"'+(plotGroup===i?' selected':'')+'>Ô đất '+(i+1)+'</option>').join('')+'</select></label>':'';
  const damp=state.afterRainUntil>currentTime()?'<p class="farm-warning">Sau mưa: sâu dễ xuất hiện trong <strong data-until="'+state.afterRainUntil+'">'+duration(state.afterRainUntil-currentTime())+'</strong> tới.</p>':'';
  return '<div class="row area-heading"><h2>Ô canh tác</h2><span class="badge">'+indices.filter(i=>cropAt(farm,i)).length+'/'+indices.length+' ô đã gieo</span></div>'+
    damp+group+'<div class="plot-select">'+indices.map(i=>{
      const crop=cropAt(farm,i), amount=crop?progress(crop.progress,cropGoal(crop)):0;
      const label=plotGroup<0?i+1:(i-plotOffset)%3+1;
      const task=tasks.find(task=>task.kind==='plot'&&task.index===i);
      const hard=!crop&&farm.soilCompactsAt[i]<=currentTime();
      return `<button class="btn${selected===i?' primary':''}" ${task?'data-flag="'+task.type+'" ':''}data-plot="${i}" aria-pressed="${selected===i}">${crop?goods[crop.kind].icon:hard?'⚒':'＋'} Ô ${label}${crop?' · '+amount+'%':hard?' · Chai':''}</button>`;
    }).join('')+'</div>';
}
function renderWorkshop(farm){
  return boardBar('Xưởng máy','⚙️ Cấp '+farm.workshop)+
    '<div class="workshop-board"><div class="workshop-emblem">⚙️</div><div><h2>Khu chế tạo</h2><p>Máy móc đã sẵn sàng. Công thức, nguyên liệu và cơ chế chế tạo vật phẩm sẽ được bổ sung trong bản cập nhật tiếp theo.</p></div></div>'+
    '<div class="craft-slots" aria-label="Vị trí công thức đang chờ"><span>＋ Công thức</span><span>＋ Nguyên liệu</span><span>＋ Thành phẩm</span></div>';
}
function renderCropTools(farm,now) {
  const plot=cropAt(farm,selected);
  if(!plot&&farm.soilCompactsAt[selected]<=now)return '<h2>Đất đã chai</h2><p>Ô này bỏ trống ít nhất 8 giờ. Cuốc đất để làm tơi rồi gieo hạt.</p><div class="actions">'+act('Cuốc đất','till','',selected,'primary')+'</div>';
  if(!plot) return '<h2>Gieo hạt</h2><p>Chọn giống cho ô '+(selected<plotOffset?selected+1:(selected-plotOffset)%3+1)+'. Cây chất lượng cao cần Xưởng máy.</p><div class="actions crop-actions">'+Object.entries(crops).map(([key,crop])=>{
    const locked=cropRequirement(farm,key);
    return act(nice(key)+(locked?' · 🔒 '+locked:' · '+(farm.inventory[crop.seed]||0)),'plant',key,selected,crop.quality?'gold':'',!!locked||!farm.inventory[crop.seed]);
  }).join('')+'</div>';
  const goal=cropGoal(plot), ripe=plot.progress>=goal;
  const wet=plot.wetUntil>now||state.weather.wet;
  const yieldTotal=cropYield(plot);
  const remaining=Math.max(0,yieldTotal-(plot.picked??0));
  const normal=crops[plot.kind].yield+Number(!!plot.fertilized);
  const forecast=(ripe?'Có thể thu '+remaining:'Dự kiến '+remaining)+' / '+normal+' món'+(normal>yieldTotal?' · Sâu đã làm mất '+(normal-yieldTotal)+' món':'')+'.';
  return '<div class="row"><h2>'+goods[plot.kind].name+'</h2><span class="badge">'+(ripe?'Đã chín':progress(plot.progress,goal)+'% lớn')+'</span></div>'+
    (!ripe?'<p>Còn ~'+duration(goal-plot.progress)+' theo tốc độ cơ sở · '+(wet?'Đất ẩm':'Đất khô · '+Math.round(dryGrowthFactor*100)+'% tốc độ cơ sở')+' · Sâu '+Math.floor(plot.pests)+'%'+(plot.fertilized?' · Đã bón phân':'')+'</p>':'')+
    '<p>'+forecast+'</p>'+valueBar(plot.progress,goal)+
    '<div class="actions">'+(ripe?act('Thu hoạch','harvest','',selected,'primary')+
      '<button type="button" class="btn subtle" data-action="harvest" data-index="'+selected+'" data-source="seed"'+(!remaining||(farm.inventory[crops[plot.kind].seed]??0)>=100?' disabled':'')+'>Thu và giữ 1 giống</button>':
      act('💧 Tưới nước','water','',selected,'primary',wet)+
      act('🧺 Bón phân · '+(farm.inventory.fertilizer||0),'fertilize','',selected,'',plot.fertilized||!farm.inventory.fertilizer)+
      act('🧴 Xịt thuốc · '+(farm.inventory.spray||0),'spray','',selected,'',plot.protectedUntil>now||!farm.inventory.spray))+'</div>';
}
function upgrade(farm,key) {
  const definition=buildings[key], level=farm[key]??definition.base??1;
  const index=level-(definition.base??(key==='fence'||key==='coop'?0:1));
  const cost=definition.costs[index];
  const locked=upgradeRequirement(farm,key);
  return '<div class="row itemrow"><div><strong>'+definition.icon+' '+definition.name+(level?' · Cấp '+level:'')+'</strong><p>'+escape(locked||definition.notes[index])+'</p></div>'+
    (cost?act((level?'Nâng':'Xây')+' · '+cost+' xu','upgrade',key,'','',farm.coins<cost||!!locked):'<span class="badge">Tối đa</span>')+'</div>';
}
function renderCoop(farm,now,lot){
  const pens=farm.pens.map((pen,i)=>({pen,i})).filter(entry=>entry.pen.lot===lot);
  const limit=coopCapacity(farm,lot);
  return boardBar(lot===undefined?'Chuồng chính':'Chuồng ở ô '+(lot+1),limit?'🐾 '+pens.length+'/'+limit:'Chưa xây chuồng')+
    '<div class="farm-list">'+(!limit?'<article><h3>Dựng chuồng đầu tiên</h3><p>Mở chỗ cho hai gà mái. Nâng cấp để nuôi bò, lợn và che nắng.</p><div class="actions">'+act('Xây chuồng · 45 xu','upgrade','coop','','primary',farm.coins<45)+'</div></article>':'')+
    pens.map(({pen,i})=>{
      const info=animals[pen.kind];
      const targetAge=growthGoal(pen), targetProduct=productGoal(pen), grown=pen.age>=targetAge, ready=pen.progress>=targetProduct;
      const status=!grown?'Đang lớn':info.oneTime?(ready?'Sẵn sàng xuất chuồng':'Đang vỗ béo'):(ready?'Có ':'Đang tạo ')+goods[info.product].name.toLowerCase();
      const label=info.oneTime?'Xuất chuồng · '+info.yield+' thịt lợn':'Thu sản phẩm';
      const ref=' data-target="'+(pen.id??i)+'" data-index="'+i+'"';
      const feed=btn('Cho ăn · '+info.food,'data-action="feed"'+ref,'',pen.fedUntil>now||farm.inventory.feed<info.food);
      const collect=btn(label,'data-action="collect"'+ref,'primary');
      return '<article data-pen="'+i+'"><div class="row"><div class="row"><span class="animal-icon">'+info.icon+'</span><div><h3>'+info.name+' '+(i+1)+'</h3><p>'+status+
        (ready?'':' · '+duration(grown?targetProduct-pen.progress:targetAge-pen.age)+' cơ sở · '+(pen.fedUntil>now?'Còn thức ăn '+duration(pen.fedUntil-now):'Đói'))+
        '</p></div></div><div class="actions">'+(ready?(info.oneTime?'':feed)+collect:feed)+'</div></div>'+valueBar(grown?pen.progress:pen.age,grown?targetProduct:targetAge)+'</article>';
    }).join('')+
    (limit?'<article><h3>Đón vật nuôi</h3><div class="actions">'+Object.entries(animals).map(([key,info])=>{
      const locked=animalRequirement(farm,key,lot);
      return act(info.icon+' '+info.name+(locked?' · 🔒 '+locked:' · '+info.cost+' xu'),'animal',key,lot??'','gold',!!locked||farm.coins<info.cost||pens.length>=limit);
    }).join('')+'</div></article>':'')+'</div>';
}
function renderMarket(farm) {
  const options={orders:'Đơn làng',stall:'Sạp làng',supplies:'Vật tư',sales:'Bán nhanh'};
  const subnav='<div class="market-tabs">'+Object.entries(options).map(([key,label])=>btn(label,'data-market-pane="'+key+'" aria-pressed="'+(marketPane===key)+'"',marketPane===key?'primary':'subtle')).join('')+'</div>';
  if(marketPane==='orders')return boardBar('Chợ làng')+subnav+'<div class="farm-list"><article id="market-orders">'+renderOrders(farm,currentTime())+'</article></div>';
  const titles={stall:'Sạp nông sản',supplies:'Vật tư',sales:'Bán nhanh cho chợ'};
  const label=marketPane==='sales'?'Tìm nông sản cần bán':marketPane==='supplies'?'Tìm vật tư cần mua':'Tìm nông sản trên sạp';
  const list=marketPane==='stall'?btn('Đăng bán','data-list','primary',!stock(farm)):'';
  return boardBar('Chợ làng')+subnav+'<div class="farm-list"><article id="market-'+marketPane+'"><div class="row"><h3>'+titles[marketPane]+'</h3>'+list+'</div>'+
    '<label class="market-search">'+label+'<input type="search" data-market-search="'+marketPane+'" autocomplete="off" placeholder="Nhập tên vật phẩm" value="'+escape(marketQueries[marketPane])+'"></label>'+
    '<div class="itemlist" data-market-results>'+renderMarketResults(farm,marketPane)+'</div></article></div>';
}
const searchText=value=>value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d').trim();
function renderMarketResults(farm,pane){
  const query=searchText(marketQueries[pane]);
  const words=query.split(/\s+/);
  const matches=key=>words.every(word=>searchText(goods[key].name).includes(word));
  const empty='<p role="status">Không tìm thấy vật phẩm phù hợp.</p>';
  if(pane==='stall'){
    return state.listings.filter(entry=>matches(entry.item)).map(entry=>
      '<div class="row itemrow"><div><strong>'+nice(entry.item)+' × '+entry.qty+'</strong><p>'+escape(entry.sellerName)+' · '+entry.price+' xu/món</p></div>'+
      (entry.seller===farm.id?act('Gỡ','delist','',entry.id,'subtle'):act('Mua · '+entry.price*entry.qty+' xu','deal','',entry.id,'gold',farm.coins<entry.price*entry.qty))+'</div>'
    ).join('')||(query?empty:'<p>Sạp đang trống.</p>');
  }
  const sell=pane==='sales';
  return Object.keys(goods).filter(key=>matches(key)&&(sell?goods[key].sell&&farm.inventory[key]:goods[key].buy)).map(key=>{
    const count=farm.inventory[key]??0;
    if(!sell){
      const crop=Object.keys(crops).find(crop=>crops[crop].seed===key),locked=crop&&cropRequirement(farm,crop);
      return '<div class="row itemrow"><div><strong>'+nice(key)+'</strong><p>'+(locked?'🔒 '+locked:'Trong túi '+count)+'</p></div>'+
        btn('Mua · '+goods[key].buy+' xu','data-shop="'+key+'"','',!!locked||farm.coins<goods[key].buy||count>=100)+'</div>';
    }
    const price=goods[key].sell;
    return '<div class="itemrow market-sale"><strong>'+nice(key)+' × '+count+'</strong><div class="actions">'+
      btn('Bán · '+price+' xu','data-sell="'+key+'"')+btn('Bán hết','data-sell-all="'+key+'" aria-label="Bán hết '+goods[key].name+'"','gold')+'</div></div>';
  }).join('')||(query?empty:'<p>Thu hoạch nông sản để bán lấy xu.</p>');
}
function renderNeighbors(farm,now) {
  const villageLeft=state.village.theftsLeft;
  const left=Math.max(0,Math.min(villageLeft,farm.bag*2-farm.daily.taken));
  let html=boardBar(neighborId?'Ghé thăm':'Hàng xóm','🎒 '+left+'/'+farm.bag*2+' lượt');
  const mine={...farm,wealth:state.wealth.find(row=>row.id===farm.id)?.total??farm.coins,mine:true};
  const homes=[mine,...state.neighbors];
  const current=state.neighbors.find(n=>n.id===neighborId);
  if(!current) {
    const count=Math.ceil(homes.length/6);
    const pages=count>1?'<div class="row map-pages">'+btn('‹ Trang trước','data-village-page="'+(villagePage-1)+'"','subtle',villagePage===0)+'<span>'+String(villagePage+1)+' / '+count+'</span>'+btn('Trang sau ›','data-village-page="'+(villagePage+1)+'"','subtle',villagePage+1>=count)+'</div>':'';
    const cards=homes.slice(villagePage*6,villagePage*6+6).map(n=>'<article class="row"><div><h3>🏡 '+escape(n.name)+(n.mine?' · Bạn':'')+'</h3><p>'+formatCoins(n.wealth)+' xu tài sản · Ruộng cấp '+n.field+(n.mine?'':n.shieldUntil>now?' · Đang đóng cổng':' · '+n.garden.length+' ô chín có thể lấy')+'</p></div>'+btn(n.mine?'Về nhà':'Ghé thăm',n.mine?'data-tab="field"':`data-visit="${n.id}"`,'primary')+'</article>').join('');
    const waiting=state.neighbors.length?'':'<article><h3>Làng đang chờ hàng xóm</h3><p>Chia sẻ mã làng để bạn bè vào trồng và trao đổi cùng bạn.</p><div class="actions">'+btn('Chia sẻ mã','data-room','primary')+'</div></article>';
    return html+pages+'<div class="farm-list">'+cards+waiting+'</div>';
  }
  const unavailable=left<1||current.available<1||farm.daily.targets.includes(current.id)||current.shieldUntil>now;
  const message=villageLeft<1?'Cả làng đã hết lượt trộm hôm nay.':current.shieldUntil>now?'Cổng đang đóng.':farm.daily.targets.includes(current.id)?'Bạn đã lấy một món tại đây hôm nay.':current.available<1?'Vườn đã đạt giới hạn bị lấy hôm nay.':left<1?'Túi ghé vườn đã hết lượt hôm nay.':'Mỗi lần lấy một món.';
  const pick=(key,source,index='')=>btn('Lấy 1 '+nice(key),`data-action="steal" data-target="${current.id}" data-source="${source}" data-index="${index}" data-item="${key}"`,'gold',unavailable);
  return html+'<div class="farm-list"><article><div class="row"><h3>🏡 '+escape(current.name)+'</h3>'+btn('Về danh sách','data-return')+'</div><p>Ruộng cấp '+current.field+' · '+current.animalCount+' vật nuôi</p><p>'+message+'</p></article>'+
    '<article id="visit-garden"><h3>🌱 Ngoài vườn</h3>'+(current.garden.length?'<div class="actions">'+current.garden.map(p=>pick(p.kind,'garden',p.index)).join('')+'</div>':'<p>Chưa có ô nào đủ nông sản để lấy.</p>')+'</article>'+
    '<article id="visit-barn"><h3>📦 Trong kho</h3>'+(current.items.length?'<div class="actions">'+current.items.map(key=>pick(key,'barn')).join('')+'</div>':'<p>Kho đang giữ lại nông sản cho chủ vườn.</p>')+'</article>'+
    '<article id="visit-pond"><h3>Ao nuôi hàng xóm</h3>'+visitFishing(current,unavailable,now)+'</article></div>';
}
function visitFishing(current,unavailable,now){
  const ponds=current.pondIndexes;
  if(!ponds.includes(visitPond))visitPond=ponds[0];
  const cast=state.me.fishing.cast;
  if(cast?.target===current.id&&ponds.includes(cast.index))visitPond=cast.index;
  const batch=visiblePondBatches(current,visitPond).find(row=>row.available);
  const buttons=ponds.length===1?'':'<div class="actions">'+ponds.map(i=>btn(i===0?'Ao chính':'Ao ô '+(i-pondOffset+1),'data-visit-pond="'+i+'"',i===visitPond?'primary':'subtle')).join('')+'</div>';
  return buttons+'<p>'+(batch?.available?'Có '+goods[batch.kind].name.toLowerCase()+' đủ lớn.':'Ao chưa có đủ cá trưởng thành.')+'</p>'+fishingControls('pond',now,{target:current.id,index:visitPond,allowed:!unavailable&&!!batch?.available});
}
function renderPonds(farm,now){
  if(!farm.pondIndexes.includes(pondTab))pondTab=0;
  const tabs=farm.pondIndexes.map(index=>btn(index===0?'Ao nuôi chính':'Ao nuôi · Ô '+(index-pondOffset+1),'data-pond-tab="'+index+'" aria-pressed="'+(pondTab===index)+'"',pondTab===index?'primary':'subtle')).join('');
  const batches=visiblePondBatches(farm,pondTab);
  const used=batches.reduce((sum,batch)=>sum+(batch.count??1),0);
  const limit=pondCapacity(farm,pondTab), food=farm.inventory.aquaFeed??0;
  const header='<div class="row"><h2>Ao nuôi cá và tôm</h2>'+btn('Tới cầu gỗ','data-pond-go','subtle')+'</div><div class="market-tabs pond-tabs">'+tabs+'</div>'+
    '<p>Đã thả '+used+'/'+limit+' con giống · Còn '+food+' phần thức ăn.</p>';
  const seeds=Object.entries(aquatic).map(([item,def])=>{
    const available=farm.inventory[def.seed]??0;
    return btn('Thả '+nice(item)+' · '+available+' giống','data-aqua-stock="'+item+'"','subtle',limit<=used||!available||batches.some(batch=>batch.kind===item));
  }).join('');
  const rows=batches.map(batch=>{
    const def=aquatic[batch.kind],ripe=pondReady(batch),eating=batch.fedUntil>now,cost=pondFood(batch);
    const status=ripe?'Có thể thu '+pondYield(batch)+' con.':(eating?'Đang lớn':'Thiếu thức ăn')+' · '+progress(batch.progress,def.time)+'%.';
    const action=ripe?act('Thu hoạch','aquaHarvest',batch.kind,pondTab,'primary'):
      act('Cho ăn · '+cost+' phần','aquaFeed',batch.kind,pondTab,'primary',eating||food<cost);
    return '<article><h3>'+nice(batch.kind)+' · '+(batch.count??1)+' giống</h3><p>'+status+'</p>'+valueBar(batch.progress,def.time)+'<div class="actions">'+action+'</div></article>';
  }).join('');
  return header+'<div class="actions">'+seeds+'</div>'+(rows?'<div class="farm-list">'+rows+'</div>':'<p>Ao đang trống. Bạn có thể mua con giống ở chợ làng.</p>');
}
function showPondStock(item){
  const farm=state.me, def=aquatic[item];
  const batches=visiblePondBatches(farm,pondTab);
  const used=batches.reduce((sum,batch)=>sum+(batch.count??1),0);
  const max=Math.min(farm.inventory[def.seed]??0,pondCapacity(farm,pondTab)-used);
  if(max<1||batches.some(batch=>batch.kind===item))return;
  modal('Thả '+def.name.toLowerCase(),'<p>Có thể thả tối đa '+max+' con giống vào ao này.</p>'+
    '<form data-form="aquaStock" data-item="'+item+'" data-pond="'+pondTab+'"><label>Số con giống<input name="qty" type="number" min="1" max="'+max+'" value="1" required></label>'+
    '<button class="btn primary" type="submit">Thả giống</button></form><p id="dialog-error" role="status"></p>');
}
function fishingControls(source,now,{target,index,allowed=true}={}){
  const info=state.me.fishing, cast=info.cast;
  if(cast){
    const same=cast.source===source&&(source==='public'||cast.target===target&&cast.index===index);
    if(!same)return '<p>Bạn đang có cần câu ở một điểm khác.</p>';
    const ready=cast.ready<=now;
    const time=ready?cast.expires-now:cast.ready-now;
    return '<p>'+(ready?'Phao chìm rồi! Còn ':'Chờ cá cắn ')+'<strong data-until="'+(ready?cast.expires:cast.ready)+'">'+duration(time)+'</strong>.</p><div class="actions">'+act('Kéo cần','reel','','','primary',!ready)+'</div>';
  }
  if(state.weather.id==='storm')return '<p>Trời đang dông. Bạn có thể thả câu sau khi dông qua.</p>';
  if(source==='public'){
    if(info.used>=state.fishingLimit)return '<p>Bạn đã dùng hết lượt câu hôm nay.</p>';
    if(info.nextAt>now)return '<p>Có thể thả lại sau <strong data-until="'+info.nextAt+'">'+duration(info.nextAt-now)+'</strong>.</p>';
  }
  return '<div class="actions">'+btn(source==='public'?'Thả câu miễn phí':'Thả câu trộm',
    'data-action="cast" data-source="'+source+'"'+(target?' data-target="'+target+'" data-index="'+index+'"':''),'primary',!allowed)+'</div>';
}
function renderLake(farm,now){
  const odds=state.weather.id==='storm'?'Dông lớn làm tạm dừng thả câu.':'Cá nhỏ thường gặp. Tỷ lệ cá chép vàng '+catchOdds(state.weather)+'%.';
  return '<div class="row"><h2>Câu ở hồ làng</h2><span class="badge">'+(state.fishingLimit-farm.fishing.used)+' / '+state.fishingLimit+' lượt</span></div><p>'+odds+'</p>'+fishingControls('public',now);
}
function decorOptions(farm,index){
  const style=fenceAt(farm,index);
  return '<div class="actions fences">'+Object.entries(fences).map(([key,option])=>act(option.name+' · '+option.cost+' xu','decorate',key,index,key===style?'primary':'subtle',key===style||farm.coins<option.cost)).join('')+(style?act('Gỡ rào','decorate','none',index,'subtle'):'')+'</div>';
}
function renderLand(farm,now){
  const lot=farm.land[selectedLot], price=lotPrice(farm.land.filter(Boolean).length);
  const grid=farm.land.map((entry,i)=>btn((i+1)+' · '+lotLabel(entry),'data-land-tab="'+i+'" aria-pressed="'+(selectedLot===i)+'"',selectedLot===i?'primary':'subtle')).join('');
  const header='<div class="row"><h2>Quỹ đất</h2><span class="badge">'+farm.land.filter(Boolean).length+'/'+farm.land.length+' ô</span></div><div class="land-grid">'+grid+'</div>';
  if(!lot)return header+'<p>Ô '+(selectedLot+1)+' chưa có chủ.</p><div class="actions">'+act('Mua ô đất · '+price+' xu','buyLand','',selectedLot,'primary',farm.coins<price)+'</div>';
  const go=btn('Tới ô '+(selectedLot+1),'data-land-go="'+selectedLot+'"','subtle');
  if(lot.kind==='empty')return header+'<p>Chọn công trình cho ô đất trống.</p><div class="actions">'+Object.entries(landTypes).map(([key,type])=>act(type.name+' · '+type.cost+' xu','buildLand',key,selectedLot,'subtle',farm.coins<type.cost)).join('')+go+'</div>';
  const launch=lot.kind==='garden'?btn('Chăm vườn','data-open-garden="'+selectedLot+'"','primary'):
    lot.kind==='pond'?btn('Chăm ao','data-open-pond="'+(selectedLot+pondOffset)+'"','primary'):'';
  return header+'<h3>'+lotLabel(lot)+' · Ô '+(selectedLot+1)+'</h3><div class="actions">'+launch+go+'</div>'+
    '<h3 class="section-title">Hàng rào trang trí</h3>'+decorOptions(farm,selectedLot)+(lot.kind==='coop'?'<div class="lot-coop">'+renderCoop(farm,now,selectedLot)+'</div>':'');
}
function renderJournal(farm){
  const {done,claimed}=farm.journal;
  const list=dayGoals.map(goal=>{
    const complete=done.includes(goal.id);
    const link=goal.area?'data-tab="'+goal.area+'"':'data-panel="'+goal.panel+'"';
    return '<li data-done="'+complete+'"><span class="journal-check">'+(complete?'✓':'○')+'</span>'+
      '<span>'+goal.label+'</span>'+(complete?'<span class="journal-status">Đã xong</span>':
        btn('Đi tới',link+' aria-label="'+goal.label+'"','subtle'))+'</li>';
  }).join('');
  return '<section class="journal"><div class="row"><h3>Sổ việc hôm nay</h3><span class="badge">'+done.length+'/'+dayGoals.length+'</span></div>'+
    '<ul>'+list+'</ul><div class="row journal-reward"><small>'+dayReward.coins+' xu · '+dayReward.xp+' XP</small>'+
    act(claimed?'Đã nhận':'Nhận thưởng','claimDay','','','gold',claimed||done.length!==dayGoals.length)+'</div></section>';
}
function renderHome(farm,now){
  const health=wellnessAt(farm,now);
  const status=health.restUntil>now?'Đang nghỉ · <span data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</span>':
    (health.until.stamina??0)>now?'Có thể nghỉ lại sau <span data-until="'+health.until.stamina+'">'+duration(health.until.stamina-now)+'</span>':
    'Thể lực '+Math.floor(health.stamina)+'/100';
  return '<section class="home-guide"><div><h2>Chỗ nghỉ</h2><p>'+status+'</p></div>'+
    '<div class="actions">'+btn('Đến giường','data-bed-go','primary')+btn('Ra vườn','data-home-exit','subtle')+'</div></section>'+renderJournal(farm);
}
function renderTasks(farm){
  const journal=renderJournal(farm);
  if(!tasks.length)return journal+ '<h2>Việc cần làm</h2><p>Vườn đang ổn. Bạn có thể dạo hồ hoặc sang chợ.</p>';
  return journal+'<h2>Việc cần làm</h2><div class="task-list">'+tasks.map((task,index)=>'<button class="task-card" data-task="'+index+'" data-tone="'+task.type+'"><span class="task-mark">'+taskStyles[task.type].mark+'</span><span><strong>'+task.title+'</strong><small>'+task.label+'</small></span><span class="task-arrow" aria-hidden="true">›</span></button>').join('')+'</div>';
}
function renderRank(me){
  if(!session)return '<h2>Tài sản trong làng</h2><p>Vào làng để xem thứ hạng tài sản của các vườn cùng chơi.</p><div class="actions">'+btn('Vào làng','data-room','primary')+'</div>';
  const format=n=>n.toLocaleString('vi-VN');
  return '<h2>Tài sản trong làng</h2><p>Tính bằng xu, gồm tiền mặt, hàng trong kho và trên sạp, đất, công trình và vật nuôi.</p><ol class="wealth-list">'+state.wealth.map((row,i)=>'<li'+(row.id===me.id?' class="is-me"':'')+'><span class="rank-no">'+(i+1)+'</span><div><strong>'+escape(row.name)+(row.id===me.id?' · Bạn':'')+'</strong><small>'+format(row.coins)+' tiền mặt · '+format(row.inventory)+' hàng hóa · '+format(row.property)+' tài sản xây dựng và vật nuôi</small></div><b>'+format(row.total)+' xu</b></li>').join('')+'</ol>';
}
function renderHud(farm,now){
  const health=wellnessAt(farm,now);
  $('#vital-hud').innerHTML=Object.entries(vitals).map(([key,info])=>{
    const points=Math.floor(health[key]), seconds=Math.max(0,(health.until[key]??0)-now);
    const resting=key==='stamina'&&health.restUntil>now;
    const hint=resting?'Đang nghỉ · '+duration(health.restUntil-now):seconds?'Dùng lại sau '+duration(seconds):{water:'Uống nước',food:'Ăn cơm nắm',stamina:'Về nhà nghỉ sức'}[key];
    return '<button type="button" class="vital" data-vital="'+key+'" data-low="'+(points<25)+'" aria-label="'+info.label+' '+points+'/100. '+hint+'" title="'+hint+'"><span class="vital-icon">'+icon(info.icon)+'</span><span class="vital-text"><span>'+info.label+'</span><strong>'+points+'</strong><i><em style="width:'+Math.max(0,points)+'%"></em></i></span></button>';
  }).join('');
  const priority=tasks[0];
  $('#task-hud').innerHTML='<button type="button" class="task-summary" data-panel="tasks" aria-pressed="'+(panel==='tasks')+'"><span class="task-mark" data-tone="'+(priority?.type??'ready')+'">'+(priority?tasks.length:'✓')+'</span><span><strong>Việc cần làm</strong><small>'+(priority?priority.title+' · '+priority.label:'Mọi việc đang ổn')+'</small></span><span class="task-arrow" aria-hidden="true">›</span></button>';
}
function showRecovery(key){
  const info=vitals[key], now=currentTime(), health=wellnessAt(state.me,now);
  const remaining=Math.max(0,(health.until[key]??0)-now);
  if(key==='stamina'){
    if(health.restUntil>now){
      modal('Đang nghỉ','<p>Hồi thể lực sau <strong data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</strong>.</p>');
      return;
    }
    const inHome=tab==='home', atBed=atHomeBed({area:tab,...world.position()});
    const instruction=atBed?'Bạn đã đến giường.':inHome?'Đến giường ở bên phải hoặc bấm vào giường trên bản đồ.':
      'Về vườn và vào nhà mái ngói ở góc trên bên trái. Trong nhà, đến gần giường và chọn Nghỉ lấy sức.';
    const action=atBed?btn('Nghỉ lấy sức','data-recover="rest"','primary',remaining>0||health.stamina>=99):
      btn(inHome?'Đến giường':'Chỉ đường về nhà',inHome?'data-bed-go':'data-home-go','primary');
    modal('Thể lực','<p>'+instruction+'</p><p>Nghỉ '+restSeconds+' giây để hồi tối đa '+info.gain+' điểm thể lực.</p>'+
      (remaining?'<p>Có thể nghỉ lại sau <span data-until="'+health.until.stamina+'">'+duration(remaining)+'</span>.</p>':
        health.stamina>=99?'<p>Thể lực đang đầy.</p>':'')+'<div class="actions">'+action+'</div>');
    return;
  }
  const copy={water:'Uống nước để hồi tối đa 48 điểm. Mỗi lượt cách nhau 90 giây.',food:'Ăn cơm nắm để hồi tối đa 52 điểm. Mỗi lượt cách nhau 5 phút.'};
  const actions={water:'Uống nước',food:'Ăn cơm nắm'};
  modal(info.label,'<p>'+copy[key]+'</p>'+(remaining?'<p>Lượt hồi phục tiếp theo sau '+duration(remaining)+'.</p>':'')+
    '<div class="actions">'+btn(actions[key],'data-recover="'+info.action+'"','primary',remaining>0||health[key]>=99)+'</div>');
}
function openTask(index){
  const task=tasks[index];
  if(!task)return;
  if(task.kind==='plot'){
    tab='field';neighborId=null;selected=task.index;plotGroup=gardenFor(selected);panel='area';render();
    world.approach('plot',selected,()=>{});
  } else if(task.kind==='pond'){
    tab='field';neighborId=null;pondTab=task.index;panel='ponds';render();
    world.approach('pond',pondTab,()=>{});
  } else {
    tab=task.lot===undefined?'coop':'field';neighborId=null;
    if(task.lot!==undefined)selectedLot=task.lot;
    panel=task.lot===undefined?'area':'land';render();
    world.approach('animal',task.index,()=>{});
    reveal(`[data-pen="${task.index}"]`);
  }
}
function marketBanner(title,description){
  return '<header class="market-banner"><h2>'+title+'</h2><p>'+description+'</p></header>';
}
function renderOrders(farm,now){
  const line=(item,qty)=>nice(item)+' × '+qty;
  const orders=state.orders.map(order=>{
    const requirements=order.items.map(({item,qty})=>{
      const count=farm.inventory[item]??0;
      return '<li data-ready="'+(count>=qty)+'"><span>'+line(item,qty)+'</span><small>Kho '+count+'/'+qty+'</small></li>';
    }).join('');
    const ready=order.items.every(({item,qty})=>(farm.inventory[item]??0)>=qty);
    return '<div class="order-ticket" data-ready="'+ready+'"><div class="row"><h3>'+
      (order.title??goods[order.items[0].item].name)+'</h3><span class="badge">'+(ready?'Đủ hàng':order.title?'Đơn giỏ':'Thiếu hàng')+'</span></div>'+
      '<ul aria-label="Hàng cần giao">'+requirements+'</ul><div class="row order-footer"><small>'+order.reward+' xu · +'+order.xp+' XP</small>'+
      act('Giao hàng','order','',order.id,'primary',!ready)+'</div></div>';
  }).join('');
  const forecasts=state.nextOrders.map(order=>'<li>'+(order.title?'<strong>'+order.title+'</strong><br>':'')+
    order.items.map(({item,qty})=>line(item,qty)).join(' · ')+'</li>').join('');
  return marketBanner('Đơn hàng của làng','Người giao đủ hàng đầu tiên nhận thưởng.')+
    '<div class="row market-cycle"><strong>Còn '+state.orders.length+'/3 đơn</strong><span class="badge" data-clock="day">'+duration(state.dayEnds-now)+'</span></div>'+
    (orders?'<div class="order-list">'+orders+'</div>':'<p class="village-empty">Hôm nay đã giao hết đơn.</p>')+
    '<div class="order-preview">'+btn(showTomorrow?'Ẩn đơn ngày mai':'Xem trước đơn ngày mai','data-order-preview aria-expanded="'+showTomorrow+'"','subtle')+
    (showTomorrow?'<ul>'+forecasts+'</ul>':'')+'</div>';
}
const formatCoins=value=>value.toLocaleString('vi-VN');
function renderVillage(farm){
  const {name,level,income,orders,theftsToday,theftCap,next,fund,built}=state.village;
  const ladder='<ol class="village-ladder" aria-label="Các cấp của làng">'+villageLevels.map((label,i)=>
    '<li data-attained="'+(i<=level)+'"'+(i===level?' aria-current="step"':'')+'>'+label+'</li>').join('')+'</ol>';
  const projectUse={notice:'Nâng cấp bảng đơn ở chợ.',well:'Thêm điểm uống nước ở hồ làng.',dock:'Tăng thêm 2 lượt câu ở hồ mỗi ngày.',hall:'Thêm điểm xem tiến độ ở Đường làng.'};
  const structures=built.length?'<p class="village-built">Đã xây · '+built.map(entry=>entry.name).join(' · ')+'</p>':'';
  const header=marketBanner(name,next?'Mục tiêu tiếp theo · '+next.levelName:'Đã đạt cấp cao nhất.')+ladder+
    '<p class="village-security">An ninh hôm nay <strong>'+theftsToday+'/'+theftCap+' vụ</strong></p>';
  if(!next)return header+structures;
  const goal=(label,value,target,suffix='')=>'<div class="village-metric"><div class="row"><span>'+label+'</span><strong>'+formatCoins(value)+' / '+
    formatCoins(target)+suffix+'</strong></div>'+valueBar(value,target)+'</div>';
  const over=theftsToday>next.theft;
  return header+goal('Thu nhập từ chợ',income,next.income,' xu')+
    goal('Đơn đã giao',orders,next.orders)+goal('Chuỗi ngày đạt an ninh',next.peaceStreak,next.peaceDays,' ngày')+
    '<p class="village-note" data-over="'+over+'">Tối đa '+next.theft+' vụ/ngày trong '+next.peaceDays+
    ' ngày game đã kết thúc liên tiếp. Hôm nay '+(over?'đã vượt mức.':'đang trong mức.')+'</p>'+
    '<section class="village-project"><div class="row"><h3>'+next.name+'</h3><span class="badge">'+
    (next.built?'Đã xây':formatCoins(fund)+' / '+formatCoins(next.cost)+' xu')+'</span></div><p>'+projectUse[next.id]+'</p>'+
    (next.built?'':valueBar(fund,next.cost)+'<div class="actions">'+btn('Góp quỹ','data-village-fund','gold',farm.coins<1)+'</div>')+
    '</section>'+structures;
}
function showVillageFund(){
  const {next,fund}=state.village;
  if(!next||next.built)return;
  const maximum=Math.min(next.cost-fund,state.me.coins);
  if(maximum<1)return;
  modal('Góp quỹ · '+next.name,'<p>Dự án còn thiếu '+formatCoins(next.cost-fund)+' xu. Xu đã góp được dành cho công trình này.</p>'+
    '<form data-form="villageFund" data-item="'+next.id+'"><label>Số xu góp<input name="amount" type="number" min="1" max="'+maximum+'" value="'+Math.min(10,maximum)+'" required></label>'+
    '<button class="btn primary">Xác nhận góp</button></form><p id="dialog-error" role="status"></p>');
}
function showSeedCrop(item){
  const farm=state.me, crop=crops[item];
  if(!crop)return;
  const maximum=Math.min(20,farm.inventory[item]??0,100-(farm.inventory[crop.seed]??0));
  if(maximum<1)return;
  modal('Giữ giống · '+goods[item].name,'<p>Mỗi nông sản giữ lại cho một giống cùng loại. Giống nằm trong túi vật tư để gieo khi cần.</p>'+
    '<form data-form="seedFromCrop" data-item="'+item+'"><label>Số nông sản đổi thành giống<input name="qty" type="number" min="1" max="'+maximum+'" value="1" required></label>'+
    '<button class="btn primary">Giữ giống</button></form><p id="dialog-error" role="status"></p>');
}
function renderPanel(farm,now) {
  if(panel==='tasks')return renderTasks(farm);
  if(panel==='rank')return renderRank(farm);
  if(panel==='land')return renderLand(farm,now);
  if(panel==='ponds')return renderPonds(farm,now);
  if(panel==='orders')return renderOrders(farm,now);
  if(panel==='villageLevel')return renderVillage(farm);
  if(panel==='stock') {
    const supplies=Object.keys(goods).filter(key=>goods[key].buy);
    const produce=Object.keys(goods).filter(key=>goods[key].sell&&farm.inventory[key]);
    const items=[...produce.map(key=>({key,kind:'Nông sản'})),...supplies.map(key=>({key,kind:'Vật tư'}))],pageSize=8;
    const pages=Math.max(1,Math.ceil(items.length/pageSize));stockPage=Math.min(stockPage,pages-1);
    const card=({key,kind})=>'<article class="stock-card"><span class="stock-icon">'+goods[key].icon+'</span><div><small>'+kind+'</small><strong>'+goods[key].name+'</strong></div><b>× '+(farm.inventory[key]||0)+'</b>'+
      (crops[key]?btn('Giữ giống','data-seed-crop="'+key+'" aria-label="Giữ giống '+goods[key].name+'"','subtle',(farm.inventory[crops[key].seed]??0)>=100):'')+'</article>';
    const pager=pages>1?'<div class="row stock-pager">'+btn('‹ Trang trước','data-stock-page="'+(stockPage-1)+'"','subtle',stockPage===0)+'<span>Trang '+(stockPage+1)+' / '+pages+'</span>'+btn('Trang sau ›','data-stock-page="'+(stockPage+1)+'"','subtle',stockPage+1>=pages)+'</div>':'';
    return '<div class="row"><div><h2>Kho &amp; túi</h2><p>Nông sản và vật tư của bạn</p></div><span class="badge">Kho '+stock(farm)+' / '+capacity(farm)+'</span></div>'+pager+
      '<div class="stock-grid">'+items.slice(stockPage*pageSize,stockPage*pageSize+pageSize).map(card).join('')+'</div>';
  }
  if(panel==='buildings') return '<div class="row"><h2>Công trình</h2><span class="badge">'+farm.xp+' XP</span></div>'+Object.keys(buildings).map(key=>upgrade(farm,key)).join('')+
    '<details class="base-decor"'+(baseDecorOpen?' open':'')+'><summary>Hàng rào công trình chính</summary>'+[-1,-2,...(farm.coop?[-4]:[])].map((id,i)=>'<h3>'+['Ruộng chính','Ao nuôi chính','Chuồng chính'][i]+'</h3>'+decorOptions(farm,id)).join('')+'</details>'+
    '<div class="actions">'+act(farm.shieldUntil>now?'Đóng cổng · '+duration(farm.shieldUntil-now):'Đóng cổng · 12 xu','shield','','','subtle',farm.coins<12||farm.shieldUntil>now)+'</div>';
  return '<h2>Nhật ký</h2>'+farm.log.slice(0,5).map(entry=>'<div class="row itemrow"><p>'+escape(entry.message)+'</p></div>').join('');
}
function showWeather(){
  const {weather,forecast,next}=state;
  modal('Thời tiết','<div class="row"><strong>'+weather.name+'</strong><span class="weather-icon">'+weather.icon+'</span></div><p>'+weather.note+'</p>'+
    '<div class="weather-next row"><p>Dự báo sau <strong data-clock="weather">'+duration(next-currentTime())+'</strong></p><strong>'+forecast.icon+' '+forecast.name+'</strong></div><p>'+forecast.note+'</p>');
}
const focusSelector='[data-plot],[data-action],[data-shop],[data-sell],[data-list],[data-room],[data-visit],[data-return],[data-tab],[data-village-page],[data-stock-page],[data-panel],[data-weather],[data-market-pane],[data-pond-tab],[data-pond-go],[data-aqua-stock],[data-land-tab],[data-land-go],[data-crop-group],[data-open-garden],[data-open-pond],[data-visit-pond],[data-vital],[data-task],[data-home-go],[data-bed-go],[data-home-exit],[data-village-fund],[data-seed-crop],[data-order-preview],[data-market-search],[data-sell-all]';
function focusKey(element) {
  if(!element?.matches(focusSelector)) return '';
  return Object.entries(element.dataset).map(([key,value])=>key+'='+value).join('|');
}
function render(arrival) {
  if(!state||composingMarketSearch) return;
  const focused=document.activeElement;
  const focus=focusKey(focused);
  const searchSelection=focused.matches('[data-market-search]')?[focused.selectionStart,focused.selectionEnd,focused.selectionDirection]:null;
  const priorDecor=$('.base-decor');
  if(priorDecor)baseDecorOpen=priorDecor.open;
  const listScroll=$('#board .farm-list')?.scrollTop??0;
  const farm=state.me, now=currentTime();
  if(!farm.plotIndexes.includes(selected)){selected=0;plotGroup=-1;}
  lastPanelTime=now;
  tasks=farmTasks(state,now);
  renderHud(farm,now);
  const [,title,description]=tabs[tab];
  const selectedNeighbor=tab==='neighbors'?state.neighbors.find(n=>n.id===neighborId):undefined;
  if(!selectedNeighbor)neighborId=null;
  $('#nav').innerHTML=Object.entries(tabs).filter(([key])=>key!=='workshop').map(([key,[,name]])=>'<button data-tab="'+key+'" class="'+(tab===key?'active':'')+'"'+(tab===key?' aria-current="page"':'')+'>'+icon(areaIcons[key])+name+'</button>').join('');
  $('#coin').textContent=formatCoins(farm.coins)+' xu';
  $('#room span').textContent=session?'Làng '+session.code:'Vào làng';
  $('#sub-title').textContent=session?farm.name+' · '+state.village.name:'Vườn chơi thử';
  $('#title').textContent=selectedNeighbor?selectedNeighbor.name:title;
  $('#world-day').title='Ngày mới sau '+duration(state.dayEnds-now);
  $('#subtitle').textContent=description;
  $('#date').textContent='Ngày '+(state.day+1);
  villagePage=Math.min(villagePage,Math.max(0,Math.ceil((state.neighbors.length+1)/6)-1));
  world.sync(selectedNeighbor?'visit':tab,state,{neighbor:selectedNeighbor,selection:selected,page:villagePage,arrival,tasks});
  $('#world-weather').innerHTML=tab==='home'||tab==='workshop'?'':'<button class="world-weather" type="button" data-weather aria-label="Xem dự báo: '+state.weather.name+'">'+icon('weather')+state.weather.name+'</button>';
  $('#board').innerHTML={
    home:()=>renderHome(farm,now), workshop:()=>renderWorkshop(farm), field:()=>renderField(farm), lake:()=>renderLake(farm,now), coop:()=>renderCoop(farm,now), market:()=>renderMarket(farm), neighbors:()=>renderNeighbors(farm,now)
  }[tab]();
  $('#tools').innerHTML=tab==='field'?renderCropTools(farm,now):'';
  const panelNav=$('#panel-nav');
  panelNav.className='panel-tabs';
  const group=Object.values(tabGroups).find(keys=>keys.includes(panel))??tabGroups.main;
  panelNav.innerHTML='<div class="panel-shortcuts">'+Object.keys(tabGroups).map(key=>{
    const active=tabGroups[key]===group;
    return '<button data-group="'+key+'" data-panel="'+tabGroups[key][0]+'"'+(active?' class="active"':'')+'>'+({main:'Tổng quan',farm:'Nông trại',village:'Làng'})[key]+'</button>';
  }).join('')+'</div><div class="panel-subtabs">'+group.map(key=>{
    const [glyph,label]={...panels,...extraPanels}[key];
    return '<button data-panel="'+key+'" class="'+(key===panel?'active':'')+'" aria-pressed="'+(key===panel)+'">'+icon(key==='area'?areaIcons[tab]:glyph)+label+'</button>';
  }).join('')+'</div>';
  $('#board').hidden=panel!=='area';
  $('#tools').hidden=panel!=='area'||tab!=='field';
  $('#side').hidden=panel==='area';
  $('#side').innerHTML=panel==='area'?'':renderPanel(farm,now);
  $('#world').dataset.area=tab;
  const list=$('#board .farm-list');
  if(list&&focus)list.scrollTop=listScroll;
  sceneChat.sessionChanged();
  if(focus&&!dialog.open){
    const control=Array.from(document.querySelectorAll(focusSelector)).find(el=>focusKey(el)===focus);
    control?.focus({preventScroll:true});
    if(control&&searchSelection)control.setSelectionRange(...searchSelection);
  }
}
function goTo(area,arrival) {
  tab=area; neighborId=null; panel='area'; render(arrival);
}
function guideHome(){
  if(dialog.open)dialog.close();
  if(tab==='home'){guideBed();return;}
  const from={coop:[433,198],market:[234,34],lake:[679,402],neighbors:[234,251]}[tab];
  if(tab!=='field')goTo('field',from);
  const started=world.approach('house',undefined,()=>goTo('home'));
  if(started)reveal('#world');
  else showToast('Hãy đi theo lối về phía ngôi nhà ở góc trên bên trái.',true);
}
function guideBed(){
  if(dialog.open)dialog.close();
  if(tab!=='home')return;
  const started=world.approach('bed',undefined,()=>showRecovery('stamina'));
  if(started)reveal('#world');
  else showToast('Hãy đến gần chiếc giường bên phải.',true);
}
function visit(id) {
  neighborId=id;visitPond=0;panel='area';render();
}
function reveal(selector) {
  const destination=$(selector);
  if(destination)destination.scrollIntoView({block:'nearest',behavior:'instant'});
}
function interactWithWorld(target) {
  if(!state||dialog.open)return;
  if(target.type==='bed'){
    showRecovery('stamina');
  } else if(target.type==='land'){
    selectedLot=target.index;panel='land';render();reveal('.control-panel');
  } else if(target.type==='pond'){
    pondTab=target.index;panel='ponds';render();reveal('.control-panel');
  } else if(target.type==='public-fishing'){
    panel='area';render();reveal('.control-panel');
  } else if(target.type==='neighbor-fishing'){
    visitPond=target.index;panel='area';render();reveal('#visit-pond');
  } else if(target.type==='order-board'){
    marketPane='orders';panel='area';render();reveal('.control-panel');
  } else if(target.type==='village-hall'){
    panel='villageLevel';render();reveal('.control-panel');
  } else if(target.type==='workshop'){
    goTo('workshop');
  } else if(target.type==='craft-bench'){
    showToast('Bàn chế tạo đã sẵn sàng. Công thức sẽ được bổ sung trong bản cập nhật sau.');
  } else if(target.type==='village-well'){
    showRecovery('water');
  } else if(target.type==='pavilion'){
    showWeather();
  } else if(target.type==='exit') {
    goTo(target.next,target.arrival);
  } else if(target.type==='neighbor') {
    visit(target.id);
  } else if(target.type==='own-house') {
    goTo('field');
  } else if(target.type==='plot'&&tab==='field') {
    selected=target.index;plotGroup=gardenFor(selected);panel='area';render();
    reveal('#tools');
  } else if(target.type==='plot'&&neighborId) {
    panel='area';render();reveal('#visit-garden');
    $('#visit-garden')?.querySelector(`[data-index="${target.index}"]:enabled`)?.focus({preventScroll:true});
  } else if(target.type==='barn') {
    panel=neighborId?'area':'stock';render();
    reveal(neighborId?'#visit-barn':'.control-panel');
  } else if(target.type==='market') {
    const section=target.style==='green'?'stall':target.style==='gold'?'sales':'supplies';
    panel='area';marketPane=section;render();reveal('#market-'+section);
  } else if(target.type==='animal') {
    const pen=state.me.pens[target.index];
    if(pen&&pen.progress>=productGoal(pen)&&!animals[pen.kind].oneTime)void perform({action:'collect',index:target.index,target:String(pen.id??target.index)});
    else {panel=pen?.lot===undefined?'area':'land';if(pen?.lot!==undefined)selectedLot=pen.lot;render();reveal(`[data-pen="${target.index}"]`);}
  } else if(target.type==='coop'||target.type==='silo') {
    panel='area';render();reveal('#board');
  } else if(target.type==='well'&&tab==='field') {
    panel='area';render();
    showRecovery('water');
  } else if(target.type==='well') {
    showToast(tab==='market'?'Giếng làng ở giữa khu chợ.':'Giếng nước của hàng xóm.');
  } else if(target.type==='house'&&!neighborId) {
    goTo('home');
  }
}
function modal(title,html) {
  dialog.innerHTML='<div class="row"><h2>'+title+'</h2>'+btn('✕','data-close aria-label="Đóng"','subtle')+'</div>'+html;
  if(!dialog.open) dialog.showModal();
}
function showAccountModal(mode='login') {
  const room= session?.code || inviteCode || '';
  const formMode=mode==='register'?'register':'login';
  const title=formMode==='register'?'Tạo tài khoản':'Đăng nhập';
  modal(title,'<div class="actions">'+btn('Đăng nhập','data-account-mode="login"',''+(formMode==='login'?'primary':'subtle'))+btn('Tạo tài khoản','data-account-mode="register"',''+(formMode==='register'?'primary':'subtle'))+'</div><form data-form="account" data-account-mode="'+formMode+'"><label>Tên tài khoản<input name="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_-]+" placeholder="Ví dụ: demo_user"></label><label>Mật khẩu<input type="password" name="password" required minlength="6" maxlength="128" placeholder="Ít nhất 6 ký tự"></label>'+(room?'<p class="small">Room hiện tại sẽ được gắn vào tài khoản: '+room+'</p>':'')+'<button class="btn primary">'+(formMode==='register'?'Tạo tài khoản':'Đăng nhập')+'</button></form><p id="dialog-error" role="status"></p>');
}
function showRoom() {
  if(session) {
    const accountSummary = accountSession ? '<p>Tài khoản: <strong>'+escape(accountSession.username)+'</strong></p>' : '';
    const accountActions = accountSession ?
      '<div class="actions">'+btn('Đăng nhập khác','data-account','primary')+btn('Tạo tài khoản mới','data-account-mode="register"','subtle')+btn('Đăng xuất','data-account-logout','subtle')+'</div>' :
      '<div class="actions">'+btn('Đăng nhập tài khoản','data-account','primary')+btn('Tạo tài khoản','data-account-mode="register"','subtle')+'</div>';
    modal('Làng của bạn','<p>Chia sẻ mã '+session.code+' hoặc gửi đường dẫn cho hàng xóm. Làng có tối đa 12 vườn.</p>'+accountSummary+accountActions+'<div class="actions">'+
      btn('Sao chép liên kết','data-copy','primary')+
      btn('Về vườn chơi thử','data-back-demo','subtle')+'</div>');
    return;
  }
  const previous=store.read(previousKey);
  const rejoin=previous&&!inviteCode?'<div class="actions">'+btn('Tiếp tục làng '+previous.code,'data-resume','gold')+'</div>':'';
  modal('Vào làng','<p>Nhập tên vườn và mã của bạn bè. Nếu để trống mã, bạn sẽ tạo làng mới.</p><div class="actions">'+btn('Đăng nhập tài khoản','data-account','primary')+btn('Chơi nhanh','data-close','subtle')+'</div><form data-form="join"><label>Tên vườn<input name="name" required minlength="2" maxlength="24" placeholder="Ví dụ: Vườn của Đổi"></label><label>Mã làng<input name="code" value="'+inviteCode+'" maxlength="8" placeholder="Để trống nếu tạo làng"></label><button class="btn primary">Bắt đầu chơi online</button></form>'+rejoin+'<p id="dialog-error" role="status"></p>');
}
function showShop(key,sell) {
  const farm=state.me, info=goods[key], price=sell?info.sell:info.buy;
  const count=sell?farm.inventory[key]:Math.min(Math.floor(farm.coins/price),100-(farm.inventory[key]||0));
  if(!count) return showToast('Hiện chưa thể mua hoặc bán mặt hàng này.',true);
  modal((sell?'Bán ':'Mua ')+info.name.toLowerCase(),'<p>'+price+' xu/món · '+(sell?'Trong kho ':'Có thể mua ')+count+'</p><form data-form="'+(sell?'sell':'buy')+'" data-item="'+key+'"><label>Số lượng<input type="number" name="qty" min="1" max="'+(sell?count:Math.min(count,20))+'" required value="1"></label><button class="btn primary">'+(sell?'Bán cho chợ':'Mua vật tư')+'</button></form><p id="dialog-error" role="status"></p>');
}
function confirmSellAll(key){
  const count=state.me.inventory[key]??0;
  if(!count)return;
  modal('Bán hết '+goods[key].name.toLowerCase(),'<p>Trong kho: '+count+' món · Dự kiến nhận '+formatCoins(count*goods[key].sell)+' xu.</p>'+
    '<div class="actions">'+btn('Xác nhận bán hết','data-confirm-sell-all="'+key+'"','primary')+btn('Quay lại','data-close','subtle')+'</div><p id="dialog-error" role="status"></p>');
}
function listingDialog() {
  const items=Object.keys(goods).filter(key=>goods[key].sell&&state.me.inventory[key]);
  modal('Đăng bán','<p>Nông sản được giữ ở sạp đến khi có người mua hoặc bạn tự gỡ hàng.</p><form data-form="list"><label>Nông sản<select name="item">'+items.map(key=>'<option value="'+key+'">'+nice(key)+' · '+state.me.inventory[key]+' trong kho</option>').join('')+
    '</select></label><label>Số lượng<input type="number" name="qty" min="1" max="20" value="1" required></label><label>Giá mỗi món · xu<input type="number" name="price" min="1" value="'+goods[items[0]].sell+'" required></label><button class="btn primary">Đăng lên sạp</button></form><p id="dialog-error" role="status"></p>');
}
function help() {
  modal('Cách chơi','<ol><li>Dùng WASD, phím mũi tên hoặc chạm bản đồ để di chuyển. Đến gần một địa điểm rồi nhấn E hoặc chọn Tương tác.</li><li>Chạm thanh Thể lực và chọn Chỉ đường về nhà. Trong nhà, tới giường để nghỉ. Bạn cũng có thể mở Nhà vườn trên thanh điều hướng.</li><li>Ô bỏ trống 8 giờ cần cuốc trước khi gieo. Khi cây chín, chọn Thu và giữ 1 giống hoặc đổi nông sản trong Kho thành giống. Bảng đơn ở Chợ làng trao thưởng cho vườn giao đủ hàng đầu tiên. Mục Cấp làng có tiến độ và quỹ xây công trình.</li><li>Tưới nước để cây lớn nhanh hơn. Mưa tưới tự nhiên, nhưng sau khi tạnh sâu vẫn dễ xuất hiện trong 20 phút. Trị sâu sớm để giữ sản lượng. Nắng nóng làm cây và vật nuôi lớn chậm hơn.</li><li>Xây chuồng, mua gà rồi cho ăn. Vật nuôi lớn lên trước khi cho trứng hoặc sữa. Khi lợn đủ lớn, chọn Xuất chuồng để thu thịt.</li><li>Ở Hàng xóm, mỗi vườn cho lấy một món mỗi ngày. Nâng túi để tăng số món từ nhiều vườn.</li><li>Mỗi ngày trong game kéo dài 8 giờ. Mở Ao nuôi để thả cá và tôm chung ao. Sức chứa tùy diện tích. Đến Hồ làng để câu miễn phí. Câu ao hàng xóm dùng chung lượt lấy đồ với vườn và kho.</li></ol>');
}
async function perform(input) {
  if(busy)return false;
  const block=workBlock(wellnessAt(state.me,currentTime()),workCost(input.action,state.weather.id),currentTime());
  if(block){showToast(block,true);return false;}
  busy=true;
  const credentials=session;
  const location={area:tab,...world.position()};
  let updateAfter=false;
  try {
    let message;
    if(input.action==='rest'&&!atHomeBed(location))throw new GameError('Hãy về nhà vườn và tới gần giường để nghỉ.');
    if(credentials) {
      if(input.action==='rest')await api('scene',{area:'home',pose:location},credentials);
      input.requestId=crypto.randomUUID();
      let result;
      try {
        result=await api('action',input,credentials);
      } catch(error) {
        if(error.status) throw error;
        result=await api('action',input,credentials);
      }
      if(credentials!==session) return false;
      revision=result.revision;
      setState(result.state);
      message=result.message;
    } else {
      const updated=structuredClone(demo);
      message=apply(updated,'demo',input,unixNow(),Math.random(),location);
      demo=updated;
      store.write(demoKey,demo);
      updateDemo();
    }
    render();
    world.particle(input);
    showToast(message);
    return true;
  } catch(error) {
    updateAfter=['order','villageFund','sell','till','plant'].includes(input.action);
    const message=error instanceof GameError||error instanceof Error?error.message:'Không thể thực hiện thao tác.';
    showToast(message,true);
    const inline=$('#dialog-error');
    if(inline) inline.textContent=message;
    return false;
  } finally {
    busy=false;
    if(updateAfter)void refresh();
  }
}
async function refresh(initial=false) {
  if(busy) return;
  const credentials=session;
  if(!credentials) {
    updateDemo();
    render();
    return;
  }
  try {
    const result=await api('state',undefined,credentials);
    if(credentials!==session||result.revision<revision) return;
    revision=result.revision;
    setState(result.state);
    render();
  } catch(error) {
    if(credentials!==session) return;
    if(error.status===401||error.status===404) {
      if(store.read(previousKey)?.token===credentials.token) store.write(previousKey,null);
      session=null;
      store.write(sessionKey,null);
      updateDemo();
      render();
    }
    if(initial) {
      if(!state) {
        $('#board').innerHTML='<p class="loading">Mất kết nối. Đang thử lại…</p>';
      } else render();
      showToast(error.message,true);
    }
  }
}
document.addEventListener('click',async e=>{
  const el=e.target.closest('button');
  if(!el) return;
  const d=el.dataset;
  if('tab' in d) {
    if(!state) return;
    if(d.tab==='home')guideHome();
    else {if(d.tab==='market'&&el.closest('.journal'))marketPane='sales';goTo(d.tab);}
  } else if('homeGo' in d)guideHome();
  else if('bedGo' in d)guideBed();
  else if('homeExit' in d){
    world.approach('exit',undefined,()=>interactWithWorld({type:'exit',...maps.home.exits[0]}));
    reveal('#world');
  } else if('vital' in d) showRecovery(d.vital);
  else if('recover' in d){
    const success=await perform({action:d.recover});
    if(success)dialog.close();
  }
  else if('task' in d)openTask(Number(d.task));
  else if('panel' in d) { panel=d.panel; render(); }
  else if('landTab' in d) {selectedLot=Number(d.landTab);render();}
  else if('landGo' in d) {
    if(tab!=='field'){tab='field';neighborId=null;render();}
    world.approach('land',Number(d.landGo),()=>{});
    reveal('#world');
  }
  else if('openGarden' in d){
    plotGroup=Number(d.openGarden);selected=plotOffset+plotGroup*3;
    goTo('field');
  }
  else if('openPond' in d){pondTab=Number(d.openPond);panel='ponds';render();}
  else if('visitPond' in d){visitPond=Number(d.visitPond);render();}
  else if('pondGo' in d) {
    if(tab!=='field') {tab='field';neighborId=null;render();}
    world.approach('pond',pondTab,()=>{});
    reveal('#world');
  }
  else if('pondTab' in d) { pondTab=Number(d.pondTab); render(); }
  else if('aquaStock' in d)showPondStock(d.aquaStock);
  else if('orderPreview' in d){showTomorrow=!showTomorrow;render();}
  else if('marketPane' in d) { marketPane=d.marketPane; render(); }
  else if('seedCrop' in d) showSeedCrop(d.seedCrop);
  else if('villageFund' in d) showVillageFund();
  else if('weather' in d) showWeather();
  else if('room' in d) showRoom();
  else if('account' in d) showAccountModal('login');
  else if('accountMode' in d) showAccountModal(d.accountMode==='register'?'register':'login');
  else if('accountLogout' in d) {
    accountSession=null; store.write(accountKey,null); showToast('Đã đăng xuất tài khoản.');
    dialog.close();
  }
  else if('info' in d) help();
  else if('plot' in d) {
    selected=Number(d.plot); render();
    if(window.matchMedia('(max-width: 860px)').matches) $('#tools').scrollIntoView({block:'nearest'});
  } else if('close' in d) dialog.close();
  else if('visit' in d) visit(d.visit);
  else if('return' in d) goTo('neighbors');
  else if('villagePage' in d) { villagePage=Number(d.villagePage); render(); }
  else if('stockPage' in d) { stockPage=Number(d.stockPage); render(); }
  else if('shop' in d) showShop(d.shop,false);
  else if('sell' in d) showShop(d.sell,true);
  else if('sellAll' in d) confirmSellAll(d.sellAll);
  else if('confirmSellAll' in d){
    if(await perform({action:'sell',item:d.confirmSellAll,source:'all'}))dialog.close();
  }
  else if('list' in d) listingDialog();
  else if('copy' in d) {
    const link=new URL(location.pathname,location.origin);
    link.searchParams.set('lang',session.code);
    try {
      await navigator.clipboard.writeText(link.href);
      showToast('Đã sao chép liên kết.');
    } catch {
      modal('Mời bạn vào làng','<label>Liên kết mời<input readonly value="'+escape(link.href)+'"></label>');
      dialog.querySelector('input').select();
    }
  } else if('resume' in d) {
    session=store.read(previousKey);
    store.write(sessionKey,session);
    revision=-1;
    dialog.close();
    await refresh(true);
  } else if('backDemo' in d) {
    dialog.close();
    store.write(previousKey,session);
    session=null;
    revision=-1;
    selected=0;plotGroup=-1;pondTab=0;selectedLot=0;
    tab='field'; neighborId=null; villagePage=0; panel='area';
    store.write(sessionKey,null);
    updateDemo();
    render();
  } else if('action' in d) {
    const input={action:d.action,item:d.item||''};
    if(d.index) input.index=Number(d.index);
    if(d.qty) input.qty=Number(d.qty);
    if(d.target)input.target=d.target;
    if(d.source)input.source=d.source;
    if(input.action==='cast'||input.action==='reel'){
      const type=(input.source??state.me.fishing.cast?.source)==='public'?'public-fishing':'neighbor-fishing';
      const started=world.approach(type,input.index??state.me.fishing.cast?.index,()=>{void perform(input);});
      if(!started)showToast('Hãy đến cầu câu để dùng cần.',true);
      else if(matchMedia('(max-width: 860px)').matches)reveal('#world');
      return;
    }
    await perform(input);
  }
});
function updateMarketSearch(event){
  const pane=event.target.dataset.marketSearch;
  if(!pane)return;
  marketQueries[pane]=event.target.value;
  const results=$('[data-market-results]');
  if(results)results.innerHTML=renderMarketResults(state.me,pane);
}
document.addEventListener('compositionstart',event=>{
  if(event.target.matches('[data-market-search]'))composingMarketSearch=true;
});
document.addEventListener('compositionend',event=>{
  if(!event.target.matches('[data-market-search]'))return;
  composingMarketSearch=false;
  updateMarketSearch(event);
});
document.addEventListener('input',updateMarketSearch);
document.addEventListener('change',event=>{
  if(!event.target.matches('[data-crop-group]'))return;
  plotGroup=Number(event.target.value);selected=plotGroup<0?0:plotOffset+plotGroup*3;
  render();
});
dialog.addEventListener('submit',async e=>{
  const form=e.target;
  if(!form.dataset.form) return;
  e.preventDefault();
  if(busy) return;
  const values=Object.fromEntries(new FormData(form));
  const button=form.querySelector('button[type="submit"], button:not([type])');
  button.disabled=true;
  const mode=form.dataset.form;
  if(mode==='join') {
    busy=true;
    try {
      const result=await api('join',values,null);
      session={code:result.code,token:result.token};
      store.write(sessionKey,session);
      revision=-1;
      selected=0;plotGroup=-1;pondTab=0;selectedLot=0;
      tab='field'; neighborId=null; villagePage=0; panel='area';
      setState(result.state);
      dialog.close();
      render();
      showToast('Bạn đã vào làng '+session.code+'.');
    } catch(error) {
      const inline=$('#dialog-error');
      if(inline) inline.textContent=error.message;
    } finally { busy=false; }
  } else if(mode==='account') {
    busy=true;
    try {
      const method=form.dataset.accountMode==='register'?'register':'login';
      const result=await apiAccount(method,{username:values.username,password:values.password,roomCode:session?.code||inviteCode||'',farmId:state?.me?.id||''});
      accountSession={token:result.token,username:result.account.username,accountId:result.account.id};
      store.write(accountKey,accountSession);
      const resumeRoom=(result.rooms&&result.rooms.length?result.rooms[0].roomCode:session?.code||inviteCode||'');
      if(resumeRoom) {
        session={code:resumeRoom,token:result.token};
        store.write(sessionKey,session);
        revision=-1;
        if(state) setState(state);
      }
      dialog.close();
      render();
      showToast(method==='register'?'Đã tạo tài khoản thành công.':'Đăng nhập tài khoản thành công.');
      if(resumeRoom) await refresh(true);
    } catch(error) {
      const inline=$('#dialog-error');
      if(inline) inline.textContent=error.message;
    } finally { busy=false; }
  } else {
    const success=await perform({action:mode,item:values.item??form.dataset.item,...(mode==='villageFund'?{amount:Number(values.amount)}:{qty:Number(values.qty)}),...(mode==='list'?{price:Number(values.price)}:{}),...(mode==='aquaStock'?{index:Number(form.dataset.pond)}:{})});
    if(success) dialog.close();
  }
  button.disabled=false;
});
const requested=new URL(location.href).searchParams.get('lang')?.toUpperCase();
if(requested&&/^[A-F0-9]{8}$/.test(requested)) inviteCode=requested;
await refresh(true);
if(!session) showRoom();
setInterval(()=>{
  if(!state||document.hidden) return;
  const now=currentTime();
  const cast=state.me.fishing.cast;
  const boundary=[cast?.ready,cast?cast.expires+1:undefined,state.me.fishing.nextAt].some(time=>time>lastPanelTime&&time<=now);
  if(boundary&&!busy&&(tab==='lake'||neighborId)){
    if(session)void refresh();
    else {updateDemo();render();}
  }
  document.querySelectorAll('[data-until]').forEach(node=>node.textContent=duration(Number(node.dataset.until)-now));
  document.querySelectorAll('[data-clock]').forEach(node=>node.textContent=duration((node.dataset.clock==='day'?state.dayEnds:state.next)-now));
},1000);
setInterval(()=>{ if(!document.hidden) refresh(); },4000);
window.addEventListener('focus',()=>refresh());
