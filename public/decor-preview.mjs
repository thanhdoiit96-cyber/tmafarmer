import {gardenDecorAt,gardenDecorItems,gardenDecorSpots} from './land.mjs';
import {porchThemes} from './porch-themes.mjs';

// A display-only copy. Never pass this farm to an action or persist it.
export function decorPreviewFarm(farm,item,target,theme=farm.porchTheme??'classic'){
  if(!Object.hasOwn(porchThemes,theme))return null;
  if(!Object.hasOwn(gardenDecorItems,item)||!Object.hasOwn(gardenDecorSpots,target)||gardenDecorAt(farm,target))return null;
  return {...farm,porchTheme:theme,gardenDecor:{...farm.gardenDecor,[item]:target}};
}
