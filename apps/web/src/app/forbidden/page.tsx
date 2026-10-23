import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <ShieldAlert className="size-12 text-amber-600" />

      <h1 className="text-3xl font-bold">Access denied</h1>

      <p className="max-w-md text-slate-600">
        Your account does not have permission to access this workspace.
      </p>

      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
