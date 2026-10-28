'use strict';
// Uses the browser tooling supplied by the managed environment; no install step.
const assert = require('node:assert/strict');
const { runPhaseRoute } = require('./phase-route.cjs');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const origin = process.env.SHADOWMAN_TEST_URL || process.env.BASE_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  async function check(name, fn) {
    try { await fn(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
    catch (error) { results.push({ name, passed: false, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
  }
  await page.goto(`${origin}/?test=1`);
  await page.waitForFunction(() => window.__shadowman?.spriteReady && __shadowman.cityReady && __shadowman.droneReady);
  await page.evaluate(() => { __shadowman.manual = true; __shadowman.start(); __shadowman.step(2); });

  await check('Sprite loads and simulation starts', async () => {
    assert.equal(await page.evaluate(() => __shadowman.mode), 'playing');
    assert.equal(await page.evaluate(() => __shadowman.p.ground), true);
    assert.equal(await page.evaluate(() => __shadowman.spriteReady), true);
  });

  await check('Complete six-sector route collects all fragments and returns without teleporting', async () => {
    const route = await page.evaluate(source=>(0,eval)('('+source+')')(__shadowman),runPhaseRoute.toString());
    assert.deepEqual(route.visited,[1,2,3,4,5,6]);assert.equal(route.fragments,3);assert.ok(route.final.x<150);
    console.log('  Phase route:',JSON.stringify({ticks:route.steps,events:route.events}));
  });

  await check('Attack has startup and applies at most one hit per target', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);const e=h.enemies[0];Object.assign(e,{x:h.p.x+95,y:442,hp:3,stun:999});h.command('KeyJ');h.step(6);const before=e.hp;h.step();const active=e.hp;h.step(35);return{before,active,after:e.hp};});
    assert.deepEqual(result,{before:3,active:2,after:2});
  });

  await check('Coyote time, jump buffering and variable jump height', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);Object.assign(h.p,{x:452,y:426,vx:0,ground:false,coyote:4});h.command('Space');h.step();const coyote=h.p.vy<0;
      Object.assign(h.p,{x:200,y:421,vy:3,ground:false,coyote:0,jumpBuffer:0});h.command('Space');h.step(3);const buffer=h.p.vy<0;
      h.release('Space');return{coyote,buffer,shortened:h.p.vy> -10};});
    assert.deepEqual(result,{coyote:true,buffer:true,shortened:true});
  });

  await check('Dash commits to direction and environmental fall ignores invulnerability', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.command('KeyK');h.keys.add('ArrowLeft');h.step(4);const direction=h.p.vx;h.p.inv=999;h.p.dash=10;h.fall();return{direction,hp:h.p.hp,ground:h.p.ground,dash:h.p.dash};});
    assert.deepEqual(result,{direction:10,hp:5,ground:true,dash:0});
  });

  await check('Gate holds closed without fragments', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.p.x=h.level.gate-5;h.step();return{x:h.p.x,w:h.p.w,boss:h.boss.phase};});
    assert.ok(result.x+result.w<=8620);assert.equal(result.boss,'sleep');
  });

  await check('Boss charge direction is fixed; defeating it completes level', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.seals.forEach(s=>s.taken=true);h.p.x=h.level.arena.start+50;h.step();h.boss.timer=1;h.step();const dir=h.boss.dir,before=h.boss.x;h.p.x=h.boss.x+180;h.step();const locked=h.boss.dir===dir&&h.boss.x<before;Object.assign(h.boss,{phase:'recover',timer:99,hp:1});Object.assign(h.p,{x:h.boss.x-100,y:426,face:1,vx:0,attackCool:0});h.keys.clear();h.command('KeyJ');h.step(8);return{locked,mode:h.mode,hp:h.boss.hp};});
    assert.deepEqual(result,{locked:true,mode:'won',hp:0});
  });

  await check('Pause and blur clear held movement; resume remains stopped', async () => {
    await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.keys.add('ArrowRight');h.step(5);window.dispatchEvent(new Event('blur'));});
    assert.equal(await page.evaluate(()=>__shadowman.mode),'paused');
    assert.equal(await page.evaluate(()=>__shadowman.keys.size),0);
    const before=await page.evaluate(()=>__shadowman.p.x);
    await page.evaluate(()=>__shadowman.step(30));
    assert.equal(await page.evaluate(()=>__shadowman.p.x),before);
    await page.click('#play');assert.equal(await page.evaluate(()=>__shadowman.mode),'playing');
  });

  await check('Desktop renders without overflow', async () => {
    await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.draw();});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:'/tmp/shadowman-v04-desktop.png',fullPage:true});
  });

  await check('Mobile touch movement and release',async()=>{
    const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    mobile.on('pageerror',error=>errors.push(error.message));
    await mobile.goto(`${origin}/?test=1`);await mobile.waitForFunction(()=>__shadowman.spriteReady);
    await mobile.evaluate(()=>{__shadowman.manual=true;});
    await mobile.tap('#play');
    assert.equal(await mobile.evaluate(()=>__shadowman.mode),'playing');
    const button=mobile.locator('[data-key="ArrowRight"]');await button.scrollIntoViewIfNeeded();
    await button.dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch',isPrimary:true});
    const movement=await mobile.evaluate(()=>{const h=__shadowman,x=h.p.x;h.step(20);return h.p.x-x;});
    assert.ok(movement>20);
    await button.dispatchEvent('pointerup',{pointerId:1,pointerType:'touch',isPrimary:true});
    assert.equal(await mobile.evaluate(()=>__shadowman.keys.has('ArrowRight')),false);
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await mobile.evaluate(()=>__shadowman.draw());
    await mobile.screenshot({path:'/tmp/shadowman-v04-mobile.png',fullPage:true});await mobile.close();
  });

  await check('Offline build embeds its sprite and supports physical keyboard input',async()=>{
    const offline=await browser.newPage();
    const requests=[];offline.on('request',r=>requests.push(r.url()));offline.on('pageerror',e=>errors.push(e.message));
    await offline.goto(`${origin}/dist/Shadowman.html?test=1`);
    await offline.waitForFunction(()=>__shadowman.spriteReady&&__shadowman.cityReady&&__shadowman.droneReady);
    await offline.click('#play');await offline.waitForTimeout(120);
    const x=await offline.evaluate(()=>__shadowman.p.x);
    await offline.keyboard.down('ArrowRight');await offline.waitForTimeout(220);await offline.keyboard.up('ArrowRight');
    assert.ok(await offline.evaluate(()=>__shadowman.p.x)>x+20);
    await offline.keyboard.press('Space');await offline.waitForFunction(()=>__shadowman.p.vy<0,{},{timeout:1500});
    assert.equal(requests.some(url=>url.includes('/assets/')||url.endsWith('game.js')||url.endsWith('style.css')||url.endsWith('level.js')),false);
    assert.equal(await offline.evaluate(()=>(document.documentElement.innerHTML.match(/data:image\/png;base64,/g)||[]).length),3);
    assert.equal(await offline.evaluate(()=>Object.keys(SHADOWMAN_PHASE_ATLAS).length),36);
    await offline.close();
  });

  await check('Fullscreen keeps touch controls inside visible game cabinet',async()=>{
    const full=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
    full.on('pageerror',e=>errors.push(e.message));await full.goto(`${origin}/?test=1`);
    await full.waitForFunction(()=>__shadowman.spriteReady);await full.tap('#play');await full.tap('#fullscreen');
    await full.waitForFunction(()=>Boolean(document.fullscreenElement));
    const visible=await full.evaluate(()=>{const b=document.querySelector('[data-key="Space"]'),r=b.getBoundingClientRect();return document.fullscreenElement.contains(b)&&r.top>=0&&r.bottom<=innerHeight;});
    assert.equal(visible,true);await full.screenshot({path:'/tmp/shadowman-v04-fullscreen.png'});await full.close();
  });


  await check('Phase and drone atlases load with 36 and 24 in-bounds rectangles',async()=>{
    const result=await page.evaluate(async()=>{
      const dimensions=await Promise.all(['phase-01-complete-atlas.png','drone-atlas.png'].map(async name=>{const image=new Image();image.src='assets/'+name;await image.decode();return {w:image.naturalWidth,h:image.naturalHeight};}));
      const groups=[Object.values(SHADOWMAN_PHASE_ATLAS),SHADOWMAN_ASSETS.drone];
      return groups.map((rects,index)=>({count:rects.length,valid:rects.every(r=>r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=dimensions[index].w&&r.y+r.h<=dimensions[index].h)}));
    });
    assert.deepEqual(result,[{count:36,valid:true},{count:24,valid:true}]);
  });

  await check('Drone telegraphs, locks projectile aim and patrols within bounds',async()=>{
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);const e=h.enemies[0];Object.assign(h.p,{x:e.x-200,y:426,inv:999});e.cool=0;h.step();const told=e.wind===38,aim={...e.shotDir};h.p.x=e.x+200;h.step(26);const q=h.shots[0];const locked=Boolean(q)&&Math.abs(q.vx-aim.x*3.9)<.00001&&Math.abs(q.vy-aim.y*3.9)<.00001;const cooled=e.cool>100;h.p.x=50;h.p.inv=999;let bounds=true;for(let i=0;i<400;i++){h.step();bounds&&=e.x>=e.origin-75&&e.x<=e.origin+75;}return{told,locked,cooled,bounds};});
    assert.deepEqual(result,{told:true,locked:true,cooled:true,bounds:true});
  });

  await check('Shadow attacks destroy drone once and clear its wreck animation',async()=>{
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);const e=h.enemies[0];Object.assign(h.p,{x:e.x-100,y:426,face:1,inv:999});e.stun=999;e.cool=999;for(let i=0;i<3;i++){h.command('KeyJ');h.step(10);if(i<2)h.step(35);}const dead=e.hp===0,wrecked=h.wrecks.length===1;h.step(300);return{dead,wrecked,stillDead:e.hp===0,expired:h.wrecks.length===0};});
    assert.deepEqual(result,{dead:true,wrecked:true,stillDead:true,expired:true});
  });

  await check('Projectiles move, expire, respect dash/invulnerability and reset cleanly',async()=>{
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.shots.push({x:300,y:200,w:10,h:10,vx:4,vy:0,life:2});h.updateShots();const moved=h.shots[0].x===304;h.updateShots();const expired=h.shots.length===0;
      h.shots.push({x:200,y:500,w:10,h:10,vx:0,vy:0,life:100});h.updateShots();const terrain=h.shots.length===0;
      function contact(){h.shots.push({x:h.p.x,y:h.p.y+15,w:10,h:10,vx:0,vy:0,life:100});h.updateShots();}
      contact();const hit=h.p.hp===5&&h.shots.length===0;h.p.inv=999;contact();const inv=h.p.hp===5&&h.shots.length===0;h.p.inv=0;h.p.dash=14;contact();const dash=h.p.hp===5&&h.shots.length===0;
      h.fireDrone(h.enemies[0]);h.wrecks.push({x:0,y:0,age:0,size:50});h.start();return{moved,expired,terrain,hit,inv,dash,reset:h.shots.length===0&&h.wrecks.length===0&&h.enemies.every(e=>e.hp===3)};});
    assert.deepEqual(result,{moved:true,expired:true,terrain:true,hit:true,inv:true,dash:true,reset:true});
    await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.seals.forEach(s=>s.taken=true);h.p.x=h.level.arena.start+50;h.step(180);h.p.inv=0;h.boss.phase='tell';h.boss.timer=35;h.snapCamera();h.draw();});
    await page.screenshot({path:'/tmp/shadowman-v04-arena.png',fullPage:true});
  });

  await check('Factory lift carries the player up and down without slipping',async()=>{
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.enemies.forEach(e=>e.hp=0);Object.assign(h.p,{x:7510,y:426,ground:true,inv:9999});let caught=false,coherent=true,min=500,max=315,riding=0;for(let i=0;i<900;i++){h.step();const lift=h.lifts[0];if(h.p.standing===lift.id){caught=true;riding++;min=Math.min(min,lift.y);max=Math.max(max,lift.y);coherent&&=Math.abs(h.p.y+h.p.h-lift.y)<1.01;}else if(caught&&lift.y<499)coherent=false;}return{caught,coherent,min,max,riding,checkpoint:h.snapshot().checkpoint.x};});
    assert.equal(result.caught,true);assert.equal(result.coherent,true);assert.ok(result.min<=316);assert.ok(result.max>=499);assert.ok(result.riding>420);
  });

  await check('Six district views render with their correct landmarks',async()=>{
    const views=[[200,426],[2160,261],[3970,211],[5650,446],[7515,426],[9040,426]];
    for(let i=0;i<views.length;i++){
      await page.evaluate(({x,y,i})=>{const h=__shadowman;h.start();if(i===5)h.seals.forEach(s=>s.taken=true);Object.assign(h.p,{x,y,inv:999});h.step(12);h.p.inv=0;h.snapCamera();h.draw();},{x:views[i][0],y:views[i][1],i});
      await page.screenshot({path:`/tmp/shadowman-v04-sector-${i+1}.png`,fullPage:true});
    }
  });

  await check('No uncaught browser errors',async()=>assert.deepEqual(errors,[]));
  await check('Test hooks absent during ordinary play',async()=>{await page.goto(origin);assert.equal(await page.evaluate(()=>typeof window.__shadowman),'undefined');});
  await browser.close();
  const failed=results.filter(r=>!r.passed);console.log(JSON.stringify({passed:results.length-failed.length,failed:failed.length,results},null,2));
  if(failed.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
