export const pixelViewport={width:640,height:384};
export const pixelCharacter={
  source:'/pixel/characters-v2-hd.png',cellWidth:48,cellHeight:64,columns:16,
  directions:{down:0,up:1,left:2,right:3},
  states:{idle:{first:0,frames:4,fps:3},walk:{first:4,frames:6},work:{first:10,frames:6,fps:8}},
};
export const pixelSlice={
  source:'/pixel/vertical-slice-v2-hd.png',house:{x:0,y:0,w:192,h:160},
  crops:{wheat:{x:192,y:0},carrot:{x:192,y:48},corn:{x:192,y:96},cell:48,stages:4},
  chicken:{x:384,y:0,cell:48,columns:8,stride:7.5,
    states:{
      idle:{first:0,frames:4,fps:3,sourceFacing:-1,feet:42},
      walk:{first:4,frames:4,sourceFacing:-1,feet:41},
      peck:{first:8,frames:4,fps:6,sourceFacing:1,feet:39},
    },
  },
};
