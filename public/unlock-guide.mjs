import {animals,buildings,buildingUpgrade,crops,cropRequirement,animalRequirement,upgradeRequirement,goods,recipes} from './game.mjs';
import {aquatic,aquaRequirement} from './aqua.mjs';

// Display thresholds come from the same definitions used by the engine.
// Authorization remains exclusively in the existing action handlers.
export function unlockGuide(farm,type,key,lot){
  const rows=[];
  const add=(label,have,need,route)=>{if(need>0)rows.push({label,have,need,ready:have>=need,route});};
  const xp=n=>add('XP nông trại',farm.xp??0,n,{kind:'progress'});
  const building=(key,n)=>add(buildings[key].name+' · cấp',farm[key]??buildings[key].base??1,n,{kind:'building',key});
  let name,reason='',max=false;
  if(type==='crop'&&Object.hasOwn(crops,key)){
    name=goods[key].name;const d=crops[key];xp(d.xp);building('workshop',d.workshop);reason=cropRequirement(farm,key);
  }else if(type==='animal'&&Object.hasOwn(animals,key)){
    const d=animals[key];name=d.name;xp(d.xp);
    add('Chuồng · cấp',lot===undefined?farm.coop:Math.max(1,farm.coop),d.level,{kind:'building',key:'coop'});
    reason=animalRequirement(farm,key,lot);
  }else if(type==='aqua'&&Object.hasOwn(aquatic,key)){
    const d=aquatic[key];name=d.name;xp(d.xp);building('barn',d.barn);reason=aquaRequirement(farm,key);
  }else if(type==='building'&&Object.hasOwn(buildings,key)){
    const d=buildingUpgrade(farm,key);max=d.level>=d.max;name=buildings[key].name+(max?'':' · cấp '+(d.level+1));
    if(!max){xp(d.xp);add('Xu',farm.coins??0,d.cost,{kind:'market'});
      for(const [item,n] of Object.entries(d.materials))add(goods[item].name,farm.inventory[item]??0,n,{kind:'item',key:item});
      reason=upgradeRequirement(farm,key)||(farm.coins<d.cost?'Chưa đủ xu.':'');}
  }else if(type==='recipe'&&Object.hasOwn(recipes,key)){
    name=goods[key].name;building('workshop',recipes[key].level);reason=(farm.workshop??0)<recipes[key].level?'Chưa đủ cấp Xưởng máy.':'';
  }else return null;
  return {type,key,name,rows,reason,max,unlocked:!reason};
}

export function itemUnlockTarget(item){
  if(Object.hasOwn(crops,item))return {type:'crop',key:item};
  const crop=Object.keys(crops).find(k=>crops[k].seed===item);
  if(crop)return {type:'crop',key:crop};
  const aqua=Object.keys(aquatic).find(k=>k===item||aquatic[k].seed===item);
  if(aqua)return {type:'aqua',key:aqua};
  return Object.hasOwn(recipes,item)?{type:'recipe',key:item}:null;
}
