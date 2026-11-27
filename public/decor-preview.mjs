import {gardenDecorAt,gardenDecorItems,gardenDecorSpots} from './land.mjs';

// A display-only copy. Never pass this farm to an action or persist it.
export function decorPreviewFarm(farm,item,target){
  if(!Object.hasOwn(gardenDecorItems,item)||!Object.hasOwn(gardenDecorSpots,target)||gardenDecorAt(farm,target))return null;
  return {...farm,gardenDecor:{...farm.gardenDecor,[item]:target}};
}
