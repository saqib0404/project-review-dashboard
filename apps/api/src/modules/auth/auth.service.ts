import { randomUUID } from "node:crypto";
import { hash, verify } from "argon2";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { hashToken, signToken, verifyToken } from "./auth.tokens.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const fallbackHashPromise = hash("dummy-password-never-used-for-login", {
  type: 2,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
});

export function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function registerStudent(data: SignupInput) {
  const passwordHash = await hash(data.password, {
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "STUDENT",
      },
    });

    return publicUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Email already registered");
    }

    throw error;
  }
}

async function createSession(userId: string) {
  const sessionId = randomUUID();
  const tokenId = randomUUID();

  const claims = { userId, sessionId, tokenId };

  const refreshToken = await signToken("refresh", claims);
  const accessToken = await signToken("access", claims);

  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  const fallbackHash = await fallbackHashPromise;

  const passwordValid = await verify(
    user?.passwordHash ?? fallbackHash,
    data.password,
  ).catch(() => false);

  if (!user || !user.isActive || !passwordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokens = await createSession(user.id);

  return {
    user: publicUser(user),
    ...tokens,
  };
}

export async function refreshUserSession(token: string) {
  let claims;

  try {
    claims = await verifyToken(token, "refresh");
  } catch {
    throw new AppError(401, "Invalid or expired session");
  }

  const previousHash = hashToken(token);
  const nextSessionId = randomUUID();
  const nextTokenId = randomUUID();

  const newClaims = {
    userId: claims.userId,
    sessionId: nextSessionId,
    tokenId: nextTokenId,
  };

  const [accessToken, refreshToken] = await Promise.all([
    signToken("access", newClaims),
    signToken("refresh", newClaims),
  ]);

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.refreshSession.updateMany({
      where: {
        id: claims.sessionId,
        userId: claims.userId,
        tokenHash: previousHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { isActive: true },
      },
      data: { revokedAt: new Date() },
    });

    if (updated.count !== 1) {
      throw new AppError(401, "Session already used or expired");
    }

    const activeUser = await tx.user.findUnique({
      where: { id: claims.userId },
    });

    if (!activeUser || !activeUser.isActive) {
      throw new AppError(401, "Account unavailable");
    }

    await tx.refreshSession.create({
      data: {
        id: nextSessionId,
        userId: claims.userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return activeUser;
  });

  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function revokeSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: {
      id: sessionId,
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}
