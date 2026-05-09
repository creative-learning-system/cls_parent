import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden border-t border-border bg-card md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-7">

        {/* Left — brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-brand">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Creative Learning</span>
            {" "}· Parent Dashboard
          </span>
        </div>

        {/* Right — copyright */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Creative Learning. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
