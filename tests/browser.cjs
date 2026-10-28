'use strict';
// Uses the browser tooling supplied by the managed environment; no install step.
const assert = require('node:assert/strict');
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
  await page.waitForFunction(() => window.__shadowman?.spriteReady);
  await page.evaluate(() => { __shadowman.manual = true; __shadowman.start(); __shadowman.step(2); });

  await check('Sprite loads and simulation starts', async () => {
    assert.equal(await page.evaluate(() => __shadowman.mode), 'playing');
    assert.equal(await page.evaluate(() => __shadowman.p.ground), true);
    assert.equal(await page.evaluate(() => __shadowman.spriteReady), true);
  });

  await check('Three collectible routes are reachable by real platform jumps', async () => {
    const routes = await page.evaluate(() => {
      const h = __shadowman; h.start(); h.step(2);
      const reports = [];
      // Start each independent route on its ground approach. No position edits after this point.
      for (const [startX, firstY, launchX, targetY, targetX] of [[320,405,510,315,715],[1190,410,1400,325,1600],[2190,405,2370,310,2580]]) {
        h.keys.clear(); Object.assign(h.p,{x:startX,y:426,vx:0,vy:0,ground:true,inv:500,stun:0,attackAge:-1,dash:0});
        const path = [];
        function jumpTo(y) {
          h.keys.add('ArrowRight'); h.command('Space'); let leftGround=false;
          for(let i=0;i<85;i++) { h.step(); if(!h.p.ground)leftGround=true; if(leftGround&&h.p.ground){path.push({x:Math.round(h.p.x),floor:h.p.y+h.p.h}); if(h.p.y+h.p.h!==y)throw new Error(`Route ${startX}: landed at ${h.p.y+h.p.h} instead of ${y}, x=${h.p.x}`);return;} }
          throw new Error(`Route ${startX}: no landing`);
        }
        jumpTo(firstY);
        while(h.p.x<launchX&&h.p.ground)h.step();
        jumpTo(targetY);
        for(let i=0;i<55&&h.p.x+15<targetX;i++)h.step();
        h.keys.clear();h.p.vx=0;
        const seal=h.seals.find(s=>s.x===targetX);
        if(!seal.taken)throw new Error(`Fragment ${targetX} was not collected; x=${h.p.x} y=${h.p.y}`);
        reports.push({startX,path,fragment:seal.x});
      }
      return reports;
    });
    assert.equal(routes.length,3);
    console.log('  Routes:',JSON.stringify(routes));
  });

  await check('Attack has startup and applies at most one hit per target', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);const e=h.enemies[0];Object.assign(e,{x:h.p.x+95,y:442,hp:3,stun:999});h.command('KeyJ');h.step(6);const before=e.hp;h.step();const active=e.hp;h.step(35);return{before,active,after:e.hp};});
    assert.deepEqual(result,{before:3,active:2,after:2});
  });

  await check('Coyote time, jump buffering and variable jump height', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);Object.assign(h.p,{x:882,y:426,vx:0,ground:false,coyote:4});h.command('Space');h.step();const coyote=h.p.vy<0;
      Object.assign(h.p,{x:200,y:421,vy:3,ground:false,coyote:0,jumpBuffer:0});h.command('Space');h.step(3);const buffer=h.p.vy<0;
      h.release('Space');return{coyote,buffer,shortened:h.p.vy> -10};});
    assert.deepEqual(result,{coyote:true,buffer:true,shortened:true});
  });

  await check('Dash commits to direction and environmental fall ignores invulnerability', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.command('KeyK');h.keys.add('ArrowLeft');h.step(4);const direction=h.p.vx;h.p.inv=999;h.p.dash=10;h.fall();return{direction,hp:h.p.hp,ground:h.p.ground,dash:h.p.dash};});
    assert.deepEqual(result,{direction:10,hp:5,ground:true,dash:0});
  });

  await check('Gate holds closed without fragments', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.p.x=3145;h.step();return{x:h.p.x,w:h.p.w,boss:h.boss.phase};});
    assert.ok(result.x+result.w<=3150);assert.equal(result.boss,'sleep');
  });

  await check('Boss charge direction is fixed; defeating it completes level', async () => {
    const result=await page.evaluate(()=>{const h=__shadowman;h.start();h.step(2);h.seals.forEach(s=>s.taken=true);h.p.x=3300;h.step();h.boss.timer=1;h.step();const dir=h.boss.dir,before=h.boss.x;h.p.x=h.boss.x+180;h.step();const locked=h.boss.dir===dir&&h.boss.x<before;Object.assign(h.boss,{phase:'recover',timer:99,hp:1});Object.assign(h.p,{x:h.boss.x-100,y:426,face:1,vx:0,attackCool:0});h.keys.clear();h.command('KeyJ');h.step(8);return{locked,mode:h.mode,hp:h.boss.hp};});
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
    await page.screenshot({path:'/tmp/shadowman-v02-desktop.png',fullPage:true});
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
    await mobile.screenshot({path:'/tmp/shadowman-v02-mobile.png',fullPage:true});await mobile.close();
  });

  await check('Offline build embeds its sprite and supports physical keyboard input',async()=>{
    const offline=await browser.newPage();
    const requests=[];offline.on('request',r=>requests.push(r.url()));offline.on('pageerror',e=>errors.push(e.message));
    await offline.goto(`${origin}/dist/Shadowman.html?test=1`);
    await offline.waitForFunction(()=>__shadowman.spriteReady);
    await offline.click('#play');await offline.waitForTimeout(120);
    const x=await offline.evaluate(()=>__shadowman.p.x);
    await offline.keyboard.down('ArrowRight');await offline.waitForTimeout(220);await offline.keyboard.up('ArrowRight');
    assert.ok(await offline.evaluate(()=>__shadowman.p.x)>x+20);
    await offline.keyboard.press('Space');await offline.waitForFunction(()=>__shadowman.p.vy<0,{},{timeout:1500});
    assert.equal(requests.some(url=>url.includes('/assets/')||url.endsWith('game.js')||url.endsWith('style.css')),false);
    await offline.close();
  });

  await check('Fullscreen keeps touch controls inside visible game cabinet',async()=>{
    const full=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
    full.on('pageerror',e=>errors.push(e.message));await full.goto(`${origin}/?test=1`);
    await full.waitForFunction(()=>__shadowman.spriteReady);await full.tap('#play');await full.tap('#fullscreen');
    await full.waitForFunction(()=>Boolean(document.fullscreenElement));
    const visible=await full.evaluate(()=>{const b=document.querySelector('[data-key="Space"]'),r=b.getBoundingClientRect();return document.fullscreenElement.contains(b)&&r.top>=0&&r.bottom<=innerHeight;});
    assert.equal(visible,true);await full.screenshot({path:'/tmp/shadowman-v02-fullscreen.png'});await full.close();
  });

  await check('No uncaught browser errors',async()=>assert.deepEqual(errors,[]));
  await check('Test hooks absent during ordinary play',async()=>{await page.goto(origin);assert.equal(await page.evaluate(()=>typeof window.__shadowman),'undefined');});
  await browser.close();
  const failed=results.filter(r=>!r.passed);console.log(JSON.stringify({passed:results.length-failed.length,failed:failed.length,results},null,2));
  if(failed.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
