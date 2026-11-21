export const neighborPageSize=6;
export const neighborBounds={width:720,height:432};
export const neighborEntry=[360,30];
export const neighborCoopEntry=[690,345];
export const neighborReturn=[360,398];
export const neighborHall={x:360,y:180,w:90,h:90};
export const neighborLot={w:210,h:108};
export const neighborHouseTier=wealth=>wealth>20000?4:wealth>5000?3:wealth>1000?2:wealth>500?1:0;
export const neighborPosition=index=>({x:index%2?540:180,y:148+Math.floor(index/2)*110});
export function neighborHomes(snapshot){
  const farm=snapshot.me;
  const ownWealth=snapshot.wealth?.find(entry=>entry.id===farm.id)?.total??farm.coins;
  return [{...farm,wealth:ownWealth,mine:true},...(snapshot.neighbors??[]).filter(home=>home.id!==farm.id).map(home=>({...home,mine:false}))];
}
export function neighborPage(snapshot,page=0){
  const homes=neighborHomes(snapshot),count=Math.max(1,Math.ceil(homes.length/neighborPageSize));
  const index=Math.max(0,Math.min(count-1,Number.isFinite(page)?Math.trunc(page):0));
  return {index,count,total:homes.length,homes:homes.slice(index*neighborPageSize,(index+1)*neighborPageSize)};
}
// Fit names by rendered width, preserving Vietnamese combining marks and emoji.
export function fitGateName(name,measure,maxWidth){
  const value=String(name??'').normalize('NFC');
  if(measure(value)<=maxWidth)return value;
  const letters=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(value)].map(s=>s.segment):Array.from(value);
  while(letters.length&&measure(letters.join('')+'…')>maxWidth)letters.pop();
  return letters.join('')+'…';
}
