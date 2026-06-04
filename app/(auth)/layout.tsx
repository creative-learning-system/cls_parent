import { AuthTopBar } from "@/components/auth-top-bar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <AuthTopBar />
      {children}
    </div>
  );
}
