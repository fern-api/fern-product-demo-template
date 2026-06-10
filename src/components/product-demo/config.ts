/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE SWAP POINT
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything that makes this demo about a *specific product* lives here.
 *  To re-skin the boilerplate for your own product, edit this file:
 *    - PRODUCT      → name / domain / tagline shown in chrome + page heading
 *    - TABS         → the top-level nav tabs
 *    - SIDEBAR      → the left-hand nav for doc pages
 *    - HOME_TILES   → the cards on the Home tab
 *    - DOC_PAGES    → the body content for each sidebar item
 *    - CHANGELOG    → entries on the Changelog tab
 *
 *  The framework pieces (browser chrome, cursor/autodemo, overlay windows,
 *  dev panel, theming) read from this config and otherwise know nothing about
 *  your product — so swapping content never touches them.
 */

export const PRODUCT = {
  name: "Fern",
  domain: "fern.dev",
  tagline: "A lean boilerplate for building animated product demos.",
};

export type TabId = "home" | "docs" | "changelog";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "docs", label: "Docs", icon: "book" },
  { id: "changelog", label: "Changelog", icon: "clock" },
];

// Left-hand nav shown on the Docs tab. Each item id maps to a DOC_PAGES entry.
export const SIDEBAR: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: "Get started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
      { id: "concepts", label: "Core concepts" },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "authentication", label: "Authentication" },
      { id: "webhooks", label: "Webhooks" },
      { id: "rate-limits", label: "Rate limits" },
    ],
  },
];

export type Tile = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
  // Clicking a tile navigates here. A tab id, optionally with a doc page.
  target: { tab: TabId; doc?: string };
};

export const HOME_TILES: Tile[] = [
  {
    id: "tile-quickstart",
    eyebrow: "Get started",
    title: "Quickstart",
    body: "Go from zero to your first request in under five minutes.",
    icon: "zap",
    target: { tab: "docs", doc: "quickstart" },
  },
  {
    id: "tile-concepts",
    eyebrow: "Learn",
    title: "Core concepts",
    body: "Understand the building blocks before you go deep.",
    icon: "book",
    target: { tab: "docs", doc: "concepts" },
  },
  {
    id: "tile-auth",
    eyebrow: "Guides",
    title: "Authentication",
    body: "Issue keys, scope them, and rotate them safely.",
    icon: "lock",
    target: { tab: "docs", doc: "authentication" },
  },
  {
    id: "tile-changelog",
    eyebrow: "What's new",
    title: "Changelog",
    body: "See what shipped in the latest releases.",
    icon: "clock",
    target: { tab: "changelog" },
  },
];

export type DocSection = {
  heading?: string;
  paragraphs?: string[];
  code?: { lang: string; content: string };
  bullets?: string[];
};

export type DocPage = {
  breadcrumbs: string[];
  title: string;
  subtitle: string;
  sections: DocSection[];
};

export const DOC_PAGES: Record<string, DocPage> = {
  introduction: {
    breadcrumbs: ["Docs", "Get started", "Introduction"],
    title: "Introduction",
    subtitle: `Welcome to ${PRODUCT.name}. This is placeholder content — replace it with your own.`,
    sections: [
      {
        paragraphs: [
          `${PRODUCT.name} is a fictional product used to demonstrate this boilerplate. Every page you see here is rendered from a single config file, so re-skinning the demo for your own product is a matter of editing text, not code.`,
          "The surrounding frame — browser chrome, the cursor that clicks around, the overlay-window system, and the dev panel — is product-agnostic and stays exactly as-is.",
        ],
      },
      {
        heading: "What's inside",
        bullets: [
          "A browser-chrome frame with traffic lights and a live URL bar",
          "A scripted cursor that drives the demo across multiple chapters",
          "A spawn framework for floating overlay windows",
          "A dev panel to control everything by hand",
        ],
      },
    ],
  },
  quickstart: {
    breadcrumbs: ["Docs", "Get started", "Quickstart"],
    title: "Quickstart",
    subtitle: "Install the SDK and make your first request.",
    sections: [
      {
        heading: "Install",
        paragraphs: ["Add the package to your project:"],
        code: { lang: "bash", content: "npm install @fern/sdk" },
      },
      {
        heading: "Make a request",
        paragraphs: ["Authenticate with your API key and call the API:"],
        code: {
          lang: "ts",
          content: `import { Fern } from "@fern/sdk";

const fern = new Fern({ apiKey: process.env.FERN_API_KEY });

const result = await fern.things.create({ name: "Hello world" });
console.log(result.id);`,
        },
      },
    ],
  },
  concepts: {
    breadcrumbs: ["Docs", "Get started", "Core concepts"],
    title: "Core concepts",
    subtitle: "The handful of ideas everything else builds on.",
    sections: [
      {
        heading: "Resources",
        paragraphs: [
          "Everything in the API is a resource with a stable id. Resources are created, read, updated, and deleted through predictable REST endpoints.",
        ],
      },
      {
        heading: "Idempotency",
        paragraphs: [
          "Mutating requests accept an idempotency key so retries never double-apply. Reuse the same key within 24 hours to get the original response back.",
        ],
      },
    ],
  },
  authentication: {
    breadcrumbs: ["Docs", "Guides", "Authentication"],
    title: "Authentication",
    subtitle: "Issue keys, scope them, and rotate them safely.",
    sections: [
      {
        paragraphs: [
          "Authenticate every request with a bearer token in the Authorization header. Keys are scoped to an environment and can be rotated without downtime.",
        ],
        code: {
          lang: "bash",
          content: `curl https://api.fern.dev/v1/things \\
  -H "Authorization: Bearer $FERN_API_KEY"`,
        },
      },
    ],
  },
  webhooks: {
    breadcrumbs: ["Docs", "Guides", "Webhooks"],
    title: "Webhooks",
    subtitle: "Receive real-time events when things change.",
    sections: [
      {
        paragraphs: [
          "Register an endpoint and Fern will POST a signed payload whenever a subscribed event fires. Verify the signature header before trusting the body.",
        ],
        bullets: ["thing.created", "thing.updated", "thing.deleted"],
      },
    ],
  },
  "rate-limits": {
    breadcrumbs: ["Docs", "Guides", "Rate limits"],
    title: "Rate limits",
    subtitle: "Stay within the limits and handle 429s gracefully.",
    sections: [
      {
        paragraphs: [
          "The API allows 100 requests per second per key. Every response includes X-RateLimit-Remaining; when you hit zero, back off using the Retry-After header.",
        ],
      },
    ],
  },
};

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  body: string;
  tag?: "Added" | "Fixed" | "Changed";
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v3.2.0",
    date: "Jun 2026",
    title: "Streaming responses",
    body: "Endpoints now support server-sent events for incremental results.",
    tag: "Added",
  },
  {
    version: "v3.1.4",
    date: "May 2026",
    title: "Faster cold starts",
    body: "Reduced p99 latency on the first request after a quiet period.",
    tag: "Changed",
  },
  {
    version: "v3.1.0",
    date: "Apr 2026",
    title: "Idempotency keys",
    body: "Mutating requests now accept an Idempotency-Key header.",
    tag: "Added",
  },
];
