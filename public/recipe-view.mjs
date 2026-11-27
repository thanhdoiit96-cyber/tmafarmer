import {recipes,goods,craftRequirement,stock,capacity,supplyLimit} from './game.mjs';

export function recipeView(farm,item){
  const recipe=recipes[item],reason=craftRequirement(farm,item),locked=(farm.workshop??0)<recipe.level;
  let count=0;
  if(!reason){
    count=Math.min(...Object.entries(recipe.ingredients).map(([key,qty])=>Math.floor((farm.inventory[key]??0)/qty)));
    if(!goods[item].sell)count=Math.min(count,supplyLimit-(farm.inventory[item]??0));
    else{
      const net=1-Object.entries(recipe.ingredients).reduce((sum,[key,qty])=>sum+(goods[key].sell?qty:0),0);
      if(net>0)count=Math.min(count,Math.floor((capacity(farm)-stock(farm))/net));
    }
  }
  return {locked,reason,count:Math.max(0,count),owned:farm.inventory[item]??0,
    label:locked?'Xưởng cấp '+recipe.level:!reason?'Có thể làm':reason.startsWith('Chưa đủ')?'Thiếu nguyên liệu':'Hết chỗ'};
}
