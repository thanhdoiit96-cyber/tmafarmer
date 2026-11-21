export const avatarDetails={
  female:{gender:'female',age:'young',name:'Cô gái',label:'Nữ · Thanh niên'},
  male:{gender:'male',age:'young',name:'Chàng trai',label:'Nam · Thanh niên'},
  'female-middle':{gender:'female',age:'middle',name:'Cô',label:'Nữ · Trung niên'},
  'male-middle':{gender:'male',age:'middle',name:'Chú',label:'Nam · Trung niên'},
  'female-elder':{gender:'female',age:'elder',name:'Bà',label:'Nữ · Cao tuổi'},
  'male-elder':{gender:'male',age:'elder',name:'Ông',label:'Nam · Cao tuổi'},
};
export const avatars=Object.fromEntries(Object.entries(avatarDetails).map(([key,value])=>[key,value.label]));
export const avatarOf=value=>Object.hasOwn(avatars,value)?value:'female';
export const avatarKey=(gender,age)=>avatarOf(age==='young'?gender:gender+'-'+age);
export const ageCharacterAtlases=Object.fromEntries(Object.keys(avatarDetails).filter(key=>key.includes('-')).map(key=>[key,{
  base:'/pixel/farmer-'+key+'-base-v1.png',actions:'/pixel/farmer-'+key+'-actions-v1.png',
  cellWidth:48,cellHeight:64,idle:0,walk:4,work:8,frames:4,
}]));
