"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
