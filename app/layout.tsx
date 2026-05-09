import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoadingScreen } from "@/components/loading-screen";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Creative Learning — Parent Dashboard",
  description: "Track and support your children's learning journey from one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>

          {/* Full-screen loading overlay — client only */}
          <LoadingScreen />

          {/* Top navbar — sticky, shared across all pages */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer — hidden on mobile (bottom tab bar takes its place) */}
          <Footer />

        </ThemeProvider>
      </body>
    </html>
  );
}
