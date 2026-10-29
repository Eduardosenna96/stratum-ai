/* Visible tile tops and physical supports share the same authored rectangles. */
(()=>{const A=window.SHADOWMAN_PHASE_ATLAS;
function prop(g,img,key,x,y,w,h){const r=A[key];if(r&&img.naturalWidth)g.drawImage(img,r.x,r.y,r.w,r.h,x,y,w,h);}
function tile(g,img,t,room){const stone=t.tile==='stone',wood=t.tile==='wood';const depth=t.kind==='step'?12:wood?18:stone?48:14;
 g.fillStyle=wood?'#392b20':stone?'#142738':'#23313b';g.fillRect(t.x,t.y,t.w,depth);
 if(img.naturalWidth){const cw=img.naturalWidth/3,ch=img.naturalHeight/2;const sample=wood?[8,ch+8,cw-16,ch-16]:stone?[8,8,cw-16,ch-16]:[cw*2+8,8,cw-16,ch-16];g.save();g.beginPath();g.rect(t.x,t.y,t.w,depth);g.clip();for(let x=t.x;x<t.x+t.w;x+=96)g.drawImage(img,...sample,x,t.y,96,depth);g.restore();}
 g.fillStyle=wood?'#c39a62':stone?'#91a7ae':'#9caeb5';g.fillRect(t.x,t.y,t.w,2);g.fillStyle='#030b1599';g.fillRect(t.x,t.y+depth-3,t.w,3);
 if(t.kind==='step'){g.strokeStyle='#5d6e77';g.lineWidth=2;g.beginPath();g.moveTo(t.x+4,t.y+12);g.lineTo(t.x+4,t.y+44);g.stroke();}
 // Foundation is background architecture, visually distinct from the walkable cap.
 if(stone&&t.kind!=='step'&&t.y>=672){g.fillStyle='#0a1723';g.fillRect(t.x,t.y+48,t.w,Math.max(0,room.height-t.y-48));if(img.naturalWidth){g.save();g.globalAlpha=.6;for(let x=t.x;x<t.x+t.w;x+=96)for(let y=t.y+48;y<room.height;y+=64)g.drawImage(img,img.naturalWidth/3+8,8,img.naturalWidth/3-16,img.naturalHeight/2-16,x,y,96,64);g.restore();}}
 if(wood&&t.kind!=='step'){g.strokeStyle='#29343b';g.lineWidth=7;for(let x=t.x+24;x<t.x+t.w;x+=144){g.beginPath();g.moveTo(x,t.y+18);g.lineTo(x,room.height);g.stroke();}g.strokeStyle='#6a5338';g.lineWidth=2;}
}
function background(g,far,mid,cam,W,H,room){g.fillStyle='#061321';g.fillRect(0,0,W,H);const draw=(img,speed,alpha,height)=>{if(!img.naturalWidth)return;const w=height*img.naturalWidth/img.naturalHeight,off=-(cam.x*cam.zoom*speed)%w;g.save();g.globalAlpha=alpha;for(let x=off-w;x<W;x+=w)g.drawImage(img,x,H-height-cam.y*.04*speed,w,height);g.restore();};draw(far,.14,1,760);draw(mid,.43,room.scene===2?.27:.64,730);if(room.scene===2){g.fillStyle='#03101a99';g.fillRect(0,0,W,H);}}
function world(g,atlas,materials,room,cam){for(const d of room.decor.filter(d=>d.layer!=='front')){g.save();g.globalAlpha=.88;const ar=A[d.key],w=Math.min(d.w,ar.w*1.15),h=Math.min(d.h,ar.h*1.15);prop(g,atlas,d.key,d.x+(d.w-w)/2,d.y+d.h-h,w,h);g.restore();}
 if(room.id===7)prop(g,atlas,'control-mechanism',2860,640,128,128);
 for(const l of room.ladders){g.strokeStyle='#18232b';g.lineWidth=7;g.beginPath();g.moveTo(l.x-10,l.top);g.lineTo(l.x-10,l.bottom);g.moveTo(l.x+10,l.top);g.lineTo(l.x+10,l.bottom);g.stroke();g.strokeStyle='#a29370';g.lineWidth=3;for(let y=l.top+5;y<l.bottom;y+=15){g.beginPath();g.moveTo(l.x-11,y);g.lineTo(l.x+11,y);g.stroke();}}
 for(const t of room.terrain)if(t.x+t.w>=cam.x-100&&t.x<=cam.x+1200/cam.zoom+100)tile(g,materials,t,room);
 if(room.scene===1){g.fillStyle='#12658066';g.fillRect(0,890,room.width,70);g.strokeStyle='#74b7c577';g.lineWidth=1;for(let i=0;i<42;i++){let x=(i*83+performance.now()*.008)%room.width;g.beginPath();g.moveTo(x,900+i%5*9);g.lineTo(x+24+i%3*7,900+i%5*9);g.stroke();}}
}
window.CITY_RENDER={background,world,prop,tile};})();
