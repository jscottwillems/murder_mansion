import type { LegacyGameRuntime } from "../types";

type LegacyRuntimeUi = {
  audioStatus?: HTMLElement | null;
  audioToggle?: HTMLElement | null;
  caseNotes?: HTMLElement | null;
  clock?: HTMLElement | null;
  dialogue?: HTMLElement | null;
  questions?: HTMLElement | null;
  roomBrief?: HTMLElement | null;
  roster?: HTMLElement | null;
  status?: HTMLElement | null;
};

export function createLegacyGameRuntime(options: {
  canvas: HTMLCanvasElement;
  autoStartLoop?: boolean;
  canvasFrame?: HTMLElement | null;
  ui?: LegacyRuntimeUi;
}): LegacyGameRuntime;
