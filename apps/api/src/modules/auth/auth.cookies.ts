import type { Response } from "express";
import { env } from "../../config/env.js";

export const ACCESS_COOKIE = "pf_access";
export const REFRESH_COOKIE = "pf_refresh";

const secure = env.NODE_ENV === "production";

const baseOptions = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, baseOptions);
  res.clearCookie(REFRESH_COOKIE, baseOptions);
}
