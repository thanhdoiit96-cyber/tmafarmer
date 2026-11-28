import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../docs/assets/social-lake-pilot-kit-v1.html',import.meta.url),'utf8');
const options=Object.fromEntries([...html.matchAll(/<select name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)].map(([,key,body])=>[key,[...body.matchAll(/<option(?: value="([^"]*)")?[^>]*>([^<]*)<\/option>/g)].map(([,value,text])=>value??text)]));
options.consent.push('Giữ tắt','Đã tự bật','Đã bật rồi tắt');
const code=html.slice(html.indexOf('const recordKeys='),html.indexOf('function render()'));
const context={allowed:k=>options[k]};vm.createContext(context);vm.runInContext(code,context);
const row={build:'test-build',environment:'test',date:'2026-11-27',participant:'P01',day:1,device:'Desktop',scenario:'Giúp tưới',outcome:'Tự làm được',annoyance:'',consent:'Chưa hỏi / chưa xem',note:'Đã tự tìm được nút.'};
const packet=(version,records)=>({version,build:'test-build',environment:'test',date:'2026-11-27',checks:Array(version===3?6:4).fill(true),records});
const modern={...row,participant:'P40',cohort:'Trang trí',experience:'Người mới',severity:'Nghiêm trọng',suggestion:'Cần kiểm tra lại.'};
test('pilot V1/V2 records migrate without inventing cohorts, experience or checked P4 preparation',()=>{
  for(const version of [1,2]){const p=context.normalizePacket(packet(version,[row]));assert.equal(p.version,3);assert.equal(p.records[0].cohort,'Chưa phân nhóm');assert.equal(p.records[0].severity,'Chưa đánh giá');assert.ok(p.checks.every(v=>v===false));assert.equal(p.records[0].note,row.note);}
  assert.equal(context.normalizePacket(packet(1,[{...row,build:''}])).records[0].build,'');
});
test('P4 validation accepts participant 40 but rejects malformed dates, records and excessive files',()=>{
  assert.equal(context.validRecord(modern),true);
  for(const changed of [{participant:'P41'},{date:'2026-02-30'},{day:0},{build:' '},{cohort:'invented'},{note:''}])assert.equal(context.validRecord({...modern,...changed}),false);
  assert.throws(()=>context.normalizePacket(packet(3,[modern,{...modern,date:'2026-02-30'}])));
  assert.throws(()=>context.normalizePacket(packet(3,Array(501).fill(modern))));
  assert.throws(()=>context.normalizePacket(packet(2,[{...row,participant:'P40'}])));
  const p=context.normalizePacket(packet(3,[{...modern,token:'private'}]));assert.equal(p.records[0].token,undefined);
});
test('report counts repeated observations separately from distinct participants and does not infer retention',()=>{
  const rows=[modern,{...modern,severity:'Nhẹ',outcome:'Gặp lỗi'},{...modern,participant:'P02',cohort:'Chơi solo'}];
  const t=context.pilotSummary(rows);assert.equal(t.observations,3);assert.equal(t.participants,2);assert.equal(t.serious,2);assert.equal(t.groups.find(g=>g.name==='Trang trí').people,1);assert.equal(t.scenarios[0].errors,1);assert.equal(t.D7,undefined);
});
