import { Router } from "express";

import { projectSubmissionSchema } from "@project/contracts";

import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";

import { limitProjectWrites } from "../../middleware/rate-limit.js";

import { AppError } from "../../lib/app-error.js";

import {
  createProject,
  getMyProject,
  reviseProject,
} from "./project.service.js";

export const projectRouter = Router();

// Every project route is student-only.
projectRouter.use(requireAuth);
projectRouter.use(requireRole("STUDENT"));

function studentId(req: AuthenticatedRequest): string {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  return req.auth.id;
}

function parseProjectBody(body: unknown) {
  const result = projectSubmissionSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(
      422,
      "Project validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return result.data;
}

// POST /api/v1/projects
projectRouter.post(
  "/",
  limitProjectWrites,
  async (req: AuthenticatedRequest, res) => {
    const input = parseProjectBody(req.body);

    const project = await createProject(studentId(req), input);

    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: { project },
    });
  },
);

// GET /api/v1/projects/me
projectRouter.get("/me", async (req: AuthenticatedRequest, res) => {
  const project = await getMyProject(studentId(req));

  res.status(200).json({
    success: true,
    message: "Project retrieved successfully",
    data: { project },
  });
});

// PATCH /api/v1/projects/me
projectRouter.patch(
  "/me",
  limitProjectWrites,
  async (req: AuthenticatedRequest, res) => {
    const input = parseProjectBody(req.body);

    const project = await reviseProject(studentId(req), input);

    res.status(200).json({
      success: true,
      message: "Project revised and resubmitted for review",
      data: { project },
    });
  },
);
