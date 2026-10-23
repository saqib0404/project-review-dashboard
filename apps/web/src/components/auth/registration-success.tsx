"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegistrationSuccess() {
  const params = useSearchParams();

  if (params.get("registered") !== "1") {
    return null;
  }

  return (
    <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800">
      <AlertDescription>
        Your student account has been created. Sign in to continue.
      </AlertDescription>
    </Alert>
  );
}
