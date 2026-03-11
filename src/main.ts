import Phaser from "phaser";
import { gameConfig } from "./game/config";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/config";

function resizeGameCanvas(game: Phaser.Game) {
  const host = document.querySelector(".stage-canvas-wrap");
  const canvas = game.canvas;
  if (!host || !canvas) return;

  const styles = window.getComputedStyle(host);
  const padX = parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
  const padY = parseFloat(styles.paddingTop || "0") + parseFloat(styles.paddingBottom || "0");
  const availableWidth = Math.max(1, host.clientWidth - padX - 2);
  const availableHeight = Math.max(1, host.clientHeight - padY - 2);
  const boundedScale = Math.min(availableWidth / GAME_WIDTH, availableHeight / GAME_HEIGHT);
  const scale = boundedScale >= 1
    ? Math.max(1, Math.floor(boundedScale * 4) / 4)
    : Math.max(0.5, boundedScale);

  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
}

void Phaser;
const game = new Phaser.Game(gameConfig);
resizeGameCanvas(game);
window.addEventListener("resize", () => resizeGameCanvas(game));
window.addEventListener("fullscreenchange", () => resizeGameCanvas(game));
