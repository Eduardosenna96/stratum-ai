/* Actor = visual entity + components. Movement and combat are intentionally not integrated yet. */
class ShadowActor extends Phaser.GameObjects.Container {
 constructor(scene){super(scene,0,0);this.visual=scene.add.sprite(320,290,'hero-base','0-0');this.add(this.visual);this.animation=new AnimationComponent(this.visual);scene.add.existing(this);}
 destroy(fromScene){this.visual.destroy();super.destroy(fromScene);}
}
