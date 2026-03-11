import * as Phaser from "/node_modules/phaser/dist/phaser.esm.js";
import { attachDebugBridge } from "../debug/debugBridge.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../config.js";
import { createLegacyGameRuntime } from "../legacy/runtime.js";

const LEGACY_TEXTURE_KEY = "legacy-runtime";
const VIEWPORT_PADDING = 24;

function getUiBindings() {
  return {
    audioStatus: document.getElementById("audio-status"),
    audioToggle: document.getElementById("audio-toggle"),
    caseNotes: document.getElementById("case-notes"),
    clock: document.getElementById("clock"),
    dialogue: document.getElementById("dialogue"),
    questions: document.getElementById("questions"),
    roomBrief: document.getElementById("room-brief"),
    roster: document.getElementById("roster"),
    status: document.getElementById("status"),
  };
}

export class InvestigationScene extends Phaser.Scene {
  constructor() {
    super("investigation");
    this.cleanupDebugBridge = null;
    this.runtime = null;
    this.runtimeSprite = null;
    this.runtimeTexture = null;
  }

  create() {
    this.cameras.main.setBackgroundColor("#05070d");

    const runtimeTexture = this.textures.createCanvas(LEGACY_TEXTURE_KEY, GAME_WIDTH, GAME_HEIGHT);
    if (!runtimeTexture) {
      throw new Error("Phaser did not create a canvas texture");
    }
    const runtimeCanvas = runtimeTexture.getSourceImage();
    if (!runtimeCanvas) {
      throw new Error("Phaser did not provide a runtime canvas");
    }
    this.runtimeTexture = runtimeTexture;
    this.runtime = createLegacyGameRuntime({
      autoStartLoop: false,
      canvas: runtimeCanvas,
      canvasFrame: document.querySelector(".stage-canvas-wrap"),
      ui: getUiBindings(),
    });
    this.registry.set("legacyRuntime", this.runtime);

    this.runtimeSprite = this.add.image(0, 0, LEGACY_TEXTURE_KEY).setOrigin(0.5);
    this.runtimeSprite.setInteractive({ cursor: "pointer" });
    this.runtimeSprite.on("pointerdown", () => {
      this.runtime?.handleCanvasClick();
      this.refreshTexture();
    });

    this.cleanupDebugBridge = attachDebugBridge({
      refresh: () => this.refreshTexture(),
      runtime: this.runtime,
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.on(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);

    this.refreshTexture();
    this.layoutViewport(GAME_WIDTH, GAME_HEIGHT);
  }

  update(time) {
    this.runtime?.tick(time);
    this.refreshTexture();
  }

  handleShutdown() {
    this.cleanupDebugBridge?.();
    this.cleanupDebugBridge = null;
    this.runtime?.destroy();
    this.runtime = null;
  }

  layoutViewport(width, height) {
    if (!this.runtimeSprite) return;

    const scale = Math.max(
      1,
      Math.min(Math.max(1, width) / GAME_WIDTH, Math.max(1, height) / GAME_HEIGHT),
    );

    this.runtimeSprite.setPosition(width / 2, height / 2);
    this.runtimeSprite.setDisplaySize(GAME_WIDTH * scale, GAME_HEIGHT * scale);
  }

  refreshTexture() {
    this.runtimeTexture?.refresh();
  }
}
