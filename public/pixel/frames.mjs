import moreCrops from './crop-stages-frames.mjs';

export const pixelViewport={width:640,height:384};
export const pixelCharacter={
  source:'/pixel/characters-v2-hd.png',cellWidth:48,cellHeight:64,columns:16,
  directions:{down:0,up:1,left:2,right:3},
  states:{
    idle:{first:0,frames:4,fps:3},
    walk:{source:'/pixel/farmer-walk-v4.png',first:0,frames:4},
    work:{first:10,frames:6,fps:8},
  },
};
export const maleCharacter={
  poses:'/pixel/farmer-male-poses.png',
  walk:'/pixel/farmer-male-walk.png',
  workFrames:[1,2,2,3,3,1],
};
export const pixelSlice={
  source:'/pixel/vertical-slice-v2-hd.png',house:{x:0,y:0,w:192,h:160},
  crops:{
    cell:48,x:192,
    // Bounds of the main silhouette in each cell, including its soil base.
    wheat:{y:0,bounds:[[13,25,42,41],[10,20,39,41],[6,12,38,41],[1,8,40,41]]},
    carrot:{y:48,bounds:[[13,18,42,34],[9,12,39,34],[5,9,39,34],[2,3,41,34]]},
    corn:{y:96,bounds:[[13,13,42,37],[9,4,40,37],[5,0,37,37],[0,0,41,37]]},
  },
  chicken:{x:384,y:0,cell:48,columns:8,stride:7.5,
    states:{
      idle:{first:0,frames:4,fps:3,sourceFacing:-1,feet:42},
      walk:{first:4,frames:4,sourceFacing:-1,feet:41},
      peck:{first:8,frames:4,fps:6,sourceFacing:1,feet:39},
    },
  },
};
export const cropStagesAtlas={source:'/pixel/crop-stages-v2.png',cell:48,crops:moreCrops};
export const progressionCropAtlas={
  source:'/pixel/progression-crops-v1.png',cell:48,
  crops:{
    coffee:{row:0,bounds:[[17,25,31,40],[13,16,36,40],[9,9,40,40],[7,8,42,40]]},
    lotus:{row:1,bounds:[[20,27,28,40],[9,22,40,40],[19,8,29,40],[17,14,31,40]]},
    dragonfruit:{row:2,bounds:[[21,28,27,40],[17,21,31,40],[18,11,35,40],[17,12,37,40]]},
    blackRice:{row:3,bounds:[[18,27,29,40],[13,14,34,40],[9,7,39,40],[9,7,39,40]]},
  },
};
export const livestockAtlas={
  source:'/pixel/livestock-v2.png',columns:4,
  frames:{goat:[0,0,56,48],sheep:[56,0,56,48],goose:[112,0,56,48],rabbit:[168,0,56,48]},
  legStart:{goat:.73,sheep:.8,goose:.88},
};
export const progressionLivestockAtlas={
  source:'/pixel/progression-livestock-v1.png',columns:2,
  frames:{quail:[0,0,56,48],buffalo:[56,0,56,48]},
  legStart:{quail:.79,buffalo:.79},
};
export const aquaticAtlas={
  source:'/pixel/aquatic-v1.png',
  frames:{snakehead:[0,0,56,40],catfish:[56,0,56,40],fieldCrab:[112,0,56,40]},
};
export const gardenDecorAtlas={
  source:'/pixel/garden-decor-v2.png',width:728,cellWidth:56,cellHeight:48,
  frames:{
    flowerPot:[0,0,56,48],bambooLamp:[56,0,56,48],gardenSign:[112,0,56,48],
    bambooBench:[168,0,56,48],wheelbarrow:[224,0,56,48],waterJar:[280,0,56,48],
    scarecrow:[336,0,56,48],lotusPot:[392,0,56,48],windChime:[448,0,56,48],
    flowerArch:[504,0,56,48],wickerBasket:[560,0,56,48],hayBale:[616,0,56,48],birdFeeder:[672,0,56,48],
  },
  lampCenter:{x:35,y:24},
  signLabel:{x:28,y:24,maxWidth:42},
};
export const gardenHelperAtlas={
  source:'/pixel/garden-helper-v1.png',cellWidth:48,cellHeight:64,feet:60,
  directions:{down:0,up:1,left:2,right:3},
  walk:[0,1,0,2],work:3,
};
