import "dotenv/config";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { signupSchema, loginSchema } from "../src/modules/auth/auth.schema.js";

import {
  signToken,
  verifyToken,
  hashToken,
} from "../src/modules/auth/auth.tokens.js";

describe("Authentication validation", () => {
  it("accepts valid student signup data", () => {
    const result = signupSchema.safeParse({
      name: "Test Student",
      email: "STUDENT@example.com",
      password: "StrongPassword123!",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("student@example.com");
    }
  });

  it("rejects public role escalation", () => {
    const result = signupSchema.safeParse({
      name: "Test Student",
      email: "student@example.com",
      password: "StrongPassword123!",
      role: "ADMIN",
    });

    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const result = signupSchema.safeParse({
      name: "Test Student",
      email: "student@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("validates a login request", () => {
    expect(
      loginSchema.safeParse({
        email: "test@example.com",
        password: "SomePassword",
      }).success,
    ).toBe(true);
  });
});

describe("JWT security", () => {
  const claims = {
    userId: randomUUID(),
    sessionId: randomUUID(),
    tokenId: randomUUID(),
  };

  it("creates and verifies an access JWT", async () => {
    const token = await signToken("access", claims);
    const decoded = await verifyToken(token, "access");

    expect(decoded.userId).toBe(claims.userId);
    expect(decoded.sessionId).toBe(claims.sessionId);
  });

  it("rejects refresh tokens as access tokens", async () => {
    const token = await signToken("refresh", claims);

    await expect(verifyToken(token, "access")).rejects.toThrow();
  });

  it("rejects tampered JWTs", async () => {
    const token = await signToken("access", claims);
    const tampered = token.slice(0, -5) + "abcde";

    await expect(verifyToken(tampered, "access")).rejects.toThrow();
  });

  it("hashes refresh tokens deterministically", () => {
    expect(hashToken("example-token")).toBe(hashToken("example-token"));

    expect(hashToken("example-token")).not.toBe(hashToken("different-token"));
  });
});
