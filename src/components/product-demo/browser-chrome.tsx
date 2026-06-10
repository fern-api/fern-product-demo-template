"use client";
import * as React from "react";
import { Icon } from "./icons";

// The macOS-style browser chrome: traffic lights, back/forward, and a live
// URL bar. Purely presentational — `domain` and `path` are passed in by App.
export function BrowserChrome({ domain, path }: { domain: string; path: string }) {
  return (
    <div className="browser-chrome">
      <div className="browser-lights">
        <div className="browser-light red" />
        <div className="browser-light yellow" />
        <div className="browser-light green" />
      </div>
      <div className="browser-nav" style={{ display: "flex", gap: 2 }}>
        <Icon name="chevronLeft" size={14} />
        <Icon name="chevronRight" size={14} />
      </div>
      <div className="browser-url">
        <span className="lock">
          <Icon name="lock" size={10} />
        </span>
        <span className="domain">{domain}</span>
        {path && <span>/</span>}
        <span className="path">{path}</span>
      </div>
      <div className="browser-right">
        <Icon name="moreHorizontal" size={14} />
      </div>
    </div>
  );
}
