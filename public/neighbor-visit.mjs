export const visitPageSize=6;
export function visitPage(rows,page=0){
  const count=Math.max(1,Math.ceil(rows.length/visitPageSize));
  const index=Math.max(0,Math.min(Number.isSafeInteger(page)?page:0,count-1));
  return {index,count,rows:rows.slice(index*visitPageSize,(index+1)*visitPageSize)};
}
export function visitPlotPane(neighbor,index){
  for(const [key,pane]of [['garden','take'],['helpPlots','help'],['prankPlots','prank']]){
    const position=(neighbor?.[key]??[]).findIndex(row=>row.index===index);
    if(position>=0)return {pane,source:'garden',page:Math.floor(position/visitPageSize)};
  }
  return {pane:'take',source:'garden',page:0};
}
