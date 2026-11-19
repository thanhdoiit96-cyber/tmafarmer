import {gardenHelperActions,gardenHelperLimit,gardenHelperName} from './garden-helper.mjs';
import {villageLevels} from './village.mjs';
import {restSeconds,vitals,wellnessAt,workBlock,workCost} from './wellness.mjs';
import {farmTasks,taskStyles} from './tasks.mjs';
import {coopCapacity,fenceAt,fences,gardenDecorAt,gardenDecorItems,gardenDecorSpots,getLand,landTypes,lotPrice,mainPlotSlot,plotAt,plotOffset,pondCapacity,pondOffset} from './land.mjs';
import {aquatic,aquaRequirement,aquaSupplyRequirement,pondFood,pondReady,pondYield,visiblePondBatches} from './aqua.mjs';
import {createSceneChat} from './scene-chat.mjs';
import {createFarmMusic} from './farm-music.mjs';
import {cropFrame,cropGrowthLabels} from './pixel/crop-layout.mjs';
import {aquaticAtlas,gardenDecorAtlas,livestockAtlas} from './pixel/frames.mjs';
import {createWorld} from './world.mjs';
import {maps} from './world-layout.mjs';
import {advanceGardenHelpers, advanceVillage, advanceVillageDrive, animalCondition, animalRelocation, animalRequirement, animals, apply, aquaOrders, avatarOf, avatars, buildingUpgrade, buildings, capacity, catchOdds, craftRequirement, cropGoal, cropRequirement, crops, cropStage, cropYield, dryGrowthFactor, dayAt, dayGoals, dayReward, farmProgress, gateMinutes, growthGoal, mealCooldown, mealRequirement, productGoal, gardenHelperPreview, gardenHelperTargets, recipeCategory, recipes, upgradeCalendar, upgradeRequirement, GameError, goods, newFarm, newRoom, snapshot, startLivestockClock, startSoilClock, startVillageSecurity, stock, supplyLimit, unixNow, varietyOrders, visitLimit, workshopFoodOrders, xpRewards, xpUnlocks} from './game.mjs';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={
  read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} },
};
const sessionKey='mua-vui-session:1', previousKey='mua-vui-previous:1', demoKey='mua-vui-demo:2', accountKey='mua-vui-account:1';
const musicKey='mua-vui-music:1';
const music=createFarmMusic($('#farm-music'),store.read(musicKey),value=>store.write(musicKey,value));
const tabs={
  field:['🌱','Vườn nhà','Gieo hạt, chăm vườn và thu hoạch theo thời tiết.'],
  home:['🏠','Nhà vườn','Vào nhà để nghỉ sức và xem Sổ việc hôm nay.'],
  workshop:['⚙️','Xưởng máy','Chế biến nông sản thành đồ ăn và thức uống để hồi thể lực.'],
  coop:['🐔','Chuồng trại','Chăm vật nuôi để thu trứng, sữa hoặc xuất chuồng lợn.'],
  lake:['🐟','Hồ làng','Thả câu ở cầu gỗ. Cá nhỏ thường gặp, cá chép vàng rất hiếm.'],
  market:['🧺','Chợ làng','Mua vật tư, giao đơn và trao đổi nông sản với hàng xóm.'],
  neighbors:['🏘️','Hàng xóm','Ghé vườn, kho và ao cá của hàng xóm.'],
};
let session=store.read(sessionKey);
let accountSession=store.read(accountKey);
let demo;
let state, tab='field', selected=0, neighborId, busy=false, toastTimer, inviteCode='';
let revision=-1, receivedAt=Date.now(), villagePage=0, panel='area', marketPane='orders', pondTab=0, selectedLot=0, plotGroup=-1, visitPond=0, baseDecorOpen=false, showTomorrow=false;
const areaIcons={field:'leaf',home:'home',workshop:'build',coop:'coop',market:'market',neighbors:'users',lake:'fish'};
const panels={area:['leaf','Khu vực'],land:['build','Đất'],ponds:['fish','Ao nuôi'],orders:['orders','Đơn hàng'],stock:['bag','Kho'],buildings:['build','Xây dựng'],log:['log','Nhật ký']};
const tabGroups={main:['area','tasks','progress','rank'],farm:['land','ponds','stock'],village:['orders','villageLevel','buildings','log']};
const extraPanels={tasks:['orders','Việc cần làm'],progress:['trophy','Tiến độ'],rank:['trophy','Tài sản'],villageLevel:['build','Cấp làng'],members:['users','Thành viên']};
const icon=name=>'<svg aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const dialog=$('#dialog');
const landscape=matchMedia('(orientation: landscape) and (min-width: 500px) and (max-width: 1100px) and (max-height: 600px)');
const layout=$('.layout'), farmPanel=$('#farm-panel'), panelBody=$('.panel-body'), panelToggle=$('[data-panel-toggle]');
const worldFrame=$('#world'), chatPanel=$('#scene-chat');
new ResizeObserver(()=>{
  const frameHeight=worldFrame.getBoundingClientRect().height;
  const chatHeight=landscape.matches?0:chatPanel.getBoundingClientRect().height;
  layout.style.setProperty('--game-height',Math.floor(frameHeight-chatHeight)+'px');
}).observe(worldFrame);
const worldHud=$('.world-hud'), statusHud=$('.status-hud'), statusSlot=$('#status-slot');
function placeStatus(){
  if(landscape.matches)worldHud.insertBefore(statusHud,$('#world-weather'));
  else statusSlot.append(statusHud);
}
placeStatus();
landscape.addEventListener('change',placeStatus);
let lastPanelTime=0, composingMarketSearch=false;
const marketQueries={supplies:'',sales:'',stall:''};
const supplyGroups={
  seeds:{label:'Hạt giống',items:Object.values(crops).map(crop=>crop.seed)},
  aquatic:{label:'Con giống',items:Object.values(aquatic).map(species=>species.seed)},
  care:{label:'Thuốc & phân bón',items:['spray','fertilizer']},
  feed:{label:'Thức ăn',items:['feed','aquaFeed']},
};
const stockTabs={food:'Thực phẩm',materials:'Vật tư',produce:'Nông sản',seeds:'Giống'};
const stockItems={
  food:Object.keys(recipes).filter(key=>recipes[key].gain),
  materials:[...supplyGroups.care.items,...supplyGroups.feed.items,...Object.keys(recipes).filter(key=>recipeCategory(recipes[key])==='materials')],
  produce:Object.keys(goods).filter(key=>goods[key].sell&&!recipes[key]),
  seeds:[...supplyGroups.seeds.items,...supplyGroups.aquatic.items],
};
let stockTab='produce', renderedStock='';
const stockTooltip=$('#stock-tooltip');
let stockTooltipCard;
let supplyGroup='all', workshopTab='food';
const workshopTabs={food:'Thực phẩm',tools:'Công cụ',materials:'Vật tư'};
const world=createWorld(worldFrame,interactWithWorld,landscape);
const sceneChat=createSceneChat({api,world,showToast,context:()=>state&&{session,player:state.me.id,area:tab==='neighbors'&&neighborId?'visit':tab,host:neighborId}});
let tasks=[];
const lotLabel=lot=>lot?.kind==='empty'?'Đất trống':landTypes[lot?.kind]?.name??'Chưa mua';
const gardenFor=index=>mainPlotSlot(index)>=0?-1:Math.floor((index-plotOffset)/3);
const plotNumber=index=>gardenFor(index)<0?mainPlotSlot(index)+1:(index-plotOffset)%3+1;
const btn=(label,attrs='',kind='',disabled=false)=>'<button type="button" class="btn '+kind+'" '+attrs+(disabled?' disabled':'')+'>'+label+'</button>';
const act=(label,action,item='',index='',kind='',disabled=false,qty=1)=>btn(label,`data-action="${action}" data-item="${item}" data-index="${index}" data-qty="${qty}"`,kind,disabled);
const nice=(key)=>goods[key].icon+' '+goods[key].name;
function aquaIllustration(item){
  const kind=goods[item].illustration;
  const frame=aquaticAtlas.frames[kind];
  if(!frame)return '';
  return '<span class="aqua-icon" style="background-position:-'+frame[0]/2+'px 0" aria-hidden="true"></span>';
}
function itemLink(key,label=nice(key)){
  const art=aquaIllustration(key);
  if(art&&label.startsWith(goods[key].icon+' '))label=label.slice(goods[key].icon.length+1);
  return '<button type="button" class="item-link" data-item-info="'+key+'" aria-label="Xem chi tiết '+escape(goods[key].name)+'">'+art+escape(label)+'</button>';
}
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
  const livestockStarted=startLivestockClock(demo,time);
  const driveUpdated=advanceVillageDrive(demo,time);
  const helpersUpdated=advanceGardenHelpers(demo,time);
  if(advanceVillage(demo,day)||started||soilStarted||livestockStarted||driveUpdated||helpersUpdated)store.write(demoKey,demo);
  setState(snapshot(demo,demo.farms.demo,time));
}
async function api(path, payload, credentials=session) {
  const headers={};
  if(credentials) {
    headers.authorization='Bearer '+credentials.token;
    if(credentials.code)headers['x-room-code']=credentials.code;
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
async function apiAccount(path,payload,credentials) {
  const headers={};
  if(credentials?.token) headers.authorization='Bearer '+credentials.token;
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
  return '<div class="row area-heading"><h2>Ô canh tác</h2><span class="badge">'+indices.filter(i=>plotAt(farm,i)).length+'/'+indices.length+' ô đã gieo</span></div>'+
    (farm.gardenHelperJob?gardenHelperStatus(farm,currentTime()):'')+damp+group+'<div class="plot-select">'+indices.map(i=>{
      const crop=plotAt(farm,i), amount=crop?progress(crop.progress,cropGoal(crop)):0;
      const label=plotNumber(i);
      const task=tasks.find(task=>task.kind==='plot'&&task.index===i);
      const hard=!crop&&farm.soilCompactsAt[i]<=currentTime();
      return `<button class="btn${selected===i?' primary':''}" ${task?'data-flag="'+task.type+'" ':''}data-plot="${i}" aria-pressed="${selected===i}">${crop?goods[crop.kind].icon:hard?'⚒':'＋'} Ô ${label}${crop?' · '+amount+'%':hard?' · Chai':''}</button>`;
    }).join('')+'</div>';
}
function renderWorkshop(farm){
  const tabs='<div class="workshop-tabs" role="group" aria-label="Nhóm chế biến">'+Object.entries(workshopTabs).map(([key,label])=>
    btn(label,'data-workshop-tab="'+key+'" aria-pressed="'+(workshopTab===key)+'"',workshopTab===key?'primary':'subtle')).join('')+'</div>';
  const available=Object.entries(recipes).filter(([,recipe])=>recipeCategory(recipe)===workshopTab);
  const orders=state.orders.some(order=>order.category==='workshop')?
    '<div class="actions">'+btn('Đơn Xưởng','data-panel="orders"','subtle')+'</div>':'';
  const heading=boardBar('Xưởng máy','⚙️ Cấp '+farm.workshop)+tabs+orders;
  if(!available.length)return heading+'<p class="workshop-empty">Công cụ sẽ được triển khai sau.</p>';
  return heading+'<div class="farm-list card-grid">'+available.map(([item,recipe])=>{
    const locked=craftRequirement(farm,item), owned=farm.inventory[item]??0;
    const note=recipe.gain?recoveryText(recipe.gain):'Có trong kho: '+owned+' · Dùng giao đơn xưởng hoặc nâng cấp.';
    return '<article class="recipe-card"><div class="row"><h3>'+itemLink(item)+'</h3><span class="badge">Cấp '+recipe.level+'</span></div><p>'+note+'</p>'+
      '<ul class="recipe-ingredients">'+Object.entries(recipe.ingredients).map(([key,count])=>'<li><span>'+itemLink(key)+'</span><strong>'+Math.min(count,farm.inventory[key]??0)+' / '+count+'</strong></li>').join('')+'</ul>'+
      (locked?'<p>'+escape(locked)+'</p>':'')+'<div class="actions">'+act('Chế biến','craft',item,'','primary',!!locked)+
      (recipe.gain&&owned>0?btn('Dùng · '+owned,'data-item-info="'+item+'"','subtle'):'')+'</div></article>';
  }).join('')+'</div>';
}
const recoveryText=gain=>Object.entries(gain).map(([key,value])=>'+'+value+' '+({stamina:'thể lực',water:'điểm nước',food:'điểm no'})[key]).join(' · ');
const ingredientsText=ingredients=>Object.entries(ingredients).map(([key,count])=>count+' '+goods[key].name.toLowerCase()).join(' + ');
const supplyUses={
  spray:'Trị sâu trên ô đang trồng để hạn chế mất sản lượng.',
  fertilizer:'Tăng tốc độ lớn và tăng sản lượng cơ sở thêm 1 món.',
  feed:'Cho vật nuôi trong chuồng ăn để lớn và tạo sản phẩm.',
  aquaFeed:'Cho cá, tôm ăn để lứa nuôi tiếp tục lớn.',
};
function describeItem(item){
  const recipe=recipes[item];
  if(recipe){
    const upgrades=Object.values(buildings).flatMap(building=>Object.entries(building.materials??{}).
      filter(([,items])=>items[item]).map(([level,items])=>building.name+' cấp '+level+' ('+items[item]+')'));
    const kitchenOrder=workshopFoodOrders.some(order=>order.item===item);
    const use=recipe.gain?recoveryText(recipe.gain)+'. Dùng từ Kho & túi hoặc thanh hồi phục.'+
      (kitchenOrder?' Có thể giao đơn Xưởng.':''):
      'Giao đơn xưởng hoặc bán tại chợ.'+(upgrades.length?' Nâng cấp '+upgrades.join(', ')+'.':'');
    return [use,'Chế biến ở Xưởng máy cấp '+recipe.level+' bằng '+ingredientsText(recipe.ingredients)+'.'];
  }
  if(supplyUses[item])return [supplyUses[item],'Mua tại Chợ làng, mục Vật tư.'];
  const crop=Object.keys(crops).find(key=>crops[key].seed===item);
  if(crop)return ['Gieo trên ô đất trống để trồng '+goods[crop].name.toLowerCase()+'.','Mua ở Chợ làng hoặc đổi '+goods[crop].name.toLowerCase()+' thành giống trong Kho & túi.'];
  const species=Object.values(aquatic).find(value=>value.seed===item);
  if(species){
    const needs=[species.xp?species.xp+' XP':'',species.barn?'Kho cấp '+species.barn:''].filter(Boolean);
    return ['Nuôi trong ao. Mỗi con giống cần '+species.food+' phần thức ăn, lớn trong '+duration(species.time)+' cơ sở và cho '+species.yield+' sản phẩm.',
      'Mua tại Chợ làng, nhóm Con giống.'+(needs.length?' Mở khóa khi có '+needs.join(' và ')+'.':'')];
  }
  const animal=Object.values(animals).find(value=>value.product===item);
  const mentionRecipes=Object.keys(recipes).filter(key=>recipes[key].ingredients[item]);
  const uses=['Bán lấy xu'];
  if(['wheat','carrot','corn','egg','milk','minnow','pork'].includes(item)||[...varietyOrders,...aquaOrders].some(order=>order.items.some(entry=>entry.item===item)))uses.push('giao đơn làng');
  if(crops[item])uses.push('giữ làm giống');
  if(mentionRecipes.length)uses.push('chế biến '+mentionRecipes.map(key=>goods[key].name.toLowerCase()).join(', '));
  let source;
  if(crops[item])source='Thu hoạch từ luống '+goods[item].name.toLowerCase()+' đã chín.';
  else if(animal)source=animal.oneTime?'Xuất chuồng '+animal.name.toLowerCase()+' sau khi nuôi đủ lớn.':'Thu từ '+animal.name.toLowerCase()+' đã trưởng thành và được cho ăn.';
  else if(aquatic[item])source=item==='tilapia'?'Thu hoạch ở ao nuôi hoặc câu tại Hồ làng.':'Thu hoạch ở ao nuôi khi lứa đã trưởng thành.';
  else source=item==='goldenCarp'?'Câu tại Hồ làng, tỷ lệ cắn câu hiếm.':'Câu tại Hồ làng.';
  return [uses.join(', ')+'.',source];
}
function itemDescription(item){
  const [use,source]=describeItem(item);
  return '<dl class="item-description"><dt>Tác dụng</dt><dd>'+escape(use)+'</dd><dt>Cách có</dt><dd>'+escape(source)+'</dd></dl>';
}
function cropGrowthStrip(kind,currentStage){
  return '<ol class="crop-growth-strip" aria-label="Bốn giai đoạn phát triển">'+cropGrowthLabels[kind].map((label,stage)=>{
    const snap=cropFrame(kind,stage);
    return '<li'+(stage===currentStage?' aria-current="step"':'')+'><span class="crop-growth-sprite" style="background-image:url('+snap.source+');background-position:'+(-snap.x)+'px '+(-snap.y)+'px" aria-hidden="true"></span><strong>'+label+'</strong></li>';
  }).join('')+'</ol><p>Thu hoạch khi tiến độ đạt 100%.</p>';
}
function stockLock(farm,item){
  const crop=Object.keys(crops).find(key=>crops[key].seed===item);
  if(crop)return cropRequirement(farm,crop);
  const recipe=recipes[item];
  return recipe&&(farm.workshop??0)<recipe.level?'Cần Xưởng máy cấp '+recipe.level+'.':aquaSupplyRequirement(farm,item);
}
function showItem(item,fromStock=false){
  if(!Object.hasOwn(goods,item))return;
  const now=currentTime(), farm=state.me, health=wellnessAt(farm,now);
  const reason=recipes[item]?.gain&&mealRequirement(farm,item,health,now);
  const crop=Object.hasOwn(crops,item)?item:Object.keys(crops).find(key=>crops[key].seed===item);
  const count=farm.inventory[item]??0;
  const locked=fromStock&&stockLock(farm,item);
  const saveSeed=fromStock&&Object.hasOwn(crops,item)&&count?
    '<div class="actions">'+btn('Giữ giống','data-seed-crop="'+item+'"','subtle',(farm.inventory[crops[item].seed]??0)>=supplyLimit)+'</div>':'';
  const art=aquaIllustration(item);
  modal(art?art+escape(goods[item].name):nice(item),itemDescription(item)+'<p>Đang có '+count+'</p>'+
    (locked?'<p><strong>Đang khóa.</strong> '+escape(locked)+'</p>':'')+
    (crop?cropGrowthStrip(crop):'')+
    (recipes[item]?.gain&&(!fromStock||count)?'<div class="actions">'+btn('Dùng ngay','data-meal="'+item+'"','primary',!!reason)+'</div>'+
      (reason?'<p>'+escape(reason)+'</p>':''):'')+saveSeed+'<p id="dialog-error" role="status"></p>');
}
function hideStockTooltip(){
  if(!stockTooltipCard)return;
  stockTooltipCard.removeAttribute('aria-describedby');
  stockTooltipCard=null;
  stockTooltip.hidden=true;
}
function showStockTooltip(card){
  if(dialog.open||stockTooltipCard===card)return;
  hideStockTooltip();
  const item=card.dataset.itemInfo, locked=stockLock(state.me,item);
  stockTooltip.innerHTML='<strong>'+escape(nice(item))+'</strong>'+itemDescription(item)+
    (locked?'<p class="stock-tooltip-lock">'+escape(locked)+'</p>':'');
  stockTooltipCard=card;
  card.setAttribute('aria-describedby','stock-tooltip');
  stockTooltip.hidden=false;
  const anchor=card.getBoundingClientRect();
  const width=stockTooltip.offsetWidth, height=stockTooltip.offsetHeight;
  const edge=8;
  const side=anchor.left>=width+edge||anchor.right+width<=innerWidth-edge;
  const left=anchor.left>=width+edge?anchor.left-width:side?anchor.right:anchor.left;
  const top=side?anchor.top:anchor.bottom+height<=innerHeight-edge?anchor.bottom:anchor.top-height;
  stockTooltip.style.left=Math.max(edge,Math.min(left,innerWidth-width-edge))+'px';
  stockTooltip.style.top=Math.max(edge,Math.min(top,innerHeight-height-edge))+'px';
}
function showCropGrowth(index){
  const plot=plotAt(state.me,index);
  if(plot)modal('Giai đoạn · '+goods[plot.kind].name,cropGrowthStrip(plot.kind,cropStage(plot)));
}
function renderCropTools(farm,now) {
  const plot=plotAt(farm,selected);
  if(!plot&&farm.soilCompactsAt[selected]<=now)return '<h2>Đất đã chai</h2><p>Ô này bỏ trống ít nhất 8 giờ. Cuốc đất để làm tơi rồi gieo hạt.</p><div class="actions">'+act('Cuốc đất','till','',selected,'primary')+'</div>';
  if(!plot) return '<h2>Gieo hạt</h2><p>Chọn giống cho ô '+plotNumber(selected)+'. Một số giống cần Xưởng máy.</p><div class="actions crop-actions">'+Object.entries(crops).map(([key,crop])=>{
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
    '<div class="actions">'+btn('4 giai đoạn','data-crop-growth="'+selected+'"','subtle')+(ripe?act('Thu hoạch','harvest','',selected,'primary')+
      '<button type="button" class="btn subtle" data-action="harvest" data-index="'+selected+'" data-source="seed"'+(!remaining||(farm.inventory[crops[plot.kind].seed]??0)>=100?' disabled':'')+'>Thu và giữ 1 giống</button>':
      act('💧 Tưới nước','water','',selected,'primary',wet)+
      act('🧺 Bón phân · '+(farm.inventory.fertilizer||0),'fertilize','',selected,'',plot.fertilized||!farm.inventory.fertilizer)+
      act('🧴 Xịt thuốc · '+(farm.inventory.spray||0),'spray','',selected,'',plot.protectedUntil>now||!farm.inventory.spray))+'</div>';
}
function upgrade(farm,key) {
  const {icon:emoji,name}=buildings[key];
  const {level,max,cost,xp,benefit,nextBenefit,materials}=buildingUpgrade(farm,key);
  const heading=emoji+' '+name+(level?' · Cấp '+level+'/'+max:'');
  const requirements=[cost&&formatCoins(cost)+' xu',xp&&formatCoins(xp)+' XP'].filter(Boolean).join(' · ');
  const missing=[farm.coins<cost&&formatCoins(cost-farm.coins)+' xu', (farm.xp??0)<xp&&formatCoins(xp-(farm.xp??0))+' XP'].filter(Boolean).join(' và ');
  const next=cost?'<p><b>Cấp '+(level+1)+'</b> · '+escape(nextBenefit)+'</p><p>'+requirements+
    (missing?' · Thiếu '+missing:'')+'</p>':'';
  const required=Object.entries(materials).map(([item,count])=>{
    const have=farm.inventory[item]??0;
    return '<li data-ready="'+(have>=count)+'"><span>'+itemLink(item)+'</span><strong>'+Math.min(have,count)+' / '+count+'</strong></li>';
  }).join('');
  return '<article class="upgrade-card"><div class="row"><h3>'+heading+'</h3>'+
    (cost?act(level?'Nâng cấp':'Xây','upgrade',key,'','',farm.coins<cost||!!upgradeRequirement(farm,key)):'<span class="badge">Tối đa</span>')+
    '</div><p>'+escape(benefit)+'</p>'+next+(required?'<ul class="recipe-ingredients upgrade-materials" aria-label="Vật tư nâng cấp">'+required+'</ul>':'')+'</article>';
}
function animalIllustration(kind){
  const frame=livestockAtlas.frames[kind];
  if(!frame)return '<span class="animal-icon" aria-hidden="true">'+animals[kind].icon+'</span>';
  const [x]=frame;
  return '<span class="animal-icon pixel-animal" aria-hidden="true" style="background-image:url('+livestockAtlas.source+
    ');background-size:'+livestockAtlas.columns*42+'px 36px;background-position:-'+x*.75+'px 0"></span>';
}
function renderCoop(farm,now,lot){
  const pens=farm.pens.map((pen,i)=>({pen,i})).filter(entry=>entry.pen.lot===lot);
  const limit=coopCapacity(farm,lot);
  const shop=limit?'<details class="panel-fold wide-card" data-panel-fold="animal-shop"'+(!pens.length?' open':'')+'><summary>Đón vật nuôi</summary><div class="actions action-grid">'+Object.entries(animals).map(([key,info])=>{
    const locked=animalRequirement(farm,key,lot);
    const label=info.name+(locked?' · 🔒 '+locked:' · '+info.cost+' xu');
    return act(animalIllustration(key)+'<span>'+label+'</span>','animal',key,lot??'','gold',!!locked||farm.coins<info.cost||pens.length>=limit);
  }).join('')+'</div></details>':'';
  return boardBar(lot===undefined?'Chuồng chính':'Chuồng ở ô '+(lot+1),limit?'🐾 '+pens.length+'/'+limit:'Chưa xây chuồng')+
    '<div class="farm-list card-grid">'+shop+(!limit?'<article class="wide-card"><h3>Dựng chuồng đầu tiên</h3><p>Mở chỗ cho hai gà mái. Nâng cấp để nuôi bò, lợn và che nắng.</p><div class="actions">'+act('Xây chuồng · 45 xu','upgrade','coop','','primary',farm.coins<45)+'</div></article>':'')+
    pens.map(({pen,i})=>{
      const info=animals[pen.kind];
      const targetAge=growthGoal(pen), targetProduct=productGoal(pen), grown=pen.age>=targetAge, ready=pen.progress>=targetProduct;
      const status=!grown?'Đang lớn':info.oneTime?(ready?'Sẵn sàng xuất chuồng':'Đang vỗ béo'):(ready?'Có ':'Đang tạo ')+goods[info.product].name.toLowerCase();
      const condition=animalCondition(pen,now);
      const label=(info.oneTime?'Xuất chuồng':'Thu')+' · '+condition.yield+' '+goods[info.product].name.toLowerCase();
      const ref=' data-target="'+(pen.id??i)+'" data-index="'+i+'"';
      const feed=btn('Cho ăn · '+info.food,'data-action="feed"'+ref,'',pen.fedUntil>now||farm.inventory.feed<info.food);
      const collect=btn(label,'data-action="collect"'+ref,'primary');
      const manage=btn('Quản lý','data-manage-animal="'+(pen.id??i)+'"','subtle');
      const aging=condition.yield<info.yield?' · '+condition.label+' ('+condition.yield+'/'+info.yield+' mỗi lứa)':'';
      return '<article class="animal-card" data-pen="'+i+'"><div>'+animalIllustration(pen.kind)+'<h3>'+info.name+' '+(i+1)+'</h3><p>'+status+
        (ready?'':' · '+duration(grown?targetProduct-pen.progress:targetAge-pen.age)+' cơ sở · '+(pen.fedUntil>now?'Còn thức ăn '+duration(pen.fedUntil-now):'Đói'))+
        aging+'</p></div>'+valueBar(grown?pen.progress:pen.age,grown?targetProduct:targetAge)+'<div class="actions">'+(ready?(info.oneTime?'':feed)+collect:feed)+manage+'</div></article>';
    }).join('')+'</div>';
}
function showAnimalManagement(id,confirmSale=false){
  const farm=state.me;
  const slot=farm.pens.findIndex(pen=>String(pen.id)===id);
  if(slot<0)return;
  const pen=farm.pens[slot],info=animals[pen.kind],condition=animalCondition(pen,currentTime());
  const title=info.name+' '+(slot+1), where=pen.lot===undefined?'Chuồng chính':'Chuồng ở ô '+(pen.lot+1);
  const sale='<form data-form="sellAnimal" data-target="'+id+'"><div class="actions">'+
    btn('Quay lại','data-manage-animal="'+id+'"','subtle')+'<button type="submit" class="btn danger">Bán · '+condition.sale+' xu</button></div></form>';
  const destinations=[undefined,...getLand(farm).flatMap((lot,index)=>lot?.kind==='coop'?[index]:[])].filter(lot=>lot!==pen.lot&&coopCapacity(farm,lot));
  const choices=destinations.map(lot=>{
    const reason=animalRelocation(farm,pen,lot);
    const label=lot===undefined?'Chuồng chính':'Chuồng ở ô '+(lot+1);
    return '<option value="'+(lot??-1)+'"'+(reason?' disabled':'')+'>'+label+(reason?' · '+escape(reason):'')+'</option>';
  }).join('');
  const canMove=destinations.some(lot=>!animalRelocation(farm,pen,lot));
  const move=destinations.length?'<form data-form="moveAnimal" data-target="'+id+'"><label>Chuyển đến<select name="destination" required>'+
    '<option value="" selected disabled>Chọn chuồng đích</option>'+choices+'</select></label><button type="submit" class="btn primary"'+(canMove?'':' disabled')+'>Chuyển chuồng</button></form>':
    '<p>Xây thêm chuồng để chuyển vật nuôi.</p>';
  const age=info.oneTime?'':condition.label+' · '+condition.days+' ngày nuôi · '+condition.yield+' '+goods[info.product].name.toLowerCase()+'/lứa';
  const details=confirmSale?'<p>Bán sống '+title.toLowerCase()+' để nhận '+condition.sale+' xu và giải phóng một chỗ ở '+where.toLowerCase()+'. Sản phẩm chưa thu sẽ mất.</p>'+sale:
    '<p>'+where+(age?' · '+age:'')+'</p>'+move+'<div class="actions">'+btn('Bán vật nuôi','data-sell-animal="'+id+'"','subtle')+'</div>';
  modal((confirmSale?'Bán ':'Quản lý ')+title.toLowerCase(),details+'<p id="dialog-error" role="status"></p>');
}
function renderMarket(farm) {
  const options={orders:'Đơn làng',stall:'Sạp',supplies:'Vật tư',sales:'Bán nhanh'};
  const subnav='<div class="market-tabs" role="group" aria-label="Khu vực chợ">'+Object.entries(options).map(([key,label])=>btn(label,'data-market-pane="'+key+'" aria-pressed="'+(marketPane===key)+'"',marketPane===key?'primary':'subtle')).join('')+'</div>';
  if(marketPane==='orders')return subnav+'<section id="market-orders">'+renderOrders(farm,currentTime())+'</section>';
  const titles={stall:'Sạp nông sản',supplies:'Vật tư',sales:'Bán nhanh cho chợ'};
  const label=marketPane==='sales'?'Tìm nông sản cần bán':marketPane==='supplies'?'Tìm vật tư cần mua':'Tìm nông sản trên sạp';
  const list=marketPane==='stall'?btn('Đăng bán','data-list','primary',!stock(farm)):'';
  const categories={all:'Tất cả',...Object.fromEntries(Object.entries(supplyGroups).map(([id,group])=>[id,group.label]))};
  const filters=marketPane==='supplies'?'<div class="market-filters" role="group" aria-label="Nhóm vật tư">'+Object.entries(categories).map(([id,name])=>
    btn(escape(name),'data-supply-group="'+id+'" aria-controls="market-results" aria-pressed="'+(id===supplyGroup)+'"',id===supplyGroup?'primary':'subtle')).join('')+'</div>':'';
  const grid=marketPane==='supplies'?'':' card-grid market-cards';
  return subnav+'<section id="market-'+marketPane+'"><div class="row"><h2>'+titles[marketPane]+'</h2>'+list+'</div>'+
    '<div class="market-search"><input type="search" data-market-search="'+marketPane+'" autocomplete="off" aria-label="'+label+'" placeholder="'+label+'" value="'+escape(marketQueries[marketPane])+'"></div>'+
    filters+'<div class="itemlist'+grid+'" id="market-results" data-market-results>'+renderMarketResults(farm,marketPane)+'</div></section>';
}
const searchText=value=>value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d').trim();
function renderMarketResults(farm,pane){
  const query=searchText(marketQueries[pane]);
  const words=query.split(/\s+/);
  const matches=key=>words.every(word=>searchText(goods[key].name).includes(word));
  const empty='<p role="status">Không tìm thấy vật phẩm phù hợp.</p>';
  if(pane==='stall'){
    return state.listings.filter(entry=>matches(entry.item)).map(entry=>
      '<div class="row itemrow"><div>'+itemLink(entry.item,nice(entry.item)+' × '+entry.qty)+'<p>'+escape(entry.sellerName)+' · '+entry.price+' xu/món</p></div>'+
      (entry.seller===farm.id?act('Gỡ','delist','',entry.id,'subtle'):act('Mua · '+entry.price*entry.qty+' xu','deal','',entry.id,'gold',farm.coins<entry.price*entry.qty))+'</div>'
    ).join('')||(query?empty:'<p>Sạp đang trống.</p>');
  }
  if(pane==='supplies'){
    const groups=supplyGroup==='all'?Object.values(supplyGroups):[supplyGroups[supplyGroup]];
    return groups.map(({label,items})=>{
      const rows=items.filter(matches).map(key=>{
        const count=farm.inventory[key]??0;
        const crop=Object.keys(crops).find(crop=>crops[crop].seed===key);
        const locked=crop?cropRequirement(farm,crop):aquaSupplyRequirement(farm,key);
        return '<div class="row itemrow"><div>'+itemLink(key)+'<p>'+(locked?'🔒 '+locked:'Trong túi '+count)+'</p></div>'+
          btn('Mua · '+goods[key].buy+' xu','data-shop="'+key+'"','',!!locked||farm.coins<goods[key].buy||count>=supplyLimit)+'</div>';
      }).join('');
      return rows?'<section class="market-supply-group"><h4>'+escape(label)+'</h4><div class="card-grid market-cards">'+rows+'</div></section>':'';
    }).join('')||empty;
  }
  return Object.keys(goods).filter(key=>matches(key)&&goods[key].sell&&farm.inventory[key]).map(key=>{
    const count=farm.inventory[key]??0;
    const price=goods[key].sell;
    return '<div class="itemrow market-sale">'+itemLink(key,nice(key)+' × '+count)+'<div class="actions">'+
      btn('Bán · '+price+' xu','data-sell="'+key+'"')+btn('Bán hết','data-sell-all="'+key+'" aria-label="Bán hết '+goods[key].name+'"','gold')+'</div></div>';
  }).join('')||(query?empty:'<p>Thu hoạch nông sản để bán lấy xu.</p>');
}
function renderNeighbors(farm,now) {
  const villageLeft=state.village.theftsLeft;
  const left=Math.max(0,Math.min(villageLeft,visitLimit(farm)-farm.daily.taken));
  let html=boardBar(neighborId?'Ghé thăm':'Hàng xóm','🎒 '+left+'/'+visitLimit(farm)+' lượt');
  const mine={...farm,wealth:state.wealth.find(row=>row.id===farm.id)?.total??farm.coins,mine:true};
  const homes=[mine,...state.neighbors];
  const current=state.neighbors.find(n=>n.id===neighborId);
  if(!current) {
    const count=Math.ceil(homes.length/6);
    const pages=count>1?'<div class="row map-pages">'+btn('‹ Trang trước','data-village-page="'+(villagePage-1)+'"','subtle',villagePage===0)+'<span>'+String(villagePage+1)+' / '+count+'</span>'+btn('Trang sau ›','data-village-page="'+(villagePage+1)+'"','subtle',villagePage+1>=count)+'</div>':'';
    const cards=homes.slice(villagePage*6,villagePage*6+6).map(n=>
      '<article class="neighbor-card"><div><h3>🏡 '+escape(n.name)+(n.mine?' · Bạn':'')+'</h3><p>'+formatCoins(n.wealth)+' xu tài sản · Ruộng cấp '+n.field+(n.mine?'':n.shieldUntil>now?' · Đang đóng cổng':' · '+n.garden.length+' ô chín có thể lấy')+'</p></div>'+
      btn(n.mine?'Về nhà':'Ghé thăm',n.mine?'data-tab="field"':`data-visit="${n.id}"`,'primary')+'</article>').join('');
    const waiting=state.neighbors.length?'':'<article class="wide-card"><h3>Làng đang chờ hàng xóm</h3><p>Chia sẻ mã làng để bạn bè vào trồng và trao đổi cùng bạn.</p><div class="actions">'+btn('Chia sẻ mã','data-room','primary')+'</div></article>';
    return html+pages+'<div class="farm-list card-grid">'+cards+waiting+'</div>';
  }
  const unavailable=left<1||current.available<1||farm.daily.targets.includes(current.id)||current.shieldUntil>now;
  const message=villageLeft<1?'Cả làng đã hết lượt trộm hôm nay.':current.shieldUntil>now?'Cổng đang đóng.':farm.daily.targets.includes(current.id)?'Bạn đã lấy một món tại đây hôm nay.':current.available<1?'Vườn đã đạt giới hạn bị lấy hôm nay.':left<1?'Túi ghé vườn đã hết lượt hôm nay.':'Mỗi lần lấy một món.';
  const pick=(key,source,index='')=>btn('Lấy 1 '+nice(key),`data-action="steal" data-target="${current.id}" data-source="${source}" data-index="${index}" data-item="${key}"`,'gold',unavailable);
  return html+'<div class="farm-list"><article><div class="row"><h3>🏡 '+escape(current.name)+'</h3>'+btn('Về danh sách','data-return')+'</div><p>Ruộng cấp '+current.field+' · '+current.animalCount+' vật nuôi</p><p>'+message+'</p></article>'+
    '<article id="visit-garden"><h3>🌱 Ngoài vườn</h3>'+(current.garden.length?'<div class="actions action-grid">'+current.garden.map(p=>pick(p.kind,'garden',p.index)).join('')+'</div>':'<p>Chưa có ô nào đủ nông sản để lấy.</p>')+'</article>'+
    '<article id="visit-barn"><h3>📦 Trong kho</h3>'+(current.items.length?'<div class="actions action-grid">'+current.items.map(key=>pick(key,'barn')).join('')+'</div>':'<p>Kho đang giữ lại nông sản cho chủ vườn.</p>')+'</article>'+
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
  const header='<div class="row"><h2>Ao nuôi thủy sản</h2>'+btn('Tới cầu gỗ','data-pond-go','subtle')+'</div><div class="market-tabs pond-tabs">'+tabs+'</div>'+
    '<p>Đã thả '+used+'/'+limit+' con giống · Còn '+food+' phần thức ăn.</p>';
  const seeds=Object.entries(aquatic).map(([item,def])=>{
    const available=farm.inventory[def.seed]??0;
    const locked=aquaRequirement(farm,item);
    const title=aquaIllustration(item)||goods[item].icon+' ';
    return btn(title+'<span>'+def.name+'<small>'+escape(locked?'🔒 '+locked:available+' con giống')+'</small></span>',
      'data-aqua-stock="'+item+'"','subtle aqua-stock',!!locked||limit<=used||!available||batches.some(batch=>batch.kind===item));
  }).join('');
  const rows=batches.map(batch=>{
    const def=aquatic[batch.kind],ripe=pondReady(batch),eating=batch.fedUntil>now,cost=pondFood(batch);
    const status=ripe?'Có thể thu '+pondYield(batch)+' con.':(eating?'Đang lớn':'Thiếu thức ăn')+' · '+progress(batch.progress,def.time)+'%.';
    const action=ripe?act('Thu hoạch','aquaHarvest',batch.kind,pondTab,'primary'):
      act('Cho ăn · '+cost+' phần','aquaFeed',batch.kind,pondTab,'primary',eating||food<cost);
    return '<article><h3>'+itemLink(batch.kind,nice(batch.kind)+' · '+(batch.count??1)+' giống')+'</h3><p>'+status+'</p>'+valueBar(batch.progress,def.time)+'<div class="actions">'+action+'</div></article>';
  }).join('');
  return header+'<div class="actions action-grid">'+seeds+'</div>'+(rows?'<div class="farm-list card-grid">'+rows+'</div>':'<p>Ao đang trống. Bạn có thể mua con giống ở chợ làng.</p>');
}
function showPondStock(item){
  const farm=state.me, def=aquatic[item];
  const batches=visiblePondBatches(farm,pondTab);
  const used=batches.reduce((sum,batch)=>sum+(batch.count??1),0);
  const max=Math.min(farm.inventory[def.seed]??0,pondCapacity(farm,pondTab)-used);
  if(aquaRequirement(farm,item)||max<1||batches.some(batch=>batch.kind===item))return;
  modal('Thả '+def.name.toLowerCase(),'<p>Có thể thả tối đa '+max+' con giống vào ao này.</p>'+
    itemDescription(def.seed)+'<form data-form="aquaStock" data-item="'+item+'" data-pond="'+pondTab+'"><label>Số con giống<input name="qty" type="number" min="1" max="'+max+'" value="1" required></label>'+
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
let gardenDecorScroll=0;
function gardenDecorIcon(item){
  const {source,width,cellHeight,frames}=gardenDecorAtlas, scale=.75;
  return '<span class="garden-decor-icon" aria-hidden="true" style="background-image:url('+source+');background-size:'+
    width*scale+'px '+cellHeight*scale+'px;background-position:-'+frames[item][0]*scale+'px 0"></span>';
}
function showGardenDecor(keepScroll=false){
  const farm=state.me, owned=farm.gardenDecor??{}, vouchers=farm.decorVouchers??0;
  const cards=Object.entries(gardenDecorItems).map(([item,definition])=>{
    const spot=owned[item];
    const status=spot?gardenDecorSpots[spot].name:Object.hasOwn(owned,item)?'Đang cất':definition.cost+' xu hoặc 1 phiếu';
    const afford=Object.hasOwn(owned,item)||farm.coins>=definition.cost||vouchers>0;
    return '<article class="garden-decor-card">'+gardenDecorIcon(item)+'<div><h3>'+definition.name+'</h3><p>'+status+'</p></div><div class="actions">'+
      btn(spot?'Chuyển':'Đặt','data-garden-decor-item="'+item+'" aria-label="'+(spot?'Chuyển ':'Đặt ')+definition.name.toLowerCase()+'"','primary',!afford)+
      (spot?btn('Cất','data-stow-garden-decor="'+item+'" aria-label="Cất '+definition.name.toLowerCase()+'"','subtle'):'')+'</div></article>';
  }).join('');
  modal('Trang trí vườn','<p><strong>'+formatCoins(farm.coins)+' xu · '+vouchers+' phiếu trang trí</strong></p>'+
    '<div class="garden-decor-list" role="region" aria-label="Danh sách đồ trang trí" tabindex="0">'+cards+'</div><p id="dialog-error" role="status"></p>');
  dialog.querySelector('.garden-decor-list').scrollTop=keepScroll?gardenDecorScroll:0;
}
function showGardenDecorPlacement(item){
  if(!Object.hasOwn(gardenDecorItems,item))return;
  gardenDecorScroll=dialog.querySelector('.garden-decor-list')?.scrollTop??0;
  const farm=state.me, definition=gardenDecorItems[item];
  const owned=Object.hasOwn(farm.gardenDecor??{},item);
  const spots=Object.entries(gardenDecorSpots).map(([key,spot])=>{
    const usedBy=gardenDecorAt(farm,key);
    return {key,label:spot.name+(usedBy?' · '+gardenDecorItems[usedBy].name:''),disabled:!!usedBy};
  });
  const canPay=owned||(farm.decorVouchers??0)>0||farm.coins>=definition.cost;
  const positions=spots.map(({key,label,disabled})=>'<option value="'+key+'"'+(disabled?' disabled':'')+'>'+label+'</option>').join('');
  const payment=owned?'<p>Bạn có thể đặt lại miễn phí.</p>':
    '<label>Thanh toán<select name="source" required><option value="" disabled selected>Chọn cách thanh toán</option>'+
    '<option value="coins"'+(farm.coins<definition.cost?' disabled':'')+'>'+definition.cost+' xu</option>'+
    '<option value="voucher"'+((farm.decorVouchers??0)<1?' disabled':'')+'>1 phiếu trang trí</option></select></label>';
  const back=btn('Quay lại','data-garden-decor','subtle');
  const form=spots.every(spot=>spot.disabled)?'<p>Cất một món để tạo chỗ trống.</p>'+back:
    '<form data-form="placeGardenDecor" data-item="'+item+'"><label>Vị trí<select name="target" required>'+
    '<option value="" disabled selected>Chọn vị trí trống</option>'+positions+'</select></label>'+payment+
    '<div class="actions">'+back+'<button type="submit" class="btn primary"'+(canPay?'':' disabled')+'>Xác nhận đặt</button></div></form>';
  modal('Đặt '+definition.name.toLowerCase(),form+'<p id="dialog-error" role="status"></p>');
}
function renderLand(farm,now){
  const lot=farm.land[selectedLot], price=lotPrice(farm.land.filter(Boolean).length);
  const grid=farm.land.map((entry,i)=>btn((i+1)+' · '+lotLabel(entry),'data-land-tab="'+i+'" aria-pressed="'+(selectedLot===i)+'"',selectedLot===i?'primary':'subtle')).join('');
  const header='<div class="row"><h2>Quỹ đất</h2><span class="badge">'+farm.land.filter(Boolean).length+'/'+farm.land.length+' ô</span></div>'+
    '<div class="actions">'+btn('Trang trí vườn','data-garden-decor aria-haspopup="dialog"','subtle')+'</div><div class="land-grid">'+grid+'</div>';
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
  const resting=health.restUntil>now;
  const status=resting?'Đang nghỉ · <span data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</span>':
    'Thể lực '+Math.floor(health.stamina)+'/100';
  return '<section class="home-guide"><div><h2>Chỗ nghỉ</h2><p>'+status+'</p></div>'+
    '<div class="actions">'+btn('Nghỉ ngay','data-recover="rest"','primary',resting||health.stamina>=100)+btn('Ra vườn','data-home-exit','subtle')+'</div></section>'+renderJournal(farm);
}
function gardenHelperStatus(farm,now){
  const job=farm.gardenHelperJob, report=farm.gardenHelperReport;
  if(job){
    const completed=job.processed-job.skipped;
    const work=job.action==='water'?'tưới cây':'thu hoạch';
    return '<div class="helper-status" data-helper-active><strong>'+gardenHelperName+' đang '+work+(job.keepSeeds?' · Giữ giống':'')+'</strong>'+
      '<p>Đã làm '+completed+'/'+job.steps.length+' ô'+(job.skipped?' · Bỏ qua '+job.skipped:'')+
      ' · Còn <span data-until="'+job.endsAt+'">'+duration(job.endsAt-now)+'</span></p></div>';
  }
  if(!report)return '';
  const work=report.action==='water'?'tưới':'thu hoạch';
  return '<div class="helper-status" data-helper-report><p>'+gardenHelperName+' đã '+work+' '+report.completed+'/'+report.total+' ô'+
    (report.produce?' · '+report.produce+' nông sản':'')+(report.seeds?' · Giữ '+report.seeds+' giống':'')+
    (report.refund?' · Hoàn '+report.refund+' xu':'')+'</p></div>';
}
function renderTasks(farm,now){
  const shortcuts=Object.entries(gardenHelperActions).map(([action,{label,fee}])=>{
    const count=gardenHelperTargets(farm,action,state.weather,now).length;
    return btn(label+' · '+fee+' xu/ô','data-quick-garden="'+action+'" aria-haspopup="dialog"','subtle',!count||!!farm.gardenHelperJob);
  }).join('');
  const status=gardenHelperStatus(farm,now);
  const quick='<section class="quick-garden-tools" aria-label="Thuê người chăm vườn"><h3>Thuê người chăm vườn</h3>'+status+
    (farm.gardenHelperJob&&tab!=='field'?'<div class="actions">'+btn('Xem ở vườn','data-tab="field"','subtle')+'</div>':'')+
    '<div class="actions">'+shortcuts+'</div></section>';
  const list=tasks.length?'<div class="task-list">'+tasks.map((task,index)=>'<button class="task-card" data-task="'+index+'" data-tone="'+task.type+'"><span class="task-mark">'+taskStyles[task.type].mark+'</span><span><strong>'+task.title+'</strong><small>'+task.label+'</small></span><span class="task-arrow" aria-hidden="true">›</span></button>').join('')+'</div>':
    '<p>Vườn đang ổn. Bạn có thể dạo hồ hoặc sang chợ.</p>';
  return '<h2>Việc cần làm</h2>'+quick+renderJournal(farm)+list;
}
function showQuickGarden(action){
  const farm=state.me, targets=gardenHelperTargets(farm,action,state.weather,currentTime());
  if(!targets.length||farm.gardenHelperJob)return;
  const rows=targets.map(({index,kind})=>{
    const lot=gardenFor(index), number=plotNumber(index);
    const name=lot<0?'Ô '+number:'Vườn ô '+(lot+1)+' · Luống '+number;
    return '<label class="quick-plot"><input type="checkbox" value="'+index+'" data-garden-plot="'+kind+'"><span><strong>'+name+'</strong><small>'+escape(nice(kind))+'</small></span><span data-garden-yield></span></label>';
  }).join('');
  const harvestOptions=action==='harvest'?'<fieldset class="quick-harvest-options"><legend>Cách thu hoạch</legend>'+
    '<label><input type="radio" name="source" value="all" data-harvest-mode checked>Thu hết</label>'+
    '<label><input type="radio" name="source" value="seed" data-harvest-mode>Giữ lại 1 giống/ô</label></fieldset>':'';
  modal(gardenHelperActions[action].label,'<form class="quick-garden-form" data-form="hireGardenHelper" data-operation="'+action+'">'+
    harvestOptions+'<div class="row"><strong>Chọn ô trong vườn</strong>'+btn('Chọn hết','data-quick-all','subtle')+'</div>'+
    '<div class="quick-garden-plots" role="group" aria-label="Các ô có thể chọn">'+rows+'</div>'+
    '<dl class="quick-garden-estimate" aria-live="polite" aria-atomic="true">'+
      '<div><dt>Số ô</dt><dd data-quick-count></dd></div><div><dt>Phí thuê</dt><dd data-quick-cost></dd></div>'+
      '<div><dt>Thời gian</dt><dd data-quick-duration></dd></div>'+
      '<div><dt>Kho cần / trống</dt><dd data-quick-space></dd><small data-quick-seeds></small></div></dl>'+
    '<p data-quick-warning role="status" hidden></p><p id="dialog-error" role="status"></p>'+
    '<button type="submit" class="btn primary" disabled>Xác nhận thuê '+gardenHelperName+'</button></form>');
  updateQuickGarden(dialog.querySelector('.quick-garden-form'));
}
function updateQuickGarden(form){
  const {me:farm,weather}=state, action=form.dataset.operation, now=currentTime();
  const keepSeeds=form.elements.source?.value==='seed';
  const available=new Map(gardenHelperTargets(farm,action,weather,now).map(target=>[target.index,target]));
  const selected=[];
  let stale=false, validCount=0, selectedCount=0;
  for(const input of form.querySelectorAll('[data-garden-plot]')){
    const target=available.get(Number(input.value)), valid=target?.kind===input.dataset.gardenPlot;
    if(valid)validCount++;
    if(input.checked){
      selectedCount++;
      if(valid)selected.push(target);
      else stale=true;
    }
    input.disabled=!valid&&!input.checked;
    const row=input.closest('label');
    row.toggleAttribute('data-unavailable',!valid);
    const reserve=valid&&keepSeeds&&target.space>0?1:0;
    row.querySelector('[data-garden-yield]').textContent=!valid?'Đã thay đổi':action==='harvest'?
      (target.space-reserve)+' món'+(reserve?' + 1 giống':''):'';
  }
  const estimate=gardenHelperPreview(farm,action,selected,keepSeeds);
  const {cost,space,seeds,free,blocked}=estimate;
  const warning=stale?'Có ô đã thay đổi. Bỏ chọn ô đó để tiếp tục.':blocked;
  const estimates={count:selectedCount,cost:stale?'—':cost+' xu',duration:stale?'—':duration(estimate.duration),
    space:stale?'—':space+' / '+free,seeds:keepSeeds&&!stale?'Giữ '+seeds+' giống':''};
  for(const [key,value] of Object.entries(estimates)){
    const output=form.querySelector('[data-quick-'+key+']');
    if(output.textContent!==String(value))output.textContent=value;
  }
  const message=form.querySelector('[data-quick-warning]');
  if(message.textContent!==warning)message.textContent=warning;
  message.hidden=!warning;
  const all=form.querySelector('[data-quick-all]');
  const clear=selected.length===Math.min(gardenHelperLimit,validCount)&&selectedCount>0;
  all.toggleAttribute('data-clear-selection',clear);
  all.textContent=clear?'Bỏ chọn hết':validCount>gardenHelperLimit?'Chọn '+gardenHelperLimit+' ô':'Chọn hết';
  all.disabled=!validCount&&!selectedCount;
  form.querySelector('button[type=submit]').disabled=busy||!selected.length||!!warning;
  return {ready:!!selected.length&&!warning,plots:selected.map(target=>target.index),space};
}
function renderRank(me){
  const ranking=state.wealth;
  const index=ranking.findIndex(row=>row.id===me.id);
  if(index<0)return '<h2>Xếp hạng tài sản</h2><p>Chưa có dữ liệu xếp hạng.</p>';
  const own=ranking[index], above=ranking[index-1], next=ranking[1];
  const goal=above?above.total+1:0;
  const lead=next?own.total-next.total:0;
  const race=above?'Thêm <strong>'+formatCoins(goal-own.total)+' xu</strong> tài sản để chắc chắn vượt hạng '+index+'.':
    !next?'Bạn đang chờ thêm vườn tham gia.':lead>0?'Hơn hạng 2 <strong>'+formatCoins(lead)+' xu</strong> tài sản.':
      'Đồng tổng tài sản với hạng 2.';
  const open=new Set(Array.from(document.querySelectorAll('#side .wealth-entry[open] summary'),summary=>summary.dataset.rankFarm));
  const rows=ranking.map((row,i)=>{
    const mine=row.id===own.id, rank=i+1;
    const id=escape(row.id);
    const title=rank===1?'Dẫn đầu':'Hạng '+rank;
    return '<li data-rank="'+rank+'"'+(mine?' class="is-me"':'')+'><details class="wealth-entry"'+(open.has(row.id)?' open':'')+'>'+
      '<summary data-rank-farm="'+id+'"><span class="rank-no" aria-label="'+title+'">'+rank+'</span>'+
      '<span class="wealth-farm"><strong>'+escape(row.name)+'</strong>'+
      (mine||rank===1?'<small>'+(mine?'Bạn':'Dẫn đầu')+'</small>':'')+'</span>'+
      '<span class="wealth-amount"><strong>'+formatCoins(row.total)+'</strong><small>xu</small></span>'+
      '<span class="wealth-arrow" aria-hidden="true">⌄</span></summary>'+
      '<dl class="wealth-breakdown">'+[['Tiền mặt',row.coins],['Kho & sạp',row.inventory],['Đất, nhà & vật nuôi',row.property]].map(([label,amount])=>
        '<div><dt>'+label+'</dt><dd>'+formatCoins(amount)+' xu</dd></div>').join('')+'</dl></details></li>';
  }).join('');
  const demoNote=session?'':'<div class="wealth-demo"><p>Bảng của làng chơi thử</p>'+btn('Vào làng','data-room','subtle')+'</div>';
  return '<section class="wealth-board" aria-label="Xếp hạng tài sản">'+
    '<header class="wealth-hero"><div class="wealth-hero-icon">'+icon('trophy')+'</div><div><h2>Xếp hạng tài sản</h2><p>'+ranking.length+' vườn · Tổng tài sản tính theo xu</p></div></header>'+
    '<section class="wealth-personal" aria-label="Thứ hạng của bạn"><div class="row"><strong>Hạng '+(index+1)+' / '+ranking.length+'</strong><b>'+formatCoins(own.total)+' xu</b></div><p>'+race+'</p>'+
      (above?valueBar(own.total,goal):'')+'</section>'+demoNote+
    '<ol class="wealth-list">'+rows+'</ol><p class="wealth-rules">Nếu bằng tổng tài sản, vườn có nhiều tiền mặt hơn xếp trước.</p></section>';
}
function renderProgress(farm){
  const {xp,rank,next}=farmProgress(farm);
  const earn={
    harvest:'Thu hoạch cây',collect:'Thu sản phẩm vật nuôi',aquaHarvest:'Thu hoạch thủy sản',
    upgrade:'Xây hoặc nâng cấp công trình',order:'Giao đơn lẻ',basket:'Giao đơn giỏ hoặc đơn mùa vụ',workshopOrder:'Giao đơn xưởng',journal:'Hoàn thành Sổ việc hôm nay',
  };
  return boardBar('Tiến độ',formatCoins(xp)+' XP')+'<div class="farm-list progress-panel">'+
    '<article class="xp-summary"><h3>'+rank.name+'</h3><p>XP tích lũy theo vườn để mở giống, vật nuôi và các cấp công trình. XP được giữ sau khi mở khóa. Xu và yêu cầu công trình được tính riêng.</p>'+
    (next?'<div class="row"><strong>Mốc tiếp theo</strong><span>'+next.xp+' XP</span></div><p>'+escape(next.label)+' · Còn '+formatCoins(next.xp-xp)+' XP</p>'+valueBar(xp,next.xp):
      '<p><strong>Đã đạt mọi mốc XP.</strong></p>')+'</article>'+
    '<details class="panel-fold" data-panel-fold="xp-milestones"><summary>Mốc mở khóa</summary><ul class="xp-list">'+xpUnlocks.map(entry=>
      '<li><div><strong>'+escape(entry.label)+'</strong>'+(entry.requires?'<small>'+escape(entry.requires)+'</small>':'')+
      (entry.reward?'<small>'+escape(entry.reward)+'</small>':'')+'</div><span data-ready="'+(xp>=entry.xp)+'">'+entry.xp+' XP'+(xp>=entry.xp?' ✓':'')+'</span></li>').join('')+'</ul></details>'+
    '<details class="panel-fold" data-panel-fold="xp-rewards"><summary>Cách nhận XP</summary><ul class="xp-list">'+Object.entries(xpRewards).map(([action,amount])=>'<li><span>'+earn[action]+'</span><strong>+'+amount+' XP</strong></li>').join('')+'</ul></details></div>';
}
function renderHud(farm,now){
  const health=wellnessAt(farm,now);
  $('#vital-hud').innerHTML=Object.entries(vitals).map(([key,info])=>{
    const points=Math.floor(health[key]), seconds=key==='stamina'?0:Math.max(0,(health.until[key]??0)-now);
    const resting=key==='stamina'&&health.restUntil>now;
    const hint=resting?'Đang nghỉ · '+duration(health.restUntil-now):seconds?'Dùng lại sau '+duration(seconds):{water:'Uống nước',food:'Ăn cơm nắm',stamina:'Nghỉ lấy sức'}[key];
    const value=resting?'<strong data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</strong>':'<strong>'+points+'</strong>';
    return '<button type="button" class="vital" data-vital="'+key+'" data-low="'+(points<25&&!resting)+'" aria-label="'+info.label+' '+points+'/100. '+hint+'" title="'+hint+'"><span class="vital-icon">'+icon(info.icon)+'</span><span class="vital-text"><span>'+info.label+'</span>'+value+'<i><em style="width:'+Math.max(0,points)+'%"></em></i></span></button>';
  }).join('');
  const priority=tasks[0];
  $('#task-hud').innerHTML='<button type="button" class="task-summary" data-panel="tasks" aria-label="Việc cần làm · '+(priority?tasks.length+' việc':'Mọi việc đang ổn')+'" aria-pressed="'+(panel==='tasks')+'"><span class="task-mark" data-pending="'+Boolean(priority)+'">'+(priority?tasks.length:'✓')+'</span><span><strong>Việc cần làm</strong><small>'+(priority?priority.title+' · '+priority.label:'Mọi việc đang ổn')+'</small></span><span class="task-arrow" aria-hidden="true">›</span></button>';
}
function showRecovery(key){
  const info=vitals[key], now=currentTime(), health=wellnessAt(state.me,now);
  const meals=Object.keys(recipes).filter(item=>recipes[item].gain?.[key]&&(state.me.inventory[item]??0)>0);
  const mealTime=health.until.meal??0;
  const options=meals.length?'<div class="recovery-meals"><h3>Đồ ăn và thức uống trong túi</h3>'+
    (mealTime>now?'<p>Dùng bữa tiếp theo sau <strong data-until="'+mealTime+'">'+duration(mealTime-now)+'</strong>.</p>':'')+
    meals.map(item=>'<div class="row itemrow"><div>'+itemLink(item)+'<p>'+recoveryText(recipes[item].gain)+' · Còn '+state.me.inventory[item]+'</p></div>'+
      btn('Dùng','data-meal="'+item+'" aria-label="Dùng '+escape(goods[item].name)+'"','',!!mealRequirement(state.me,item,health,now))+'</div>').join('')+'</div>':'';
  if(key==='stamina'){
    if(health.restUntil>now){
      modal('Đang nghỉ','<p>Hồi thể lực sau <strong data-rest-countdown data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</strong>.</p>');
      return;
    }
    const action=tab==='home'?btn('Nghỉ ngay','data-recover="rest"','primary',health.stamina>=100):
      btn('Về Nhà vườn','data-rest-home','primary',health.stamina>=100);
    modal('Thể lực','<p>Nghỉ '+restSeconds+' giây trong Nhà vườn để hồi tối đa '+info.gain+' điểm thể lực.</p>'+
      (health.stamina>=100?'<p>Thể lực đang đầy.</p>':'')+'<div class="actions">'+action+'</div>'+options+'<p id="dialog-error" role="status"></p>');
    return;
  }
  const remaining=Math.max(0,(health.until[key]??0)-now);
  const copy={water:'Uống nước để hồi tối đa 48 điểm. Mỗi lượt cách nhau 90 giây.',food:'Ăn cơm nắm để hồi tối đa 52 điểm. Mỗi lượt cách nhau 5 phút.'};
  const actions={water:'Uống nước',food:'Ăn cơm nắm'};
  modal(info.label,'<p>'+copy[key]+'</p>'+(remaining?'<p>Lượt hồi phục tiếp theo sau '+duration(remaining)+'.</p>':'')+
    '<div class="actions">'+btn(actions[key],'data-recover="'+info.action+'"','primary',remaining>0||health[key]>=99)+'</div>'+options+'<p id="dialog-error" role="status"></p>');
}
function openTask(index){
  const task=tasks[index];
  if(!task)return;
  const arrival=selector=>landscape.matches?()=>reveal(selector):()=>{};
  if(landscape.matches)setPanelOpen(false);
  if(task.kind==='plot'){
    tab='field';neighborId=null;selected=task.index;plotGroup=gardenFor(selected);panel='area';render();
    if(!world.approach('plot',selected,arrival('#tools'))&&landscape.matches)reveal('#tools');
  } else if(task.kind==='pond'){
    tab='field';neighborId=null;pondTab=task.index;panel='ponds';render();
    if(!world.approach('pond',pondTab,arrival('#farm-panel'))&&landscape.matches)reveal('#farm-panel');
  } else {
    tab=task.lot===undefined?'coop':'field';neighborId=null;
    if(task.lot!==undefined)selectedLot=task.lot;
    panel=task.lot===undefined?'area':'land';render();
    const details=`[data-pen="${task.index}"]`;
    if(!world.approach('animal',task.index,arrival(details))||!landscape.matches)reveal(details);
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
      return '<li data-ready="'+(count>=qty)+'"><span>'+itemLink(item,line(item,qty))+'</span><small>Kho '+count+'/'+qty+'</small></li>';
    }).join('');
    const ready=order.items.every(({item,qty})=>(farm.inventory[item]??0)>=qty);
    return '<div class="order-ticket" data-category="'+(order.category??'regular')+'" data-ready="'+ready+'"><div class="row"><h3>'+
      (order.title??goods[order.items[0].item].name)+'</h3><span class="badge">'+(ready?'Đủ hàng':order.category==='workshop'?'Đơn xưởng':order.category==='variety'?'Đơn mùa vụ':order.category==='aquatic'?'Đơn thủy sản':order.title?'Đơn giỏ':'Thiếu hàng')+'</span></div>'+
      '<ul aria-label="Hàng cần giao">'+requirements+'</ul><div class="row order-footer"><small>'+order.reward+' xu · +'+order.xp+' XP</small>'+
      act('Giao hàng','order','',order.id,'primary',!ready)+'</div></div>';
  }).join('');
  const forecasts=state.nextOrders.map(order=>'<li>'+(order.title?'<strong>'+order.title+'</strong><br>':'')+
    order.items.map(({item,qty})=>line(item,qty)).join(' · ')+'</li>').join('');
  return marketBanner('Đơn hàng của làng','Người giao đủ hàng đầu tiên nhận thưởng.')+
    '<div class="row market-cycle"><strong>Còn '+state.orders.length+'/'+(state.orderCount??3)+' đơn</strong><span class="badge" data-clock="day">'+duration(state.dayEnds-now)+'</span></div>'+
    (orders?'<div class="order-list order-grid">'+orders+'</div>':'<p class="village-empty">Hôm nay đã giao hết đơn.</p>')+
    '<div class="order-preview">'+btn(showTomorrow?'Ẩn đơn ngày mai':'Xem trước đơn ngày mai','data-order-preview aria-expanded="'+showTomorrow+'"','subtle')+
    (showTomorrow?'<ul>'+forecasts+'</ul>':'')+'</div>';
}
const formatCoins=value=>value.toLocaleString('vi-VN');
function renderVillageDrive(farm,now){
  const drive=state.villageDrive;
  if(!drive)return '';
  const {title,items,mine,minimum,rewardXp,completed,endsAt,contributors,previous}=drive;
  const status=completed?'Đã hoàn thành':endsAt<=now?'Đã hết hạn':'Còn <span data-until="'+endsAt+'">'+duration(endsAt-now)+'</span>';
  const rows=items.map(({item,required,delivered})=>{
    const count=farm.inventory[item]??0;
    const ready=delivered>=required;
    return '<li><div class="row">'+itemLink(item)+'<strong>'+delivered+' / '+required+'</strong></div>'+
      valueBar(delivered,required)+'<div class="row village-drive-stock"><small>Trong kho '+count+'</small>'+
      (completed||ready?'':btn('Góp','data-village-goods="'+item+'" aria-label="Góp '+escape(goods[item].name)+'"','primary',!count||endsAt<=now))+'</div></li>';
  }).join('');
  const personal=mine.paid?'Đã nhận '+formatCoins(mine.coins)+' xu và '+rewardXp+' XP'+(mine.decorVoucher?' cùng 1 phiếu trang trí.':'.'):
    completed?'Đợt này thưởng cho vườn góp từ '+minimum+' món.':
    mine.quantity<minimum?'Góp từ '+minimum+' món để nhận thưởng khi làng hoàn thành.':
    'Dự kiến nhận '+formatCoins(mine.coins)+' xu, '+rewardXp+' XP và 1 phiếu trang trí khi làng hoàn thành.';
  const rank=contributors.length?'<details class="panel-fold" data-panel-fold="village-drive-rank"><summary>Bảng đóng góp</summary><ol>'+
    contributors.map(({name,quantity})=>'<li>'+escape(name)+' · '+quantity+' món</li>').join('')+'</ol></details>':'';
  const last=previous?'<p class="village-drive-last"><strong>Đợt trước · '+escape(previous.title)+'</strong> · '+(previous.completed?'Hoàn thành':'Hết hạn')+
    (previous.top?' · Góp nhiều nhất: '+escape(previous.top.name)+' ('+previous.top.quantity+' món)':'')+'</p>':'';
  return '<section class="village-drive" aria-label="Đơn góp hàng của làng"><div class="row"><h2>Đơn góp hàng</h2><span class="badge">'+status+'</span></div>'+
    '<h3>'+escape(title)+'</h3><ul class="village-drive-items">'+rows+'</ul>'+
    '<p><strong>Bạn đã góp '+mine.quantity+' món.</strong> '+personal+'</p>'+
    (mine.decorVoucher?'<div class="actions">'+btn('Trang trí vườn','data-garden-decor aria-haspopup="dialog"','subtle')+'</div>':'')+rank+last+'</section>';
}
function showVillageGoods(item){
  const drive=state.villageDrive;
  if(!drive||drive.completed||drive.endsAt<=currentTime())return;
  const line=drive.items.find(entry=>entry.item===item);
  if(!line)return;
  const maximum=Math.min(line.required-line.delivered,state.me.inventory[item]??0);
  if(maximum<1)return;
  modal('Góp '+goods[item].name.toLowerCase(),'<p>Bạn có thể góp tối đa '+maximum+' món. Hàng đã góp sẽ được trừ khỏi kho và không hoàn lại khi hết hạn.</p>'+
    '<form data-form="villageGoods" data-item="'+item+'" data-index="'+drive.id+'"><label>Số lượng góp<input name="qty" type="number" min="1" max="'+maximum+'" value="1" required></label>'+
    '<button class="btn primary">Xác nhận góp</button></form><p id="dialog-error" role="status"></p>');
}
function renderVillageMembers(farm){
  const members=[farm,...state.neighbors];
  const rows=members.map(member=>{
    const owner=member.id===state.villageOwnerId, mine=member.id===farm.id;
    const role=owner?(mine?'Chủ làng · Bạn':'Chủ làng'):mine?'Bạn':'';
    const remove=owner||mine?'':btn('Mời ra','data-remove-member="'+member.id+'" aria-label="Mời '+escape(member.name)+' ra khỏi làng"','subtle');
    return '<article class="row"><div class="village-member-name"><h3>'+escape(member.name)+'</h3>'+
      (role?'<p>'+role+'</p>':'')+'</div>'+remove+'</article>';
  }).join('');
  return '<div class="row board-bar"><h2>Thành viên</h2><span class="badge">'+members.length+' vườn</span></div>'+
    '<div class="farm-list">'+rows+'</div>';
}
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
function renderStock(farm){
  const tabs='<div class="stock-tabs" role="group" aria-label="Nhóm vật phẩm trong kho">'+Object.entries(stockTabs).map(([key,label])=>
    btn(label,'data-stock-tab="'+key+'" aria-pressed="'+(stockTab===key)+'" aria-controls="stock-items"',stockTab===key?'primary':'subtle')
  ).join('')+'</div>';
  const keys=stockItems[stockTab].filter(key=>stockTab!=='produce'||(farm.inventory[key]??0)>0);
  const cards=keys.map(item=>{
    const {name,icon:picture}=goods[item];
    const locked=Boolean(stockLock(farm,item));
    return '<button type="button" class="stock-card" data-stock-item data-item-info="'+item+'" aria-haspopup="dialog">'+
      '<span class="stock-icon" aria-hidden="true">'+(aquaIllustration(item)||picture)+'</span><span class="stock-name">'+escape(name)+'</span>'+
      '<span class="stock-quantity">× '+(farm.inventory[item]??0)+'</span>'+
      '<span class="stock-status" data-locked="'+locked+'">'+(locked?'Đang khóa':'Đã mở')+'</span></button>';
  }).join('');
  return '<div class="row stock-heading"><div><h2>Kho &amp; túi</h2><p>'+stock(farm)+' / '+capacity(farm)+' chỗ kho</p></div>'+
    btn('Nâng cấp kho','data-panel="buildings"','subtle')+'</div>'+tabs+
    '<div id="stock-items" class="stock-grid card-grid">'+(cards||'<p>Chưa có nông sản.</p>')+'</div>';
}
function renderPanel(farm,now) {
  if(panel==='tasks')return renderTasks(farm,now);
  if(panel==='progress')return renderProgress(farm);
  if(panel==='rank')return renderRank(farm);
  if(panel==='land')return renderLand(farm,now);
  if(panel==='ponds')return renderPonds(farm,now);
  if(panel==='orders')return renderVillageDrive(farm,now)+renderOrders(farm,now);
  if(panel==='villageLevel')return renderVillage(farm);
  if(panel==='members')return renderVillageMembers(farm);
  if(panel==='stock')return renderStock(farm);
  if(panel==='buildings') return '<div class="row"><h2>Công trình</h2>'+btn(farm.xp+' XP','data-panel="progress" aria-label="Xem tiến độ XP"','subtle')+'</div>'+'<div class="upgrade-list card-grid">'+Object.keys(buildings).map(key=>upgrade(farm,key)).join('')+'</div>'+
    ((farm.workshop??0)>0?'<div class="actions">'+btn('Vào Xưởng máy','data-workshop-go','primary')+'</div>':'')+
    '<details class="base-decor"'+(baseDecorOpen?' open':'')+'><summary>Hàng rào công trình chính</summary>'+[-1,-2,...(farm.coop?[-4]:[])].map((id,i)=>'<h3>'+['Ruộng chính','Ao nuôi chính','Chuồng chính'][i]+'</h3>'+decorOptions(farm,id)).join('')+'</details>'+
    '<div class="actions">'+act(farm.shieldUntil>now?'Đóng cổng · '+duration(farm.shieldUntil-now):'Đóng cổng '+gateMinutes(farm)+' phút · 12 xu','shield','','','subtle',farm.coins<12||farm.shieldUntil>now)+'</div>';
  return '<h2>Nhật ký</h2>'+farm.log.slice(0,5).map(entry=>'<div class="row itemrow"><p>'+escape(entry.message)+'</p></div>').join('');
}
function showWeather(){
  const {weather,forecast,next}=state;
  modal('Thời tiết','<div class="row"><strong>'+weather.name+'</strong><span class="weather-icon">'+weather.icon+'</span></div><p>'+weather.note+'</p>'+
    '<div class="weather-next row"><p>Dự báo sau <strong data-clock="weather">'+duration(next-currentTime())+'</strong></p><strong>'+forecast.icon+' '+forecast.name+'</strong></div><p>'+forecast.note+'</p>');
}
const focusSelector='[data-plot],[data-action],[data-shop],[data-sell],[data-list],[data-room],[data-visit],[data-return],[data-tab],[data-village-page],[data-stock-tab],[data-panel],[data-weather],[data-market-pane],[data-pond-tab],[data-pond-go],[data-aqua-stock],[data-land-tab],[data-land-go],[data-crop-group],[data-open-garden],[data-open-pond],[data-visit-pond],[data-vital],[data-task],[data-recover],[data-remove-member],[data-home-exit],[data-village-fund],[data-village-goods],[data-seed-crop],[data-order-preview],[data-market-search],[data-supply-group],[data-sell-all],[data-item-info],[data-workshop-go],[data-workshop-tab],[data-crop-growth],[data-rank-farm],[data-manage-animal],[data-sell-animal],[data-quick-garden],[data-garden-decor]';
function focusKey(element) {
  if(element?.matches('[data-panel-fold]>summary'))return 'fold='+element.parentElement.dataset.panelFold;
  if(!element?.matches(focusSelector)) return '';
  return Object.entries(element.dataset).map(([key,value])=>key+'='+value).join('|')+
    ('itemInfo' in element.dataset?(element.getAttribute('aria-label')??''):'');
}
function areaButtons(farm) {
  return Object.entries(tabs).filter(([key])=>key!=='workshop'||(farm.workshop??0)>0).map(([key,[,name]])=>
    '<button type="button" data-tab="'+key+'" class="'+(tab===key?'active':'')+'"'+(tab===key?' aria-current="page"':'')+'>'+icon(areaIcons[key])+name+'</button>').join('');
}
function render(arrival) {
  if(!state||composingMarketSearch) return;
  const focused=document.activeElement;
  const focus=focusKey(focused);
  const searchSelection=focused.matches('[data-market-search]')?[focused.selectionStart,focused.selectionEnd,focused.selectionDirection]:null;
  const priorDecor=$('.base-decor');
  if(priorDecor)baseDecorOpen=priorDecor.open;
  const panelScroll=panelBody.scrollTop;
  const folded=new Map(Array.from(panelBody.querySelectorAll('details[data-panel-fold]'),el=>[el.dataset.panelFold,el.open]));
  const farm=state.me, now=currentTime();
  const workshopUnlocked=(farm.workshop??0)>0;
  const canManage=!!session&&state.canManageMembers;
  if(panel==='members'&&!canManage)panel='villageLevel';
  if(tab==='workshop'&&!workshopUnlocked){tab='field';panel='area';}
  if(!farm.plotIndexes.includes(selected)){selected=0;plotGroup=-1;}
  lastPanelTime=now;
  tasks=farmTasks(state,now);
  renderHud(farm,now);
  const [,title,description]=tabs[tab];
  const selectedNeighbor=tab==='neighbors'?state.neighbors.find(n=>n.id===neighborId):undefined;
  if(!selectedNeighbor)neighborId=null;
  $('#nav').innerHTML=areaButtons(farm);
  $('#coin').textContent=formatCoins(farm.coins)+' xu';
  $('#room span').textContent=session?'Làng '+session.code:'Vào làng';
  $('#sub-title').textContent=session?farm.name+' · '+state.village.name:'Vườn chơi thử';
  $('#title').textContent=selectedNeighbor?selectedNeighbor.name:title;
  $('#world-day').title='Ngày mới sau '+duration(state.dayEnds-now);
  $('#subtitle').textContent=description;
  $('#date').textContent='Ngày '+(state.day+1);
  villagePage=Math.min(villagePage,Math.max(0,Math.ceil((state.neighbors.length+1)/6)-1));
  world.sync(selectedNeighbor?'visit':tab,state,{neighbor:selectedNeighbor,selection:selected,page:villagePage,arrival,tasks});
  $('#world-weather').innerHTML=tab==='home'||tab==='workshop'?'':'<button class="world-weather" type="button" data-weather aria-label="Xem dự báo: '+state.weather.name+'">'+icon('weather')+'<span class="weather-name">'+state.weather.name+'</span><span class="landscape-only weather-symbol" aria-hidden="true">'+state.weather.icon+'</span></button>';
  $('#board').innerHTML={
    home:()=>renderHome(farm,now), workshop:()=>renderWorkshop(farm), field:()=>renderField(farm), lake:()=>renderLake(farm,now), coop:()=>renderCoop(farm,now), market:()=>renderMarket(farm), neighbors:()=>renderNeighbors(farm,now)
  }[tab]();
  $('#tools').innerHTML=tab==='field'?renderCropTools(farm,now):'';
  const panelNav=$('#panel-nav');
  panelNav.className='panel-tabs';
  const groups=canManage?{...tabGroups,village:[...tabGroups.village,'members']}:tabGroups;
  const group=Object.values(groups).find(keys=>keys.includes(panel))??groups.main;
  panelNav.innerHTML='<div class="panel-shortcuts">'+Object.keys(groups).map(key=>{
    const active=groups[key]===group;
    return '<button data-group="'+key+'" data-panel="'+groups[key][0]+'"'+(active?' class="active"':'')+'>'+({main:'Tổng quan',farm:'Nông trại',village:'Làng'})[key]+'</button>';
  }).join('')+'</div><div class="panel-subtabs" data-count="'+group.length+'">'+group.map(key=>{
    const [glyph,label]={...panels,...extraPanels}[key];
    return '<button data-panel="'+key+'" class="'+(key===panel?'active':'')+'" aria-pressed="'+(key===panel)+'">'+icon(key==='area'?areaIcons[tab]:glyph)+label+'</button>';
  }).join('')+'</div>';
  $('#board').hidden=panel!=='area';
  $('#tools').hidden=panel!=='area'||tab!=='field';
  const side=$('#side');
  side.hidden=panel==='area';
  const sideContent=panel==='area'?'':renderPanel(farm,now);
  if(panel!=='stock'||renderedStock!==sideContent){
    hideStockTooltip();
    side.innerHTML=sideContent;
  }
  renderedStock=panel==='stock'?sideContent:'';
  const section=panel==='area'?{market:marketPane,workshop:workshopTab,field:plotGroup,neighbors:villagePage}[tab]:
    {land:selectedLot,ponds:pondTab,stock:stockTab}[panel];
  const panelContext=JSON.stringify([tab,neighborId,panel,section]);
  const samePanel=panelBody.dataset.context===panelContext;
  if(samePanel)panelBody.querySelectorAll('details[data-panel-fold]').forEach(el=>{
    if(folded.has(el.dataset.panelFold))el.open=folded.get(el.dataset.panelFold);
  });
  panelBody.scrollTop=samePanel?panelScroll:0;
  panelBody.dataset.context=panelContext;
  $('#world').dataset.area=tab;
  sceneChat.sessionChanged();
  const quickGardenForm=dialog.open&&dialog.querySelector('.quick-garden-form');
  if(quickGardenForm&&!busy)updateQuickGarden(quickGardenForm);
  if(focus&&!dialog.open){
    const control=Array.from(document.querySelectorAll(focusSelector+', [data-panel-fold]>summary')).find(el=>focusKey(el)===focus);
    control?.focus({preventScroll:true});
    if(control&&searchSelection)control.setSelectionRange(...searchSelection);
  }
}
function goTo(area,arrival) {
  if(landscape.matches)setPanelOpen(false);
  tab=area; neighborId=null; panel='area'; render(arrival);
}
function guideHome(forRest=false){
  if(dialog.open)dialog.close();
  if(tab==='home'){showRecovery('stamina');return;}
  const from={coop:[433,198],market:[234,34],lake:[679,402],neighbors:[234,251]}[tab];
  if(tab!=='field')goTo('field',from);
  const started=world.approach('house',undefined,()=>{
    goTo('home');
    if(forRest)showRecovery('stamina');
  });
  if(started)reveal('#world');
  else showToast('Hãy đi theo lối về phía ngôi nhà ở góc trên bên trái.',true);
}
function visit(id) {
  if(landscape.matches)setPanelOpen(false);
  neighborId=id;visitPond=0;panel='area';render();
}
function setPanelOpen(open){
  const wasOpen=layout.hasAttribute('data-panel-open');
  if(open===wasOpen)return;
  const restoreFocus=!open&&farmPanel.contains(document.activeElement);
  if(open)sceneChat.close(false);
  layout.toggleAttribute('data-panel-open',open);
  panelToggle.setAttribute('aria-expanded',String(open));
  if(restoreFocus)panelToggle.focus({preventScroll:true});
}
function reveal(selector) {
  const destination=$(selector);
  if(!destination)return;
  if(landscape.matches){
    if(selector==='#world'){setPanelOpen(false);return;}
    if(farmPanel.contains(destination)){
      setPanelOpen(true);
      if(destination===farmPanel)return;
    }
  }
  if(panelBody.contains(destination)){
    if(!landscape.matches&&matchMedia('(max-width: 760px)').matches){
      farmPanel.scrollIntoView({block:'nearest',behavior:'instant'});
    }
    const target=destination.getBoundingClientRect(), viewport=panelBody.getBoundingClientRect();
    if(target.top<viewport.top||target.height>viewport.height)panelBody.scrollTop+=target.top-viewport.top;
    else if(target.bottom>viewport.bottom)panelBody.scrollTop+=target.bottom-viewport.bottom;
    return;
  }
  destination.scrollIntoView({block:'nearest',behavior:'instant'});
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
    panel='area';render();reveal('.control-panel');
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
    panel='area';marketPane=section;render();reveal('.control-panel');
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
  hideStockTooltip();
  dialog.innerHTML='<div class="row"><h2>'+title+'</h2>'+btn('✕','data-close aria-label="Đóng"','subtle')+'</div>'+html;
  if(!dialog.open) dialog.showModal();
}
function showMobileMenu(){
  if(!state)return;
  const roomLabel=$('#room span').textContent;
  const fullscreen=document.fullscreenEnabled&&(document.fullscreenElement?document.exitFullscreen:document.documentElement.requestFullscreen);
  modal('Khu vực','<nav class="mobile-area-list" aria-label="Di chuyển tới khu vực">'+areaButtons(state.me)+'</nav>'+
    '<div class="mobile-options">'+btn(icon('users')+escape(roomLabel),'data-room')+btn(icon('users')+'Nhân vật','data-avatar-menu')+
    btn(icon('music')+'Nhạc nền','data-music-menu')+btn(icon('help')+'Hướng dẫn','data-info')+
    (fullscreen?btn(document.fullscreenElement?'Thoát toàn màn hình':'Toàn màn hình','data-fullscreen'): '')+'</div>');
}
function showMusic(){
  modal('Nhạc nền','<p>Vườn sớm</p><label class="music-volume">Âm lượng <output for="farm-volume">'+music.volume+'%</output>'+
    '<input id="farm-volume" type="range" min="0" max="100" step="1" value="'+music.volume+'" data-music-volume></label>'+
    '<div class="actions">'+btn('Tắt tiếng','data-music-mute aria-pressed="'+music.muted+'"',music.muted?'primary':'subtle')+'</div>');
}
function avatarOptions(current){
  return '<fieldset class="avatar-options"><legend>Nhân vật</legend>'+Object.entries(avatars).map(([key,label])=>
    '<label><input type="radio" name="avatar" value="'+key+'"'+(avatarOf(current)===key?' checked':'')+'><span class="avatar-portrait" data-avatar="'+key+'" aria-hidden="true"></span><strong>'+label+'</strong></label>').join('')+'</fieldset>';
}
function showAvatar(){
  if(!state)return;
  modal('Chọn nhân vật','<form data-form="avatar">'+avatarOptions(state.me.avatar)+
    '<button class="btn primary">Lưu nhân vật</button></form><p id="dialog-error" role="status"></p>');
}
function guestSession(){
  return session&&!session.account&&session.token!==accountSession?.token?session:null;
}
function showAccountModal(mode='login') {
  const room=mode==='register'?guestSession()?.code:null;
  const formMode=mode==='register'?'register':'login';
  const title=formMode==='register'?'Tạo tài khoản':'Đăng nhập';
  modal(title,'<div class="actions">'+btn('Đăng nhập','data-account-mode="login"',''+(formMode==='login'?'primary':'subtle'))+btn('Tạo tài khoản','data-account-mode="register"',''+(formMode==='register'?'primary':'subtle'))+'</div><form data-form="account" data-account-mode="'+formMode+'"><label>Tên tài khoản<input name="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_-]+" placeholder="Ví dụ: demo_user"></label><label>Mật khẩu<input type="password" name="password" required minlength="6" maxlength="128" placeholder="Ít nhất 6 ký tự"></label>'+(room?'<p class="small">Làng hiện tại sẽ được gắn vào tài khoản '+room+'</p>':'')+'<button class="btn primary">'+(formMode==='register'?'Tạo tài khoản':'Đăng nhập')+'</button></form><p id="dialog-error" role="status"></p>');
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
  const accountControls=accountSession?'<p>Tài khoản: <strong>'+escape(accountSession.username)+'</strong></p><div class="actions">'+
    btn('Đăng nhập khác','data-account','primary')+btn('Đăng xuất','data-account-logout','subtle')+'</div>':
    '<div class="actions">'+btn('Đăng nhập tài khoản','data-account','primary')+'</div>';
  modal('Vào làng','<p>Nhập tên vườn và mã của bạn bè. Nếu để trống mã, bạn sẽ tạo làng mới.</p>'+accountControls+'<form data-form="join"><label>Tên vườn<input name="name" required minlength="2" maxlength="24" placeholder="Ví dụ: Vườn của Đổi"></label><label>Mã làng<input name="code" value="'+inviteCode+'" maxlength="8" placeholder="Để trống nếu tạo làng"></label>'+avatarOptions(state?.me.avatar)+'<div class="actions"><button class="btn primary">Bắt đầu chơi online</button>'+btn('Chơi nhanh','data-quick-avatar','subtle')+'</div></form>'+rejoin+'<p id="dialog-error" role="status"></p>');
}
function backToDemo(){
  session=null;
  revision=-1;
  selected=0;plotGroup=-1;pondTab=0;selectedLot=0;
  tab='field';neighborId=null;villagePage=0;panel='area';
  store.write(sessionKey,null);
  setPanelOpen(false);
  updateDemo();
  render();
}
function showShop(key,sell) {
  const farm=state.me, info=goods[key], price=sell?info.sell:info.buy;
  const count=sell?farm.inventory[key]??0:Math.min(Math.floor(farm.coins/price),supplyLimit-(farm.inventory[key]??0));
  if(count<1) return showToast('Hiện chưa thể mua hoặc bán mặt hàng này.',true);
  const quickBuy=sell?'':'<div class="buy-steps" role="group" aria-label="Tăng nhanh số lượng">'+[5,10,20,30].map(step=>
    btn('+'+step,'data-buy-step="'+step+'"','subtle',count===1)).join('')+'</div><p class="buy-total"><span>Tổng tiền</span><output for="buy-quantity">'+formatCoins(price)+' xu</output></p>';
  modal((sell?'Bán ':'Mua ')+info.name.toLowerCase(),itemDescription(key)+'<p>'+price+' xu/món · '+(sell?'Trong kho ':'Mua tối đa ')+count+'</p><form data-form="'+(sell?'sell':'buy')+'" data-item="'+key+'"><label>Số lượng<input'+(sell?'':' id="buy-quantity"')+' type="number" name="qty" min="1" max="'+count+'" required value="1"></label>'+quickBuy+'<button type="submit" class="btn primary">'+(sell?'Bán cho chợ':'Mua vật tư')+'</button></form><p id="dialog-error" role="status"></p>');
}
function updateBuyTotal(input){
  const form=input.form;
  const qty=input.valueAsNumber;
  form.querySelector('output').value=input.validity.valid?formatCoins(qty*goods[form.dataset.item].buy)+' xu':'—';
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
  modal('Cách chơi','<ol><li>Dùng WASD, giữ nút mũi tên hoặc chạm bản đồ để di chuyển. Đến gần một địa điểm rồi nhấn E hoặc chọn Tương tác. Khi xoay ngang, bấm Khu vực để chuyển cảnh hoặc Công cụ để mở bảng quản lý.</li><li>Chạm Thể lực → Về Nhà vườn. Khi vào nhà, chọn Nghỉ ngay. Sau 60 giây, bạn hồi tối đa 75 điểm thể lực.</li><li>Ô bỏ trống 8 giờ cần cuốc trước khi gieo. Khi cây chín, chọn Thu và giữ 1 giống hoặc đổi nông sản trong Kho thành giống. Bảng đơn ở Chợ làng trao thưởng cho vườn giao đủ hàng đầu tiên. Mục Cấp làng có tiến độ và quỹ xây công trình.</li><li>Tưới nước để cây lớn nhanh hơn. Mưa tưới tự nhiên, nhưng sau khi tạnh sâu vẫn dễ xuất hiện trong 20 phút. Trị sâu sớm để giữ sản lượng. Nắng nóng làm cây và vật nuôi lớn chậm hơn.</li><li>Xây chuồng, đón vật nuôi rồi cho ăn. Vật nuôi lớn lên trước khi cho sản phẩm. Chọn Quản lý để chuyển chuồng hoặc bán sống. Vật nuôi lấy sản phẩm cho ít hơn sau 3 và 7 ngày thực. Khi lợn hoặc thỏ sẵn sàng, chọn Xuất chuồng để thu thịt.</li><li>Ở Hàng xóm, mỗi vườn cho lấy một món mỗi ngày. Nâng túi để tăng số món từ nhiều vườn.</li><li>Mỗi ngày trong game kéo dài 8 giờ. Mở Ao nuôi để thả cá, tôm và cua chung ao. Sức chứa tùy diện tích. Đến Hồ làng để câu miễn phí. Câu ao hàng xóm dùng chung lượt lấy đồ với vườn và kho.</li></ol>');
}
async function perform(input) {
  if(busy)return false;
  const block=workBlock(wellnessAt(state.me,currentTime()),workCost(input.action,state.weather.id),currentTime());
  if(block){showToast(block,true);return false;}
  busy=true;
  const credentials=session;
  const previousFarm=state.me, actionTab=tab, actionNeighbor=neighborId;
  let updateAfter=false;
  try {
    let message;
    if(input.action==='rest'&&actionTab!=='home')throw new GameError('Hãy vào Nhà vườn để bắt đầu nghỉ.');
    if(credentials) {
      if(input.action==='rest')await api('scene',{area:actionTab,pose:world.position()},credentials);
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
      message=apply(updated,'demo',input,unixNow(),Math.random(),{area:actionTab});
      demo=updated;
      store.write(demoKey,demo);
      updateDemo();
    }
    render();
    if(!['removeMember','villageGoods','hireGardenHelper'].includes(input.action)&&tab===actionTab&&neighborId===actionNeighbor){
      const reel=input.action==='reel';
      const caught=reel&&[previousFarm.fishing.cast?.item,'minnow','tilapia','goldenCarp'].some(key=>key&&(state.me.inventory[key]??0)>(previousFarm.inventory[key]??0));
      world.particle(input,{cast:reel?previousFarm.fishing.cast:state.me.fishing.cast,caught});
    }
    showToast(message);
    return true;
  } catch(error) {
    updateAfter=error.status===401||['order','villageGoods','villageFund','sell','till','plant','hireGardenHelper','moveAnimal','sellAnimal','placeGardenDecor','stowGardenDecor','removeMember'].includes(input.action);
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
      selected=0; plotGroup=-1; pondTab=0; selectedLot=0;
      tab='field'; neighborId=null; villagePage=0; panel='area';
      setPanelOpen(false);
      if(dialog.open)dialog.close();
      updateDemo();
      render();
      if(!initial)showToast(error.message,true);
    }
    if(initial) {
      if(!state) {
        $('#board').innerHTML='<p class="loading">Mất kết nối. Đang thử lại…</p>';
      } else render();
      showToast(error.message,true);
    }
  }
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&stockTooltipCard){
    event.preventDefault();
    hideStockTooltip();
    return;
  }
  if(event.key==='Escape'&&landscape.matches&&!dialog.open&&layout.hasAttribute('data-panel-open')){
    event.preventDefault();
    setPanelOpen(false);
  }
});
panelBody.addEventListener('pointerover',event=>{
  const card=event.target.closest('[data-stock-item]');
  if(event.pointerType==='mouse'&&card)showStockTooltip(card);
});
panelBody.addEventListener('pointerout',event=>{
  if(event.pointerType==='mouse'&&stockTooltipCard?.contains(event.target)&&
    !stockTooltipCard.contains(event.relatedTarget)&&!stockTooltip.contains(event.relatedTarget))hideStockTooltip();
});
stockTooltip.addEventListener('pointerleave',event=>{
  if(!stockTooltipCard?.contains(event.relatedTarget))hideStockTooltip();
});
panelBody.addEventListener('focusin',event=>{
  if(event.target.matches('[data-stock-item]:focus-visible'))showStockTooltip(event.target);
});
panelBody.addEventListener('focusout',event=>{
  if(event.target===stockTooltipCard&&!stockTooltip.matches(':hover')&&!stockTooltipCard.matches(':hover'))hideStockTooltip();
});
window.addEventListener('scroll',hideStockTooltip,{capture:true,passive:true});
window.addEventListener('resize',hideStockTooltip);
document.addEventListener('click',async e=>{
  const el=e.target.closest('button');
  if(!el) return;
  const d=el.dataset;
  if('tab' in d) {
    if(!state) return;
    if(el.closest('.mobile-area-list'))dialog.close();
    if(d.tab==='home')guideHome();
    else {if(d.tab==='market'&&el.closest('.journal'))marketPane='sales';goTo(d.tab);}
  } else if('mobileMenu' in d)showMobileMenu();
  else if('fullscreen' in d){
    try {
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      dialog.close();
    } catch {
      dialog.close();
      showToast('Trình duyệt chưa thể chuyển chế độ toàn màn hình.',true);
    }
  } else if('panelToggle' in d)setPanelOpen(!layout.hasAttribute('data-panel-open'));
  else if('panelClose' in d)setPanelOpen(false);
  else if('chatToggle' in d&&landscape.matches)setPanelOpen(false);
  else if('workshopTab' in d&&Object.hasOwn(workshopTabs,d.workshopTab)){workshopTab=d.workshopTab;render();}
  else if('workshopGo' in d){goTo('workshop');reveal('#world');}
  else if('homeExit' in d){
    world.approach('exit',undefined,()=>interactWithWorld({type:'exit',...maps.home.exits[0]}));
    reveal('#world');
  } else if('vital' in d) showRecovery(d.vital);
  else if('restHome' in d)guideHome(true);
  else if('recover' in d){
    const success=await perform({action:d.recover});
    if(success)dialog.close();
  }
  else if('quickGarden' in d)showQuickGarden(d.quickGarden);
  else if('quickAll' in d){
    if(busy)return;
    const form=el.form, clear=el.hasAttribute('data-clear-selection');
    let chosen=0;
    for(const input of form.querySelectorAll('[data-garden-plot]')){
      input.checked=!clear&&!input.closest('label').hasAttribute('data-unavailable')&&chosen<gardenHelperLimit;
      if(input.checked)chosen++;
    }
    form.querySelector('#dialog-error').textContent='';
    updateQuickGarden(form);
  }
  else if('task' in d)openTask(Number(d.task));
  else if('panel' in d) {
    const outsidePanel=!farmPanel.contains(el);
    panel=d.panel;render();
    if(outsidePanel)reveal('.control-panel');
    else if(landscape.matches)setPanelOpen(true);
  }
  else if('gardenDecor' in d)showGardenDecor(dialog.contains(el));
  else if('gardenDecorItem' in d)showGardenDecorPlacement(d.gardenDecorItem);
  else if('stowGardenDecor' in d){
    gardenDecorScroll=dialog.querySelector('.garden-decor-list')?.scrollTop??0;
    if(await perform({action:'stowGardenDecor',item:d.stowGardenDecor})&&dialog.open)showGardenDecor(true);
  }
  else if('landTab' in d) {selectedLot=Number(d.landTab);render();}
  else if('landGo' in d) {
    if(tab!=='field'){tab='field';neighborId=null;render();}
    world.approach('land',Number(d.landGo),()=>{});
    reveal('#world');
  }
  else if('openGarden' in d){
    plotGroup=Number(d.openGarden);selected=plotOffset+plotGroup*3;
    goTo('field');
    if(landscape.matches)reveal('#tools');
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
  else if('manageAnimal' in d)showAnimalManagement(d.manageAnimal);
  else if('sellAnimal' in d)showAnimalManagement(d.sellAnimal,true);
  else if('orderPreview' in d){showTomorrow=!showTomorrow;render();}
  else if('marketPane' in d) { marketPane=d.marketPane; render(); }
  else if('supplyGroup' in d) { supplyGroup=d.supplyGroup; render(); }
  else if('seedCrop' in d) showSeedCrop(d.seedCrop);
  else if('villageFund' in d) showVillageFund();
  else if('villageGoods' in d) showVillageGoods(d.villageGoods);
  else if('weather' in d) showWeather();
  else if('room' in d) showRoom();
  else if('avatarMenu' in d) showAvatar();
  else if('musicMenu' in d)showMusic();
  else if('musicMute' in d){
    music.toggleMute();
    el.setAttribute('aria-pressed',String(music.muted));
    el.classList.toggle('primary',music.muted);
    el.classList.toggle('subtle',!music.muted);
  }
  else if('quickAvatar' in d){
    const avatar=el.form.elements.avatar.value;
    if(avatar===state.me.avatar||await perform({action:'avatar',item:avatar}))dialog.close();
  }
  else if('account' in d) showAccountModal('login');
  else if('accountMode' in d) showAccountModal(d.accountMode==='register'?'register':'login');
  else if('accountLogout' in d) {
    const credentials=accountSession;
    accountSession=null;
    store.write(accountKey,null);
    const previous=store.read(previousKey);
    if(previous&&(previous.account||previous.token===credentials?.token))store.write(previousKey,null);
    dialog.close();
    if(session&&(session.account||session.token===credentials?.token))backToDemo();
    try {
      if(credentials)await apiAccount('logout',{},credentials);
      showToast('Đã đăng xuất tài khoản.');
    } catch {
      showToast('Đã thoát trên thiết bị này. Chưa thể kết thúc phiên trên máy chủ.',true);
    }
  }
  else if('info' in d) help();
  else if('plot' in d) {
    selected=Number(d.plot); render();
    reveal('#tools');
  } else if('close' in d) dialog.close();
  else if('visit' in d) visit(d.visit);
  else if('removeMember' in d){
    const neighbor=state.neighbors.find(entry=>entry.id===d.removeMember);
    if(panel!=='members'||!session||!state.canManageMembers||!neighbor||neighbor.id===state.villageOwnerId)return;
    modal('Mời thành viên ra khỏi làng','<p>Vườn, tài sản và các sạp của <strong>'+escape(neighbor.name)+'</strong> sẽ bị xóa khỏi làng sau khi xác nhận.</p>'+
      '<div class="actions">'+btn('Hủy','data-close','subtle')+
      btn('Mời ra','data-confirm-remove-member="'+neighbor.id+'"','danger')+'</div><p id="dialog-error" role="status"></p>');
  } else if('confirmRemoveMember' in d){
    if(panel==='members'&&session&&state.canManageMembers&&await perform({action:'removeMember',target:d.confirmRemoveMember}))dialog.close();
  }
  else if('return' in d) goTo('neighbors');
  else if('villagePage' in d) { villagePage=Number(d.villagePage); render(); }
  else if('stockTab' in d&&Object.hasOwn(stockTabs,d.stockTab)){stockTab=d.stockTab;render();}
  else if('shop' in d) showShop(d.shop,false);
  else if('itemInfo' in d)showItem(d.itemInfo,'stockItem' in d);
  else if('cropGrowth' in d)showCropGrowth(Number(d.cropGrowth));
  else if('meal' in d){
    if(await perform({action:'consume',item:d.meal}))dialog.close();
  }
  else if('buyStep' in d){
    const input=el.form.elements.qty;
    const qty=Math.max(0,Math.trunc(input.valueAsNumber||0));
    input.value=Math.min(Number(input.max),qty+Number(d.buyStep));
    updateBuyTotal(input);
  }
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
    backToDemo();
  } else if('action' in d) {
    const input={action:d.action,item:d.item||''};
    if(d.index) input.index=Number(d.index);
    if(d.qty) input.qty=Number(d.qty);
    if(d.target)input.target=d.target;
    if(d.source)input.source=d.source;
    const fishing=input.action==='cast'||input.action==='reel';
    if(fishing||input.action==='till'||input.action==='plant'){
      if(busy)return;
      const cast=state.me.fishing.cast;
      const type=fishing?((input.source??cast?.source)==='public'?'public-fishing':'neighbor-fishing'):'plot';
      const started=world.approach(type,input.index??(fishing?cast?.index:undefined),()=>{void perform(input);});
      if(!started)showToast(fishing?'Hãy đến cầu câu để dùng cần.':'Chưa tìm được đường tới ô đất.',true);
      else if(landscape.matches||matchMedia('(max-width: 860px)').matches)reveal('#world');
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
dialog.addEventListener('input',event=>{
  const slider=event.target;
  if(!slider.matches('[data-music-volume]'))return;
  music.setVolume(slider.valueAsNumber);
  dialog.querySelector('output[for="farm-volume"]').value=music.volume+'%';
});
dialog.addEventListener('input',event=>{
  if(event.target.id==='buy-quantity')updateBuyTotal(event.target);
});
dialog.addEventListener('change',event=>{
  if(!event.target.matches('[data-garden-plot],[data-harvest-mode]'))return;
  const form=event.target.form;
  form.querySelector('#dialog-error').textContent='';
  updateQuickGarden(form);
});
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
      const result=await api('join',values,accountSession);
      session={code:result.code,token:result.token,account:!!result.account};
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
      const guest=method==='register'?guestSession():null;
      const result=await apiAccount(method,{username:values.username,password:values.password,roomCode:guest?.code??''},guest);
      const previous=store.read(previousKey);
      if(previous&&(previous.account||previous.token===accountSession?.token))store.write(previousKey,null);
      const switchingAccount=session&&(session.account||session.token===accountSession?.token);
      accountSession={token:result.token,username:result.account.username,accountId:result.account.id};
      store.write(accountKey,accountSession);
      const resumeRoom=result.rooms[0]?.roomCode;
      if(resumeRoom) {
        session={code:resumeRoom,token:result.token,account:true};
        store.write(sessionKey,session);
        revision=-1;
      } else if(switchingAccount)backToDemo();
      dialog.close();
      render();
      showToast(method==='register'?'Đã tạo tài khoản thành công.':'Đăng nhập tài khoản thành công.');
      busy=false;
      if(resumeRoom)await refresh(true);
    } catch(error) {
      const inline=$('#dialog-error');
      if(inline) inline.textContent=error.message;
    } finally { busy=false; }
  } else if(mode==='hireGardenHelper'){
    const {ready,plots,space}=updateQuickGarden(form);
    if(!ready)return;
    button.disabled=true;
    const operation=form.dataset.operation;
    const request={action:'hireGardenHelper',item:operation,plots,expectedSpace:space};
    if(operation==='harvest')request.source=values.source;
    const worked=await perform(request);
    if(worked&&form.isConnected){
      dialog.close();
      const trigger=panelBody.querySelector('[data-quick-garden="'+operation+'"]:enabled')??$('#task-hud button');
      trigger?.focus({preventScroll:true});
    } else if(form.isConnected)updateQuickGarden(form);
    return;
  } else if(mode==='placeGardenDecor'){
    const input={action:mode,item:form.dataset.item,target:values.target};
    if(values.source)input.source=values.source;
    if(await perform(input)&&form.isConnected&&dialog.open)showGardenDecor(true);
  } else if(mode==='avatar'){
    if(await perform({action:'avatar',item:values.avatar}))dialog.close();
  } else if(mode==='moveAnimal'||mode==='sellAnimal'){
    const input={action:mode,target:form.dataset.target};
    if(mode==='moveAnimal')input.index=Number(values.destination);
    if(await perform(input))dialog.close();
  } else if(mode==='villageGoods'){
    if(await perform({action:mode,item:form.dataset.item,index:Number(form.dataset.index),qty:Number(values.qty)}))dialog.close();
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
  const justReached=time=>time>lastPanelTime&&time<=now;
  const fishingBoundary=[cast?.ready,cast?cast.expires+1:undefined,state.me.fishing.nextAt].some(justReached);
  const visitedJob=neighborId&&state.neighbors.find(neighbor=>neighbor.id===neighborId)?.gardenHelperJob;
  const helperBoundary=[state.me.gardenHelperJob,visitedJob].some(job=>job?.steps.some(step=>justReached(step.doneAt)));
  if(!busy&&(helperBoundary||fishingBoundary&&(tab==='lake'||neighborId))){
    if(session)void refresh();
    else {updateDemo();render();}
  }
  const restEnds=state.me.wellness.restUntil;
  if(!busy&&restEnds>lastPanelTime&&restEnds<=now)render();
  const restCountdown=dialog.querySelector('[data-rest-countdown]');
  if(dialog.open&&restCountdown&&Number(restCountdown.dataset.until)<=now)showRecovery('stamina');
  document.querySelectorAll('[data-until]').forEach(node=>node.textContent=duration(Number(node.dataset.until)-now));
  document.querySelectorAll('[data-clock]').forEach(node=>node.textContent=duration((node.dataset.clock==='day'?state.dayEnds:state.next)-now));
},1000);
setInterval(()=>{ if(!document.hidden) refresh(); },4000);
window.addEventListener('focus',()=>refresh());
