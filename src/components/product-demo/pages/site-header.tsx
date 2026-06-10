"use client";
import * as React from "react";
import { Icon } from "../icons";
import { PRODUCT, TABS, type TabId } from "../config";

// Top nav: product wordmark, a (decorative) search box, theme toggle, and the
// tab row. Tabs carry `data-demo="tab-<id>"` so the cursor can click them.
export function SiteHeader({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
}: {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  theme: string;
  onToggleTheme: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "color-mix(in srgb, var(--bg-surface) 80%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            color: "var(--fg-primary)",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "-0.01em",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "var(--brand-gradient)",
              display: "inline-block",
            }}
          />
          {PRODUCT.name}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 420,
              height: 32,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 10px",
              color: "var(--fg-tertiary)",
              fontSize: 13,
            }}
          >
            <Icon name="search" size={13} />
            <span style={{ flex: 1, textAlign: "left" }}>Search</span>
            <kbd
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                padding: "2px 5px",
                borderRadius: 4,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--fg-tertiary)",
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--fg-secondary)",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={14} />
        </button>
      </div>

      <div
        style={{
          height: 38,
          display: "flex",
          alignItems: "stretch",
          padding: "0 8px",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-demo={`tab-${tab.id}`}
              style={{
                position: "relative",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--fg-primary)" : "var(--fg-tertiary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 120ms",
              }}
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 12,
                    right: 12,
                    height: 2,
                    background: "var(--brand-gradient)",
                    borderRadius: "2px 2px 0 0",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
