"use client";
/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE OVERLAY-WINDOW SWAP POINT
 * ─────────────────────────────────────────────────────────────────────────
 *  Register every spawnable overlay window here. Adding your own is two
 *  steps: drop a component next to notification-widget.tsx, then add an
 *  entry to WIDGETS below. The new window is immediately available to
 *    - chapter scripts:  window.__pdWidgets?.spawn?.("<id>", corner)
 *    - the dev panel:    a spawn button appears automatically
 *
 *  The framework that floats these (widgets.tsx) and the WidgetsBridge below
 *  are generic — they read from WIDGETS and never need to change.
 */
import * as React from "react";
import { useWidgets } from "../widgets";
import { NotificationWidget } from "./notification-widget";

export type Corner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type WidgetDef = {
  // Shown on the dev panel's spawn button.
  label: string;
  // Dev-panel button icon — see icons.tsx for the available names.
  icon: string;
  render: (ctx: { dismiss: () => void }) => React.ReactNode;
  // Corner used when a caller doesn't pass one. Default "bottom-right".
  defaultCorner?: Corner;
};

export const WIDGETS: Record<string, WidgetDef> = {
  notification: {
    label: "Notification",
    icon: "bell",
    render: ({ dismiss }) => <NotificationWidget onClose={dismiss} />,
    defaultCorner: "bottom-right",
  },
};

// The bridge chapter scripts and the dev panel use to spawn overlay windows
// without holding a React ref.
declare global {
  interface Window {
    __pdWidgets?: {
      spawn: (id: string, corner?: Corner) => void;
      dismissAll: () => void;
    } | null;
  }
}

// Maps a corner to the widget position + a natural entrance transition.
function cornerPosition(corner: Corner) {
  const transition = corner.startsWith("top") ? "drop" : "slide-up";
  return {
    position: { kind: "anchor" as const, anchor: corner, offset: [20, 20] as [number, number] },
    transition: transition as "drop" | "slide-up",
  };
}

// Installs window.__pdWidgets so chapter scripts and the dev panel can spawn
// any registered widget by id. Must live inside <WidgetHost>.
export function WidgetsBridge() {
  const widgets = useWidgets();
  const ref = React.useRef(widgets);
  ref.current = widgets;

  React.useEffect(() => {
    window.__pdWidgets = {
      spawn: (id: string, corner?: Corner) => {
        const def = WIDGETS[id];
        if (!def) return;
        const { position, transition } = cornerPosition(
          corner ?? def.defaultCorner ?? "bottom-right",
        );
        ref.current.spawn({
          id,
          render: ({ dismiss }) => def.render({ dismiss }),
          position,
          transition,
          dismissOnEsc: true,
        });
      },
      dismissAll: () => ref.current.dismissAll(),
    };
    return () => {
      window.__pdWidgets = null;
    };
  }, []);
  return null;
}
