"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Role = "STUDENT" | "MENTOR" | "ADMIN";

export default function RestoreSessionPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const response = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "X-ProjectFlow-Request": "web",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const payload = (await response.json()) as {
          success: boolean;
          data?: {
            user?: {
              role: Role;
            };
          };
        };

        if (!payload.success || !payload.data?.user) {
          throw new Error("Invalid session response");
        }

        if (!cancelled) {
          const destination =
            payload.data.user.role === "STUDENT" ? "/student" : "/mentor";

          router.replace(destination);
          router.refresh();
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white"
      aria-live="polite"
    >
      <Loader2
        className="size-9 animate-spin text-cyan-400"
        aria-hidden="true"
      />

      <h1 className="text-xl font-semibold">Restoring your session</h1>

      <p className="text-sm text-slate-400">Verifying your login securely...</p>
    </main>
  );
}
