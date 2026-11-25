import {readdir,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
async function bytes(path){
  const info=await lstat(path);
  if(info.isSymbolicLink())return 0;
  if(!info.isDirectory())return info.size;
  const entries=await readdir(path);
  return (await Promise.all(entries.map(name=>bytes(join(path,name))))).reduce((a,b)=>a+b,0);
}
const rows=await Promise.all((await readdir(root)).map(async name=>({name,bytes:await bytes(resolve(root,name))})));
rows.sort((a,b)=>b.bytes-a.bytes);
console.table(rows.filter(row=>row.bytes>=1048576).map(row=>({folder:row.name,MiB:+(row.bytes/1048576).toFixed(2)})));
console.log('Total MiB:',+(rows.reduce((sum,row)=>sum+row.bytes,0)/1048576).toFixed(2));
console.log('dist is reproducible build output. docs, .git, databases and backups are retained.');
