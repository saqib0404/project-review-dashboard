import { describe, expect, it } from "vitest";

import {
  projectListQuerySchema,
  projectIdParamSchema,
  reviewDecisionSchema,
} from "../src/modules/reviews/review.schema.js";

describe("Mentor review query validation", () => {
  it("provides default pagination", () => {
    const result = projectListQuerySchema.parse({});

    expect(result).toEqual({
      page: 1,
      limit: 10,
      status: "ALL",
    });
  });

  it("accepts a pending filter", () => {
    const result = projectListQuerySchema.parse({
      page: "2",
      limit: "20",
      status: "PENDING",
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.status).toBe("PENDING");
  });

  it("rejects unsupported statuses", () => {
    expect(
      projectListQuerySchema.safeParse({
        status: "DELETED",
      }).success,
    ).toBe(false);
  });

  it("rejects excessive page size", () => {
    expect(
      projectListQuerySchema.safeParse({
        limit: "1000",
      }).success,
    ).toBe(false);
  });

  it("rejects negative pages", () => {
    expect(
      projectListQuerySchema.safeParse({
        page: "-1",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid UUIDs", () => {
    expect(
      projectIdParamSchema.safeParse({
        id: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("Review decision validation", () => {
  it("accepts an approval", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "APPROVED",
        expectedVersion: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts a rejection with reason", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "REJECTED",
        expectedVersion: 1,
        reason: "Repository documentation is incomplete.",
      }).success,
    ).toBe(true);
  });

  it("rejects a rejection without reason", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "REJECTED",
        expectedVersion: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects short rejection reasons", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "REJECTED",
        expectedVersion: 1,
        reason: "Bad",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid expected versions", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "APPROVED",
        expectedVersion: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects client-supplied reviewer IDs", () => {
    expect(
      reviewDecisionSchema.safeParse({
        decision: "APPROVED",
        expectedVersion: 1,
        reviewerId: "attacker",
      }).success,
    ).toBe(false);
  });
});
