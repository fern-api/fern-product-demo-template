"use client";
import * as React from "react";
import { Icon } from "../icons";
import { HOME_TILES, PRODUCT, type Tile } from "../config";

// The Home tab: a hero line and a grid of clickable tiles. Each tile carries
// `data-demo="tile-<id>"` for the cursor and navigates via onSelect.
export function HomePage({ onSelect }: { onSelect: (tile: Tile) => void }) {
  return (
    <div style={{ padding: "48px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--brand-fg)",
            marginBottom: 8,
          }}
        >
          {PRODUCT.name} docs
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
          }}
        >
          Build with {PRODUCT.name}
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--fg-tertiary)",
            maxWidth: 560,
          }}
        >
          {PRODUCT.tagline}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {HOME_TILES.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onSelect(tile)}
            data-demo={`tile-${tile.id}`}
            style={{
              textAlign: "left",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 18,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 140ms, transform 140ms, box-shadow 140ms",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "var(--accent-bg)",
                color: "var(--brand-fg)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={tile.icon} size={17} />
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--fg-quaternary)",
              }}
            >
              {tile.eyebrow}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--fg-primary)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tile.title}
              <Icon name="arrowRight" size={14} />
            </span>
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--fg-tertiary)",
              }}
            >
              {tile.body}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
