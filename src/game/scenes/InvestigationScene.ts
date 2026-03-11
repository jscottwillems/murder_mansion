import Phaser from "phaser";
import { attachDebugBridge } from "../debug/debugBridge";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { createLegacyGameRuntime } from "../legacy/runtime.js";
import type { LegacyGameRuntime } from "../types";

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
  private cleanupDebugBridge: (() => void) | null = null;
  private runtime: LegacyGameRuntime | null = null;
  private runtimeSprite: Phaser.GameObjects.Image | null = null;
  private runtimeTexture: Phaser.Textures.CanvasTexture | null = null;

  constructor() {
    super("investigation");
  }

  create() {
    this.cameras.main.setBackgroundColor("#05070d");

    const runtimeTexture = this.textures.createCanvas(LEGACY_TEXTURE_KEY, GAME_WIDTH, GAME_HEIGHT);
    if (!runtimeTexture) {
      throw new Error("Phaser did not create a canvas texture");
    }
    const runtimeCanvas = runtimeTexture.getSourceImage() as HTMLCanvasElement | null;
    if (!runtimeCanvas) {
      throw new Error("Phaser did not provide a runtime canvas");
    }
    this.runtimeTexture = runtimeTexture;
    this.runtime = createLegacyGameRuntime({
      autoStartLoop: false,
      canvas: runtimeCanvas,
      canvasFrame: document.querySelector(".stage-canvas-wrap") as HTMLElement | null,
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

  update(time: number) {
    this.runtime?.tick(time);
    this.refreshTexture();
  }

  private handleShutdown() {
    this.cleanupDebugBridge?.();
    this.cleanupDebugBridge = null;
    this.runtime?.destroy();
    this.runtime = null;
  }

  private layoutViewport(width: number, height: number) {
    if (!this.runtimeSprite) return;

    const scale = Math.max(
      1,
      Math.min(Math.max(1, width) / GAME_WIDTH, Math.max(1, height) / GAME_HEIGHT),
    );

    this.runtimeSprite.setPosition(width / 2, height / 2);
    this.runtimeSprite.setDisplaySize(GAME_WIDTH * scale, GAME_HEIGHT * scale);
  }

  private refreshTexture() {
    this.runtimeTexture?.refresh();
  }
}
