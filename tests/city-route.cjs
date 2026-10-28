const {chromium}=require('playwright');
const base=process.env.BASE_URL||'http://localhost:3000/prototype/index.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{const p=await b.newPage({viewport:{width:1200,height:950}});await p.goto(base+(base.includes('?')?'&':'?')+'test=1');await p.waitForFunction(()=>!document.querySelector('#play').disabled);await p.waitForFunction(()=>CITY_TEST.loaded.size===3);await p.click('#play');const result=await p.evaluate(()=>{const t=CITY_TEST;let ticks=0,falls=0;function step(n=1){for(let i=0;i<n;i++){t.enemies.forEach(e=>e.hp=0);let hp=t.p.hp;t.step();if(t.p.hp<hp)falls++;ticks++;}}function walk(x,jump=false){let stuck=0;for(let i=0;i<750;i++){let d=x-(t.p.x+12);if(Math.abs(d)<8){t.keys.clear();step(6);return;}t.keys.clear();t.keys.add(d>0?'ArrowRight':'ArrowLeft');if(jump||stuck>8){t.keys.add('Space');if(t.p.ground)t.press('Space');}let last=t.p.x;step();stuck=Math.abs(last-t.p.x)<.3?stuck+1:0;if(t.p.hang){t.keys.add('ArrowUp');step(2);}}throw Error('walk failed room '+t.state.room+' target '+x+' at '+JSON.stringify(t.p));}
function go(dest){let d=t.doors.find(d=>d.a===t.state.room&&d.b===dest||d.b===t.state.room&&d.a===dest);let a=d.a===t.state.room?d.pa:d.pb;walk(a.x);t.keys.clear();t.interact();if(t.state.room!==dest)throw Error('door failed '+dest+' at '+JSON.stringify(t.p));step(12);}
function item(){const r=t.rewards[t.state.room];walk(r.x);step(12);if(!t.has(r.key))throw Error('item missing '+r.key+' '+JSON.stringify(t.p));}
step(10);go(1);go(2);item();go(1);go(3);
// Actual canal ladder leads from the bridge to the lower gallery.
const ladder=t.point(3,330,348);walk(ladder.x);t.keys.clear();t.keys.add('ArrowDown');step(105);t.keys.clear();item();
// Return to the same ladder and climb back to the bridge.
walk(ladder.x);t.keys.clear();t.keys.add('ArrowUp');step(105);t.keys.clear();go(1);
// Approach the visible street staircase from its foot, then ascend left.
walk(t.point(1,1650,640).x);walk(t.point(1,1180,345).x);go(4);item();go(1);go(3);
// Descend again, then cross the lower canal gap with a real jump.
walk(ladder.x);t.keys.clear();t.keys.add('ArrowDown');step(105);t.keys.clear();walk(t.point(3,1040,723).x);walk(t.point(3,1260,724).x,true);go(5);go(6);item();go(7);
if(falls)throw Error('Route took environmental damage '+falls+' times');
return{ticks,room:t.state.room,owned:t.state.owned,falls};});console.log('PASS physical route without repositioning (enemies disabled):',result);await p.screenshot({path:'/tmp/shadowman-v08-route.png'});
// Only visual review uses explicit room entry after the physical-route assertion.
for(const [room,name] of [[3,'canal'],[5,'terminal']]){await p.evaluate(room=>{CITY_TEST.enter(room);CITY_TEST.p.inv=0;CITY_TEST.render();},room);await p.screenshot({path:'/tmp/shadowman-v08-'+name+'.png'});}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
