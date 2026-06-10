"use client";
import * as React from "react";
import { CHANGELOG } from "../config";

const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  Added: { bg: "var(--accent-bg)", fg: "var(--brand-fg)" },
  Fixed: { bg: "rgba(16,185,129,0.12)", fg: "#10b981" },
  Changed: { bg: "rgba(245,158,11,0.12)", fg: "#d97706" },
};

export function ChangelogPage() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 720, margin: "0 auto" }}>
      <h1
        style={{
          margin: "0 0 24px",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
        }}
      >
        Changelog
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {CHANGELOG.map((entry, i) => (
          <div
            key={entry.version}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 20,
              padding: "20px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  color: "var(--fg-primary)",
                }}
              >
                {entry.version}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-quaternary)", marginTop: 2 }}>
                {entry.date}
              </div>
            </div>
            <div>
              {entry.tag && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    marginBottom: 8,
                    background: TAG_COLORS[entry.tag]?.bg,
                    color: TAG_COLORS[entry.tag]?.fg,
                  }}
                >
                  {entry.tag}
                </span>
              )}
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--fg-primary)",
                }}
              >
                {entry.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--fg-tertiary)",
                }}
              >
                {entry.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
