import type { Request, Response, NextFunction } from "express";

import { env } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireSameOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  res.vary("Origin");
  res.vary("Sec-Fetch-Site");

  const origin = req.get("Origin");

  // Require an exact configured browser origin.
  if (!origin || origin !== env.WEB_ORIGIN) {
    next(new AppError(403, "Request origin not allowed"));
    return;
  }

  // Reject browser requests identified as cross-site.
  const fetchSite = req.get("Sec-Fetch-Site");

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    next(new AppError(403, "Cross-site request rejected"));
    return;
  }

  // Custom header prevents ordinary cross-site form
  // submissions from invoking cookie-based mutations.
  if (req.get("X-ProjectFlow-Request") !== "web") {
    next(new AppError(403, "Request verification required"));
    return;
  }

  next();
}
