import * as Phaser from "/node_modules/phaser/dist/phaser.esm.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    this.scene.launch("investigation");
    this.scene.launch("hud");
    this.scene.stop();
  }
}
