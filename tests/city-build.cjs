/* Validate the delivery contract, not the game's implementation. Run build:city first. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),site=path.join(root,'dist/city-site');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/city-build.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
assert(Buffer.byteLength(html)<32768,'web entry must remain below32KiB');
assert(!html.includes('data:image/'),'public HTML must not wait for embedded full-size art');
const sources=[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g)].map(m=>m[1]);
assert(sources.length>0,'entry must reference local scripts');
for(const relative of sources){
 assert(!/^(?:https?:)?\/\//.test(relative),'no external runtime dependency');
 const js=fs.readFileSync(path.join(site,relative),'utf8');
 assert(relative.includes(sha(js).slice(0,12)),'script cache key tracks content');
 assert(!js.includes('../assets/'),'asset paths are valid at the published root');
 for(const match of js.matchAll(/["'](assets\/[^"']+)["']/g))assert(fs.existsSync(path.join(site,match[1])),'all referenced assets are emitted');
}
for(const record of manifest.files){const data=fs.readFileSync(path.join(site,record.path));assert.equal(data.length,record.bytes);assert.equal(sha(data),record.sha256);}
const offline=fs.readFileSync(path.join(root,'dist/Shadowman-Cidade.html'));
assert.equal(sha(offline),manifest.offlineSha256);
assert(!/<script\b[^>]*src=/.test(offline.toString()),'offline has no script requests');
assert(offline.includes(Buffer.from('data:image/')),'offline includes its own art');
console.log('PASS web entry '+Buffer.byteLength(html)+'bytes; local hashed scripts/assets; manifest hashes; self-contained offline delivery');
