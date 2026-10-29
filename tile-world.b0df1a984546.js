/* Authoring contract: geometry is rendered as tiles, never inferred from painted backgrounds. */
(()=>{'use strict';
 const T=48,W=1200,H=675,RW=64*T,RH=20*T;
 const scenes=[{id:'city',name:'Cidade gótica',theme:'city'},{id:'canal',name:'Canais e docas',theme:'canal'},{id:'industrial',name:'Interior industrial',theme:'industrial'}];
 const rooms=[];
 function room(id,name,scene,mx,my,spawn,tip){const r={id,name,scene,mx,my,tip,width:RW,height:RH,spawn:{x:spawn[0],y:spawn[1]},terrain:[],ladders:[],decor:[],drones:[]};rooms.push(r);return r;}
 function floor(r,id,x,y,w,tile='stone'){r.terrain.push({id:r.id+'-'+id,x,y,w,h:T,kind:'surface',tile});}
 function ladder(r,x,top,bottom){r.ladders.push({x,top,bottom});}
 // Real risers are12world high. Engine draws each matching tread; no diagonal collider over a facade.
 function stair(r,id,x,y,steps,direction=1,tile='stone'){for(let i=0;i<steps;i++){const top=y+(direction>0?-(i+1)*12:i*12);r.terrain.push({id:r.id+'-'+id+'-'+i,x:x+i*T,y:top,w:T,h:12,kind:'step',tile});}}
 function prop(r,key,x,y,w,h,layer='back'){r.decor.push({key,x,y,w,h,layer});}
 function drone(r,x,y,cool=100){r.drones.push({x,y,base:y,w:44,h:44,hp:3,cool});}
 // 0. Cais: two short96px jumps, optional crane gallery, then eight visible12px risers.
 {
 const r=room(0,'Cais das Sombras',1,0,1,[144,768],'Atravesse os pequenos vãos do cais. A escada final leva às ruas.');
 floor(r,'quay',0,768,864);floor(r,'pier',960,768,768,'wood');floor(r,'east-pier',1824,768,384,'wood');stair(r,'quay-stair',2208,768,8,1);floor(r,'street-exit',2592,672,480);
 floor(r,'crane-gallery',288,480,384,'wood');ladder(r,432,480,768);
 prop(r,'crane',48,96,432,672);prop(r,'cargo-warehouse',1152,240,480,528);prop(r,'cargo-stack',1968,576,192,192);prop(r,'wharf',2640,480,288,192);
 }
 // 1. Praça: central fountain hub; the raised route has a physical stair and separate support columns.
 {
 const r=room(1,'Praça dos Lampiões',0,1,1,[96,768],'Procure o Arquivo à direita. O Canal e a passagem alta exigem poderes.');
 floor(r,'street',0,768,3072);floor(r,'stair-access',1728,624,288,'metal');ladder(r,1872,624,768);stair(r,'clock-stair',2016,624,12,1,'metal');floor(r,'clock-landing',2592,480,480,'metal');
 // Alternate access keeps the hub readable; no invisible walking surface on house fronts.
 floor(r,'fountain-balcony',384,480,432);ladder(r,528,480,768);
 prop(r,'storefront',192,384,288,384);prop(r,'fountain-lamp',960,432,288,336);prop(r,'street-arch',1296,288,384,480);prop(r,'clocktower',2520,0,288,480);prop(r,'balcony-house',480,96,288,384);
 drone(r,1440,704,120);
 }
 // 2. Arquivo: lower approach, ladder to an identifiable raised alcove containing Passo.
 {
 const r=room(2,'Arquivo das Sombras',2,2,1,[96,768],'Suba à galeria do Arquivo e encontre o Passo Sombrio.');
 floor(r,'archive-floor',0,768,3072);floor(r,'archive-gallery',768,624,960,'metal');ladder(r,864,624,768);floor(r,'reading-balcony',2208,480,576,'metal');ladder(r,2352,480,768);
 prop(r,'terminal-gate',48,384,288,384);prop(r,'arena-wall',336,192,384,576);prop(r,'shadow-alcove',1200,336,288,288);prop(r,'control-mechanism',1920,576,192,192);prop(r,'tunnel',2592,144,384,336);
 }
 // 3. Canal: upper bridge and lower maintenance form an explicit loop, with real gaps over water.
 {
 const r=room(3,'Galeria do Canal',1,1,2,[144,480],'Desça a escada do canal. O Tentáculo está na galeria inferior.');
 floor(r,'west-bridge',0,480,1296);floor(r,'east-bridge',1440,480,1632,'wood');
 floor(r,'west-maintenance',0,816,1056);floor(r,'center-maintenance',1152,816,864);floor(r,'east-maintenance',2112,816,960);
 ladder(r,528,480,816);ladder(r,2640,480,816);
 prop(r,'stone-bridge',192,240,384,240);prop(r,'canal-lock',1248,528,384,288);prop(r,'drain',1848,528,240,288);prop(r,'steel-span',2304,192,480,288);prop(r,'bridge-railing',624,384,432,96);
 drone(r,1488,752,140);drone(r,2304,416,180);
 }
 // 4. Telhados: roof-to-roof jumps; lower balconies are a recoverable loop, not a death pit.
 {
 const r=room(4,'Telhados do Relógio',0,1,0,[144,480],'Explore os telhados. A escada junto ao relógio alcança o Selo da Torre.');
 floor(r,'west-roof',0,480,768);floor(r,'middle-roof',864,480,672);floor(r,'sunken-roof',1632,528,480);floor(r,'east-roof',2208,480,864);floor(r,'lower-balconies',0,816,3072,'wood');
 floor(r,'clock-crown',2448,336,480);ladder(r,2496,336,480);ladder(r,672,480,816);ladder(r,1776,528,816);
 prop(r,'chimneys',192,240,192,240);prop(r,'slate-roof',912,240,384,240);prop(r,'clocktower',2304,0,240,336);prop(r,'terrace',1632,672,432,144);prop(r,'roof-connector',2832,144,192,192);
 drone(r,1104,416,160);drone(r,2352,416,200);
 }
 // 5. Fábrica: lower machine hall, upper gantry and one authored moving lift.
 {
 const r=room(5,'Pátio das Máquinas',2,2,2,[144,768],'Use o elevador para alcançar a passarela e a Câmara.');
 floor(r,'machine-floor',0,768,3072,'metal');floor(r,'west-gantry',1056,480,528,'metal');floor(r,'east-gantry',1728,480,912,'metal');floor(r,'service-platform',480,624,384,'metal');ladder(r,672,624,768);
 r.lift={x:1584,w:144,y:768,low:768,high:480,h:12,source:null};
 prop(r,'boiler',192,384,288,384);prop(r,'exhaust-pipes',864,192,192,576);prop(r,'factory-wall',1824,0,384,480);prop(r,'reactor',2736,384,288,384);prop(r,'catwalk',1104,336,336,144);
 drone(r,1296,704,130);drone(r,2160,416,180);
 }
 // 6. Câmara: a raised shrine approached through matching12px stairs on both sides.
 {
 const r=room(6,'Câmara da Névoa',2,3,2,[144,768],'Suba ao santuário da Névoa. A saída exige também o Selo da Torre.');
 floor(r,'west-chamber',0,768,768);stair(r,'shrine-rise',768,768,8,1);floor(r,'shrine-floor',1152,672,768);stair(r,'shrine-descent',1920,672,8,-1);floor(r,'east-chamber',2304,768,768);
 prop(r,'shadow-alcove',1344,288,384,384);prop(r,'arena-wall',240,288,384,480);prop(r,'control-mechanism',2496,480,240,288);prop(r,'tunnel',2832,240,240,528);
 }
 // 7. Arena: safe broad floor, readable boss lane and optional flanking platforms.
 {
 const r=room(7,'Coração do Terminal',2,3,1,[144,768],'O Vigia guarda o núcleo. Observe o aviso do olho antes de atacar.');
 floor(r,'arena-floor',0,768,3072,'metal');floor(r,'west-arena-gallery',0,480,672,'metal');floor(r,'east-arena-gallery',2448,480,624,'metal');ladder(r,480,480,768);ladder(r,2640,480,768);
 prop(r,'terminal-gate',48,384,288,384);prop(r,'arena-wall',768,192,384,576);prop(r,'reactor',2304,288,384,480);prop(r,'shadow-alcove',2832,384,240,384);
 r.drones.push({x:2112,y:680,base:680,w:70,h:70,hp:8,cool:90,boss:true});
 }
 const connections=[];
 function connect(a,pa,b,pb,req=null,shortcut=false,auto=false){connections.push({id:connections.length,a,b,pa:{x:pa[0],y:pa[1]},pb:{x:pb[0],y:pb[1]},req,shortcut,auto});}
 connect(0,[2976,672],1,[96,768],null,false,true);
 connect(1,[2976,768],2,[96,768]);
 connect(1,[1248,768],3,[144,480],'passo');
 connect(1,[2976,480],4,[144,480],'tentaculo');
 connect(3,[2976,816],5,[144,768]);
 connect(5,[2448,480],6,[144,768],'tentaculo');
 connect(6,[2976,768],7,[144,768],'final');
 connect(0,[480,480],3,[288,816],null,true);
 connect(4,[2976,480],5,[1152,480],null,true);
 const rewards={
  2:{x:1392,y:624,key:'passo',name:'PASSO SOMBRIO · K para avançar'},
  3:{x:1728,y:816,key:'tentaculo',name:'TENTÁCULO · passagens altas liberadas'},
  4:{x:2736,y:336,key:'selo',name:'SELO DA TORRE'},
  6:{x:1536,y:672,key:'nevoa',name:'FORMA DE NÉVOA · passagens estreitas liberadas'}
 };
 window.CITY_LEVEL={W,H,T,rooms,connections,rewards,scenes,point:(x,y)=>({x,y})};
})();
