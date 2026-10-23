import type { Response, NextFunction } from "express";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "./auth.js";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const projectWriteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "projectflow:project-write",
  analytics: false,
  timeout: 1500,
});

export async function limitProjectWrites(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const result = await projectWriteLimiter.limit(`student:${req.auth.id}`);

    // Do not silently bypass protection when Redis times out.
    if (result.reason === "timeout") {
      res.status(503).json({
        success: false,
        message: "Rate limiting temporarily unavailable",
      });
      return;
    }

    res.setHeader("RateLimit-Limit", result.limit);
    res.setHeader("RateLimit-Remaining", result.remaining);

    if (!result.success) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      );

      res.status(429).json({
        success: false,
        message: "Too many submissions. Please try again later.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Project rate limiter unavailable:", error);

    res.status(503).json({
      success: false,
      message: "Rate limiting temporarily unavailable",
    });
  }
}
