/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE CHAPTER SWAP POINT
 * ─────────────────────────────────────────────────────────────────────────
 *  Chapters are content, just like config.ts. Each one stages the page
 *  (onEnter) and runs a list of cursor steps. Edit / add freely — the dev
 *  panel lists whatever is in CHAPTERS, and `/?chapter=<id>` deep-links to
 *  any entry. The engine that runs these (autodemo.tsx) never needs to
 *  change.
 *
 *  Chapters drive the app through two window bridges:
 *    - window.__pdApp     → navigate the product. Installed by the product
 *                           shell (pages/sample-product.tsx), which also
 *                           defines its shape.
 *    - window.__pdWidgets → spawn / dismiss overlay windows by registry id.
 *                           Installed by WidgetsBridge (widgets/registry.tsx).
 *  Keeping chapters decoupled this way means a script never holds a React
 *  ref — it just calls the bridge.
 *
 *  Steps target elements by their `data-demo="..."` attribute. The cursor
 *  targets the first *visible* match for the selector and waits for it to
 *  appear, so timing is forgiving.
 */

export type DemoStep = {
  target: string;
  delay: number;
  hold: number;
  action?: "click" | "custom" | "escape" | "hover";
  run?: () => void;
  // Optional [dx, dy] added to the cursor's resting position (default: the
  // target's center). Use to land "near" rather than "on".
  offset?: [number, number];
};

export type ChapterContext = {
  // Schedule a deferred action that's cancelled if the chapter exits first.
  schedule: (fn: () => void, ms: number) => void;
};

export type Chapter = {
  label: string;
  // Stage the page before the cursor runs (switch tabs, reset, spawn windows).
  onEnter?: (ctx: ChapterContext) => void;
  steps: DemoStep[];
  loop?: boolean;
  // Delay before onComplete fires after the steps drain.
  completeAfter?: number;
  // When false, a real pointerdown does not cancel the demo and the hint is
  // suppressed. Default true.
  interruptible?: boolean;
  // When false, the "Click to interact" hint is fully disabled. Default true.
  hint?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────
//  CHAPTERS — the example demos. Edit / add freely.
// ─────────────────────────────────────────────────────────────────────────
export const CHAPTERS: Record<string, Chapter> = {
  // Chapter 1: walk through the product's navigation.
  tour: {
    label: "Guided tour",
    onEnter: () => {
      window.__pdApp?.reset?.();
      window.__pdApp?.setActiveTab?.("home");
      window.__pdWidgets?.dismissAll?.();
    },
    steps: [
      // Click into the Docs tab.
      { target: '[data-demo="tab-docs"]', delay: 1400, hold: 900, action: "click" },
      // Open a sidebar page.
      { target: '[data-demo="nav-concepts"]', delay: 700, hold: 1100, action: "click" },
      // Open another to show navigation.
      { target: '[data-demo="nav-authentication"]', delay: 800, hold: 1200, action: "click" },
    ],
  },

  // Chapter 2: open the changelog, then a "new release" notice slides in.
  // Also the example of a *scripted* overlay-window spawn (ctx.schedule +
  // window.__pdWidgets.spawn), driven from a chapter rather than the dev panel.
  "whats-new": {
    label: "What's new",
    onEnter: (ctx) => {
      window.__pdApp?.reset?.();
      window.__pdApp?.setActiveTab?.("home");
      window.__pdWidgets?.dismissAll?.();
      // Once the cursor has opened the changelog, slide a release notice in.
      ctx.schedule(
        () => window.__pdWidgets?.spawn?.("notification", "bottom-right"),
        3200,
      );
    },
    steps: [
      // Open the Changelog tab.
      {
        target: '[data-demo="tab-changelog"]',
        delay: 1400,
        hold: 1600,
        action: "click",
      },
      // Click the notice that slides in.
      {
        target: '[data-demo="notif-action"]',
        delay: 500,
        hold: 1200,
        action: "click",
      },
    ],
    completeAfter: 600,
  },
};

export const DEFAULT_CHAPTER = "tour";

export function isChapterHintEnabled(chapter: string): boolean {
  return CHAPTERS[chapter]?.hint !== false;
}
