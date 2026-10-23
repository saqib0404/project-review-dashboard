import Link from "next/link";
import { FolderKanban } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
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

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>

            <CardDescription>
              Join as a student and start submitting projects.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
