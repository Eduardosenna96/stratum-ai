/* Component data-driven: no map-specific animation code. */
class AnimationComponent {
 constructor(sprite){this.sprite=sprite;this.clip=null;this.elapsed=0;this.speed=1;this.paused=false;this.index=0;}
 play(key){this.clip=PHASE1_KIT.clips[key];this.elapsed=0;this.key=key;this.update(0);}
 update(delta){if(!this.clip)return;if(!this.paused)this.elapsed+=delta*this.speed;const total=this.clip.frames.reduce((n,f)=>n+f.duration,0);let t=this.clip.loop?this.elapsed%total:Math.min(this.elapsed,total-1);this.index=0;for(let i=0;i<this.clip.frames.length;i++){this.index=i;if(t<this.clip.frames[i].duration)break;t-=this.clip.frames[i].duration;}const f=this.clip.frames[this.index],m=PHASE1_FRAMES[f.texture][f.frame],s=m.worldScale*3;this.sprite.setTexture(f.texture,f.frame).setOrigin(m.pivot.x,m.pivot.y).setScale(f.flipX?-s:s,s);const bottom=(1-m.pivot.y)*m.frame.h*s;this.sprite.y=Math.min(290,340-bottom);this.sprite.x=320;document.querySelector('#frame').textContent=`Quadro ${this.index+1}/${this.clip.frames.length} · ${f.duration} ms · ${f.texture}/${f.frame}`;}
}
