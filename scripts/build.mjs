import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await cp('server','dist/server',{recursive:true});
await cp('public/game.mjs','dist/server/game.mjs');
await cp('public/aqua.mjs','dist/server/aqua.mjs');
await cp('public/land.mjs','dist/server/land.mjs');
await cp('public/world-layout.mjs','dist/server/world-layout.mjs');
await cp('public/garden-helper.mjs','dist/server/garden-helper.mjs');
await cp('public/wellness.mjs','dist/server/wellness.mjs');
await cp('public/home-rules.mjs','dist/server/home-rules.mjs');
await cp('public/village.mjs','dist/server/village.mjs');
await writeFile('dist/server/engine.mjs',"export * from './game.mjs';\n");
await cp('public','dist/client',{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'};
const assets={};
async function collect(directory,prefix=''){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const relative=prefix+entry.name,path=directory+'/'+entry.name;
    if(entry.isDirectory()){await collect(path,relative+'/');continue;}
    const type=mime[extname(entry.name)];
    if(type)assets['/'+relative]=[type,(await readFile(path)).toString('base64')];
  }
}
await collect('public');
await writeFile('dist/server/assets.mjs','export default '+JSON.stringify(assets)+';\n');
await writeFile('dist/server/index.js',`import game from './worker.mjs';
import assets from './assets.mjs';
export default { fetch(request, env) {
  const {pathname}=new URL(request.url);
  if(pathname.startsWith('/api/')) return game.fetch(request,env);
  if(request.method!=='GET'&&request.method!=='HEAD') return new Response(null,{status:405});
  const entry=assets[pathname==='/'?'/index.html':pathname];
  if(!entry || !Array.isArray(entry)) return new Response('Not found',{status:404});
  const [type,encoded]=entry;
  const data=request.method==='HEAD'?null:Uint8Array.from(atob(encoded),ch=>ch.charCodeAt(0));
  return new Response(data,{headers:{'content-type':type,'cache-control':/\.(webp|png)$/.test(pathname)?'public, max-age=86400':'no-cache'}});
}};
`);
if(process.env.SITES_MANAGED_LINUX_CONTAINER==='1') {
  await mkdir('dist/.openai',{recursive:true});
  await cp('.openai/hosting.json','dist/.openai/hosting.json');
  await cp('drizzle','dist/.openai/drizzle',{recursive:true});
}
