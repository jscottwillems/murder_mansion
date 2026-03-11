import Phaser from "phaser";

export class HudScene extends Phaser.Scene {
  constructor() {
    super("hud");
  }

  create() {
    this.scene.bringToTop();
  }
}
