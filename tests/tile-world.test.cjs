const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('prototype/tile-world.js','utf8'),ctx);const L=ctx.window.CITY_LEVEL,atlas=JSON.parse(fs.readFileSync('assets/phase-01-atlas.json'));
assert.equal(L.rooms.length,8);assert.equal(L.T,48);const ids=new Set();
function supported(room,p){return room.terrain.some(t=>p.x>=t.x&&p.x<=t.x+t.w&&Math.abs(p.y-t.y)<.01)||(room.lift&&p.x>=room.lift.x&&p.x<=room.lift.x+room.lift.w&&(p.y===room.lift.low||p.y===room.lift.high));}
for(const room of L.rooms){
 assert.equal(room.width,3072);assert.equal(room.height,960);assert(room.width>L.W*2.5,'each room spans more than2.5viewports');assert(supported(room,room.spawn),'spawn on visible surface: '+room.id);
 for(const t of room.terrain){assert(!ids.has(t.id),'unique collider id');ids.add(t.id);assert(t.x>=0&&t.y>=0&&t.x+t.w<=room.width&&t.y+t.h<=room.height,'terrain bounds '+t.id);assert(['stone','wood','metal'].includes(t.tile),'visible tile for '+t.id);assert(t.kind==='surface'||t.kind==='step');if(t.kind==='step')assert.equal(t.h,12,'each stair uses a12px drawn riser');else assert.equal(t.y%48,0);}
 for(const l of room.ladders){assert(l.top<l.bottom);assert(supported(room,{x:l.x,y:l.top}),'ladder top support '+room.id);assert(supported(room,{x:l.x,y:l.bottom}),'ladder bottom support '+room.id);}
 for(const d of room.decor){assert(atlas[d.key],'known prop '+d.key);assert(d.layer==='back'||d.layer==='front');}
}
for(const d of L.connections){assert(supported(L.rooms[d.a],d.pa),'door A support '+d.id);assert(supported(L.rooms[d.b],d.pb),'door B support '+d.id);}
for(const [id,r]of Object.entries(L.rewards))assert(supported(L.rooms[id],r),'reward support '+id);
let seen=new Set([0]),owned=new Set(),open=new Set(),changed=true;while(changed){const before=[seen.size,owned.size,open.size].join();for(const id of seen){const r=L.rewards[id];if(r)owned.add(r.key);}for(const d of L.connections){if(d.shortcut&&seen.has(d.b))open.add(d.id);if(d.shortcut&&!open.has(d.id))continue;if(d.req==='final'&&(!owned.has('selo')||!owned.has('nevoa')))continue;if(d.req&&d.req!=='final'&&!owned.has(d.req))continue;if(seen.has(d.a))seen.add(d.b);if(seen.has(d.b))seen.add(d.a);}changed=before!==[seen.size,owned.size,open.size].join();}
assert.equal(seen.size,8,'all rooms logically reachable');assert.equal(owned.size,4);assert.equal(open.size,2);assert.equal(L.rooms.filter(r=>r.lift).length,1,'one moving lift, in factory');
console.log('PASS tile authoring:8rooms/9connections/4rewards; bounds, visual-tile tags, supports, ladder ends and gated graph');
