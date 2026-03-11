export function attachDebugBridge({ refresh, runtime }) {
  window.render_game_to_text = () => runtime.renderGameToText();
  window.advanceTime = async (ms) => {
    await runtime.advanceTime(ms);
    refresh();
  };

  return () => {
    delete window.render_game_to_text;
    delete window.advanceTime;
  };
}
