import type { Request, Response, NextFunction } from "express";

import { env } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireSameOrigin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;

  if (origin && origin !== env.WEB_ORIGIN) {
    next(new AppError(403, "Request origin not allowed"));
    return;
  }

  if (req.header("X-ProjectFlow-Request") !== "web") {
    next(new AppError(403, "Request verification required"));
    return;
  }

  next();
}
