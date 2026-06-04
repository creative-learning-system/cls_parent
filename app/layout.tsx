import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingScreen } from "@/components/loading-screen";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Learning — Parent Dashboard",
  description: "Track and support your children's learning journey from one place.",
};

// Runs before React hydrates to prevent flash of wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.classList.add(t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <LoadingScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
