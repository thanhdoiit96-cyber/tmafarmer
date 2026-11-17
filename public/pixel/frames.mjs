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
export const pixelSlice={
  source:'/pixel/vertical-slice-v2-hd.png',house:{x:0,y:0,w:192,h:160},
  crops:{
    cell:48,
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
