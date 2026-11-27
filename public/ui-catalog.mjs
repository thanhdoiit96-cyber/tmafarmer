export function catalogPage(entries,page=0,size=6){
  const count=Math.max(1,Math.ceil(entries.length/size));
  const index=Math.min(count-1,Math.max(0,Number.isInteger(page)?page:0));
  return {index,count,total:entries.length,entries:entries.slice(index*size,(index+1)*size)};
}
