// Inventory uses its own available panel area, not the adoption dialog breakpoint.
export function stockLayout({width,height,chrome=90,rowHeight=64}){
  const columns=width>=300?3:2;
  const rows=Math.max(1,Math.min(4,Math.floor((height-chrome+4)/(rowHeight+4))));
  return {columns,rows,size:columns*rows};
}
