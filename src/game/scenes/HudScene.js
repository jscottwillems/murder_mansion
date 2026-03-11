import * as Phaser from "/node_modules/phaser/dist/phaser.esm.js";

export class HudScene extends Phaser.Scene {
  constructor() {
    super("hud");
  }

  create() {
    this.scene.bringToTop();
  }
}
