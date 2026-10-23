import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface CurrentUserResponse {
  success: boolean;
  data?: {
    user: AuthUser;
  };
}

export function dashboardPath(role: UserRole): string {
  return role === "STUDENT" ? "/student" : "/mentor";
}

export async function getCurrentUser(): Promise<
  "UNAUTHENTICATED" | "REFRESH_REQUIRED" | AuthUser
> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("pf_access")?.value;
  const refreshToken = cookieStore.get("pf_refresh")?.value;

  if (!accessToken) {
    return refreshToken ? "REFRESH_REQUIRED" : "UNAUTHENTICATED";
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:5000";

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        Cookie: `pf_access=${accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Authentication service is currently unavailable.");
  }

  if (response.status === 401) {
    return refreshToken ? "REFRESH_REQUIRED" : "UNAUTHENTICATED";
  }

  if (!response.ok) {
    throw new Error("Unable to verify the current session.");
  }

  const payload = (await response.json()) as CurrentUserResponse;

  if (!payload.success || !payload.data?.user) {
    throw new Error("Invalid authentication response.");
  }

  return payload.data.user;
}

export async function requireUser(allowedRoles: UserRole[]): Promise<AuthUser> {
  const result = await getCurrentUser();

  if (result === "REFRESH_REQUIRED") {
    redirect("/auth/restore");
  }

  if (result === "UNAUTHENTICATED") {
    redirect("/login");
  }

  if (!allowedRoles.includes(result.role)) {
    redirect("/forbidden");
  }

  return result;
}
