const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const p=await b.newPage();await p.goto('http://localhost:3000/prototype/index.html?test=1');await p.waitForFunction(()=>!document.querySelector('#play').disabled);await p.click('#play');const result=await p.evaluate(()=>{const t=CITY_TEST;let ticks=0;function step(n=1){for(let i=0;i<n;i++){t.enemies.forEach(e=>e.hp=0);t.step();ticks++;}}function walk(x,jump=false){let last=0,stuck=0;for(let i=0;i<650;i++){let d=x-(t.p.x+12);if(Math.abs(d)<10){t.keys.clear();step(4);return;}t.keys.clear();t.keys.add(d>0?'ArrowRight':'ArrowLeft');if(jump||stuck>8){t.keys.add('Space');if(t.p.ground)t.press('Space');}last=t.p.x;step();stuck=Math.abs(last-t.p.x)<.3?stuck+1:0;if(t.p.hang){t.keys.add('ArrowUp');step(2);}}throw Error('walk failed room '+t.state.room+' target '+x+' at '+JSON.stringify(t.p));}
function go(dest){let d=t.doors.find(d=>d.a===t.state.room&&d.b===dest||d.b===t.state.room&&d.a===dest);let a=d.a===t.state.room?d.pa:d.pb;walk(a.x);t.keys.clear();t.interact();if(t.state.room!==dest)throw Error('door failed '+dest+' at '+JSON.stringify(t.p));step(10);}
function item(){const r=t.rewards[t.state.room];walk(r.x);step(10);if(!t.has(r.key))throw Error('item missing '+r.key+' '+JSON.stringify(t.p));}
step(10);go(1);go(2);item();go(1);go(3);
// Reach the real canal ladder, descend to maintenance and drop onto the island.
const ladder=t.point(3,139,124);walk(ladder.x);t.keys.clear();t.keys.add('ArrowDown');step(90);t.keys.clear();item();
// Return by jumping from island to maintenance, then climb the ladder.
walk(ladder.x,true);t.keys.clear();t.keys.add('ArrowUp');step(100);t.keys.clear();go(1);
// Street stairs require moving to their foot before ascending to the high door.
walk(t.point(1,535,305).x);walk(t.point(1,445,222).x);go(4);item();
walk(t.point(4,70,195).x,true);go(1);go(3);go(5);go(6);item();go(7);return{ticks,room:t.state.room,owned:t.state.owned};});console.log('PASS physical route without repositioning:',result);await p.screenshot({path:'/tmp/shadowman-city-route.png'});}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
