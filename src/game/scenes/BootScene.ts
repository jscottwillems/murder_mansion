import Phaser from "phaser";

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
