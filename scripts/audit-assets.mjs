import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ageCharacterAtlases} from '../public/avatar-models.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),publicRoot=resolve(root,'public');
async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else result.push(p)}return result}
const all=await files(publicRoot),texts=await Promise.all(all.filter(p=>['.mjs','.js','.css','.html','.json'].includes(extname(p))).map(async p=>({path:p,text:await readFile(p,'utf8')})));
const live=new Set(Object.values(ageCharacterAtlases).flatMap(a=>[a.base,a.actions]));
const missing=[];
for(const {path,text} of texts){
 for(const match of text.matchAll(/["'(](\/(?!\/)[\w./-]+\.(?:png|webp|mp3|mjs|css|html))(?:\?[^"')\s]*)?["')]/g)){
  live.add(match[1]);if(!all.includes(resolve(publicRoot,'.'+match[1])))missing.push({from:relative(root,path),asset:match[1]});
 }
}
for(const url of live)if(!all.includes(resolve(publicRoot,'.'+url)))missing.push({from:'avatar-models.mjs or static reference',asset:url});
const pipeline=(await Promise.all((await files(resolve(root,'scripts'))).filter(p=>['.mjs','.py','.ps1'].includes(extname(p))).map(p=>readFile(p,'utf8')))).join('\n');
let total=0;const candidates=[],references=[];
for(const path of all.filter(p=>['.png','.webp','.mp3'].includes(extname(p)))){
 const bytes=(await stat(path)).size;total+=bytes;
 const url='/'+relative(publicRoot,path).replaceAll('\\','/');
 if(live.has(url))continue;
 // Dynamic URLs must be accounted for above; this is a conservative report,
 // never an automatic deletion list. Retain authoring inputs used by scripts.
 if(pipeline.includes(url)||pipeline.includes(url.slice(1)))references.push(url);
 else candidates.push({path:url,bytes});
}
console.log(JSON.stringify({publicAssetMiB:+(total/1048576).toFixed(2),missing,pipelineOnly:references,reviewUnused:candidates},null,2));
if(missing.length)process.exitCode=1;
