import type { LegacyGameRuntime } from "../types";

type BridgeOptions = {
  refresh: () => void;
  runtime: LegacyGameRuntime;
};

export function attachDebugBridge({ refresh, runtime }: BridgeOptions) {
  window.render_game_to_text = () => runtime.renderGameToText();
  window.advanceTime = async (ms: number) => {
    await runtime.advanceTime(ms);
    refresh();
  };

  return () => {
    delete window.render_game_to_text;
    delete window.advanceTime;
  };
}
