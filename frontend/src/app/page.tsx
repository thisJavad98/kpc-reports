"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/projects" : "/login");
  }, [loading, user, router]);

  return (
    <div className="min-h-[100dvh] bg-[var(--ground)] px-4 py-8">
      <div className="mx-auto max-w-md space-y-3">
        <div className="h-8 w-36 animate-pulse rounded bg-[var(--raised)]" />
        <div className="h-28 animate-pulse rounded-[8px] bg-[var(--surface)]" />
      </div>
    </div>
  );
}
