/* Source coordinates were traced over the approved storyboard, not reconstructed from generic tiles. */
(()=>{
 const W=1200,H=600,NW=724,NH=362;
 const crops=[{x:6,y:4,w:708,h:342},{x:736,y:4,w:670,h:342},{x:1426,y:4,w:741,h:342},{x:7,y:369,w:723,h:348},{x:751,y:369,w:641,h:348},{x:1414,y:369,w:751,h:348}];
 const titles=['CAIS DAS SOMBRAS','RUA DOS LAMPIÕES','TELHADOS DO RELÓGIO','PONTE DOS ECOS','PÁTIO DAS MÁQUINAS','TERMINAL 08'];
 const tips=['Atravesse o cais e suba pela escadaria à direita.','O primeiro fragmento brilha junto à fonte.','Siga os telhados até o vale e volte a subir à direita.','Use ↑ / ↓ na escada para alcançar o fragmento sob a ponte.','Desça até o reator. O elevador e as escadas ligam os andares.','O Vigia mergulha após o sinal vermelho. Ataque quando ele pousar.'];
 const entry=[241,290,130,124,195,296],exit=[162,305,233,124,290,296];
 const scenes=crops.map((crop,i)=>({id:i+1,name:titles[i],start:i*W,end:(i+1)*W,crop,offsetY:0,tip:tips[i]}));
 const lx=(i,x)=>(i%3*NW+x-crops[i].x)/crops[i].w*W;
 const ly=(i,y)=>(Math.floor(i/3)*NH+y-crops[i].y)/crops[i].h*H;
 for(let i=0;i<6;i++){scenes[i].offsetY=i?scenes[i-1].exitY-ly(i,entry[i]):0;scenes[i].entryY=scenes[i].offsetY+ly(i,entry[i]);scenes[i].exitY=scenes[i].offsetY+ly(i,exit[i]);}
 const point=(i,x,y)=>({x:scenes[i].start+lx(i,x),y:scenes[i].offsetY+ly(i,y)});
 const terrain=[],ladders=[],lifts=[];
 function flat(i,id,x1,x2,y,kind='surface'){const a=point(i,x1,y),b=point(i,x2,y);terrain.push({id,x:a.x,y:a.y,w:b.x-a.x,h:12,kind,scene:i,trace:[x1,y,x2,y]});}
 function slope(i,id,x1,y1,x2,y2){const n=Math.max(Math.ceil((x2-x1)/6),Math.ceil(Math.abs(y2-y1)/8));for(let k=0;k<n;k++){const a=x1+(x2-x1)*k/n,b=x1+(x2-x1)*(k+1)/n;flat(i,id+'-'+k,a,b+.25,y1+(y2-y1)*(k+.5)/n,'step');}}
 function ladder(i,id,x,top,bottom){const a=point(i,x,top),b=point(i,x,bottom);ladders.push({id,scene:i,x:a.x,top:a.y,bottom:b.y});}
 // Cais: the quay and pier are continuous in the artwork. The right stair has two flights.
 flat(0,'quay',6,120,241);flat(0,'quay-low',120,245,258);flat(0,'pier',245,555,248);slope(0,'dock-stair',550,248,665,162);flat(0,'dock-exit',665,714,162);
 slope(0,'dock-upper-stair',600,122,665,162);flat(0,'upper-balcony',540,600,122);slope(0,'warehouse-left-roof',388,123,440,82);slope(0,'warehouse-right-roof',440,82,540,120);
 // Ruas: the fountain stays on the lower street; the balcony is an optional route.
 flat(1,'street-left',12,125,290);flat(1,'fountain-street',125,682,305);slope(1,'street-stair',470,222,535,305);flat(1,'street-landing',410,470,222);flat(1,'upper-arcade',250,410,171);flat(1,'shop-balcony',12,125,176);
 // Telhados: descending stair, lower valley and ascending stair exactly follow the image.
 flat(2,'roof-entry',-22,40,130);flat(2,'roof-west',40,125,195);slope(2,'roof-first-descent',125,195,170,248);flat(2,'roof-over-arch',170,255,248);slope(2,'roof-second-descent',255,248,315,319);flat(2,'valley-step',315,347,319);flat(2,'roof-valley',347,475,319);slope(2,'roof-ascent-a',475,319,530,267);slope(2,'roof-ascent-b',530,267,540,233);flat(2,'roof-east',540,719,233);flat(2,'high-balcony',559,719,150);
 // Canal: use the real ladder and lower masonry path; water is not an invisible floor.
 flat(3,'bridge-west',7,385,124);slope(3,'wood-bridge-down',385,124,480,137);slope(3,'wood-bridge-up',480,137,526,124);flat(3,'bridge-east',526,723,124);flat(3,'lower-canal-west',7,125,239);flat(3,'lower-canal',125,240,229);flat(3,'canal-island',226,365,275);flat(3,'hanging-ledge',250,300,174);flat(3,'canal-mechanism',500,723,199);ladder(3,'canal-west-ladder',139,124,229);ladder(3,'canal-east-chain',600,124,199);
 // Factory: upper arrival, lower reactor, a lift in the visible shaft and the overhead gantry.
 flat(4,'factory-arrival',27,300,195);slope(4,'factory-upper-steps',290,195,310,174);flat(4,'factory-upper',310,395,174);flat(4,'factory-lower-west',27,215,300);flat(4,'factory-reactor-floor',215,520,310);slope(4,'factory-exit-steps',520,310,540,290);flat(4,'factory-exit',540,668,290);flat(4,'maintenance-stop',315,375,260);flat(4,'suspended-crate',430,470,153);flat(4,'overhead-gantry',310,610,90);ladder(4,'gantry-ladder',450,90,153);
 const lo=point(4,318,310),hi=point(4,318,174),right=point(4,378,310);lifts.push({id:'factory-lift',scene:4,x:lo.x,y:lo.y,w:right.x-lo.x,h:12,low:lo.y,high:hi.y,period:420,kind:'lift',source:{x:724+315,y:362+258,w:60,h:13}});
 flat(5,'terminal-left',-34,150,296);slope(5,'terminal-floor-rise',150,296,300,283);flat(5,'terminal-center',300,450,283);slope(5,'terminal-floor-fall',450,283,600,296);flat(5,'terminal-right',600,717,296);
 const seal=(i,x,y,safeX,safeY)=>({...point(i,x,y),safe:point(i,safeX,safeY).x,safeY:point(i,safeX,safeY).y,scene:i});
 const checkpoint=(i,x,y,label)=>({...point(i,x,y),scene:i,label});
 const drone=(i,x,y)=>{const c=point(i,x,y);return{x:c.x-22,y:c.y-22,scene:i};};
 const arenaFloor=point(5,370,283).y,bc=point(5,370,140),left=point(5,20,286),rightArena=point(5,680,286);
 window.SHADOWMAN_LEVEL={version:'0.5.0',width:7200,viewWidth:W,viewHeight:H,scenes,sectors:scenes,terrain,ladders,lifts,stairs:[],decor:[],point,
  spawn:point(0,130,258),gate:6000,
  arena:{scene:5,start:6000+75,min:left.x,max:rightArena.x-100,bossX:bc.x-50,hoverY:bc.y-50,downY:arenaFloor-100,floor:arenaFloor},
  seals:[seal(1,350,289,350,305),seal(3,280,256,300,275),seal(4,240,245,420,310)],
  checkpoints:[checkpoint(0,685,162,'ARMAZÉM'),checkpoint(2,70,195,'TELHADOS'),checkpoint(3,150,124,'PONTE'),checkpoint(4,430,310,'FÁBRICA'),checkpoint(5,80,296,'TERMINAL')],
  heals:[{...point(0,575,106),scene:0},{...point(1,330,155),scene:1},{...point(2,690,134),scene:2},{...point(3,640,183),scene:3},{...point(4,570,74),scene:4}],
  drones:[drone(0,310,180),drone(1,520,265),drone(2,130,155),drone(2,640,110),drone(3,350,82),drone(3,540,166),drone(4,200,250),drone(4,570,260)]
 };
})();
