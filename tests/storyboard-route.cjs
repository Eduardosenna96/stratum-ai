'use strict';
function runStoryboardRoute(h){
 h.manual=true;h.start();h.enemies.forEach(e=>e.hp=0);h.p.inv=999999;
 const events=[],transitions=[],seen=new Set();let ticks=0;
 const native=(i,x,y=0)=>h.level.point(i,x,y);
 const pos=()=>({scene:h.snapshot().scene,x:Math.round(h.p.x),feet:Math.round(h.p.y+h.p.h),standing:h.p.standing,climbing:h.p.climbing,fragments:h.seals.filter(s=>s.taken).length});
 function step(n=1){for(let i=0;i<n;i++){const old={x:h.p.x,y:h.p.y,scene:h.snapshot().scene};h.step();ticks++;const now=pos();seen.add(now.scene);if(now.scene!==old.scene)transitions.push({from:old.scene,to:now.scene,dx:h.p.x-old.x,dy:h.p.y-old.y});if(Math.abs(h.p.x-old.x)>15)throw new Error('Respawn/teleport: '+JSON.stringify({old,now}));if(h.mode!=='playing')throw new Error('Run ended: '+JSON.stringify(now));if(ticks>16000)throw new Error('Step budget exceeded');}}
 function dir(d){h.keys.clear();if(d)h.keys.add(d>0?'ArrowRight':'ArrowLeft');}
 function walk(x){const d=Math.sign(x-h.p.x);dir(d);for(let i=0;i<1800;i++){if(d>0?h.p.x>=x:h.p.x<=x)return;step();}throw new Error('Cannot reach x '+x+' '+JSON.stringify(pos()));}
 function stop(){dir(0);for(let i=0;i<20&&Math.abs(h.p.vx)>.01;i++)step();}
 function ground(y,limit=150){for(let i=0;i<limit;i++){if(h.p.ground&&(y===undefined||Math.abs(h.p.y+h.p.h-y)<2))return;step();}throw new Error('No ground y '+y+' '+JSON.stringify(pos()));}
 function jump(d){dir(d);h.command('Space');let air=false;for(let i=0;i<130;i++){step();if(!h.p.ground)air=true;if(air&&h.p.ground)return;}throw new Error('Jump did not land '+JSON.stringify(pos()));}
 function event(name){events.push({name,...pos()});}
 function climb(i,id,down){const l=h.level.ladders.find(l=>l.id===id);walk(l.x-20);stop();h.keys.clear();h.keys.add(down?'ArrowDown':'ArrowUp');for(let t=0;t<220;t++){step();if(h.p.ground&&Math.abs(h.p.y+h.p.h-(down?l.bottom:l.top))<1){h.keys.clear();event(id+(down?'-down':'-up'));return;}}throw new Error('Ladder stalled '+JSON.stringify(pos()));}
 function rideLift(){const l=h.lifts[0];walk(native(4,348).x);stop();for(let i=0;i<650;i++){step();if(h.p.standing===l.id&&h.p.y+h.p.h<=l.high+12){event('lift-top');return;}}throw new Error('Lift did not reach upper floor '+JSON.stringify(pos()));}
 step(2);event('cais-spawn');walk(native(1,350).x-12);stop();ground();event('fountain-fragment');if(!h.seals[0].taken)throw new Error('Fountain fragment missing');
 walk(native(3,139).x-20);stop();event('rooftops-and-canal-arrival');climb(3,'canal-west-ladder',true);
 walk(native(3,280).x-12);stop();ground();event('canal-fragment');if(!h.seals[1].taken)throw new Error('Canal fragment missing');
 jump(-1);climb(3,'canal-west-ladder',false);walk(native(4,410).x);stop();ground(native(4,410,310).y);event('factory-lower-arrival');
 walk(native(4,240).x-12);stop();ground();jump(0);event('reactor-fragment');if(!h.seals[2].taken)throw new Error('Reactor fragment missing');
 rideLift();walk(native(4,425).x);stop();ground(native(4,425,310).y);event('factory-safe-return');walk(native(5,290).x);stop();ground();event('terminal-arena');
 // True backtracking: lift is required to reach the factory's high arrival floor.
 walk(native(4,420).x);stop();ground(native(4,420,310).y);rideLift();walk(native(3,540).x);event('canal-backtrack');
 walk(native(2,80).x);stop();ground(native(2,80,195).y);jump(-1);event('rooftop-entry-return');
 walk(native(1,150).x);stop();ground(native(1,150,305).y);jump(-1);event('street-step-return');
 walk(native(0,130).x);stop();ground(native(0,130,258).y);event('returned-to-cais');
 return{ticks,scenes:[...seen].sort(),transitions,fragments:h.seals.filter(s=>s.taken).length,events,checkpoint:h.snapshot().checkpoint};
}
module.exports={runStoryboardRoute};
if(require.main===module){const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{const p=await b.newPage();await p.goto((process.env.BASE_URL||'http://127.0.0.1:3000')+'/?test=1');await p.waitForFunction(()=>__shadowman.spriteReady&&__shadowman.cityReady&&__shadowman.droneReady);console.log(JSON.stringify(await p.evaluate(src=>(0,eval)('('+src+')')(__shadowman),runStoryboardRoute.toString()),null,2));}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});}
