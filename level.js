/* Hand-authored Phase 1. Art composition: docs/phase-01/full-map.png. */
(()=>{
 const terrain=[],stairs=[];
 const floor=(id,x,y,w,kind='street',art='wharf')=>terrain.push({id,x,y,w,h:kind==='street'?100:25,kind,art});
 function stair(id,x,lowY,n=6,rise=18,run=45,reverse=false){for(let i=0;i<n;i++)floor(`${id}-${i}`,x+i*run,reverse?lowY+(i+1)*rise:lowY-(i+1)*rise,run+2,'step');stairs.push({id,x,y:reverse?lowY:lowY-n*rise,w:n*run,h:n*rise,reverse});}
 // Cais: safe movement, a short water crossing and optional warehouse roof.
 floor('dock-start',0,500,450,'street','wharf');floor('dock-pier',570,500,930,'street','wooden-pier');
 stair('dock-stairs',960,500,7,18,40);floor('warehouse-roof',1240,374,190,'roof','terrace');
 // Ruas: continuous pavement, courtyard stairs and first fragment in plain sight.
 floor('old-street',1500,500,1600,'street','wharf');floor('shop-awning',1750,420,170,'roof','storefront');floor('courtyard',1990,335,280,'roof','balcony-house');
 // Telhados: high route around the clocktower, with a forgiving street below.
 floor('roof-lower-street',3100,500,1600,'street','wharf');stair('fire-steps',3200,500,7,18,40);
 floor('roof-terrace',3480,374,200,'roof','terrace');floor('roof-link',3700,350,135,'platform','roof-connector');floor('clock-terrace',3870,285,230,'roof','terrace');floor('slate-terrace',4170,330,220,'roof','slate-roof');floor('roof-return',4460,410,150,'platform','roof-connector');
 // Canal: bridge above, maintenance route below; both reconnect at the far bank.
 stair('bridge-approach',4700,500,6,18,45);floor('bridge-west',4970,390,330,'bridge','steel-span');floor('bridge-east',5440,390,640,'bridge','steel-span');
 floor('canal-drop',5260,520,210,'platform','wooden-pier');floor('canal-lock',5530,520,280,'platform','canal-lock');stair('canal-return',5790,520,7,18,42);
 stair('bridge-exit',6080,390,6,18,40,true);floor('canal-bank',6320,500,80,'street','wharf');
 // Factory: ground route plus machinery and a working lift to the last fragment.
 floor('factory-street',6400,500,1700,'street','factory-wall');floor('boiler-roof',6640,410,210,'roof','factory-roof');floor('factory-catwalk',6930,325,240,'platform','catwalk');floor('lift-dock',7340,500,130,'platform','catwalk');floor('generator-platform',7700,315,245,'platform','catwalk');
 // Terminal: safe checkpoint, fragment gate and a broad flat boss arena.
 floor('terminal-street',8100,500,1500,'street','arena-wall');
 const sectors=[
  {id:1,name:'CAIS DAS SOMBRAS',start:0,end:1500,tip:'Atravesse o cais. As escadas levam ao telhado do armazém.'},
  {id:2,name:'RUA DOS LAMPIÕES',start:1500,end:3100,tip:'Um fragmento brilha na varanda acima do pátio.'},
  {id:3,name:'TELHADOS DO RELÓGIO',start:3100,end:4700,tip:'Suba pelos telhados ou siga pela rua. Os caminhos se reencontram.'},
  {id:4,name:'PONTE DOS ECOS',start:4700,end:6400,tip:'O fragmento está no mecanismo abaixo da ponte. Desça pela abertura.'},
  {id:5,name:'PÁTIO DAS MÁQUINAS',start:6400,end:8100,tip:'O elevador liga o chão à plataforma do gerador.'},
  {id:6,name:'TERMINAL 08',start:8100,end:9600,tip:'O portão exige os três fragmentos. Prepare-se para o Vigia.'}
 ];
 // Distinct buildings and props are positioned explicitly, rather than tiled across all districts.
 const decor=[
  ['cargo-warehouse',1040,220,340,280],['crane',180,120,235,380],['cargo-stack',620,393,150,107],['dock-stairs',1275,408,210,92],
  ['storefront',1510,300,235,200],['street-arch',2350,228,260,272],['fountain-lamp',2660,315,175,185],['courtyard-gate',2910,320,185,180],
  ['slate-roof',3100,240,220,260],['chimneys',3610,180,170,194],['clocktower',3890,70,200,300],['balcony-house',4220,130,175,370],
  ['stone-bridge',4890,390,370,210],['broken-bridge',5280,390,170,130],['drain',5565,345,210,175],['bridge-railing',5460,345,605,45],['stone-bridge',5750,390,320,210],
  ['factory-roof',6440,235,290,265],['boiler',6750,333,155,167],['exhaust-pipes',7140,215,190,285],['factory-wall',7300,180,175,320],['reactor',7750,198,140,117],
  ['courtyard-gate',8180,315,190,185],['terminal-gate',8440,220,250,280],['tunnel',8860,188,300,312],['control-mechanism',9360,340,150,160],['shadow-alcove',9490,300,110,200]
 ].map(([art,x,y,w,h])=>({art,x,y,w,h}));
 window.SHADOWMAN_LEVEL={version:'0.4.0',width:9600,gate:8620,arena:{start:8820,min:8840,max:9510,bossX:9230},terrain,stairs,sectors,decor,
  seals:[{x:2160,y:300,safe:2250},{x:5650,y:485,safe:6325},{x:7820,y:280,safe:7960}],
  checkpoints:[{x:1200,label:'ARMAZÉM'},{x:4400,label:'RELÓGIO'},{x:7950,label:'FÁBRICA'},{x:8500,label:'TERMINAL'}],
  heals:[{x:1330,y:340},{x:3990,y:250},{x:6745,y:375}],
  drones:[{x:840,y:426},{x:1840,y:426},{x:2740,y:426},{x:3650,y:317},{x:4520,y:426},{x:5120,y:316},{x:5810,y:446},{x:6620,y:426},{x:7200,y:342},{x:8030,y:426}],
  lifts:[{id:'factory-lift',x:7460,y:500,w:150,h:20,low:500,high:315,period:420,kind:'lift',art:'lift'}]
 };
})();
