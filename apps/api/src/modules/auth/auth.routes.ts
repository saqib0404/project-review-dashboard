import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

import { AppError } from "../../lib/app-error.js";
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";

import { signupSchema, loginSchema } from "./auth.schema.js";

import {
  registerStudent,
  loginUser,
  refreshUserSession,
  revokeSession,
} from "./auth.service.js";

import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "./auth.cookies.js";

import { verifyToken } from "./auth.tokens.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },
});

function validationError(error: z.ZodError) {
  return {
    success: false,
    message: "Validation failed",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

// Student signup
authRouter.post("/signup", authLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(422).json(validationError(parsed.error));
    return;
  }

  const user = await registerStudent(parsed.data);

  res.status(201).json({
    success: true,
    message: "Student account created successfully",
    data: { user },
  });
});

// Login for all existing roles
authRouter.post("/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(422).json(validationError(parsed.error));
    return;
  }

  const result = await loginUser(parsed.data);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: result.user },
  });
});

// Rotate refresh token
authRouter.post("/refresh", authLimiter, async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (typeof token !== "string") {
    throw new AppError(401, "Refresh token required");
  }

  const result = await refreshUserSession(token);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Session refreshed",
    data: { user: result.user },
  });
});

// Logout revokes the database session.
authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (typeof token === "string") {
    try {
      const claims = await verifyToken(token, "refresh");
      await revokeSession(claims.sessionId, claims.userId);
    } catch {}
  }

  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Authenticated user profile
authRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  const { id, name, email, role } = req.auth;

  res.status(200).json({
    success: true,
    message: "Current user retrieved",
    data: { user: { id, name, email, role } },
  });
});

authRouter.get(
  "/check/student",
  requireAuth,
  requireRole("STUDENT"),
  (_req, res) => {
    res.json({ success: true, message: "Student access granted" });
  },
);

authRouter.get(
  "/check/reviewer",
  requireAuth,
  requireRole("MENTOR", "ADMIN"),
  (_req, res) => {
    res.json({ success: true, message: "Reviewer access granted" });
  },
);
