import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingScreen } from "@/components/loading-screen";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Learning — Parent Dashboard",
  description: "Track and support your children's learning journey from one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LoadingScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
