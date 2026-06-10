import { Inter, JetBrains_Mono } from "next/font/google";

// Fonts scoped to the demo. next/font/google emits a className exposing each
// CSS variable on whichever element it's applied to; we apply them to the
// .pd-root wrapper so the variables only matter inside the demo subtree.
export const demoSans = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const demoMono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
