// Read-only guard against accidentally publishing local/generated files.
import {execFileSync} from 'node:child_process';
import {readdir,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const json=process.argv.includes('--json');
let sourceList;
try{sourceList=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'});}
catch(error){console.error('Cannot enumerate Git source files ('+(error.code??'Git error')+'). Workspace audit was not performed.');process.exit(1);}
const paths=[...new Set(sourceList.split('\0').filter(Boolean))];
function issue(path){
  if(/(^|\/)(?:dist|node_modules|\.local|\.vercel|\.wrangler|__pycache__|\.pytest_cache)(?:\/|$)/.test(path))return 'Generated/local directory in source';
  if(/(^|\/)(?:\.DS_Store|Thumbs\.db|Desktop\.ini)$|\.(?:pyc|pyo|tmp|log|tsbuildinfo)$/i.test(path))return 'Temporary/cache file in source';
  if(/(^|\/)\.env(?:\..*)?$/.test(path)&&!path.endsWith('.env.example'))return 'Local environment file in source';
  if(!path.startsWith('test/fixtures/')&&/\.(?:sqlite3?|db)(?:-wal|-shm|-journal)?$/i.test(path))return 'Local database in source';
  // Art, plans, historical concepts and archives in docs are intentionally retained.
  if(!path.startsWith('docs/')&&/\.(?:zip|7z|bak)$/i.test(path))return 'Backup/archive outside design documentation';
  return null;
}
async function bytes(path){
  let entry;try{entry=await lstat(path);}catch(error){if(error.code==='ENOENT')return 0;throw error;}
  if(entry.isSymbolicLink())return 0;
  if(!entry.isDirectory())return entry.size;
  const entries=await readdir(path);
  return (await Promise.all(entries.map(name=>bytes(join(path,name))))).reduce((sum,n)=>sum+n,0);
}
const issues=paths.flatMap(path=>{const reason=issue(path);return reason?[{path,reason}]:[];});
const folders=await Promise.all((await readdir(root)).map(async name=>({name,bytes:await bytes(join(root,name))})));
let local=[];try{local=await readdir(join(root,'.local'),{withFileTypes:true});}catch(error){if(error.code!=='ENOENT')throw error;}
const browserProfiles=await Promise.all(local.filter(entry=>entry.isDirectory()&&/^edge-.*-qa$/.test(entry.name)).map(async entry=>({path:'.local/'+entry.name,bytes:await bytes(join(root,'.local',entry.name))})));
const report={
  sourceFiles:paths.length,issues,
  totalBytes:folders.reduce((sum,row)=>sum+row.bytes,0),
  protected:folders.filter(row=>['docs','.git'].includes(row.name)),
  generated:folders.filter(row=>['dist','node_modules','.vercel','.wrangler'].includes(row.name)),
  local:{bytes:folders.find(row=>row.name==='.local')?.bytes??0,browserProfiles},
  note:'Read only. No deletion, Git rewrite, database access or artwork changes. Ignored local files are not source violations. Browser profiles may still be in use.'
};
if(json)console.log(JSON.stringify(report,null,2));
else{
  const mib=n=>(n/1048576).toFixed(2)+' MiB';
  console.log('Source hygiene: '+(issues.length?'FAIL':'PASS')+' ('+paths.length+' files checked)');
  for(const row of issues)console.log('  '+row.path+': '+row.reason);
  console.log('Workspace: '+mib(report.totalBytes));
  for(const row of report.protected)console.log('Retained '+row.name+': '+mib(row.bytes));
  console.log('Local data/backups/cache: '+mib(report.local.bytes));
  for(const row of report.generated)console.log('Generated '+row.name+': '+mib(row.bytes)+' (not a violation when ignored)');
  for(const row of browserProfiles)console.log('Browser profile '+row.path+': '+mib(row.bytes)+'; close the browser before reviewing cleanup');
  console.log(report.note);
}
if(issues.length)process.exitCode=1;
