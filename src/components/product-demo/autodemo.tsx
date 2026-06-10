"use client";
/*
 * The scripted-cursor engine.
 *
 * useAutoDemo(enabled, chapter, deps, onComplete) runs a per-chapter script of
 * steps. Each step names a target selector, waits, then performs an action
 * (click / hover / escape / custom). DemoCursor is a portalled SVG cursor that
 * glides to each target; HintTooltip shows "Click to interact" and hands the
 * demo over to a real user on first click.
 *
 * Chapters drive the app imperatively through two window bridges:
 * window.__pdApp (navigate the product — installed by the product shell,
 * which defines its shape) and window.__pdWidgets (spawn/dismiss overlay
 * windows — installed by WidgetsBridge in widgets/registry.tsx). Keeping
 * chapters decoupled this way means a script never holds a React ref — it
 * just calls the bridge.
 *
 * The chapters themselves are content and live in chapters.ts — this engine
 * only reads CHAPTERS and never needs to change per-product.
 */
import * as React from "react";
import ReactDOM from "react-dom";

import { CHAPTERS, type ChapterContext } from "./chapters";

// The surface the cursor and hint operate over.
const SURFACE_SELECTOR = ".pd-root .browser-body";

export function useAutoDemo(
  enabled: boolean,
  chapter: string,
  deps: React.DependencyList,
  onComplete?: () => void,
) {
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cursorRef = React.useRef<HTMLDivElement | null>(null);
  const cancelled = React.useRef(false);
  const hoveredElRef = React.useRef<Element | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    const script = CHAPTERS[chapter];
    if (!script) return;

    cancelled.current = false;
    window.__pdWidgets?.dismissAll?.();
    const timers: ReturnType<typeof setTimeout>[] = [];

    const clearHover = () => {
      const h = hoveredElRef.current;
      if (h) {
        try {
          h.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
          h.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
        } catch {}
        hoveredElRef.current = null;
      }
    };

    // A real pointerdown on the surface cancels the demo — the user takes over.
    const interactRoot = document.querySelector(
      SURFACE_SELECTOR,
    ) as HTMLElement | null;
    const demoFlag = { active: false };
    const takeover = () => {
      // The demo's simulated clicks dispatch `click`, not `pointerdown`, so
      // this won't fire from the script itself.
      if (demoFlag.active) return;
      cancelled.current = true;
      clearHover();
      setVisible(false);
      timers.forEach(clearTimeout);
      interactRoot?.removeEventListener("pointerdown", takeover);
    };
    if (script.interruptible !== false) {
      interactRoot?.addEventListener("pointerdown", takeover);
    }

    // Must match the transform transition on .pd-cursor in theme.css.
    const CURSOR_TRANSITION_MS = 700;

    const readCursorXY = (cursor: HTMLElement): [number, number] => {
      const m = cursor.style.transform.match(
        /translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/,
      );
      return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0];
    };

    const moveTo = (
      el: Element,
      cursor: HTMLElement,
      offset?: [number, number],
    ) => {
      if (!el || !cursor) return;
      const b = (el as HTMLElement).getBoundingClientRect();
      const [dx = 0, dy = 0] = offset || [0, 0];
      const x = b.left + window.scrollX + b.width / 2 + dx;
      const y = b.top + window.scrollY + b.height / 2 + dy;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    const runStep = (i: number) => {
      const steps = script.steps;
      if (cancelled.current || i >= steps.length) {
        if (!cancelled.current && script.loop && steps.length > 0) {
          timers.push(setTimeout(() => runStep(0), 1500));
        } else if (!cancelled.current) {
          clearHover();
          setVisible(false);
          const fireComplete = () => {
            if (cancelled.current) return;
            onCompleteRef.current?.();
          };
          const delay = script.completeAfter ?? 0;
          if (delay > 0) timers.push(setTimeout(fireComplete, delay));
          else fireComplete();
        }
        return;
      }
      const step = steps[i];
      const cursor = cursorRef.current;
      if (!cursor) {
        timers.push(setTimeout(() => runStep(i + 1), 300));
        return;
      }

      const pollBudget = Math.max(step.delay || 800, 10000);
      const pollStart = Date.now();
      // First *visible* match — display:none twins report a zero rect.
      const findVisible = (selector: string): Element | null => {
        const all = document.querySelectorAll(selector);
        for (const el of all) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return el;
        }
        return null;
      };
      const waitForTarget = (onFound: (el: Element) => void) => {
        if (cancelled.current) return;
        const el = findVisible(step.target);
        if (el) return onFound(el);
        if (Date.now() - pollStart > pollBudget) {
          timers.push(setTimeout(() => runStep(i + 1), 100));
          return;
        }
        timers.push(setTimeout(() => waitForTarget(onFound), 120));
      };

      waitForTarget((el) => {
        setVisible(true);
        const [prevX, prevY] = readCursorXY(cursor);
        moveTo(el, cursor, step.offset);
        const [nextX, nextY] = readCursorXY(cursor);
        // Hold the action until the cursor visibly lands when there's a move.
        const moved = Math.hypot(nextX - prevX, nextY - prevY) > 4;
        const arrivalDelay = moved ? CURSOR_TRANSITION_MS : 0;
        const actionDelay = Math.max(step.delay || 800, arrivalDelay);
        const hoverDelay = moved ? arrivalDelay : Math.min(step.delay || 800, 600);

        const prevHover = hoveredElRef.current;
        if (prevHover && prevHover !== el) {
          try {
            prevHover.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
            prevHover.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
          } catch {}
        }
        hoveredElRef.current = el;

        timers.push(
          setTimeout(() => {
            if (cancelled.current) return;
            try {
              el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
              el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
            } catch {}
          }, hoverDelay),
        );

        timers.push(
          setTimeout(() => {
            if (cancelled.current) return;

            if (step.action === "hover") {
              timers.push(
                setTimeout(() => {
                  if (hoveredElRef.current === el) {
                    el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
                    el.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
                    hoveredElRef.current = null;
                  }
                }, Math.max(200, (step.hold || 700) - 100)),
              );
              timers.push(setTimeout(() => runStep(i + 1), step.hold || 700));
              return;
            }

            cursor.classList.add("clicking");

            if (step.action === "escape") {
              demoFlag.active = true;
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
              );
              timers.push(setTimeout(() => (demoFlag.active = false), 50));
            } else if (step.action === "custom" && typeof step.run === "function") {
              demoFlag.active = true;
              try {
                step.run();
              } catch {}
              timers.push(setTimeout(() => (demoFlag.active = false), 200));
            } else {
              demoFlag.active = true;
              el.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true }),
              );
              timers.push(setTimeout(() => (demoFlag.active = false), 50));
            }

            timers.push(setTimeout(() => cursor.classList.remove("clicking"), 400));
            timers.push(setTimeout(() => runStep(i + 1), step.hold || 700));
          }, actionDelay),
        );
      });
    };

    const ctx: ChapterContext = {
      schedule: (fn, ms) => {
        timers.push(
          setTimeout(() => {
            if (cancelled.current) return;
            try {
              fn();
            } catch {}
          }, ms),
        );
      },
    };

    // Defer onEnter slightly so the window bridges have mounted.
    timers.push(
      setTimeout(() => {
        if (cancelled.current) return;
        try {
          script.onEnter?.(ctx);
        } catch {}
      }, 50),
    );
    timers.push(setTimeout(() => runStep(0), 200));

    return () => {
      clearHover();
      setVisible(false);
      timers.forEach(clearTimeout);
      interactRoot?.removeEventListener("pointerdown", takeover);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, chapter, ...deps]);

  return { cursorRef, visible };
}

export function DemoCursor({
  cursorRef,
  visible,
}: {
  cursorRef: React.MutableRefObject<HTMLDivElement | null>;
  visible: boolean;
}) {
  const [theme, setTheme] = React.useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  React.useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() =>
      setTheme(html.classList.contains("dark") ? "dark" : "light"),
    );
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Park the cursor at the surface center on mount (without animating from the
  // CSS default top-left). useLayoutEffect + suppressed transition = clean jump.
  React.useLayoutEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    let cancelled = false;
    const apply = (surface: HTMLElement) => {
      const r = surface.getBoundingClientRect();
      const x = r.left + window.scrollX + r.width / 2;
      const y = r.top + window.scrollY + r.height / 2;
      const prev = cursor.style.transition;
      cursor.style.transition = "none";
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      void cursor.offsetHeight;
      cursor.style.transition = prev;
    };
    const tick = () => {
      if (cancelled) return;
      const surface = document.querySelector(SURFACE_SELECTOR) as HTMLElement | null;
      if (!surface) {
        requestAnimationFrame(tick);
        return;
      }
      apply(surface);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [cursorRef]);

  return ReactDOM.createPortal(
    <div data-theme={theme}>
      <div ref={cursorRef} className={`pd-cursor ${visible ? "visible" : ""}`}>
        <svg
          viewBox="0 0 26.62 32"
          width="26.62"
          height="32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 21.319 19.252 L 12.219 20.64 C 11.668 20.724 11.171 21.021 10.836 21.466 L 6.24 27.576 C 5.067 29.136 2.588 28.431 2.411 26.487 L 0.414 4.547 C 0.25 2.744 2.265 1.569 3.753 2.601 L 22.212 15.39 C 23.798 16.489 23.227 18.961 21.319 19.252 Z"
            fill="rgb(0,0,0)"
            stroke="#ffffff"
            strokeWidth="2.226"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>,
    document.body,
  );
}

export function HintTooltip({
  label = "Click to interact",
  enabled = true,
  idle = true,
  onInteract,
}: {
  label?: string;
  enabled?: boolean;
  idle?: boolean;
  onInteract?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const onInteractRef = React.useRef(onInteract);
  React.useLayoutEffect(() => {
    onInteractRef.current = onInteract;
  });

  React.useEffect(() => {
    if (!enabled) return;
    const surface = document.querySelector(SURFACE_SELECTOR) as HTMLElement | null;
    const tip = ref.current;
    if (!surface || !tip) return;

    const root = surface.closest(".pd-root") as HTMLElement | null;
    root?.classList.add("inviting");

    let alreadyHovering = false;
    try {
      alreadyHovering = surface.matches(":hover");
    } catch {}
    if (idle && !alreadyHovering) tip.classList.add("centered");

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;
    let pending = false;
    let recenterTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let retired = false;

    // Matches the CSS opacity transition on .pd-hint.
    const FADE_OUT_MS = 200;

    const fadeOutCentered = () => {
      if (!tip.classList.contains("centered")) return;
      if (tip.classList.contains("fading-out")) return;
      tip.classList.add("fading-out");
      if (fadeTimer) clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => {
        fadeTimer = undefined;
        if (retired) return;
        tip.classList.remove("centered");
        tip.classList.remove("fading-out");
      }, FADE_OUT_MS);
    };

    const onEnter = () => {
      if (retired) return;
      if (recenterTimer) {
        clearTimeout(recenterTimer);
        recenterTimer = undefined;
      }
      fadeOutCentered();
    };
    const onMove = (e: PointerEvent) => {
      if (retired) return;
      const r = surface.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      nextX = x;
      nextY = y;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(() => {
          pending = false;
          if (retired) return;
          fadeOutCentered();
          tip.style.setProperty("--hx", nextX + "px");
          tip.style.setProperty("--hy", nextY + "px");
          tip.classList.add("visible");
        });
      }
    };
    const onLeave = () => {
      tip.classList.remove("visible");
      if (retired) return;
      if (fadeTimer) {
        clearTimeout(fadeTimer);
        fadeTimer = undefined;
        tip.classList.remove("fading-out");
      }
      if (!idle) return;
      if (recenterTimer) clearTimeout(recenterTimer);
      recenterTimer = setTimeout(() => {
        if (retired) return;
        tip.classList.add("centered");
      }, 220);
    };
    const onDown = () => {
      retired = true;
      tip.classList.remove("visible");
      tip.classList.remove("centered");
      tip.classList.remove("fading-out");
      if (recenterTimer) clearTimeout(recenterTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      root?.classList.remove("inviting");
      onInteractRef.current?.();
    };

    surface.addEventListener("pointerenter", onEnter);
    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerleave", onLeave);
    surface.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(rafId);
      if (recenterTimer) clearTimeout(recenterTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      surface.removeEventListener("pointerenter", onEnter);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
      surface.removeEventListener("pointerdown", onDown);
      root?.classList.remove("inviting");
      tip.classList.remove("visible");
      tip.classList.remove("centered");
      tip.classList.remove("fading-out");
    };
  }, [enabled, idle]);

  return (
    <div ref={ref} className="pd-hint" aria-hidden="true">
      <span className="pd-hint-dot" />
      <span>{label}</span>
    </div>
  );
}
