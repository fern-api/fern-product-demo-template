"use client";
import * as React from "react";
import { Icon } from "../icons";
import { DOC_PAGES } from "../config";

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div
      style={{
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        margin: "14px 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderBottom: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--fg-tertiary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(content).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "none",
            color: "var(--fg-tertiary)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={12} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "var(--fg-secondary)",
          overflowX: "auto",
        }}
      >
        {content}
      </pre>
    </div>
  );
}

// Renders a single doc page from config. The activeId comes from the sidebar.
export function DocPage({ activeId }: { activeId: string }) {
  const page = DOC_PAGES[activeId] ?? DOC_PAGES.introduction;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 760, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--fg-quaternary)",
          marginBottom: 14,
        }}
      >
        {page.breadcrumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <Icon name="chevronRight" size={11} />}
            <span>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
        }}
      >
        {page.title}
      </h1>
      <p
        style={{
          margin: "8px 0 24px",
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--fg-tertiary)",
        }}
      >
        {page.subtitle}
      </p>

      {page.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          {section.heading && (
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--fg-primary)",
              }}
            >
              {section.heading}
            </h2>
          )}
          {section.paragraphs?.map((p, j) => (
            <p
              key={j}
              style={{
                margin: "0 0 12px",
                fontSize: 14.5,
                lineHeight: 1.7,
                color: "var(--fg-secondary)",
              }}
            >
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul
              style={{
                margin: "0 0 12px",
                paddingLeft: 20,
                color: "var(--fg-secondary)",
                fontSize: 14.5,
                lineHeight: 1.8,
              }}
            >
              {section.bullets.map((b) => (
                <li key={b}>
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      background: "var(--bg-muted)",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    {b}
                  </code>
                </li>
              ))}
            </ul>
          )}
          {section.code && (
            <CodeBlock lang={section.code.lang} content={section.code.content} />
          )}
        </div>
      ))}
    </div>
  );
}
