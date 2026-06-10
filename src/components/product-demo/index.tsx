"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { demoSans, demoMono } from "./fonts";
import "./theme.css";

// The App subtree relies on browser-only APIs (window, document, portals), so
// it's loaded client-only. The wrapper below carries the scoped font + token
// classes; App fades in once its chunk arrives.
const App = dynamic(() => import("./app"), { ssr: false, loading: () => null });

// Reads the theme from <html class="dark"> directly. next-themes' inline
// script sets this before hydration, so it's correct on first paint.
function useHtmlTheme(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  React.useEffect(() => {
    const html = document.documentElement;
    const read = () => (html.classList.contains("dark") ? "dark" : "light");
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function ProductDemo({ onComplete }: { onComplete?: () => void }) {
  const theme = useHtmlTheme();
  const fontVars = `${demoSans.variable} ${demoMono.variable}`;

  return (
    <div className={`pd-root pd-tokens ${fontVars}`} data-theme={theme}>
      <div className="pd-frame-scale">
        <App onComplete={onComplete} />
      </div>
    </div>
  );
}
