import type { Request, Response, NextFunction } from "express";

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { env } from "../config/env.js";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const credentialLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "projectflow:auth:credentials",
  analytics: false,
  timeout: 1500,
});

const refreshLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "15 m"),
  prefix: "projectflow:auth:refresh",
  analytics: false,
  timeout: 1500,
});

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function createLimiter(limiter: Ratelimit) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";

      const key = hashIdentifier(ip);

      const result = await limiter.limit(key);

      if (result.reason === "timeout") {
        res.status(503).json({
          success: false,
          message: "Authentication temporarily unavailable",
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
          message: "Too many authentication attempts. Try again later.",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Authentication rate-limit failure:", error);

      res.status(503).json({
        success: false,
        message: "Authentication temporarily unavailable",
      });
    }
  };
}

export const limitCredentialAttempts = createLimiter(credentialLimiter);

export const limitRefreshAttempts = createLimiter(refreshLimiter);
