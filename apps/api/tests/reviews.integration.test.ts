import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken, hashToken } from "../src/modules/auth/auth.tokens.js";

const suite = describe;

suite("Mentor review API integration", () => {
  const suffix = randomUUID();

  let studentId: string;
  let mentorId: string;
  let projectId: string;

  let studentCookie: string;
  let mentorCookie: string;

  const origin = "http://localhost:3000";

  beforeAll(async () => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Integration tests must not run in production.");
    }

    const student = await prisma.user.create({
      data: {
        name: "Integration Student",
        email: `student-${suffix}@example.com`,
        passwordHash: "integration-test-only",
        role: "STUDENT",
      },
    });

    studentId = student.id;

    const mentor = await prisma.user.create({
      data: {
        name: "Integration Mentor",
        email: `mentor-${suffix}@example.com`,
        passwordHash: "integration-test-only",
        role: "MENTOR",
      },
    });

    mentorId = mentor.id;

    const project = await prisma.project.create({
      data: {
        studentId,
        name: "Integration Test Project",
        description: "Project used to verify review transactions.",
        repositoryUrl: `https://github.com/integration/${suffix}`,
        repositoryKey: `integration/${suffix}`,
        status: "PENDING",
      },
    });

    projectId = project.id;

    async function createTestCookie(userId: string) {
      const sessionId = randomUUID();

      const claims = {
        userId,
        sessionId,
        tokenId: randomUUID(),
      };

      const accessToken = await signToken("access", claims);

      const refreshToken = await signToken("refresh", claims);

      await prisma.refreshSession.create({
        data: {
          id: sessionId,
          userId,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      return `pf_access=${accessToken}`;
    }

    studentCookie = await createTestCookie(studentId);
    mentorCookie = await createTestCookie(mentorId);
  });

  afterAll(async () => {
    if (projectId) {
      await prisma.review.deleteMany({
        where: { projectId },
      });

      await prisma.project.deleteMany({
        where: { id: projectId },
      });
    }

    const ids = [studentId, mentorId].filter((value): value is string =>
      Boolean(value),
    );

    if (ids.length > 0) {
      await prisma.refreshSession.deleteMany({
        where: { userId: { in: ids } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: ids } },
      });
    }

    await prisma.$disconnect();
  });

  it("denies students access to review projects", async () => {
    const response = await request(app)
      .get("/api/v1/reviews/projects")
      .set("Cookie", studentCookie);

    expect(response.status).toBe(403);
  });

  it("returns a filtered paginated list", async () => {
    const response = await request(app)
      .get("/api/v1/reviews/projects?page=1&limit=10&status=PENDING")
      .set("Cookie", mentorCookie);

    expect(response.status).toBe(200);
    expect(response.body.data.pagination.page).toBe(1);
    expect(
      response.body.data.projects.every(
        (project: { status: string }) => project.status === "PENDING",
      ),
    ).toBe(true);
  });

  it("returns aggregate statistics", async () => {
    const response = await request(app)
      .get("/api/v1/reviews/stats")
      .set("Cookie", mentorCookie);

    expect(response.status).toBe(200);

    const stats = response.body.data.statistics;

    expect(stats.total).toBe(stats.pending + stats.approved + stats.rejected);
  });

  it("allows exactly one competing decision", async () => {
    const url = `/api/v1/reviews/projects/${projectId}/decision`;

    const approveRequest = request(app)
      .patch(url)
      .set("Cookie", mentorCookie)
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .send({
        decision: "APPROVED",
        expectedVersion: 1,
      });

    const rejectRequest = request(app)
      .patch(url)
      .set("Cookie", mentorCookie)
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .send({
        decision: "REJECTED",
        expectedVersion: 1,
        reason: "Documentation needs further improvement.",
      });

    const responses = await Promise.all([approveRequest, rejectRequest]);

    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([200, 409]);

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
    });

    const history = await prisma.review.findMany({
      where: { projectId },
    });

    expect(project.version).toBe(2);
    expect(history).toHaveLength(1);
    expect(history[0]?.decision).toBe(project.status);
    expect(history[0]?.projectVersion).toBe(2);
  });

  it("rejects another review of a decided project", async () => {
    const response = await request(app)
      .patch(`/api/v1/reviews/projects/${projectId}/decision`)
      .set("Cookie", mentorCookie)
      .set("Origin", origin)
      .set("X-ProjectFlow-Request", "web")
      .send({
        decision: "APPROVED",
        expectedVersion: 2,
      });

    expect(response.status).toBe(409);
  });

  it("returns review history with reviewer details", async () => {
    const response = await request(app)
      .get(`/api/v1/reviews/projects/${projectId}/history`)
      .set("Cookie", mentorCookie);

    expect(response.status).toBe(200);
    expect(response.body.data.reviews).toHaveLength(1);
    expect(response.body.data.reviews[0].reviewer.id).toBe(mentorId);
  });
});
