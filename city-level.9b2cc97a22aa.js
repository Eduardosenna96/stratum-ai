/* Collision authored directly over full-resolution reference scenes. Native pixels: 1672 x 941. */
(()=>{const W=1200,H=675,px=x=>x*W/1672,py=y=>y*H/941;
const scenes=[
 {id:'streets',src:"assets/city-streets-hd.7052cdfa4304.png",spawn:[150,640],flats:[[0,1672,640],[0,270,320],[1110,1300,345],[620,1080,869],[1250,1450,819]],slopes:[[1290,345,1640,640]],ladders:[[263,320,640]]},
 {id:'canal',src:"assets/city-canal-hd.d742e074b46b.png",spawn:[140,348],flats:[[0,1390,348],[1640,1672,560],[0,620,710],[620,1084,723],[1190,1672,724]],slopes:[[1390,348,1640,560]],ladders:[[330,348,710]]},
 {id:'terminal',src:"assets/city-terminal-hd.456652185f83.png",spawn:[100,790],flats:[[0,1672,790],[0,520,363],[1100,1672,370]],slopes:[[520,363,900,790]],ladders:[],lift:{x:1130,w:130,low:790,high:370,source:[1130,620,130,22]}}
];for(const s of scenes){s.terrain=[];s.flats.forEach(([a,b,y],i)=>s.terrain.push({id:s.id+'-floor-'+i,x:px(a),y:py(y),w:px(b-a),h:10,kind:'surface'}));s.slopes.forEach(([x1,y1,x2,y2],j)=>{const n=Math.ceil(Math.max((x2-x1)/7,(y2-y1)/8));for(let i=0;i<n;i++)s.terrain.push({id:s.id+'-stair-'+j+'-'+i,x:px(x1+(x2-x1)*i/n),y:py(y1+(y2-y1)*(i+.5)/n),w:px((x2-x1)/n)+.5,h:10,kind:'step'});});s.ladders=s.ladders.map(([x,a,b])=>({x:px(x),top:py(a),bottom:py(b)}));if(s.lift){const l=s.lift;s.lift={x:px(l.x),w:px(l.w),y:py(l.low),low:py(l.low),high:py(l.high),h:12,source:l.source};}}
window.CITY_LEVEL={W,H,scenes,point:(x,y)=>({x:px(x),y:py(y)})};})();
