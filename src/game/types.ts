export type LegacyGameRuntime = {
  advanceTime(ms: number): Promise<void>;
  destroy(): void;
  getGame(): unknown;
  getSize(): { height: number; width: number };
  handleCanvasClick(): void;
  renderGameToText(): string;
  resizeCanvasForPixelPerfect(): void;
  tick(now?: number): void;
};

declare global {
  interface Window {
    advanceTime?: (ms: number) => Promise<void>;
    render_game_to_text?: () => string;
  }
}

export {};
