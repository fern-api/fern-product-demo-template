"use client";
/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE PRODUCT SWAP POINT
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything rendered *inside* the browser chrome lives here: the sample
 *  product's navigation state, page routing, and the __pdApp bridge chapter
 *  scripts use to drive it. For content-only changes, edit config.ts and
 *  never touch this file.
 *
 *  To demo a different kind of product entirely (a dashboard, an editor, a
 *  chat app), replace <SampleProduct /> in app.tsx with your own component.
 *  The contract with the framework is small:
 *    - install window.__pdApp so chapters can navigate it — its shape is
 *      yours to define, declared below; chapters are the only callers
 *    - call onPathChange(path) so the chrome URL bar tracks navigation
 *    - put data-demo="..." attributes on anything the cursor should click
 */
import * as React from "react";
import { SiteHeader } from "./site-header";
import { SiteSidebar } from "./site-sidebar";
import { HomePage } from "./home-page";
import { DocPage } from "./doc-page";
import { ChangelogPage } from "./changelog-page";
import { PRODUCT, SIDEBAR, type TabId } from "../config";

// Shown in the chrome URL bar (app.tsx passes it to <BrowserChrome>).
export const SAMPLE_PRODUCT_DOMAIN = `docs.${PRODUCT.domain}`;

// The imperative bridge chapter scripts use to navigate the product. Reshape
// it to whatever your product needs.
declare global {
  interface Window {
    __pdApp?: {
      setActiveTab: (id: string) => void;
      setActiveDoc: (id: string) => void;
      reset: () => void;
    } | null;
  }
}

export function SampleProduct({
  theme,
  onToggleTheme,
  onPathChange,
}: {
  theme: string;
  onToggleTheme: () => void;
  // Reports the URL-bar path ("", "docs/quickstart", "changelog", …).
  onPathChange?: (path: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<TabId>("home");
  const [activeDoc, setActiveDoc] = React.useState(SIDEBAR[0].items[0].id);

  React.useEffect(() => {
    window.__pdApp = {
      setActiveTab: (id) => setActiveTab(id as TabId),
      setActiveDoc: (id) => {
        setActiveDoc(id);
        setActiveTab("docs");
      },
      reset: () => {
        setActiveTab("home");
      },
    };
    return () => {
      window.__pdApp = null;
    };
  }, []);

  // URL bar path derived from the current page.
  const path =
    activeTab === "home"
      ? ""
      : activeTab === "docs"
        ? `docs/${activeDoc}`
        : "changelog";
  const onPathChangeRef = React.useRef(onPathChange);
  onPathChangeRef.current = onPathChange;
  React.useEffect(() => {
    onPathChangeRef.current?.(path);
  }, [path]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <SiteHeader
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {activeTab === "home" ? (
          <div className="pd-scroll" style={{ flex: 1 }}>
            <HomePage
              onSelect={(tile) => {
                if (tile.target.doc) setActiveDoc(tile.target.doc);
                setActiveTab(tile.target.tab);
              }}
            />
          </div>
        ) : activeTab === "docs" ? (
          <>
            <SiteSidebar activeId={activeDoc} onSelect={(id) => setActiveDoc(id)} />
            <div className="pd-scroll" style={{ flex: 1 }}>
              <DocPage activeId={activeDoc} />
            </div>
          </>
        ) : (
          <div className="pd-scroll" style={{ flex: 1 }}>
            <ChangelogPage />
          </div>
        )}
      </div>
    </div>
  );
}
