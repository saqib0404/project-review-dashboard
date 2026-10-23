import { Router } from "express";
import { z } from "zod";

import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";

import { AppError } from "../../lib/app-error.js";

import {
  projectListQuerySchema,
  projectIdParamSchema,
  reviewDecisionSchema,
} from "./review.schema.js";

import {
  listProjects,
  getReviewStatistics,
  getReviewProject,
  getProjectReviewHistory,
  reviewProject,
} from "./review.service.js";

export const reviewRouter = Router();

// All review routes require reviewer permissions.
reviewRouter.use(requireAuth);
reviewRouter.use(requireRole("MENTOR", "ADMIN"));

function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      422,
      "Request validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return result.data;
}

function getProjectId(input: unknown): string {
  return parseInput(projectIdParamSchema, input).id;
}

// GET /api/v1/reviews/projects
reviewRouter.get("/projects", async (req, res) => {
  const query = parseInput(projectListQuerySchema, req.query);

  const data = await listProjects(query);

  res.status(200).json({
    success: true,
    message: "Projects retrieved successfully",
    data,
  });
});

// GET /api/v1/reviews/stats
reviewRouter.get("/stats", async (_req, res) => {
  const statistics = await getReviewStatistics();

  res.status(200).json({
    success: true,
    message: "Review statistics retrieved",
    data: { statistics },
  });
});

// GET /api/v1/reviews/projects/:id
reviewRouter.get("/projects/:id", async (req, res) => {
  const id = getProjectId(req.params);

  const project = await getReviewProject(id);

  res.status(200).json({
    success: true,
    message: "Project retrieved successfully",
    data: { project },
  });
});

// GET /api/v1/reviews/projects/:id/history
reviewRouter.get("/projects/:id/history", async (req, res) => {
  const id = getProjectId(req.params);

  const history = await getProjectReviewHistory(id);

  res.status(200).json({
    success: true,
    message: "Review history retrieved",
    data: history,
  });
});

// PATCH /api/v1/reviews/projects/:id/decision
reviewRouter.patch(
  "/projects/:id/decision",
  async (req: AuthenticatedRequest, res) => {
    const id = getProjectId(req.params);

    const input = parseInput(reviewDecisionSchema, req.body);

    if (!req.auth) {
      throw new AppError(401, "Authentication required");
    }

    const result = await reviewProject(id, req.auth.id, input);

    res.status(200).json({
      success: true,
      message:
        input.decision === "APPROVED"
          ? "Project approved successfully"
          : "Project rejected successfully",
      data: result,
    });
  },
);
