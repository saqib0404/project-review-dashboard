import "dotenv/config";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";

const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

describe("CSRF protection", () => {
  it("rejects a mutation without Origin", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("X-ProjectFlow-Request", "web");

    expect(response.status).toBe(403);
  });

  it("rejects a foreign Origin", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", "https://evil.example")
      .set("X-ProjectFlow-Request", "web");

    expect(response.status).toBe(403);
  });

  it("rejects a missing custom header", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", origin);

    expect(response.status).toBe(403);
  });

  it("rejects cross-site fetch metadata", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .set("Sec-Fetch-Site", "cross-site");

    expect(response.status).toBe(403);
  });

  it("accepts a legitimate same-origin logout", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .set("Sec-Fetch-Site", "same-origin");

    expect(response.status).toBe(200);
  });

  it("allows safe health requests", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
  });
});
