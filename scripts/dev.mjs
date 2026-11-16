import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { Readable } from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import worker from '../server/worker.mjs';

const root=resolve('public');
mkdirSync('.local',{recursive:true});
const sqlite=new DatabaseSync(process.env.FARM_DB??'.local/farm.sqlite');
for(const file of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+file,'utf8'));
const DB={
  prepare(sql) {
    const statement=sqlite.prepare(sql);
    return {bind(...args){return {
      first: async()=>statement.get(...args),
      all: async()=>({results:statement.all(...args)}),
      run:async()=>({meta:statement.run(...args)}),
    };}};
  },
};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(incoming,outgoing)=>{
  try {
    const url=new URL(incoming.url,'http://localhost');
    if(url.pathname.startsWith('/api/')) {
      const options={method:incoming.method,headers:incoming.headers};
      if(!['GET','HEAD'].includes(incoming.method)) {
        options.body=Readable.toWeb(incoming);
        options.duplex='half';
      }
      const response=await worker.fetch(new Request(url,options),{DB});
      outgoing.writeHead(response.status,Object.fromEntries(response.headers));
      if(response.body) Readable.fromWeb(response.body).pipe(outgoing);
      else outgoing.end();
      return;
    }
    const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
    if(!file.startsWith(root+sep)||!mime[extname(file)]||!existsSync(file)) {
      outgoing.writeHead(404).end('Not found'); return;
    }
    outgoing.writeHead(200,{'content-type':mime[extname(file)]});
    createReadStream(file).pipe(outgoing);
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500).end('Server error');
  }
});
const portArgument=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArgument>=0?process.argv[portArgument+1]:process.argv.find(x=>x.startsWith('--port='))?.slice(7))||3000);
server.listen(port,'0.0.0.0',()=>console.log('Local: http://localhost:'+server.address().port));
