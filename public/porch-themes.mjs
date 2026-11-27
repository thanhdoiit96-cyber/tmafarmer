export const porchThemes={
  classic:{name:'Mẫu hiện tại'},
  north:{name:'Hiên Bắc Bộ',note:'Men lam, tre vàng và sen hồng'},
  central:{name:'Hiên miền Trung',note:'Gốm mộc, đèn lồng nhỏ và tre nâu'},
  south:{name:'Hiên Nam Bộ',note:'Đất nung, mây đan và lá sen'},
};
export const porchAtlas={source:'/pixel/lotus-porch-v1.png',width:224,height:144,cellWidth:56,cellHeight:48,ground:45};
export function porchFrame(item,theme='classic'){
  const row=['north','central','south'].indexOf(theme);
  const col=['lotusPot','bambooLamp','giftTable','porchOrnament'].indexOf(item);
  // The new table uses the northern master when the old style is selected.
  if(col<0||row<0&&item!=='giftTable')return null;
  return [col*56,Math.max(0,row)*48,56,48];
}
