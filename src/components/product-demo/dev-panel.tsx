"use client";
import * as React from "react";
import { Icon } from "./icons";
import { CHAPTERS } from "./chapters";
import { WIDGETS, type Corner } from "./widgets/registry";

const CORNERS: Corner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

// Playful palette — a light card with a bold fern-green border and a dotted
// backdrop. Self-contained (independent of the demo's theme tokens) so it
// reads consistently on the page backdrop.
const GREEN = "#3f8f5c";
const GREEN_DK = "#2f6d44";
const INK = "#18271e";
const MUTED = "#7c8a82";
const CARD = "#ffffff";
const LEAF = "#edf6f0";
const BORDER_SOFT = "#d8e9de";
// Subtle grey depth shadow for inactive pills so they sit at the same height
// as active (green) ones — toggling recolors the shadow instead of adding it.
const SHADOW_SOFT = "#dde0e3";
const DOTS =
  "radial-gradient(circle, rgba(63,143,92,0.14) 1.1px, transparent 1.1px)";

// A floating dev/tweaks panel for driving the demo by hand: pause the
// auto-demo, switch chapters, spawn an overlay window in any corner, toggle
// theme. Chapter and spawn buttons are generated from CHAPTERS / WIDGETS, so
// new entries show up here automatically. Collapsible. Hide it in production
// by not rendering <DevPanel>.
export function DevPanel({
  chapter,
  onChapterChange,
  autoDemoEnabled,
  onToggleAutoDemo,
  theme,
  onToggleTheme,
  spawnCorner,
  onCornerChange,
  onSpawn,
  onDismissAll,
  onRestartChapter,
}: {
  chapter: string;
  onChapterChange: (id: string) => void;
  autoDemoEnabled: boolean;
  onToggleAutoDemo: () => void;
  theme: string;
  onToggleTheme: () => void;
  spawnCorner: Corner;
  onCornerChange: (c: Corner) => void;
  onSpawn: (id: string) => void;
  onDismissAll: () => void;
  onRestartChapter: () => void;
}) {
  const [open, setOpen] = React.useState(true);

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: MUTED,
    marginBottom: 7,
  };

  // Chunky rounded "pill" buttons. Both states carry the same 2px drop shadow
  // so they sit at a consistent height — active just swaps grey for green.
  const pill = (active?: boolean): React.CSSProperties => ({
    appearance: "none",
    background: active ? GREEN : CARD,
    border: `1.5px solid ${active ? GREEN : BORDER_SOFT}`,
    borderRadius: 11,
    color: active ? "#fff" : INK,
    padding: "7px 11px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: `0 2px 0 ${active ? GREEN_DK : SHADOW_SOFT}`,
    transition: "transform 90ms ease, box-shadow 90ms ease",
  });

  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 10000,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          background: CARD,
          backgroundImage: open ? DOTS : "none",
          backgroundSize: "13px 13px",
          border: `2.5px solid ${GREEN}`,
          borderRadius: 18,
          boxShadow:
            "0 16px 34px -10px rgba(28,86,52,0.45), 0 3px 0 rgba(63,143,92,0.28)",
          width: open ? 274 : "auto",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 13px",
            background: LEAF,
            border: "none",
            borderBottom: open ? `2px solid ${BORDER_SOFT}` : "none",
            color: INK,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: GREEN,
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 2px 0 ${GREEN_DK}`,
            }}
          >
            <Icon name="sliders" size={13} stroke={2.4} />
          </span>
          <span style={{ flex: 1, textAlign: "left" }}>Demo controls</span>
          <span style={{ color: GREEN, display: "inline-flex" }}>
            <Icon name={open ? "chevronDown" : "chevronRight"} size={16} stroke={2.6} />
          </span>
        </button>

        {open && (
          <div style={{ padding: 13, display: "flex", flexDirection: "column", gap: 15 }}>
            {/* Auto-demo */}
            <div>
              <div style={sectionLabel}>Auto-demo</div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={onToggleAutoDemo} style={{ ...pill(autoDemoEnabled), flex: 1 }}>
                  <Icon name={autoDemoEnabled ? "pause" : "play"} size={13} stroke={2.4} />
                  {autoDemoEnabled ? "Pause" : "Play"}
                </button>
                <button onClick={onRestartChapter} style={pill()} title="Restart chapter">
                  <Icon name="rotateCcw" size={13} stroke={2.4} />
                </button>
              </div>
            </div>

            {/* Chapters */}
            <div>
              <div style={sectionLabel}>Chapter</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {Object.entries(CHAPTERS).map(([id, ch]) => (
                  <button
                    key={id}
                    onClick={() => onChapterChange(id)}
                    style={{ ...pill(chapter === id), justifyContent: "flex-start" }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay windows */}
            <div>
              <div style={sectionLabel}>Overlay window</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                  marginBottom: 7,
                }}
              >
                {CORNERS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onCornerChange(c)}
                    style={{
                      ...pill(spawnCorner === c),
                      fontSize: 11,
                      padding: "6px 9px",
                      justifyContent: "center",
                    }}
                  >
                    {c.replace("-", " ")}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {Object.entries(WIDGETS).map(([id, w]) => (
                  <button
                    key={id}
                    onClick={() => onSpawn(id)}
                    style={{ ...pill(), justifyContent: "flex-start" }}
                  >
                    <Icon name={w.icon} size={13} stroke={2.4} />
                    Spawn {w.label.toLowerCase()}
                  </button>
                ))}
                {/* Ghost button — no fill/border/shadow, just muted text. */}
                <button
                  onClick={onDismissAll}
                  title="Dismiss all"
                  style={{
                    appearance: "none",
                    background: "transparent",
                    border: "none",
                    borderRadius: 11,
                    color: MUTED,
                    padding: "6px 11px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 6,
                    transition: "background 90ms ease, color 90ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = LEAF;
                    e.currentTarget.style.color = INK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = MUTED;
                  }}
                >
                  <Icon name="x" size={13} stroke={2.4} />
                  Dismiss all
                </button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <div style={sectionLabel}>Theme</div>
              <button onClick={onToggleTheme} style={{ ...pill(), width: "100%", justifyContent: "center" }}>
                <Icon name={theme === "dark" ? "sun" : "moon"} size={13} stroke={2.4} />
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
