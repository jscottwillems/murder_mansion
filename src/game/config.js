import * as Phaser from "/node_modules/phaser/dist/phaser.esm.js";
import { BootScene } from "./scenes/BootScene.js";
import { HudScene } from "./scenes/HudScene.js";
import { InvestigationScene } from "./scenes/InvestigationScene.js";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 288;
export const GAME_PARENT_ID = "phaser-game";

export const gameConfig = {
  type: Phaser.CANVAS,
  parent: GAME_PARENT_ID,
  backgroundColor: "#05070d",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: [BootScene, InvestigationScene, HudScene],
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
