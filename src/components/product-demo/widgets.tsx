"use client";
/*
 * Headless overlay-window system.
 *
 * Wrap a region in <WidgetHost> to make it a "surface", then call
 * useWidgets().spawn({ render, position, transition, ... }) to float a React
 * node over it. Handles positioning (anchor / absolute / relative-to-selector),
 * stacking, enter/exit transitions, and esc-to-dismiss.
 *
 * This file is product-agnostic — it knows nothing about your demo. See
 * widgets/notification-widget.tsx for an example of something to spawn.
 */
import * as React from "react";

type PositionSpec =
  | { kind: "absolute"; x: number; y: number }
  | {
      kind: "anchor";
      anchor?:
        | "top-left"
        | "top"
        | "top-right"
        | "left"
        | "center"
        | "right"
        | "bottom-left"
        | "bottom"
        | "bottom-right";
      offset?: [number, number];
    }
  | {
      kind: "selector";
      selector: string;
      placement?: "below" | "above" | "right" | "left" | "cover";
      offset?: [number, number];
    };

type SpawnOptions = {
  id?: string;
  render: (ctx: { id: string; dismiss: () => void }) => React.ReactNode;
  position?: PositionSpec;
  transition?: "pop" | "fade" | "slide-up" | "drop";
  dismissOnEsc?: boolean;
  dismissOnBackdrop?: boolean;
  backdrop?: boolean;
  stackKey?: string | null;
  stackGap?: number;
  stackAxis?: "x" | "y";
};

type Entry = {
  id: string;
  render: (ctx: { id: string; dismiss: () => void }) => React.ReactNode;
  position: PositionSpec;
  transition: "pop" | "fade" | "slide-up" | "drop";
  dismissOnEsc: boolean;
  dismissOnBackdrop: boolean;
  backdrop: boolean;
  stackKey: string | null;
  stackGap: number;
  stackAxis: "x" | "y";
  __dismissing: boolean;
  __requestDismiss: () => void;
};

export type WidgetsApi = {
  spawn: (opts: SpawnOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  dismissStack: (stackKey: string) => void;
  toggle: (id: string, opts: SpawnOptions) => boolean;
  has: (id: string) => boolean;
};

const WidgetContext = React.createContext<WidgetsApi | null>(null);

export function useWidgets(): WidgetsApi {
  const ctx = React.useContext(WidgetContext);
  if (!ctx) throw new Error("useWidgets() must be used inside <WidgetHost>");
  return ctx;
}

type ResolvedPosition = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  origin: string;
};

function resolvePosition(
  spec: PositionSpec | undefined,
  surface: HTMLElement,
  el: HTMLElement | null,
): ResolvedPosition {
  const sw = surface.clientWidth;
  const sh = surface.clientHeight;
  const ew = el ? el.offsetWidth : 0;
  const eh = el ? el.offsetHeight : 0;

  if (!spec || spec.kind === "anchor") {
    const anchor = spec?.anchor || "center";
    const [dx = 0, dy = 0] = spec?.offset || [0, 0];
    // Anchor to CSS edges (right/bottom) when possible so content growth
    // doesn't require a JS recompute — the browser keeps the anchored edge
    // pinned, avoiding a one-frame "appears low then jumps up" glitch.
    switch (anchor) {
      case "top-left":     return { left: dx,            top: dy,            origin: "top left" };
      case "top":          return { left: (sw - ew) / 2, top: dy,            origin: "top center" };
      case "top-right":    return { right: dx,           top: dy,            origin: "top right" };
      case "left":         return { left: dx,            top: (sh - eh) / 2, origin: "center left" };
      case "center":       return { left: (sw - ew) / 2, top: (sh - eh) / 2, origin: "center" };
      case "right":        return { right: dx,           top: (sh - eh) / 2, origin: "center right" };
      case "bottom-left":  return { left: dx,            bottom: dy,         origin: "bottom left" };
      case "bottom":       return { left: (sw - ew) / 2, bottom: dy,         origin: "bottom center" };
      case "bottom-right": return { right: dx,           bottom: dy,         origin: "bottom right" };
      default:             return { left: (sw - ew) / 2, top: (sh - eh) / 2, origin: "center" };
    }
  }

  if (spec.kind === "absolute") {
    return { left: spec.x ?? 0, top: spec.y ?? 0, origin: "top left" };
  }

  // selector
  const target = surface.querySelector(spec.selector) as HTMLElement | null;
  if (!target) {
    return { left: (sw - ew) / 2, top: (sh - eh) / 2, origin: "center" };
  }
  const sRect = surface.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  const tx = tRect.left - sRect.left;
  const ty = tRect.top - sRect.top;
  const [dx = 0, dy = 0] = spec.offset || [0, 0];
  switch (spec.placement || "below") {
    case "below":
      return { left: tx + dx, top: ty + tRect.height + dy, origin: "top left" };
    case "above":
      return { left: tx + dx, top: ty - eh - dy, origin: "bottom left" };
    case "right":
      return { left: tx + tRect.width + dx, top: ty + dy, origin: "center left" };
    case "left":
      return { left: tx - ew - dx, top: ty + dy, origin: "center right" };
    case "cover":
    default:
      return { left: tx + dx, top: ty + dy, origin: "top left" };
  }
}

function WidgetSlot({
  entry,
  surface,
  onDismiss,
  zIndex,
  stackDx,
  stackDy,
  onMeasure,
}: {
  entry: Entry;
  surface: HTMLElement;
  onDismiss: () => void;
  zIndex: number;
  stackDx: number;
  stackDy: number;
  onMeasure: (id: string, w: number, h: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = React.useState<"enter" | "active" | "exit">("enter");
  const [coords, setCoords] = React.useState<ResolvedPosition | null>(null);

  React.useLayoutEffect(() => {
    if (!ref.current || !surface) return;
    const measure = () => {
      const base = resolvePosition(entry.position, surface, ref.current);
      const next: ResolvedPosition = { origin: base.origin };
      if (base.top !== undefined) next.top = base.top + (stackDy || 0);
      if (base.bottom !== undefined) next.bottom = base.bottom + (stackDy || 0);
      if (base.left !== undefined) next.left = base.left + (stackDx || 0);
      if (base.right !== undefined) next.right = base.right + (stackDx || 0);
      setCoords(next);
      if (onMeasure && ref.current) {
        const r = ref.current.getBoundingClientRect();
        onMeasure(entry.id, r.width, r.height);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(surface);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [entry.position, surface, stackDx, stackDy, onMeasure, entry.id]);

  React.useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      setPhase((p) => (p === "enter" ? "active" : p));
    };
    const raf = requestAnimationFrame(() => setTimeout(go, 0));
    const backup = setTimeout(go, 80);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(backup);
    };
  }, []);

  React.useEffect(() => {
    if (entry.__dismissing && phase !== "exit") setPhase("exit");
    // Respawn-while-dismissing: a fresh entry reuses this slot with
    // __dismissing=false while phase is still "exit"; snap back to active.
    else if (!entry.__dismissing && phase === "exit") setPhase("active");
  }, [entry.__dismissing, phase]);

  React.useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => onDismiss(), 240);
    return () => clearTimeout(t);
  }, [phase, onDismiss]);

  const transition = entry.transition || "pop";
  const transformByPhase: Record<string, Record<string, string>> = {
    pop: {
      enter: "scale(0.92) translateY(6px)",
      active: "scale(1) translateY(0)",
      exit: "scale(0.94) translateY(4px)",
    },
    fade: { enter: "none", active: "none", exit: "none" },
    "slide-up": {
      enter: "translateY(16px)",
      active: "translateY(0)",
      exit: "translateY(10px)",
    },
    drop: {
      enter: "translateY(-20px)",
      active: "translateY(0)",
      exit: "translateY(-12px)",
    },
  };
  const opacity = phase === "active" ? 1 : 0;
  const transform = (transformByPhase[transition] || transformByPhase.pop)[phase];
  const placed = coords != null;

  return (
    <div
      ref={ref}
      className="pd-widget-slot"
      style={{
        position: "absolute",
        left: placed ? coords!.left : 0,
        top: placed ? coords!.top : 0,
        right: placed ? coords!.right : undefined,
        bottom: placed ? coords!.bottom : undefined,
        zIndex,
        transformOrigin: placed ? coords!.origin : "center",
        transform,
        opacity: placed ? opacity : 0,
        transition:
          "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      {entry.render({
        id: entry.id,
        dismiss: () => entry.__requestDismiss(),
      })}
    </div>
  );
}

export function WidgetHost({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [surfaceEl, setSurfaceEl] = React.useState<HTMLDivElement | null>(null);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const nextIdRef = React.useRef(1);
  const [sizes, setSizes] = React.useState<Record<string, { w: number; h: number }>>({});

  const api = React.useMemo<WidgetsApi>(() => {
    const dismiss = (id: string) => {
      setEntries((list) =>
        list.map((e) => (e.id === id ? { ...e, __dismissing: true } : e)),
      );
    };
    const dismissAll = () => {
      setEntries((list) => list.map((e) => ({ ...e, __dismissing: true })));
    };
    const dismissStack = (stackKey: string) => {
      setEntries((list) =>
        list.map((e) =>
          e.stackKey === stackKey && !e.__dismissing
            ? { ...e, __dismissing: true }
            : e,
        ),
      );
    };
    const spawn = (opts: SpawnOptions) => {
      const id = opts.id ?? `w_${nextIdRef.current++}`;
      setEntries((list) => {
        const without = list.filter((e) => e.id !== id);
        const entry: Entry = {
          id,
          render: opts.render,
          position: opts.position || { kind: "anchor", anchor: "center" },
          transition: opts.transition || "pop",
          dismissOnEsc: opts.dismissOnEsc !== false,
          dismissOnBackdrop: !!opts.dismissOnBackdrop,
          backdrop: !!opts.backdrop,
          stackKey: opts.stackKey || null,
          stackGap: opts.stackGap || 0,
          stackAxis: opts.stackAxis || "y",
          __dismissing: false,
          __requestDismiss: () => dismiss(id),
        };
        return [...without, entry];
      });
      return id;
    };
    const has = (id: string) =>
      entries.some((e) => e.id === id && !e.__dismissing);
    const toggle = (id: string, opts: SpawnOptions) => {
      if (entries.some((e) => e.id === id && !e.__dismissing)) {
        dismiss(id);
        return false;
      }
      spawn({ ...opts, id });
      return true;
    };
    return { spawn, dismiss, dismissAll, dismissStack, toggle, has };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const live = entries.filter((x) => !x.__dismissing);
      const top = live[live.length - 1];
      if (top && top.dismissOnEsc) api.dismiss(top.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entries, api]);

  const removeEntry = React.useCallback((id: string) => {
    setEntries((list) => list.filter((e) => e.id !== id));
    setSizes((s) => {
      if (!(id in s)) return s;
      const n = { ...s };
      delete n[id];
      return n;
    });
  }, []);

  const handleMeasure = React.useCallback((id: string, w: number, h: number) => {
    setSizes((prev) => {
      const cur = prev[id];
      if (cur && Math.abs(cur.h - h) < 0.5 && Math.abs(cur.w - w) < 0.5) return prev;
      return { ...prev, [id]: { w, h } };
    });
  }, []);

  const stackOffsets = React.useMemo(() => {
    const cumByKey: Record<string, number> = {};
    const offsets: Record<string, { dx: number; dy: number }> = {};
    entries.forEach((e) => {
      if (!e.stackKey || e.__dismissing) {
        offsets[e.id] = { dx: 0, dy: 0 };
        return;
      }
      const anchor =
        e.position.kind === "anchor" ? String(e.position.anchor || "") : "";
      const axis = e.stackAxis || "y";
      const sign =
        axis === "y"
          ? anchor.startsWith("bottom")
            ? -1
            : 1
          : anchor.endsWith("right")
            ? -1
            : 1;
      const prior = cumByKey[e.stackKey] || 0;
      offsets[e.id] =
        axis === "y" ? { dx: 0, dy: prior * sign } : { dx: prior * sign, dy: 0 };
      const measured = sizes[e.id];
      const gap = e.stackGap || 0;
      const advance = measured
        ? (axis === "y" ? measured.h : measured.w) + gap
        : gap;
      cumByKey[e.stackKey] = prior + advance;
    });
    return offsets;
  }, [entries, sizes]);

  return (
    <WidgetContext.Provider value={api}>
      <div
        ref={setSurfaceEl}
        className={className}
        style={{ position: "relative", ...(style || {}) }}
      >
        {children}
        {surfaceEl &&
          entries.map((entry, i) => (
            <React.Fragment key={entry.id}>
              {entry.backdrop && !entry.__dismissing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.25)",
                    zIndex: 1300 + i * 2,
                    animation: "pd-fadeIn 180ms ease",
                  }}
                  onClick={() => entry.dismissOnBackdrop && api.dismiss(entry.id)}
                />
              )}
              <WidgetSlot
                entry={entry}
                surface={surfaceEl}
                zIndex={1301 + i * 2}
                stackDx={stackOffsets[entry.id]?.dx || 0}
                stackDy={stackOffsets[entry.id]?.dy || 0}
                onMeasure={handleMeasure}
                onDismiss={() => removeEntry(entry.id)}
              />
            </React.Fragment>
          ))}
      </div>
    </WidgetContext.Provider>
  );
}
