<br/>
<div align="left">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern&utm_content=logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/fern-api/fern/raw/main/fern/images/logo-white.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/fern-api/fern/raw/main/fern/images/logo-primary.svg">
      <img alt="logo" src="https://github.com/fern-api/fern/raw/main/fern/images/logo-primary.svg" height="80" align="center">
    </picture>
  </a>
</div>
<br/>
  
# Product Demo Template

A lean boilerplate for building **animated product demos** — the kind that sit
on a marketing homepage: a fake product running inside a browser-chrome frame,
with a simulated cursor that clicks through scripted "chapters," a framework for
spawning floating overlay windows, and a dev panel to drive it all by hand.

Inspired from [Fern's marketing-site](https://buildwithfern.com/) homepage
animation into a reusable, product-agnostic starting point. Swap in your own
product, keep the machinery.

```bash
npm install
npm run dev      # http://localhost:3000
```

<img width="1880" height="1184" alt="fern-product-demo-template-screenshot" src="https://github.com/user-attachments/assets/5be494a4-5add-4b97-8334-e2d3ed1add14" />


---

## What's included

| Piece | Where | Notes |
| --- | --- | --- |
| **Browser chrome** | `browser-chrome.tsx` + `theme.css` | Traffic lights, back/forward, live URL bar. |
| **Scripted-cursor engine** | `autodemo.tsx` | A portalled SVG cursor that glides to targets and clicks. Includes the "Click to interact" hand-off to real users. Never needs editing. |
| **Demo chapters** | `chapters.ts` | The scripts the cursor runs — arrays of steps. **Swap point.** |
| **Overlay-window framework** | `widgets.tsx` | `WidgetHost` + `useWidgets().spawn()`. Anchor/selector positioning, any corner, stacking, enter/exit transitions, esc-to-dismiss. |
| **Overlay-window registry** | `widgets/registry.tsx` + `widgets/notification-widget.tsx` | Register your own windows here; the example notification card shows the shape. **Swap point.** |
| **Dev panel** | `dev-panel.tsx` | Pause the auto-demo, switch chapters, spawn windows in any corner, toggle theme. Buttons are generated from `CHAPTERS` / `WIDGETS`. |
| **Sample product** | `config.ts` + `pages/` | A generic docs-style site (Home tiles, sidebar, doc pages, changelog). **This is what you replace.** |
| **Theming** | `theme.css` | Scoped light/dark token system. Recolor the brand accent in one place. |

Everything is scoped under `.pd-root` / `.pd-tokens` so nothing leaks into the
surrounding app.

---

## Swapping in your own product

There are exactly three files you're meant to edit, and none of them are
machinery:

1. **`config.ts`** — the product's content
2. **`chapters.ts`** — the scripted demos the cursor runs
3. **`widgets/registry.tsx`** — the overlay windows that can be spawned

`config.ts` re-skins the demo without touching anything else:

- `PRODUCT` — name, domain, tagline (shown in the chrome URL bar + page heading)
- `TABS` — the top-level nav tabs
- `SIDEBAR` — the left-hand nav on the Docs tab
- `HOME_TILES` — the cards on the Home tab
- `DOC_PAGES` — the body content for each sidebar item
- `CHANGELOG` — entries on the Changelog tab

For bigger changes, the sample product is a single self-contained component:
**`pages/sample-product.tsx`** owns its navigation state, page routing, and
the `window.__pdApp` bridge chapters use to drive it; the page components it
renders (`site-header`, `site-sidebar`, `home-page`, `doc-page`,
`changelog-page`) are plain React. To demo something else entirely — a
dashboard, an editor, a chat app — write your own component and swap the two
marked lines in `app.tsx` (`<BrowserChrome domain=…>` and
`<SampleProduct />`). Keep the `data-demo="..."` attributes on anything the
cursor needs to click, and reshape the `__pdApp` bridge to whatever
navigation your product has — chapters are its only callers.

Recolor the whole demo by editing the two brand stops in `theme.css`
(`--brand-fg` and `--accent-bg`, in both the light and `html.dark` blocks).

---

## Writing a demo chapter

Chapters live in `CHAPTERS` in **`chapters.ts`** — the engine that runs them
(`autodemo.tsx`) is generic and never needs editing. A chapter stages the
page (`onEnter`) then runs a list of `steps`:

```ts
myChapter: {
  label: "My demo",
  onEnter: (ctx) => {
    window.__pdApp?.reset?.();
    window.__pdApp?.setActiveTab?.("docs");
    // ctx.schedule(fn, ms) defers work that's cancelled if the chapter exits
  },
  steps: [
    // Click an element by its data-demo attribute
    { target: '[data-demo="nav-quickstart"]', delay: 1200, hold: 900, action: "click" },
    // Run arbitrary code at a cursor position (e.g. spawn a window)
    {
      target: '[data-demo="tab-home"]',
      delay: 800, hold: 2000, action: "custom",
      run: () => window.__pdWidgets?.spawn?.("notification", "bottom-right"),
    },
  ],
},
```

Step actions: `click`, `hover`, `escape`, `custom` (calls `run`). Other knobs:
`loop`, `completeAfter`, `interruptible`, `hint`. The cursor targets the first
**visible** match for the selector and waits for it to appear, so timing is
forgiving.

Chapters drive the app through two `window` bridges:

- `window.__pdApp` — navigate the product (`setActiveTab`, `setActiveDoc`,
  `reset`). Installed by the product shell (`pages/sample-product.tsx`),
  which also defines its shape — reshape it for your own product.
- `window.__pdWidgets` — spawn / dismiss overlay windows by registry id
  (`spawn("notification", "bottom-right")`). Installed by `WidgetsBridge`
  (`widgets/registry.tsx`).

This keeps chapters decoupled — they never hold a React ref.

A chapter is deep-linkable: `/?chapter=whats-new` starts the demo on that chapter.

---

## Spawning overlay windows

To add your own overlay window: copy `widgets/notification-widget.tsx`,
then register it in `WIDGETS` in **`widgets/registry.tsx`**:

```tsx
myTerminal: {
  label: "Terminal",
  icon: "code",
  render: ({ dismiss }) => <TerminalWidget onClose={dismiss} />,
  defaultCorner: "bottom-left",
},
```

That's the whole change — it's immediately spawnable from chapter scripts
(`window.__pdWidgets?.spawn?.("myTerminal", corner)`) and gets its own button
in the dev panel.

For full control (custom positioning, stacking, backdrops), anything inside
`<WidgetHost>` can call `useWidgets()` directly:

```tsx
const widgets = useWidgets();
widgets.spawn({
  id: "my-window",
  render: ({ dismiss }) => <MyWidget onClose={dismiss} />,
  position: { kind: "anchor", anchor: "bottom-right", offset: [20, 20] },
  transition: "slide-up",   // pop | fade | slide-up | drop
  dismissOnEsc: true,
});
```

Positioning supports `anchor` (nine positions, any corner), `absolute`
(x/y), and `selector` (relative to an element on the surface). Windows can
stack (`stackKey`) and carry a backdrop.

See `widgets/registry.tsx` for how the bridge wires registered windows to a
corner, and `widgets/notification-widget.tsx` for a window to copy.

---

## Project structure

```
src/
  app/                       Next.js App Router shell (layout, page, globals)
  components/product-demo/
    index.tsx                Entry — theme wrapper + lazy-loaded App
    app.tsx                  Orchestrator — wires chrome, demo state, dev panel
    config.ts                ← SWAP POINT: your product's content
    chapters.ts              ← SWAP POINT: your scripted demo chapters
    theme.css                Scoped tokens + chrome + cursor + hint styles
    browser-chrome.tsx       The browser frame top bar
    autodemo.tsx             Cursor engine + hint tooltip (generic)
    widgets.tsx              Overlay-window framework (generic)
    dev-panel.tsx            Hand-driving controls (generated from the registries)
    icons.tsx                Small icon set
    fonts.ts                 Scoped fonts (Inter + JetBrains Mono)
    pages/
      sample-product.tsx     ← SWAP POINT: the product shell inside the chrome
      …                      The sample product's pages
    widgets/
      registry.tsx           ← SWAP POINT: register spawnable windows
      notification-widget.tsx  Example window to copy
```

## Removing the dev panel for production

The dev panel is just `<DevPanel>` rendered at the bottom of `app.tsx`. Delete
that block (or gate it on `process.env.NODE_ENV !== "production"`) to ship the
demo without it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · next-themes.
The demo itself uses scoped CSS + inline styles, not Tailwind, so it's portable
into any React app — Tailwind is just available for the surrounding page.
