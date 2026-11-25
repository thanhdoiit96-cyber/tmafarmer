import {crops,goods,cropWeatherProfiles} from './game.mjs';
import {unlockGuide} from './unlock-guide.mjs';

export function seedCatalog(farm){
  return Object.entries(crops).map(([key,crop])=>{
    const unlock=unlockGuide(farm,'crop',key);
    return {key,name:goods[key].name,seed:crop.seed,count:farm.inventory[crop.seed]??0,
      time:crop.time,yield:crop.yield,quality:!!crop.quality,weather:cropWeatherProfiles[crop.weather],unlock};
  });
}
export function seedPickerPage(farm,group='open',page=0,size=3){
  const catalog=seedCatalog(farm),open=catalog.filter(s=>s.unlock.unlocked),locked=catalog.filter(s=>!s.unlock.unlocked);
  open.sort((a,b)=>Number(b.count>0)-Number(a.count>0)||a.time-b.time);
  locked.sort((a,b)=>(crops[a.key].workshop??0)-(crops[b.key].workshop??0)||(crops[a.key].xp??0)-(crops[b.key].xp??0)||a.time-b.time);
  const entries=group==='locked'?locked:open,pages=Math.max(1,Math.ceil(entries.length/size));
  const current=Math.max(0,Math.min(pages-1,Number.isInteger(page)?page:0));
  return {entries:entries.slice(current*size,(current+1)*size),page:current,pages,open:open.length,locked:locked.length};
}
