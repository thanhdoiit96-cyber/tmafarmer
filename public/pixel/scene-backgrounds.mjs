// A subtle neutral tint reduces painted contrast without affecting actors.
// Source-over works on Safari too; this pass does not require Canvas filters.
export const sceneBackgroundTone={color:'#8d917b',opacity:.075};
export const sceneBackgroundAtlases={
  concept:{
    source:'/pixel/scene-backgrounds-concept-v1.png',
    frames:{
      home:[0,0,800,480],
      workshop:[816,0,800,480],
      village:[0,490,800,480],
      farm:[816,490,800,480],
    },
  },
  environments:{
    source:'/pixel/scene-backgrounds-environments-v1.png',
    frames:{
      market:[0,0,800,480],
      coop:[816,0,800,480],
      lake:[0,490,800,480],
      neighbor:[816,490,800,480],
    },
  },
  homestead:{source:'/pixel/scene-background-homestead-v2.png'},
  expansion:{source:'/pixel/expansion-terrain-v7.png'},
  coop:{source:'/pixel/scene-background-coop-v8.png'},
  neighbors:{source:'/pixel/scene-background-neighbors-v1.png'},
};

export const sceneBackgrounds={
  home:{atlas:'concept',frame:'home'},
  workshop:{atlas:'concept',frame:'workshop'},
  neighbors:{atlas:'neighbors'},
  field:{atlas:'homestead'},
  visit:{atlas:'homestead'},
  market:{atlas:'environments',frame:'market'},
  coop:{atlas:'coop'},
  lake:{atlas:'environments',frame:'lake'},
};

const backgroundedActors={
  field:new Set(['house','barn','well','tree']),
  visit:new Set(['house','barn','well','tree']),
  market:new Set(['market','well','tree']),
  coop:new Set(['coop','foundation','silo','tree']),
  lake:new Set(['dock','tree']),
  neighbors:new Set(['tree']),
};

export const hasSceneBackground=scene=>Object.hasOwn(sceneBackgrounds,scene);
export const backgroundOwnsActor=(scene,type)=>backgroundedActors[scene]?.has(type)??false;
