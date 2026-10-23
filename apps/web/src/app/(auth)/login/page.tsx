import Link from "next/link";
import { FolderKanban, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { RegistrationSuccess } from "@/components/auth/registration-success";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-3 text-white"
        >
          <FolderKanban className="size-8 text-cyan-400" />
          <span className="text-2xl font-bold">ProjectFlow</span>
        </Link>

        <Card className="border-slate-200 shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>

            <CardDescription>
              Sign in to access your project workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={null}>
              <RegistrationSuccess />
            </Suspense>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck className="size-4" />
          Secure, role-based project management
        </p>
      </div>
    </main>
  );
}
