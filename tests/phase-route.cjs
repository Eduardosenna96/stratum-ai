'use strict';
// All travel after start is real input and physics. Enemies are disabled to isolate level geometry.
function runPhaseRoute(h) {
  h.manual=true;h.start();h.enemies.forEach(e=>e.hp=0);h.p.inv=999999;
  const events=[],visited=new Set();let steps=0;
  const position=()=>({x:Math.round(h.p.x),feet:Math.round(h.p.y+h.p.h),standing:h.p.standing,fragments:h.seals.filter(s=>s.taken).length});
  function step(n=1){for(let i=0;i<n;i++){const old=h.p.x;h.step();steps++;if(Math.abs(h.p.x-old)>15)throw new Error(`Unexpected respawn/teleport at x=${old}, new x=${h.p.x}`);if(h.mode!=='playing')throw new Error(`Run ended at ${JSON.stringify(position())}`);visited.add(h.level.sectors.find(s=>h.p.x>=s.start&&h.p.x<s.end)?.id);if(steps>18000)throw new Error('Route exceeded step budget');}}
  function direction(d){h.keys.delete('ArrowLeft');h.keys.delete('ArrowRight');if(d)h.keys.add(d>0?'ArrowRight':'ArrowLeft');}
  function walk(x){direction(Math.sign(x-h.p.x));for(let i=0;i<2400;i++){if((h.keys.has('ArrowRight')&&h.p.x>=x)||(h.keys.has('ArrowLeft')&&h.p.x<=x))return;step();}throw new Error(`Could not walk to ${x}: ${JSON.stringify(position())}`);}
  function stop(){direction(0);for(let i=0;i<30&&Math.abs(h.p.vx)>.01;i++)step();}
  function waitGround(y,limit=110){for(let i=0;i<limit;i++){if(h.p.ground&&(y===undefined||Math.abs(h.p.y+h.p.h-y)<2))return;step();}throw new Error(`No ground at y=${y}: ${JSON.stringify(position())}`);}
  function jump(d,y,short=false){direction(d);h.command('Space');let airborne=false;for(let i=0;i<110;i++){step();if(short&&i===4)h.release('Space');if(!h.p.ground)airborne=true;if(airborne&&h.p.ground){if(y!==undefined&&Math.abs(h.p.y+h.p.h-y)>2)throw new Error(`Unexpected jump landing, wanted ${y}: ${JSON.stringify(position())}`);return;}}throw new Error(`No jump landing: ${JSON.stringify(position())}`);}
  function event(name){events.push({name,...position()});}
  step(2);walk(390);jump(1,500);event('dock-water-crossing');
  walk(1690);waitGround(500);jump(1,420);walk(1875);jump(1,335);walk(2145);stop();event('courtyard-fragment');
  if(!h.seals[0].taken)throw new Error('Courtyard fragment missing');
  // Return from the upper courtyard to its ground approach, then continue forward.
  walk(1690);stop();waitGround(500);event('courtyard-return');
  walk(3495);waitGround(374);walk(3580);jump(1,350);walk(3790);jump(1,285);walk(4030);jump(1,330);walk(4320);jump(1,410);event('clock-rooftops');
  walk(5270);waitGround(390);walk(5325);stop();waitGround(520);event('canal-maintenance-descent');
  walk(5420);jump(1,520,true);walk(5635);stop();event('canal-fragment');
  if(!h.seals[1].taken)throw new Error('Canal fragment missing');
  walk(6350);stop();waitGround(500);event('canal-stairs-return');
  walk(7510);stop();waitGround(500);
  for(let i=0;i<600;i++){if(h.p.standing===h.lifts[0].id&&h.p.y+h.p.h<=335)break;step();if(i===599)throw new Error(`Lift never carried player upward: ${JSON.stringify(position())}`);}
  event('lift-ascent');walk(7570);jump(1,315);walk(7805);stop();event('factory-fragment');
  if(!h.seals[2].taken)throw new Error('Factory fragment missing');
  // The generator platform has a safe drop back to the factory floor.
  walk(7320);stop();waitGround(500);event('factory-return');
  walk(8870);event('terminal-entry');walk(9130);stop();event('arena-arrival');
  if(h.snapshot().checkpoint.x!==8500)throw new Error('Terminal checkpoint not active');
  // Backtrack through all districts. The broken bridge is crossed from east to west.
  walk(5480);waitGround(390);jump(-1,390);event('bridge-backtrack');
  walk(620);waitGround(500);jump(-1,500);walk(100);stop();waitGround(500);event('returned-to-start');
  return{steps,visited:[...visited].sort(),fragments:h.seals.filter(s=>s.taken).length,events,final:position()};
}
module.exports={runPhaseRoute};
if(require.main===module){
  const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  (async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{const page=await browser.newPage();await page.goto((process.env.BASE_URL||'http://127.0.0.1:3000')+'/?test=1');await page.waitForFunction(()=>__shadowman.spriteReady&&__shadowman.cityReady&&__shadowman.droneReady);const report=await page.evaluate(source=>(0,eval)('('+source+')')(__shadowman),runPhaseRoute.toString());console.log(JSON.stringify(report,null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
}
