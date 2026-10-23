import type { ValidatedProjectSubmission } from "@project/contracts";

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

import { normalizeGitHubRepository } from "./project.repository-url.js";

const projectSelect = {
  id: true,
  studentId: true,
  name: true,
  description: true,
  repositoryUrl: true,
  liveUrl: true,
  status: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

function handleProjectWriteError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      409,
      "A project with this student or repository already exists",
    );
  }

  throw error;
}

export async function createProject(
  studentId: string,
  input: ValidatedProjectSubmission,
) {
  const normalized = normalizeGitHubRepository(input.repositoryUrl);

  try {
    return await prisma.project.create({
      data: {
        studentId,
        name: input.name,
        description: input.description,
        repositoryUrl: normalized.repositoryUrl,
        repositoryKey: normalized.repositoryKey,
        liveUrl: input.liveUrl,
        status: "PENDING",
      },
      select: projectSelect,
    });
  } catch (error) {
    return handleProjectWriteError(error);
  }
}

export async function getMyProject(studentId: string) {
  const project = await prisma.project.findUnique({
    where: { studentId },

    select: {
      ...projectSelect,

      reviews: {
        where: {
          decision: "REJECTED",
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 1,
        select: {
          reason: true,
          createdAt: true,
          projectVersion: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(404, "You have not submitted a project");
  }

  const { reviews, ...details } = project;

  const latestRejection = reviews[0];

  return {
    ...details,

    reviewFeedback:
      project.status === "REJECTED" && latestRejection
        ? {
            reason: latestRejection.reason,
            reviewedAt: latestRejection.createdAt,
          }
        : null,
  };
}

export async function reviseProject(
  studentId: string,
  input: ValidatedProjectSubmission,
) {
  const normalized = normalizeGitHubRepository(input.repositoryUrl);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.project.findUnique({
        where: { studentId },
        select: {
          id: true,
          version: true,
          status: true,
        },
      });

      if (!existing) {
        throw new AppError(404, "You have not submitted a project");
      }

      if (existing.status !== "REJECTED") {
        throw new AppError(409, "Only rejected projects can be revised");
      }

      // Optimistic concurrency control:
      // only one update can succeed for the observed version.
      const result = await tx.project.updateMany({
        where: {
          id: existing.id,
          studentId,
          status: "REJECTED",
          version: existing.version,
        },
        data: {
          name: input.name,
          description: input.description,
          repositoryUrl: normalized.repositoryUrl,
          repositoryKey: normalized.repositoryKey,
          liveUrl: input.liveUrl,
          status: "PENDING",
          version: { increment: 1 },
        },
      });

      if (result.count !== 1) {
        throw new AppError(409, "Project was changed. Reload and try again.");
      }

      const updated = await tx.project.findUnique({
        where: { id: existing.id },
        select: projectSelect,
      });

      if (!updated) {
        throw new AppError(404, "Project not found");
      }

      return updated;
    });
  } catch (error) {
    return handleProjectWriteError(error);
  }
}
