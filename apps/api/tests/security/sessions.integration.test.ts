import "dotenv/config";

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import request from "supertest";

import app from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";
import { signToken, hashToken } from "../../src/modules/auth/auth.tokens.js";

describe("Database-backed session security", () => {
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

  const userId = randomUUID();
  const sessionId = randomUUID();

  let accessToken = "";
  let refreshToken = "";

  beforeAll(async () => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Never run database integration tests in production.");
    }

    await prisma.user.create({
      data: {
        id: userId,
        name: "Session Security Test",
        email: `session-${userId}@example.com`,
        passwordHash: "test-only-no-login",
        role: "STUDENT",
      },
    });

    const claims = {
      userId,
      sessionId,
      tokenId: randomUUID(),
    };

    accessToken = await signToken("access", claims);
    refreshToken = await signToken("refresh", claims);

    await prisma.refreshSession.create({
      data: {
        id: sessionId,
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    await prisma.refreshSession.deleteMany({
      where: { userId },
    });

    await prisma.user.deleteMany({
      where: { id: userId },
    });

    await prisma.$disconnect();
  });

  it("allows an active authenticated session", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `pf_access=${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(userId);
  });

  it("revokes a session on logout", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .set("Cookie", `pf_refresh=${refreshToken}`);

    expect(response.status).toBe(200);

    const session = await prisma.refreshSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    expect(session.revokedAt).not.toBeNull();
  });

  it("rejects the previously valid access JWT", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `pf_access=${accessToken}`);

    expect(response.status).toBe(401);
  });

  it("rejects a refresh token after logout", async () => {
    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .set("Cookie", `pf_refresh=${refreshToken}`);

    expect(response.status).toBe(401);
  });
});
