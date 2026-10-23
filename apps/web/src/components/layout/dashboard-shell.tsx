"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  FolderKanban,
  ClipboardCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api";

import type { AuthUser } from "@/lib/auth";

interface DashboardShellProps {
  user: AuthUser;
  section: "student" | "mentor";
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  section,
  children,
}: DashboardShellProps) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const isStudent = section === "student";

  const links = isStudent
    ? [
        {
          label: "My Dashboard",
          href: "/student",
          icon: LayoutDashboard,
        },
      ]
    : [
        {
          label: "Review Dashboard",
          href: "/mentor",
          icon: ClipboardCheck,
        },
      ];

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-ProjectFlow-Request": "web",
        },
      });

      if (!response.ok) {
        throw new ApiError(response.status, "Logout failed. Please try again.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const navigation = (
    <nav aria-label="Dashboard navigation" className="space-y-2">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Link href="/" className="font-bold text-slate-900">
          ProjectFlow
        </Link>

        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 p-5 text-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500 p-2">
            <FolderKanban className="size-6 text-slate-950" />
          </div>

          <div>
            <div className="text-xl font-bold">ProjectFlow</div>
            <p className="text-xs text-slate-400">Submission & Review</p>
          </div>
        </div>

        {navigation}

        <div className="mt-auto space-y-4">
          <Separator className="bg-slate-800" />

          <div className="px-2">
            <p className="truncate text-sm font-medium">{user.name}</p>

            <p className="truncate text-xs text-slate-400">{user.email}</p>

            <p className="mt-1 text-xs text-cyan-300">{user.role}</p>
          </div>

          {logoutError && (
            <p role="alert" className="text-xs text-red-300">
              {logoutError}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full justify-start border-slate-700 bg-transparent text-white hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="mr-2 size-4" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="hidden h-16 items-center justify-between border-b bg-white px-8 lg:flex">
          <p className="text-sm font-medium text-slate-500">
            {isStudent ? "Student Workspace" : "Mentor Workspace"}
          </p>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {user.role}
          </span>
        </header>

        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
