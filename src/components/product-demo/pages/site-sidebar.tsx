"use client";
import * as React from "react";
import { SIDEBAR } from "../config";

// Left-hand doc navigation. Each item carries `data-demo="nav-<id>"` so the
// cursor can target it.
export function SiteSidebar({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        padding: "20px 12px",
        overflowY: "auto",
      }}
    >
      {SIDEBAR.map((section) => (
        <div key={section.title} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-quaternary)",
              padding: "0 8px",
              marginBottom: 6,
            }}
          >
            {section.title}
          </div>
          {section.items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                data-demo={`nav-${item.id}`}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "none",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  background: isActive ? "var(--accent-bg)" : "transparent",
                  color: isActive ? "var(--brand-fg)" : "var(--fg-secondary)",
                  transition: "background 120ms, color 120ms",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
