import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../../config/env.js";

const encoder = new TextEncoder();

const accessKey = encoder.encode(env.JWT_ACCESS_SECRET);
const refreshKey = encoder.encode(env.JWT_REFRESH_SECRET);

export type TokenKind = "access" | "refresh";

export interface AuthClaims {
  userId: string;
  sessionId: string;
  tokenId: string;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function signToken(
  kind: TokenKind,
  claims: AuthClaims,
): Promise<string> {
  const key = kind === "access" ? accessKey : refreshKey;
  const expires = kind === "access" ? "15m" : "7d";

  return new SignJWT({
    sid: claims.sessionId,
    typ: kind,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setJti(claims.tokenId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

export async function verifyToken(
  token: string,
  expectedKind: TokenKind,
): Promise<AuthClaims> {
  const key = expectedKind === "access" ? accessKey : refreshKey;

  const { payload } = await jwtVerify(token, key, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["HS256"],
  });

  if (
    payload.typ !== expectedKind ||
    typeof payload.sub !== "string" ||
    typeof payload.sid !== "string" ||
    typeof payload.jti !== "string"
  ) {
    throw new Error("Invalid token claims");
  }

  return {
    userId: payload.sub,
    sessionId: payload.sid,
    tokenId: payload.jti,
  };
}
