/* Shadowman / Senna Comics. Fixed 60 Hz simulation; rendering and input stay separate. */
(()=>{'use strict';
const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
const WIDTH=1200,HEIGHT=600,WORLD=4000,GROUND=500,STEP=1000/60;
const keys=new Set(),reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sprite=new Image();sprite.src='assets/shadowman.png';
const cityAtlas=new Image();cityAtlas.src='assets/city-atlas.png';
const droneAtlas=new Image();droneAtlas.src='assets/drone-atlas.png';
const atlas=window.SHADOWMAN_ASSETS||{city:{},drone:[]};
let cityReady=false,droneReady=false,loadedAssets=0;
function loadedAsset(){loadedAssets++;$('#load-status').textContent=loadedAssets===3?'← → MOVER · ESPAÇO SALTAR · J SOMBRAS · K ESQUIVAR':`CARREGANDO ARTE ${loadedAssets} / 3`;}
cityAtlas.onload=()=>{cityReady=true;loadedAsset();};droneAtlas.onload=()=>{droneReady=true;loadedAsset();};
let spriteReady=false;
sprite.onload=()=>{spriteReady=true;loadedAsset();};
sprite.onerror=()=>{$('#load-status').textContent='Arte indisponível. O modo de silhueta continua jogável.';};
let mode='title',p,boss,enemies,seals,particles=[],tick=0,cam=0,shake=0,freeze=0,toastTicks=0,checkpoint,runFrames=0;
let last=0,acc=0,muted=true,audio=null,manual=false;
let shots=[],wrecks=[];
const terrain=[
 {x:0,y:500,w:880,h:100},{x:990,y:500,w:910,h:100},{x:2050,y:500,w:1950,h:100},
 {x:340,y:405,w:210,h:25},{x:610,y:315,w:210,h:25},
 {x:1210,y:410,w:210,h:25},{x:1480,y:325,w:240,h:25},
 {x:2210,y:405,w:190,h:25},{x:2460,y:310,w:240,h:25},{x:2820,y:400,w:210,h:25}
];
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
function makePlayer(x=80){return{x,y:GROUND-74,w:30,h:74,vx:0,vy:0,face:1,hp:6,ground:false,coyote:0,jumpBuffer:0,inv:0,attackAge:-1,attackCool:0,hitTargets:new Set(),dash:0,dashCool:0,dashDir:1,stun:0,anim:0};}
function makeBoss(){return{id:'boss',x:3590,y:GROUND-110,w:76,h:80,hp:18,maxHp:18,phase:'sleep',timer:0,dir:-1,stun:0,flash:0};}
function reset(){p=makePlayer();boss=makeBoss();enemies=[790,1360,1820,2330,2910].map((x,i)=>({id:`drone-${i}`,x,y:GROUND-74,baseY:GROUND-74,w:44,h:44,hp:3,maxHp:3,origin:x,dir:-1,stun:0,flash:0,wind:0,cool:65+i*17,shotDir:{x:-1,y:0}}));seals=[{x:715,y:280,taken:false,safe:680},{x:1600,y:290,taken:false,safe:1530},{x:2580,y:275,taken:false,safe:2540}];particles=[];shots=[];wrecks=[];cam=0;tick=0;runFrames=0;freeze=0;shake=0;checkpoint={x:80};toastTicks=0;$('#toast').classList.remove('visible');updateHud();}
function updateHud(){const n=count();$('#fragments').textContent=`FRAGMENTOS ${n} / 3`;$('#objective').textContent=n===3?'ENFRENTE O VIGIA NO TERMINAL 08':'ENCONTRE OS FRAGMENTOS NOS TELHADOS';$('#zone').textContent=p.x>3140?'TERMINAL 08':p.x>1950?'PONTE DOS ECOS':'DISTRITO DAS DOCAS';}
function overlay(kicker,title,text,button,restart=false){$('#overlay').hidden=false;$('#overlay-kicker').textContent=kicker;$('#overlay-title').textContent=title;$('#overlay-text').innerHTML=text;$('#play').textContent=button;$('#restart').hidden=!restart;}
function start(){reset();mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});toast('Encontre os fragmentos azuis nos telhados.');}
function pause(){if(mode==='playing'){mode='paused';clearInput();overlay('A CIDADE PODE ESPERAR','Entre dois mundos.','Sua jornada está pausada.','CONTINUAR →',true);}else if(mode==='paused'){mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});}$('#pause').textContent=mode==='paused'?'▶':'II';}
function finish(won){mode=won?'won':'dead';clearInput();$('#toast').classList.remove('visible');if(won){sound(720,.6,'triangle');overlay('CAPÍTULO 01 CONCLUÍDO','As sombras obedecem.',`O Terminal 08 está livre.<br>Três fragmentos. Um guardião. Uma cidade que ainda guarda segredos.<br>Tempo de jogo: ${Math.floor(runFrames/3600)} min ${Math.floor(runFrames/60)%60} s.`,'JOGAR NOVAMENTE →');}else overlay('A NOITE AINDA NÃO TERMINOU','Erga-se, Shadowman.',count()?'Os fragmentos recuperados continuam com você.<br>Retorne ao último ponto seguro.':'Respire. Observe os sinais. Tente outra vez.','TENTAR NOVAMENTE →',true);}
function respawn(){p=makePlayer(checkpoint.x);p.inv=90;boss=makeBoss();freeze=0;shake=0;particles=[];shots=[];wrecks=[];mode='playing';clearInput();$('#overlay').hidden=true;canvas.focus({preventScroll:true});toast('De volta às sombras.');}
function takeDamage(environment=false,fromX=p.x-1){if(mode!=='playing'||(!environment&&(p.inv>0||p.dash>0)))return false;p.hp--;p.inv=70;p.stun=15;p.vx=Math.sign(p.x-fromX||1)*5;p.vy=-5;p.dash=0;p.attackAge=-1;shake=reducedMotion?0:8;burst(p.x+15,p.y+30,18,'#75cfff');sound(90,.2,'sawtooth');if(p.hp<=0)finish(false);return true;}
function fall(){takeDamage(true);if(mode!=='playing')return;p.x=checkpoint.x;p.y=GROUND-p.h;p.vx=0;p.vy=0;p.stun=0;p.inv=90;p.ground=true;p.coyote=6;p.dash=0;toast('A sombra o trouxe de volta. Cuidado com os canais.',150);}
function command(code){if(code==='KeyP'||code==='Escape'){pause();return;}if(mode!=='playing')return;if(code==='Space'||code==='ArrowUp'||code==='KeyW')p.jumpBuffer=8;if(code==='KeyJ'&&p.attackCool<=0&&p.dash<=0&&p.stun<=0){p.attackAge=0;p.attackCool=32;p.hitTargets.clear();sound(170,.16,'triangle');}if(code==='KeyK'&&p.dashCool<=0&&p.stun<=0){p.dash=14;p.dashCool=65;p.dashDir=p.face;p.attackAge=-1;p.vy=0;burst(p.x,p.y+40,8);sound(430,.16);}}
function release(code){keys.delete(code);if(['Space','ArrowUp','KeyW'].includes(code)&&p.vy< -5)p.vy*=.5;}
function terrainUnder(x,w=30){return terrain.some(f=>f.y===GROUND&&x>=f.x&&x+w<=f.x+f.w);}
function attack(){if(p.attackAge<7||p.attackAge>15)return;const area={x:p.face>0?p.x+p.w-4:p.x-124,y:p.y+8,w:128,h:64};for(const e of [...enemies,boss]){if(e.hp<=0||p.hitTargets.has(e.id)||(e===boss&&boss.phase==='sleep')||!overlap(area,e))continue;p.hitTargets.add(e.id);e.hp--;e.flash=10;e.stun=16;if(e!==boss){const next=e.x+p.face*15;if(terrainUnder(next,e.w))e.x=next;if(e.hp===0){wrecks.push({x:e.x+e.w/2,y:e.y+e.h/2,age:0,size:90});burst(e.x+22,e.y+22,24,'#ffb35e');}}burst(e.x+e.w/2,e.y+30,20);sound(110,.13,'square',.017);freeze=3;shake=reducedMotion?0:4;if(e===boss&&e.hp<=0){burst(e.x+25,e.y+40,70);finish(true);return;}}}
function fireDrone(e){if(shots.length>=20)return;const aim=e.shotDir||{x:-1,y:0};shots.push({x:e.x+e.w/2+aim.x*25,y:e.y+e.h/2+aim.y*25,w:10,h:10,vx:aim.x*3.9,vy:aim.y*3.9,life:155});burst(e.x+22,e.y+22,5,'#ff986e');sound(310,.13,'triangle',.018);}
function updateEnemies(){for(const e of enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-1);e.stun=Math.max(0,e.stun-1);e.cool=Math.max(0,e.cool-1);if(e.stun>0)continue;e.y=e.baseY+Math.sin(tick*.045+e.origin)*5;const dx=p.x+15-(e.x+22),dy=p.y+38-(e.y+22);
if(e.wind>0){e.wind--;if(e.wind===12)fireDrone(e);}else if(Math.abs(dx)<335&&Math.abs(dy)<125&&e.cool===0){e.wind=38;e.cool=155;e.dir=Math.sign(dx)||-1;const distance=Math.max(1,Math.hypot(dx,dy));e.shotDir={x:dx/distance,y:dy/distance};}else{if(e.x<=e.origin-75)e.dir=1;else if(e.x>=e.origin+75)e.dir=-1;e.x=clamp(e.x+e.dir*.55,e.origin-75,e.origin+75);}if(overlap(p,e))takeDamage(false,e.x);}}
function updateShots(){for(let i=shots.length-1;i>=0;i--){const q=shots[i];q.x+=q.vx;q.y+=q.vy;q.life--;if(overlap(q,p)){takeDamage(false,q.x);burst(q.x,q.y,5,'#ff9b70');shots.splice(i,1);continue;}if(q.life<=0||q.x< -40||q.x>WORLD+40||q.y< -80||q.y>HEIGHT+70||terrain.some(f=>overlap(q,f))){shots.splice(i,1);}}for(const w of wrecks)w.age++;wrecks=wrecks.filter(w=>w.age<36);}
function updateBoss(){if(boss.hp<=0)return;boss.flash=Math.max(0,boss.flash-1);if(count()<3)return;if(boss.phase==='sleep'&&p.x>3230){boss.phase='tell';boss.timer=55;toast('O Vigia avança em linha reta. Espere o vermelho e esquive.',230);sound(65,.4,'triangle');}if(boss.phase==='sleep')return;boss.timer--;if(boss.phase==='tell'&&boss.timer<=0){boss.phase='charge';boss.timer=36;boss.dir=Math.sign(p.x-boss.x)||-1;sound(90,.18,'sawtooth');}else if(boss.phase==='charge'){boss.x=clamp(boss.x+boss.dir*(boss.hp<=9?8:6.3),3240,3910);if(boss.timer<=0){boss.phase='recover';boss.timer=boss.hp<=9?62:82;}}else if(boss.phase==='recover'&&boss.timer<=0){boss.phase='tell';boss.timer=boss.hp<=9?40:55;}
const area={x:boss.x-(boss.phase==='charge'?15:0),y:boss.y,w:boss.w+(boss.phase==='charge'?30:0),h:boss.h};if(overlap(p,area))takeDamage(false,boss.x);}
function update(){if(mode!=='playing')return;if(freeze>0){freeze--;return;}tick++;runFrames++;if(toastTicks>0&&--toastTicks===0)$('#toast').classList.remove('visible');for(const k of ['inv','stun','attackCool','dashCool'])p[k]=Math.max(0,p[k]-1);if(p.ground)p.coyote=6;else p.coyote=Math.max(0,p.coyote-1);
if(p.jumpBuffer>0&&p.coyote>0&&p.stun===0&&p.dash===0){p.vy=-13.8;p.jumpBuffer=0;p.coyote=0;p.ground=false;burst(p.x+15,p.y+p.h,6,'#567990');sound(250,.1);}else p.jumpBuffer=Math.max(0,p.jumpBuffer-1);
const move=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
if(p.dash>0){p.vx=p.dashDir*10;p.vy=0;p.dash--;if(tick%2===0)burst(p.x+15,p.y+40,1,'#249bdf');}else{if(p.stun===0){if(move)p.face=move;p.vx=approach(p.vx,move*4.6,p.ground?.85:.48);if(!move)p.vx=approach(p.vx,0,p.ground?.8:.15);}p.vy=Math.min(15,p.vy+.64);}
p.x=clamp(p.x+p.vx,0,WORLD-p.w);if(count()<3&&p.x+p.w>3150)p.x=3150-p.w;
const oldFeet=p.y+p.h;p.y+=p.vy;p.ground=false;for(const f of terrain)if(p.vy>=0&&oldFeet<=f.y+.01&&p.y+p.h>=f.y&&p.x+p.w>f.x&&p.x<f.x+f.w){p.y=f.y-p.h;p.vy=0;p.ground=true;}
if(p.y>HEIGHT+60){fall();if(mode!=='playing')return;}
p.anim+=Math.abs(p.vx)>.5?.19:.08;if(p.attackAge>=0){p.attackAge++;attack();if(mode!=='playing')return;if(p.attackAge>=32)p.attackAge=-1;}
for(const s of seals)if(!s.taken&&Math.hypot(p.x+15-s.x,p.y+32-s.y)<48){s.taken=true;checkpoint={x:s.safe};p.hp=Math.min(6,p.hp+1);burst(s.x,s.y,36);sound(780,.35);toast(count()===3?'Três fragmentos. O Terminal 08 está aberto.':'Fragmento recuperado · ponto seguro ativado · +1 vida');updateHud();}
updateEnemies();if(mode!=='playing')return;updateShots();if(mode!=='playing')return;updateBoss();if(mode!=='playing')return;
for(const q of particles){q.x+=q.vx;q.y+=q.vy;q.vy+=.06;q.life--;}particles=particles.filter(q=>q.life>0);cam=approach(cam,clamp(p.x-WIDTH*.35,0,WORLD-WIDTH),Math.max(2,Math.abs(p.vx)+1));shake=Math.max(0,shake-.6);if(tick%12===0)updateHud();}
// Static skyline layers are cached once rather than rebuilt every animation frame.
function makeLayer(width,height,paint){const layer=document.createElement('canvas');layer.width=width;layer.height=height;paint(layer.getContext('2d'));return layer;}
let rng=9408;function rand(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;}
const skyline=makeLayer(1800,440,g=>{for(let x=-20;x<1800;x+=38+rand()*34){const w=30+rand()*55,h=80+rand()*260,y=430-h;g.fillStyle='#0b1b2b';g.fillRect(x,y,w,h);g.beginPath();g.moveTo(x-4,y);g.lineTo(x+w/2,y-20-rand()*45);g.lineTo(x+w+4,y);g.fill();g.fillRect(x+w/2-1,y-60,2,60);for(let wy=y+15;wy<426;wy+=14)for(let wx=x+7;wx<x+w-6;wx+=10)if(rand()>.37){g.fillStyle=rand()>.7?'#d6a760':'#80633b';g.fillRect(wx,wy,2,5);}}});
const bridge=makeLayer(1700,240,g=>{g.strokeStyle='#132536';g.lineWidth=6;g.fillStyle='#0d1c2a';g.fillRect(0,130,1700,14);for(let x=70;x<1700;x+=240){g.fillRect(x,67,14,165);g.fillRect(x-7,60,28,10);g.beginPath();g.moveTo(x-240,75);g.quadraticCurveTo(x-120,150,x,75);g.stroke();for(let i=0;i<12;i++){const xx=x-i*20;g.fillRect(xx,108,2,23);}g.fillStyle='#b98e51';g.fillRect(x+4,48,4,8);g.fillStyle='#0d1c2a';}});
function arch(x,y,w,h,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill();}
function glow(x,y,r,color){const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'#00000000');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);}
function scenery(){const sky=ctx.createLinearGradient(0,0,0,HEIGHT);sky.addColorStop(0,'#081323');sky.addColorStop(.65,'#1c3950');sky.addColorStop(1,'#102636');ctx.fillStyle=sky;ctx.fillRect(0,0,WIDTH,HEIGHT);
glow(850-cam*.025,90,145,'#527e9c25');ctx.fillStyle='#bacdd666';ctx.beginPath();ctx.arc(850-cam*.025,85,30,0,Math.PI*2);ctx.fill();for(let i=0;i<35;i++)box((i*103.7-cam*.03+WIDTH*2)%WIDTH,20+(i*67)%220,1,1,'#c2d8e866');
ctx.drawImage(skyline,-cam*.13,-20);ctx.drawImage(skyline,1800-cam*.13,-20);
// A needle-shaped landmark anchors the skyline to the comic cover.
const spire=940-cam*.07;box(spire,100,61,330,'#15283b');box(spire+13,56,35,350,'#162c40');box(spire+24,16,13,390,'#152638');box(spire+29,0,2,65,'#96805c');for(let y=70;y<410;y+=18){box(spire+21,y,3,8,'#c69852');box(spire+38,y+5,3,7,'#b98a48');}glow(spire+29,300,120,'#e5a34812');
box(0,420,WIDTH,180,'#102938');for(let i=0;i<65;i++){const x=(i*139-cam*.16+WIDTH*3)%WIDTH,y=432+(i*37)%160;box(x,y,5+(i*13)%43,1,'#b7955544');}ctx.drawImage(bridge,-cam*.23,250);ctx.drawImage(bridge,1700-cam*.23,250);
ctx.save();ctx.translate(-cam,0);
if(cityReady){
 for(let i=0;i<16;i++){const x=i*290-40,y=338+(i%3)*31;if(x+270<cam||x>cam+WIDTH)continue;ctx.save();ctx.globalAlpha=.62;for(let dx=0;dx<270;dx+=90)for(let dy=0;dy<210;dy+=105)cityPiece((i+dx/90)%3===0?'wall':'window',x+dx,y+dy,90,105);cityPiece('roof-middle',x,y-35,270,60);if(i%3===1)cityPiece('water-tank',x+130,y-142,78,90);else if(i%3===0)cityPiece('chimney',x+44,y-100,70,75);ctx.restore();}
 for(let x=100;x<WORLD;x+=540){ctx.save();ctx.globalAlpha=.3;cityPiece('bridge-support',x,370,210,165);ctx.restore();}
}
for(const f of terrain){if(f.x+f.w<cam||f.x>cam+WIDTH)continue;box(f.x,f.y,f.w,f.h,'#111e2a');
 if(cityReady){
  ctx.save();ctx.beginPath();ctx.rect(f.x,f.y,f.w,HEIGHT-f.y);ctx.clip();
  if(f.h<40){for(let x=f.x;x<f.x+f.w;x+=87)cityPiece('double-window',x,f.y+25,87,102);}
  else for(let x=f.x;x<f.x+f.w;x+=100)cityPiece('wall',x,f.y+15,100,116);
  for(let x=f.x;x<f.x+f.w;x+=125)cityPiece('roof-middle',x,f.y,125,70);
  ctx.restore();
  if(f.h<40){cityPiece('railing',f.x+8,f.y-29,f.w-16,31);if(f.x===340||f.x===2210)cityPiece('pipe',f.x+f.w-18,f.y+34,35,75);}
 }else{box(f.x,f.y,f.w,4,'#6595a7');box(f.x,f.y+4,f.w,12,'#344b5a');}
 // A restrained highlight marks the actual collision surface even on dark roofs.
 box(f.x,f.y,f.w,2,'#7aa5ad');
}
for(const x of [180,1090,2110,2810,3280,3840]){if(cityReady)cityPiece('lamp',x-19,GROUND-101,43,101);else{box(x,GROUND-72,3,72,'#52606a');box(x-5,GROUND-80,13,12,'#e0b76b');}glow(x+3,GROUND-74,45,'#efb84b22');}
if(cityReady){cityPiece('gargoyle',250,GROUND-58,70,58);cityPiece('crate',1090,GROUND-38,44,38);cityPiece('bollard',1850,GROUND-31,47,31);cityPiece('crate',2780,GROUND-40,46,40);cityPiece('water-tank',2880,268,80,88);for(const x of [870,1890])cityPiece('chain',x-9,GROUND-16,x===870?135:175,38);}
// Canal warning chains make the walkable gaps readable.
for(const x of [880,1900]){box(x-5,GROUND-26,4,26,'#70818a');box(x+(x===880?110:150),GROUND-26,4,26,'#70818a');}
if(cityReady){cityPiece('tunnel',3470,263,210,237);cityPiece('door',3700,355,125,145);cityPiece('rift',3430,360,45,110);}else{arch(3470,265,210,235,'#07111d');}box(3464,257,223,10,'#344858');label('TERMINAL 08',3576,247,17,'#c4ad82','center');for(let x=3490;x<3670;x+=25)box(x,310,4,190,'#1d3141');
if(count()<3){for(let x=3150;x<3170;x+=7)box(x,220,3,280,'#58b5e077');glow(3160,380,50,'#168fff18');label('3 FRAGMENTOS',3158,206,10,'#79bad9','center');}
ctx.restore();}
function cityPiece(name,x,y,w,h,g=ctx){const r=atlas.city[name];if(!cityReady||!r)return;g.drawImage(cityAtlas,r.x,r.y,r.w,r.h,Math.round(x),Math.round(y),w,h);}
function droneFrame(row,frame,x,y,size,dir=-1){if(!droneReady)return false;ctx.save();ctx.translate(x,y);ctx.scale(dir>0?-1:1,1);ctx.imageSmoothingEnabled=false;const r=atlas.drone[row*6+frame];if(r){const scale=size/225;ctx.drawImage(droneAtlas,r.x,r.y,r.w,r.h,(r.x%256-140)*scale,(r.y%256-(row===0?145:140))*scale,r.w*scale,r.h*scale);}else ctx.drawImage(droneAtlas,frame*256,row*256,256,256,-size*.62,-size*.62,size*1.14,size*1.14);ctx.restore();return true;}
function enemyArt(e,isBoss=false){let row=0,frame=Math.floor(tick/9)%6;if(e.flash>0){row=3;frame=0;}else if(isBoss&&boss.phase==='tell'){row=1;frame=clamp(Math.floor((55-boss.timer)/8),0,5);}else if(isBoss&&boss.phase==='charge'){row=2;frame=4;}else if(!isBoss&&e.wind>12){row=1;frame=clamp(Math.floor((38-e.wind)/5),0,5);}else if(!isBoss&&e.wind>0){row=2;frame=clamp(2+Math.floor((12-e.wind)/3),2,5);}const bob=isBoss?Math.sin(tick*.035)*4:0;const size=isBoss?125:76;
const ready=droneFrame(row,frame,e.x+e.w/2,e.y+e.h/2+bob,size,isBoss?boss.dir:e.dir);if(!ready){ctx.fillStyle='#243c52';ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,e.w/2,0,Math.PI*2);ctx.fill();glow(e.x+e.w/2,e.y+e.h/2,12,'#ffb45e');}if(!isBoss&&e.hp<e.maxHp){box(e.x-2,e.y-13,e.w+4,3,'#1f2d3b');box(e.x-2,e.y-13,(e.w+4)*e.hp/e.maxHp,3,'#ef9b63');}}
// Source grid remains untouched; 256px cells and feet anchors are explicit.
const feet=[248,248,248,249,248,248,244,242,246,247,247,246,247,248,248,195,238,247,236,236,236,236,236,236];
function hero(){if(p.inv>0&&tick%8<3)return;let row=0,frame=Math.floor(p.anim)%6;if(p.attackAge>=0){row=3;frame=Math.min(5,Math.floor(p.attackAge/6));}else if(!p.ground){row=2;frame=p.vy< -7?1:p.vy< -1?2:p.vy<4?3:4;}else if(Math.abs(p.vx)>.5){row=1;}if(p.dash>0){row=1;frame=2;}ctx.save();ctx.translate(Math.round(p.x+p.w/2),Math.round(p.y+p.h));ctx.scale(p.face,1);if(p.dash>0){ctx.globalAlpha=.45;for(let i=1;i<4;i++){if(spriteReady)ctx.drawImage(sprite,frame*256,row*256,256,256,-56-i*14,-feet[row*6+frame]*.38,97.28,97.28);}ctx.globalAlpha=1;}
if(spriteReady){ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,frame*256,row*256,256,256,-56,-feet[row*6+frame]*.38,97.28,97.28);}else{box(-12,-74,26,74,'#0b1727');box(3,-60,8,3,'#46c9ff');label('∞',0,-39,18,'#52baff','center');}
ctx.restore();if(p.attackAge>=7&&p.attackAge<=18){const alpha=p.attackAge>15?(19-p.attackAge)/4:1;ctx.save();ctx.translate(p.x+15,p.y+35);ctx.scale(p.face,1);ctx.globalAlpha=alpha;ctx.shadowColor='#199fff';ctx.shadowBlur=10;for(let i=0;i<4;i++){ctx.strokeStyle=i%2?'#2a8bd2':'#060f22';ctx.lineWidth=8-i*1.5;ctx.beginPath();ctx.moveTo(15,0);ctx.bezierCurveTo(55,-23+i*13,85,27-i*13,143,-15+i*8);ctx.stroke();}ctx.restore();}}
function draw(){ctx.save();if(shake>0&&!reducedMotion)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);scenery();ctx.save();ctx.translate(-cam,0);for(const s of seals)if(!s.taken){const y=s.y+Math.sin(tick*.055)*4;glow(s.x,y,32,'#1f9fff33');ctx.save();ctx.translate(s.x,y);ctx.rotate(Math.PI/4);ctx.strokeStyle='#8ee8ff';ctx.lineWidth=2;ctx.strokeRect(-10,-10,20,20);box(-3,-3,6,6,'#d1f5ff');ctx.restore();}
for(const e of enemies)if(e.hp>0){enemyArt(e);if(e.wind>9){ctx.strokeStyle='#de7999aa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x+15,e.y+22,31,-1.4,1.4);ctx.stroke();}}
if(boss.hp>0){enemyArt(boss,true);if(boss.phase==='tell'){ctx.strokeStyle='#ee846d99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(boss.x+28,boss.y+45,67+Math.sin(tick*.2)*3,0,Math.PI*2);ctx.stroke();glow(boss.x+28,boss.y+45,90,'#f15b4322');}else if(boss.phase==='recover'){label('VULNERÁVEL',boss.x+28,boss.y-19,10,'#81d9f4','center');}}
for(const w of wrecks)droneFrame(3,Math.min(5,Math.floor(w.age/6)),w.x,w.y,w.size);for(const q of shots){glow(q.x+5,q.y+5,15,'#ff74455e');box(q.x,q.y,10,10,'#e97c5d');box(q.x+3,q.y+3,4,4,'#ffe6ac');}hero();for(const q of particles)box(q.x,q.y,2,2,q.color);ctx.restore();
if(!reducedMotion){ctx.strokeStyle='#81acc81c';ctx.lineWidth=1;for(let i=0;i<45;i++){const x=(i*137+tick*2.8)%WIDTH,y=(i*83+tick*9)%HEIGHT;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+13);ctx.stroke();}}
const fog=ctx.createLinearGradient(0,520,0,600);fog.addColorStop(0,'#0a192400');fog.addColorStop(1,'#081321cc');ctx.fillStyle=fog;ctx.fillRect(0,520,WIDTH,80);ctx.restore();
if(mode!=='title'){box(24,22,239,62,'#081321d9');label('SHADOWMAN',38,43,10,'#adc7da');for(let i=0;i<6;i++)box(38+i*35,56,29,7,i<p.hp?'#55bfe9':'#263c4f');label('∞',279,53,27,p.dashCool===0?'#78d7ff':'#36566b');box(272,64,32*(1-p.dashCool/65),2,'#46a3cd');if(boss.phase!=='sleep'&&boss.hp>0){box(760,22,412,55,'#081321d9');label('O VIGIA DO TERMINAL',775,42,11,'#d2a49a');box(775,55,382,5,'#362c37');box(775,55,382*boss.hp/boss.maxHp,5,'#cd7c84');}}
}
const accepted=new Set(['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','Space','KeyJ','KeyK','KeyP','Escape']);
window.addEventListener('keydown',e=>{if(!accepted.has(e.code))return;const target=e.target;if(target&&/INPUT|TEXTAREA|SELECT/.test(target.tagName))return;e.preventDefault();keys.add(e.code);if(!e.repeat){if((mode==='title'||mode==='dead'||mode==='won')&&e.code==='Space'){$('#play').click();return;}command(e.code);}});
window.addEventListener('keyup',e=>release(e.code));window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);b.classList.add('pressed');command(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{release(b.dataset.key);b.classList.remove('pressed');});}
$('#play').onclick=()=>{if(mode==='paused')pause();else if(mode==='dead')respawn();else start();};$('#restart').onclick=start;$('#pause').onclick=pause;
$('#sound').onclick=()=>{muted=!muted;$('#sound').textContent=muted?'SOM OFF':'SOM ON';$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');sound(460,.2);};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#cabinet').requestFullscreen();}catch{toast('Tela cheia indisponível neste navegador.');}};
function frame(now){const elapsed=last?Math.min(50,now-last):STEP;last=now;if(!manual){acc+=elapsed;while(acc>=STEP){update();acc-=STEP;}}draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
// Explicit opt-in test bridge; absent during ordinary play.
if(new URLSearchParams(location.search).has('test'))window.__shadowman={start,pause,command,release,update,draw,fall,damage:takeDamage,keys,terrain,get p(){return p;},get boss(){return boss;},get seals(){return seals;},get enemies(){return enemies;},get mode(){return mode;},get spriteReady(){return spriteReady;},get cityReady(){return cityReady;},get droneReady(){return droneReady;},get shots(){return shots;},get wrecks(){return wrecks;},fireDrone,updateShots,set manual(value){manual=value;},step(n=1){for(let i=0;i<n;i++)update();},snapshot:()=>({mode,p:{...p,hitTargets:[...p.hitTargets]},boss:{...boss},seals:seals.map(s=>({...s})),checkpoint:{...checkpoint},cam,tick,runFrames,shots:shots.map(q=>({...q})),wrecks:wrecks.map(q=>({...q}))})};
})();
