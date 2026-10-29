class AssetReviewScene extends Phaser.Scene {
 constructor(){super('AssetReview');}
 preload(){this.failed=[];this.load.on('progress',v=>document.querySelector('#status').textContent='Carregando catálogo · '+Math.round(v*100)+'%');this.load.on('loaderror',f=>{this.failed.push(f.key);document.querySelector('#status').textContent='Falha ao carregar '+f.key+'. Recarregue para tentar novamente.';});for(const [key,t]of Object.entries(PHASE1_KIT.textures))this.load.atlas(key,'assets/'+t.image,t.atlas);}
 create(){if(this.failed.length)return;this.add.grid(320,180,640,360,32,32,0x071725,1,0x284252,.55);this.anchor=this.add.graphics();this.actor=new ShadowActor(this);this.actor.animation.play('hero/repouso');window.PHASE1_REVIEW_SCENE=this;document.querySelector('#status').textContent='Catálogo em Phaser '+Phaser.VERSION+' · revisão de assets, sem jogo integrado';document.querySelector('#actions').disabled=false;this.game.events.emit('kitready');}
 update(_,delta){if(!this.actor)return;this.actor.animation.update(delta);const y=this.actor.visual.y;this.anchor.clear().lineStyle(1,0x78cfff,.7).lineBetween(0,y,640,y).lineBetween(320,y-10,320,y+10);}
}
