import type { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/app-error.js";
import { verifyToken } from "../modules/auth/auth.tokens.js";
import { ACCESS_COOKIE } from "../modules/auth/auth.cookies.js";
import type { UserRole } from "@project/contracts";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[ACCESS_COOKIE];

    if (typeof token !== "string") {
      throw new AppError(401, "Authentication required");
    }

    let claims;

    try {
      claims = await verifyToken(token, "access");
    } catch {
      throw new AppError(401, "Invalid or expired access token");
    }

    const session = await prisma.refreshSession.findFirst({
      where: {
        id: claims.sessionId,
        userId: claims.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { isActive: true },
      },
      include: { user: true },
    });

    if (!session) {
      throw new AppError(401, "Session no longer active");
    }

    req.auth = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.auth) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}
