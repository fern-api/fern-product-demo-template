"use client";
import * as React from "react";
import { Icon } from "../icons";
import { PRODUCT } from "../config";

/**
 * Example overlay window.
 *
 * This is the canonical thing-you-spawn: a small floating card with its own
 * chrome (icon, title, close button) and an action button. It's intentionally
 * generic — copy this file to build your own overlay windows (a terminal, a
 * chat panel, a settings sheet, etc.), then register them in registry.tsx
 * next door. The spawn framework (widgets.tsx) handles positioning/stacking/
 * transitions; this component only renders the card and wires its buttons to
 * `onClose`.
 *
 * The action button carries `data-demo="notif-action"` so the scripted cursor
 * can click it during the "What's new" chapter.
 */
export function NotificationWidget({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        width: 320,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: 12,
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "var(--accent-bg)",
            color: "var(--brand-fg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="bell" size={15} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-primary)",
            }}
          >
            {PRODUCT.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-quaternary)" }}>
            just now
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            width: 26,
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 6,
            color: "var(--fg-tertiary)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Icon name="x" size={15} />
        </button>
      </div>

      <div style={{ padding: "14px" }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--fg-primary)",
            marginBottom: 4,
          }}
        >
          This is an overlay window
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--fg-tertiary)",
          }}
        >
          Spawned over the demo surface and placeable in any corner. Swap this
          card for whatever your product needs.
        </p>
        <button
          onClick={onClose}
          data-demo="notif-action"
          style={{
            width: "100%",
            height: 34,
            background: "var(--brand-gradient)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
