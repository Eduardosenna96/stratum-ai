/* Shadowman / Senna Comics. Fixed 60 Hz simulation; rendering and input stay separate. */
(()=>{'use strict';
const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
const level=window.SHADOWMAN_LEVEL;
if(!level)throw new Error('Dados da fase não carregados.');
const WIDTH=1200,HEIGHT=600,WORLD=level.width,STEP=1000/60;
const keys=new Set(),reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sprite=new Image();sprite.src='assets/shadowman.png';
const cityAtlas=new Image();cityAtlas.src='assets/storyboard-clean.png';
const droneAtlas=new Image();droneAtlas.src='assets/drone-atlas.png';
const atlas={city:window.SHADOWMAN_PHASE_ATLAS||{},drone:window.SHADOWMAN_ASSETS?.drone||[]};
let cityReady=false,droneReady=false,loadedAssets=0;
$('#play').disabled=true;
function loadedAsset(){loadedAssets++;if(loadedAssets===3)$('#play').disabled=false;$('#load-status').textContent=loadedAssets===3?'← → MOVER · ESPAÇO SALTAR · J SOMBRAS · K ESQUIVAR':`CARREGANDO ARTE ${loadedAssets} / 3`;}
cityAtlas.onload=()=>{cityReady=true;loadedAsset();};droneAtlas.onload=()=>{droneReady=true;loadedAsset();};
let spriteReady=false;
sprite.onload=()=>{spriteReady=true;loadedAsset();};
sprite.onerror=()=>{$('#load-status').textContent='Arte indisponível. O modo de silhueta continua jogável.';};
let mode='title',p,boss,enemies,seals,particles=[],tick=0,cam=0,camY=0,sceneIndex=0,sceneFade=0,debugGeometry=false,shake=0,freeze=0,toastTicks=0,checkpoint,runFrames=0;
let last=0,acc=0,muted=true,audio=null,manual=false;
let shots=[],wrecks=[];
const terrain=[];let lifts=[],heals=[],safeReached=new Set(),lastSector=1;
const count=()=>seals.filter(s=>s.taken).length;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const approach=(a,b,n)=>a<b?Math.min(b,a+n):Math.max(b,a-n);
function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function label(text,x,y,size=12,color='#b1c8dc',align='left'){ctx.fillStyle=color;ctx.font=`${size}px Arial`;ctx.textAlign=align;ctx.fillText(text,x,y);ctx.textAlign='left';}
function sound(hz,duration=.1,type='sine',volume=.025){if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(hz,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(25,hz*.45),audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{muted=true;$('#sound').textContent='SOM OFF';}}
function burst(x,y,n=14,color='#4ac6ff'){for(let i=0;i<n&&particles.length<180;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.7)*5,life:22+Math.random()*14,color});}
function toast(text,duration=190){$('#toast').textContent=text;$('#toast').classList.add('visible');toastTicks=duration;}
function clearInput(){keys.clear();document.querySelectorAll('.touch button').forEach(b=>b.classList.remove('pressed'));if(p)p.jumpBuffer=0;}
function makePlayer(x=level.spawn.x,feet=level.spawn.y){return{x,y:feet-54,w:24,h:54,vx:0,vy:0,face:1,hp:6,ground:false,coyote:0,jumpBuffer:0,inv:0,attackAge:-1,attackCool:0,hitTargets:new Set(),dash:0,dashCool:0,dashDir:1,stun:0,anim:0,standing:null,climbing:null};}
function scene(){return level.scenes[sceneIndex];}
function syncScene(force=false){const next=clamp(Math.floor((p.x+p.w/2)/WIDTH),0,level.scenes.length-1);if(next!==sceneIndex&&!force){sceneFade=12;shots=[];wrecks=[];p.inv=Math.max(p.inv,25);}sceneIndex=next;cam=scene().start;camY=scene().offsetY;}
function saveCheckpoint(x,y){if(x>=checkpoint.x)checkpoint={x,y};}
function makeBoss(){return{id:'boss',x:level.arena.bossX,y:level.arena.hoverY,w:100,h:100,hp:18,maxHp:18,phase:'sleep',timer:0,dir:-1,stun:0,flash:0};}
function reset(){p=makePlayer();boss=makeBoss();terrain.length=0;terrain.push(...level.terrain.map(f=>({...f})));lifts=level.lifts.map(f=>({...f,dy:0}));terrain.push(...lifts);enemies=level.drones.map((d,i)=>({id:`drone-${i}`,x:d.x,y:d.y,baseY:d.y,scene:d.scene,w:44,h:44,hp:3,maxHp:3,origin:d.x,dir:-1,stun:0,flash:0,wind:0,cool:65+i*17,shotDir:{x:-1,y:0}}));seals=level.seals.map(s=>({...s,taken:false}));heals=level.heals.map(h=>({...h,taken:false}));safeReached=new Set();lastSector=1;particles=[];shots=[];wrecks=[];sceneFade=0;cam=0;tick=0;runFrames=0;freeze=0;shake=0;checkpoint={...level.spawn};syncScene(true);toastTicks=0;$('#toast').classList.remove('visible');updateHud();}
function updateHud(){const n=count(),sector=level.sectors.find(s=>p.x>=s.start&&p.x<s.end)||level.sectors.at(-1);$('#fragments').textContent=`FRAGMENTOS ${n} / 3`;$('#objective').textContent=n===3?'ENFRENTE O VIGIA NO TERMINAL 08':sector.tip.toUpperCase();$('#zone').textContent=`${String(sector.id).padStart(2,'0')} / ${sector.name}`;if(mode==='playing'&&lastSector!==sector.id)toast(sector.tip,230);lastSector=sector.id;}
function overlay(kicker,title,text,button,restart=false){$('#overlay').hidden=false;$('#overlay-kicker').textContent=kicker;$('#overlay-title').textContent=title;$('#overlay-text').innerHTML=text;$('#play').textContent=button;$('#restart').hidden=!restart;}
function start(){reset();mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});toast('Explore ruas, telhados e docas. Três fragmentos abrem o Terminal 08.');}
function pause(){if(mode==='playing'){mode='paused';clearInput();overlay('A CIDADE PODE ESPERAR','Entre dois mundos.','Sua jornada está pausada.','CONTINUAR →',true);}else if(mode==='paused'){mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});}$('#pause').textContent=mode==='paused'?'▶':'II';}
function finish(won){mode=won?'won':'dead';clearInput();$('#toast').classList.remove('visible');if(won){sound(720,.6,'triangle');overlay('CAPÍTULO 01 CONCLUÍDO','As sombras obedecem.',`O Terminal 08 está livre.<br>Três fragmentos. Um guardião. Uma cidade que ainda guarda segredos.<br>Tempo de jogo: ${Math.floor(runFrames/3600)} min ${Math.floor(runFrames/60)%60} s.`,'JOGAR NOVAMENTE →');}else overlay('A NOITE AINDA NÃO TERMINOU','Erga-se, Shadowman.',count()?'Os fragmentos recuperados continuam com você.<br>Retorne ao último ponto seguro.':'Respire. Observe os sinais. Tente outra vez.','TENTAR NOVAMENTE →',true);}
function respawn(){p=makePlayer(checkpoint.x,checkpoint.y);syncScene(true);p.inv=90;boss=makeBoss();freeze=0;shake=0;particles=[];shots=[];wrecks=[];mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});toast('De volta às sombras.');}
function takeDamage(environment=false,fromX=p.x-1){if(mode!=='playing'||(!environment&&(p.inv>0||p.dash>0)))return false;p.climbing=null;p.hp--;p.inv=70;p.stun=15;p.vx=Math.sign(p.x-fromX||1)*5;p.vy=-5;p.dash=0;p.attackAge=-1;shake=reducedMotion?0:8;burst(p.x+15,p.y+30,18,'#75cfff');sound(90,.2,'sawtooth');if(p.hp<=0)finish(false);return true;}
function fall(){takeDamage(true);if(mode!=='playing')return;p.x=checkpoint.x;p.y=checkpoint.y-p.h;p.vx=0;p.vy=0;p.stun=0;p.inv=90;p.ground=true;p.coyote=6;p.dash=0;p.climbing=null;syncScene(true);toast('A sombra o trouxe de volta. Cuidado com os canais.',150);}
function command(code){if(code==='KeyP'||code==='Escape'){pause();return;}if(mode!=='playing')return;if(code==='Space'&&p.climbing){p.climbing=null;p.vy=-11.5;p.ground=false;p.coyote=0;p.jumpBuffer=0;}else if(code==='Space')p.jumpBuffer=8;else if((code==='ArrowUp'||code==='KeyW')&&!nearLadder())p.jumpBuffer=8;if(code==='KeyJ'&&p.attackCool<=0&&p.dash<=0&&p.stun<=0){p.attackAge=0;p.attackCool=32;p.hitTargets.clear();sound(170,.16,'triangle');}if(code==='KeyK'&&p.dashCool<=0&&p.stun<=0){p.climbing=null;p.dash=14;p.dashCool=65;p.dashDir=p.face;p.attackAge=-1;p.vy=0;burst(p.x,p.y+40,8);sound(430,.16);}}
function release(code){keys.delete(code);if(['Space','ArrowUp','KeyW'].includes(code)&&p.vy< -5)p.vy*=.5;}
function terrainUnder(x,w=30){return terrain.some(f=>Math.abs(f.y-(p.y+p.h))<120&&x>=f.x&&x+w<=f.x+f.w);}
function attack(){if(p.attackAge<7||p.attackAge>15)return;const area={x:p.face>0?p.x+p.w-4:p.x-124,y:p.y+8,w:128,h:64};for(const e of [...enemies,boss]){if(e.hp<=0||p.hitTargets.has(e.id)||(e===boss&&boss.phase==='sleep')||!overlap(area,e))continue;p.hitTargets.add(e.id);e.hp--;e.flash=10;e.stun=16;if(e!==boss){const next=e.x+p.face*15;if(terrainUnder(next,e.w))e.x=next;if(e.hp===0){wrecks.push({x:e.x+e.w/2,y:e.y+e.h/2,age:0,size:90});burst(e.x+22,e.y+22,24,'#ffb35e');}}burst(e.x+e.w/2,e.y+30,20);sound(110,.13,'square',.017);freeze=3;shake=reducedMotion?0:4;if(e===boss&&e.hp<=0){burst(e.x+25,e.y+40,70);finish(true);return;}}}
function fireDrone(e){if(shots.length>=20)return;const aim=e.shotDir||{x:-1,y:0};shots.push({x:e.x+e.w/2+aim.x*25,y:e.y+e.h/2+aim.y*25,w:10,h:10,vx:aim.x*3.9,vy:aim.y*3.9,life:155});burst(e.x+22,e.y+22,5,'#ff986e');sound(310,.13,'triangle',.018);}
function updateEnemies(){for(const e of enemies){if(e.hp<=0||e.scene!==sceneIndex)continue;e.flash=Math.max(0,e.flash-1);e.stun=Math.max(0,e.stun-1);e.cool=Math.max(0,e.cool-1);if(e.stun>0)continue;e.y=e.baseY+Math.sin(tick*.045+e.origin)*5;const dx=p.x+15-(e.x+22),dy=p.y+38-(e.y+22);
if(e.wind>0){e.wind--;if(e.wind===12)fireDrone(e);}else if(Math.abs(dx)<335&&Math.abs(dy)<230&&e.cool===0){e.wind=38;e.cool=155;e.dir=Math.sign(dx)||-1;const distance=Math.max(1,Math.hypot(dx,dy));e.shotDir={x:dx/distance,y:dy/distance};}else{if(e.x<=e.origin-75)e.dir=1;else if(e.x>=e.origin+75)e.dir=-1;e.x=clamp(e.x+e.dir*.55,e.origin-75,e.origin+75);}if(overlap(p,e))takeDamage(false,e.x);}}
function updateShots(){for(let i=shots.length-1;i>=0;i--){const q=shots[i];q.x+=q.vx;q.y+=q.vy;q.life--;if(overlap(q,p)){takeDamage(false,q.x);burst(q.x,q.y,5,'#ff9b70');shots.splice(i,1);continue;}if(q.life<=0||q.x< -40||q.x>WORLD+40||q.y<camY-80||q.y>camY+HEIGHT+70||terrain.some(f=>overlap(q,f))){shots.splice(i,1);}}for(const w of wrecks)w.age++;wrecks=wrecks.filter(w=>w.age<36);}
function updateBoss(){if(sceneIndex!==level.arena.scene||boss.hp<=0)return;boss.flash=Math.max(0,boss.flash-1);if(count()<3)return;if(boss.phase==='sleep'&&p.x>level.arena.start){boss.phase='tell';boss.timer=60;toast('O Vigia mergulha em linha reta. Espere o vermelho e esquive.',230);sound(65,.4,'triangle');}if(boss.phase==='sleep')return;boss.timer--;
if(boss.phase==='tell'){boss.y=approach(boss.y,level.arena.hoverY,4);if(boss.timer<=0){boss.phase='charge';boss.timer=48;boss.dir=Math.sign(p.x-boss.x)||-1;sound(90,.18,'sawtooth');}}
else if(boss.phase==='charge'){boss.x=clamp(boss.x+boss.dir*(boss.hp<=9?8:6.3),level.arena.min,level.arena.max);boss.y=approach(boss.y,level.arena.downY,6);if(boss.timer<=0){boss.phase='recover';boss.timer=boss.hp<=9?70:90;}}
else if(boss.phase==='recover'){boss.y=approach(boss.y,level.arena.downY,6);if(boss.timer<=0){boss.phase='tell';boss.timer=boss.hp<=9?45:60;}}
const area={x:boss.x-(boss.phase==='charge'?12:0),y:boss.y,w:boss.w+(boss.phase==='charge'?24:0),h:boss.h};if(overlap(p,area))takeDamage(false,boss.x);}
function updateLifts(){for(const lift of lifts){const phase=(tick%lift.period)/lift.period,old=lift.y;lift.y=phase<.5?lift.low-(lift.low-lift.high)*phase*2:lift.high+(lift.low-lift.high)*(phase-.5)*2;lift.dy=lift.y-old;if(p.standing===lift.id&&p.ground){p.y+=lift.dy;}}}
function nearLadder(){return level.ladders.find(l=>l.scene===sceneIndex&&Math.abs(p.x+p.w/2-l.x)<23&&p.y+p.h>=l.top-10&&p.y<=l.bottom+4);}
function updateClimb(){if(p.stun>0||p.dash>0){p.climbing=null;return false;}const up=keys.has('ArrowUp')||keys.has('KeyW'),down=keys.has('ArrowDown')||keys.has('KeyS');const l=level.ladders.find(l=>l.id===p.climbing)||nearLadder();if(!l||(!p.climbing&&!up&&!down))return false;
if(!up&&!down&&(keys.has('ArrowLeft')||keys.has('ArrowRight')||keys.has('KeyA')||keys.has('KeyD'))){p.climbing=null;return false;}p.climbing=l.id;p.x=approach(p.x,l.x-p.w/2,4);p.vx=0;p.vy=(Number(down)-Number(up))*2.8;p.y+=p.vy;p.ground=false;p.standing=null;
if(p.y+p.h<=l.top){p.y=l.top-p.h;p.ground=true;p.climbing=null;p.vy=0;}else if(p.y+p.h>=l.bottom){p.y=l.bottom-p.h;p.ground=true;p.climbing=null;p.vy=0;}return true;}
function update(){if(mode!=='playing')return;if(freeze>0){freeze--;return;}tick++;runFrames++;updateLifts();if(toastTicks>0&&--toastTicks===0)$('#toast').classList.remove('visible');for(const k of ['inv','stun','attackCool','dashCool'])p[k]=Math.max(0,p[k]-1);if(p.ground)p.coyote=6;else p.coyote=Math.max(0,p.coyote-1);
const climbing=updateClimb();
if(!climbing){
 if(p.jumpBuffer>0&&p.coyote>0&&p.stun===0&&p.dash===0){p.vy=-14.5;p.jumpBuffer=0;p.coyote=0;p.ground=false;burst(p.x+12,p.y+p.h,6,'#567990');sound(250,.1);}else p.jumpBuffer=Math.max(0,p.jumpBuffer-1);
 const move=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
 if(p.dash>0){p.vx=p.dashDir*10;p.vy=0;p.dash--;if(tick%2===0)burst(p.x+12,p.y+30,1,'#249bdf');}else{if(p.stun===0){if(move)p.face=move;p.vx=approach(p.vx,move*4.6,p.ground?.85:.48);if(!move)p.vx=approach(p.vx,0,p.ground?.8:.15);}p.vy=Math.min(15,p.vy+.64);}
 p.x=clamp(p.x+p.vx,0,WORLD-p.w);if(count()<3&&p.x+p.w>level.gate){p.x=level.gate-p.w;toast('O Terminal exige três fragmentos. Consulte a fonte, o canal e o reator.',150);}
 if(p.ground&&p.dash===0&&p.vy>=0){const feet=p.y+p.h,step=terrain.filter(f=>p.x+p.w>f.x&&p.x<f.x+f.w&&f.y<feet&&feet-f.y<=32).sort((a,b)=>a.y-b.y)[0];if(step)p.y=step.y-p.h;}
 const oldFeet=p.y+p.h;p.y+=p.vy;p.ground=false;p.standing=null;for(const f of terrain)if(p.vy>=0&&oldFeet<=f.y+.01&&p.y+p.h>=f.y&&p.x+p.w>f.x&&p.x<f.x+f.w){p.y=f.y-p.h;p.vy=0;p.ground=true;p.standing=f.kind==='lift'?f.id:null;}
}
syncScene();if(sceneFade>0)sceneFade--;
if(p.y>camY+HEIGHT+60){fall();if(mode!=='playing')return;}
p.anim+=Math.abs(p.vx)>.5?.19:.08;if(p.attackAge>=0){p.attackAge++;attack();if(mode!=='playing')return;if(p.attackAge>=32)p.attackAge=-1;}
for(const s of seals)if(!s.taken&&Math.hypot(p.x+15-s.x,p.y+32-s.y)<48){s.taken=true;saveCheckpoint(s.safe,s.safeY);p.hp=Math.min(6,p.hp+1);burst(s.x,s.y,36);sound(780,.35);toast(count()===3?'Três fragmentos. O Terminal 08 está aberto.':'Fragmento recuperado · ponto seguro ativado · +1 vida');updateHud();}
for(const h of heals)if(!h.taken&&Math.hypot(p.x+15-h.x,p.y+32-h.y)<42){h.taken=true;p.hp=Math.min(6,p.hp+1);burst(h.x,h.y,20);sound(620,.2);toast('Eco de sombra recuperado · +1 vida',120);}
for(const point of level.checkpoints)if(point.scene===sceneIndex&&p.x>=point.x&&!safeReached.has(point.x)){safeReached.add(point.x);saveCheckpoint(point.x,point.y);p.hp=Math.min(6,p.hp+1);toast(`Ponto seguro: ${point.label}`,130);}
updateEnemies();if(mode!=='playing')return;updateShots();if(mode!=='playing')return;updateBoss();if(mode!=='playing')return;
for(const q of particles){q.x+=q.vx;q.y+=q.vy;q.vy+=.06;q.life--;}particles=particles.filter(q=>q.life>0);syncScene();shake=Math.max(0,shake-.6);if(tick%12===0)updateHud();}
function glow(x,y,r,color){const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'#00000000');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);}
function scenery(){box(0,0,WIDTH,HEIGHT,'#08121e');if(cityReady){const r=scene().crop;ctx.imageSmoothingEnabled=false;ctx.drawImage(cityAtlas,r.x,r.y,r.w,r.h,0,0,WIDTH,HEIGHT);}}
function droneFrame(row,frame,x,y,size,dir=-1){if(!droneReady)return false;ctx.save();ctx.translate(x,y);ctx.scale(dir>0?-1:1,1);ctx.imageSmoothingEnabled=false;const r=atlas.drone[row*6+frame];if(r){const scale=size/225;ctx.drawImage(droneAtlas,r.x,r.y,r.w,r.h,(r.x%256-140)*scale,(r.y%256-(row===0?145:140))*scale,r.w*scale,r.h*scale);}else ctx.drawImage(droneAtlas,frame*256,row*256,256,256,-size*.62,-size*.62,size*1.14,size*1.14);ctx.restore();return true;}
function enemyArt(e,isBoss=false){let row=0,frame=Math.floor(tick/9)%6;if(e.flash>0){row=3;frame=0;}else if(isBoss&&boss.phase==='tell'){row=1;frame=clamp(Math.floor((55-boss.timer)/8),0,5);}else if(isBoss&&boss.phase==='charge'){row=2;frame=4;}else if(!isBoss&&e.wind>12){row=1;frame=clamp(Math.floor((38-e.wind)/5),0,5);}else if(!isBoss&&e.wind>0){row=2;frame=clamp(2+Math.floor((12-e.wind)/3),2,5);}const bob=isBoss?Math.sin(tick*.035)*4:0;const size=isBoss?180:64;
const ready=droneFrame(row,frame,e.x+e.w/2,e.y+e.h/2+bob,size,isBoss?boss.dir:e.dir);if(!ready){ctx.fillStyle='#243c52';ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/2,0,Math.PI*2);ctx.fill();glow(e.x+e.w/2,e.y+e.h/2,12,'#ffb45e');}if(!isBoss&&e.hp<e.maxHp){box(e.x-2,e.y-13,e.w+4,3,'#1f2d3b');box(e.x-2,e.y-13,(e.w+4)*e.hp/e.maxHp,3,'#ef9b63');}}
// Source grid remains untouched; 256px cells and feet anchors are explicit.
const feet=[248,248,248,249,248,248,244,242,246,247,247,246,247,248,248,195,238,247,236,236,236,236,236,236];
function hero(){if(p.inv>0&&tick%8<3)return;let row=0,frame=Math.floor(p.anim)%6;if(p.attackAge>=0){row=3;frame=Math.min(5,Math.floor(p.attackAge/6));}else if(!p.ground){row=2;frame=p.vy< -7?1:p.vy< -1?2:p.vy<4?3:4;}else if(Math.abs(p.vx)>.5){row=1;}if(p.dash>0){row=1;frame=2;}if(p.climbing){row=1;frame=Math.floor(tick/9)%6;}ctx.save();ctx.translate(Math.round(p.x+p.w/2),Math.round(p.y+p.h));ctx.scale(p.face,1);if(p.dash>0){ctx.globalAlpha=.45;for(let i=1;i<4;i++){if(spriteReady)ctx.drawImage(sprite,frame*256,row*256,256,256,-41-i*14,-feet[row*6+frame]*.28,71.68,71.68);}ctx.globalAlpha=1;}
if(spriteReady){ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,frame*256,row*256,256,256,-41,-feet[row*6+frame]*.28,71.68,71.68);}else{box(-12,-74,26,74,'#0b1727');box(3,-60,8,3,'#46c9ff');label('∞',0,-39,18,'#52baff','center');}
ctx.restore();if(p.attackAge>=7&&p.attackAge<=18){const alpha=p.attackAge>15?(19-p.attackAge)/4:1;ctx.save();ctx.translate(p.x+15,p.y+35);ctx.scale(p.face,1);ctx.globalAlpha=alpha;ctx.shadowColor='#199fff';ctx.shadowBlur=10;for(let i=0;i<4;i++){ctx.strokeStyle=i%2?'#2a8bd2':'#060f22';ctx.lineWidth=8-i*1.5;ctx.beginPath();ctx.moveTo(15,0);ctx.bezierCurveTo(55,-23+i*13,85,27-i*13,143,-15+i*8);ctx.stroke();}ctx.restore();}}
function draw(){ctx.save();if(shake>0&&!reducedMotion)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);scenery();ctx.save();ctx.translate(-cam,-camY);
for(const lift of lifts)if(lift.scene===sceneIndex&&cityReady){const r=lift.source;ctx.drawImage(cityAtlas,r.x,r.y,r.w,r.h,lift.x,lift.y,lift.w,16);box(lift.x,lift.y,lift.w,1,'#9bc4cf');}
for(const s of seals)if(!s.taken&&s.scene===sceneIndex){const y=s.y+Math.sin(tick*.055)*3;glow(s.x,y,27,'#1f9fff44');ctx.save();ctx.translate(s.x,y);ctx.rotate(Math.PI/4);ctx.strokeStyle='#8ee8ff';ctx.lineWidth=2;ctx.strokeRect(-8,-8,16,16);box(-2,-2,4,4,'#d1f5ff');ctx.restore();}
for(const e of enemies)if(e.hp>0&&e.scene===sceneIndex)enemyArt(e);
if(sceneIndex===level.arena.scene&&boss.hp>0){enemyArt(boss,true);if(boss.phase==='tell'){ctx.strokeStyle='#ef876a99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(boss.x+50,boss.y+50,65+Math.sin(tick*.2)*3,0,Math.PI*2);ctx.stroke();}else if(boss.phase==='recover')label('VULNERÁVEL',boss.x+50,boss.y-16,10,'#81d9f4','center');}
for(const w of wrecks)droneFrame(3,Math.min(5,Math.floor(w.age/6)),w.x,w.y,w.size);
for(const q of shots){glow(q.x+5,q.y+5,13,'#ff74455e');box(q.x,q.y,8,8,'#e97c5d');box(q.x+2,q.y+2,3,3,'#ffe6ac');}
for(const h of heals)if(!h.taken&&h.scene===sceneIndex){glow(h.x,h.y,17,'#44baff33');label('∞',h.x,h.y+5,18,'#8cdfff','center');}
hero();for(const q of particles)box(q.x,q.y,2,2,q.color);
const l=nearLadder();if(l&&mode==='playing')label('↑ / ↓',l.x,p.y-13,11,'#b9e6f5','center');
if(debugGeometry){ctx.strokeStyle='#49ffb7';ctx.lineWidth=2;for(const f of terrain)if(f.scene===sceneIndex){ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+f.w,f.y);ctx.stroke();}ctx.strokeStyle='#ffce5c';for(const l of level.ladders)if(l.scene===sceneIndex)ctx.strokeRect(l.x-12,l.top,24,l.bottom-l.top);}
ctx.restore();ctx.restore();
if(sceneFade>0&&!reducedMotion)box(0,0,WIDTH,HEIGHT,`rgba(3,8,14,${sceneFade/15})`);
if(mode!=='title'){box(19,18,200,49,'#07121bc9');label('SHADOWMAN',30,35,9,'#c2d6df');for(let i=0;i<6;i++)box(30+i*29,47,23,6,i<p.hp?'#61c7eb':'#294250');label('∞',240,43,22,p.dashCool===0?'#78d7ff':'#36566b');
if(sceneIndex===5&&boss.phase!=='sleep'&&boss.hp>0){box(815,18,365,44,'#07121bcc');label('O VIGIA DO TERMINAL',828,34,10,'#d2a49a');box(828,45,337,5,'#362c37');box(828,45,337*boss.hp/boss.maxHp,5,'#cd7c84');}}
}
const accepted=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyS','KeyA','KeyD','KeyW','Space','KeyJ','KeyK','KeyP','Escape']);
window.addEventListener('keydown',e=>{if(!accepted.has(e.code))return;const target=e.target;if(target&&/INPUT|TEXTAREA|SELECT/.test(target.tagName))return;e.preventDefault();keys.add(e.code);if(!e.repeat){if((mode==='title'||mode==='dead'||mode==='won')&&e.code==='Space'){$('#play').click();return;}command(e.code);}});
window.addEventListener('keyup',e=>release(e.code));window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);b.classList.add('pressed');command(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{release(b.dataset.key);b.classList.remove('pressed');});}
$('#play').onclick=()=>{if(mode==='paused')pause();else if(mode==='dead')respawn();else start();};$('#restart').onclick=start;$('#pause').onclick=pause;
$('#sound').onclick=()=>{muted=!muted;$('#sound').textContent=muted?'SOM OFF':'SOM ON';$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');sound(460,.2);};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#cabinet').requestFullscreen();}catch{toast('Tela cheia indisponível neste navegador.');}};
function frame(now){const elapsed=last?Math.min(50,now-last):STEP;last=now;if(!manual){acc+=elapsed;while(acc>=STEP){update();acc-=STEP;}}draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
// Explicit opt-in test bridge; absent during ordinary play.
if(new URLSearchParams(location.search).has('test'))window.__shadowman={start,pause,command,release,update,draw,fall,damage:takeDamage,keys,terrain,get p(){return p;},get boss(){return boss;},get seals(){return seals;},get enemies(){return enemies;},get mode(){return mode;},get spriteReady(){return spriteReady;},get cityReady(){return cityReady;},get droneReady(){return droneReady;},get shots(){return shots;},get wrecks(){return wrecks;},get lifts(){return lifts;},get heals(){return heals;},level,updateLifts,fireDrone,updateShots,get scene(){return scene();},set debugGeometry(v){debugGeometry=v;},snapCamera(){syncScene(true);},enterScene(i){const a=level.scenes[i];p.x=a.start+24;p.y=a.entryY-p.h;p.vx=0;p.vy=0;p.ground=true;syncScene(true);updateHud();},set manual(value){manual=value;},step(n=1){for(let i=0;i<n;i++)update();},snapshot:()=>({mode,p:{...p,hitTargets:[...p.hitTargets]},boss:{...boss},seals:seals.map(s=>({...s})),checkpoint:{...checkpoint},cam,camY,scene:sceneIndex,tick,runFrames,shots:shots.map(q=>({...q})),wrecks:wrecks.map(q=>({...q}))})};
})();
