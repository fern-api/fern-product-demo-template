import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Demo Template",
  description: "A lean boilerplate for building animated product demos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* next-themes toggles `class="dark"` on <html>; the demo reads it to
            switch its scoped token set. defaultTheme="dark" matches the dark
            page backdrop, but the in-demo toggle flips it freely. */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
