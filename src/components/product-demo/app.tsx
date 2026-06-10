"use client";
/*
 * The orchestrator. Wires the framework together: browser chrome, the widget
 * surface + bridge, the scripted cursor, the hint, and the dev panel. It is
 * product-agnostic — the product on display is mounted in one place below
 * (see "Replace these two lines"), and everything product-specific lives in
 * config.ts, chapters.ts, widgets/registry.tsx, and pages/.
 */
import * as React from "react";
import { useTheme } from "next-themes";

import { BrowserChrome } from "./browser-chrome";
import { WidgetHost } from "./widgets";
import { WidgetsBridge, type Corner } from "./widgets/registry";
import { SampleProduct, SAMPLE_PRODUCT_DOMAIN } from "./pages/sample-product";
import { useAutoDemo, DemoCursor, HintTooltip } from "./autodemo";
import { CHAPTERS, DEFAULT_CHAPTER, isChapterHintEnabled } from "./chapters";
import { DevPanel } from "./dev-panel";

// Pick the starting chapter from `?chapter=` if it names a real chapter, so a
// demo can be deep-linked (e.g. /?chapter=whats-new). Falls back to the default.
function initialChapter(): string {
  if (typeof window === "undefined") return DEFAULT_CHAPTER;
  const q = new URLSearchParams(window.location.search).get("chapter");
  return q && q in CHAPTERS ? q : DEFAULT_CHAPTER;
}

export default function App({ onComplete }: { onComplete?: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  // ── Demo orchestration state ──
  const [chapter, setChapter] = React.useState(initialChapter);
  const [autoDemoEnabled, setAutoDemoEnabled] = React.useState(true);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [demoDone, setDemoDone] = React.useState(false);
  const [replayNonce, setReplayNonce] = React.useState(0);
  const [spawnCorner, setSpawnCorner] = React.useState<Corner>("bottom-right");
  // The chrome URL bar path, reported by the product as it navigates.
  const [path, setPath] = React.useState("");

  // Hold off the scripted demo for a beat after mount so the page settles.
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setArmed(true);
      return;
    }
    const t = setTimeout(() => setArmed(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Fresh slate on every chapter switch. The product itself remounts via
  // key={chapter} below, so its internal state resets too.
  React.useEffect(() => {
    setDemoDone(false);
    setUserInteracted(false);
  }, [chapter]);

  const handleComplete = React.useCallback(() => {
    setDemoDone(true);
    onComplete?.();
  }, [onComplete]);

  const { cursorRef, visible: cursorVisible } = useAutoDemo(
    armed && autoDemoEnabled && !userInteracted,
    chapter,
    [autoDemoEnabled, replayNonce],
    handleComplete,
  );

  // ── Dev-panel handlers ──
  const handleToggleAutoDemo = React.useCallback(() => {
    setAutoDemoEnabled((v) => {
      const next = !v;
      if (next) setUserInteracted(false); // resume = replay from the top
      return next;
    });
  }, []);
  const handleRestartChapter = React.useCallback(() => {
    setUserInteracted(false);
    setAutoDemoEnabled(true);
    setReplayNonce((n) => n + 1);
  }, []);
  const handleChapterChange = React.useCallback((id: string) => {
    setAutoDemoEnabled(true);
    setChapter(id);
  }, []);
  const handleSpawn = React.useCallback(
    (id: string) => {
      window.__pdWidgets?.spawn?.(id, spawnCorner);
    },
    [spawnCorner],
  );
  const handleDismissAll = React.useCallback(() => {
    window.__pdWidgets?.dismissAll?.();
  }, []);
  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <div className="pd-frame">
      <div className="browser">
        {/* ── The product on display. Replace these two lines with yours. ── */}
        <BrowserChrome domain={SAMPLE_PRODUCT_DOMAIN} path={path} />
        <WidgetHost className="browser-body">
          <SampleProduct
            key={chapter}
            theme={theme}
            onToggleTheme={toggleTheme}
            onPathChange={setPath}
          />

          <WidgetsBridge />
          <DemoCursor cursorRef={cursorRef} visible={cursorVisible} />
          <HintTooltip
            idle={demoDone}
            enabled={!userInteracted && isChapterHintEnabled(chapter)}
            onInteract={() => {
              setUserInteracted(true);
              window.__pdWidgets?.dismissAll?.();
            }}
          />
        </WidgetHost>
      </div>

      <DevPanel
        chapter={chapter}
        onChapterChange={handleChapterChange}
        autoDemoEnabled={autoDemoEnabled}
        onToggleAutoDemo={handleToggleAutoDemo}
        theme={theme}
        onToggleTheme={toggleTheme}
        spawnCorner={spawnCorner}
        onCornerChange={setSpawnCorner}
        onSpawn={handleSpawn}
        onDismissAll={handleDismissAll}
        onRestartChapter={handleRestartChapter}
      />
    </div>
  );
}
