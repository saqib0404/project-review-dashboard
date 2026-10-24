import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

import type { ProjectListQuery, ReviewDecisionInput } from "./review.schema.js";

const projectSelection = {
  id: true,
  name: true,
  description: true,
  repositoryUrl: true,
  liveUrl: true,
  status: true,
  version: true,
  createdAt: true,
  updatedAt: true,

  student: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ProjectSelect;

const reviewSelection = {
  id: true,
  decision: true,
  reason: true,
  projectVersion: true,
  createdAt: true,

  reviewer: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.ReviewSelect;

// Get a paginated, server-filtered list.
export async function listProjects(query: ProjectListQuery) {
  const { page, limit, status } = query;

  const where: Prisma.ProjectWhereInput = status === "ALL" ? {} : { status };

  const skip = (page - 1) * limit;

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      select: projectSelection,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: limit,
    }),

    prisma.project.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    },
  };
}

// Aggregate counts directly inside PostgreSQL.

export async function getReviewStatistics() {
  const [pending, approved, rejected] = await prisma.$transaction([
    prisma.project.count({
      where: { status: "PENDING" },
    }),

    prisma.project.count({
      where: { status: "APPROVED" },
    }),

    prisma.project.count({
      where: { status: "REJECTED" },
    }),
  ]);

  return {
    total: pending + approved + rejected,
    pending,
    approved,
    rejected,
  };
}

// Get full submission details for review.
export async function getReviewProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: projectSelection,
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  return project;
}

// Retrieve all historical review decisions.
export async function getProjectReviewHistory(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  const reviews = await prisma.review.findMany({
    where: { projectId },
    select: reviewSelection,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return {
    projectId,
    reviews,
    total: reviews.length,
  };
}

// Atomic approval/rejection with optimistic concurrency.
export async function reviewProject(
  projectId: string,
  reviewerId: string,
  input: ReviewDecisionInput,
) {
  const result = await prisma.$transaction(
    async (tx) => {
      const current = await tx.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          status: true,
          version: true,
        },
      });

      if (!current) {
        throw new AppError(404, "Project not found");
      }

      if (current.status !== "PENDING") {
        throw new AppError(409, "Only pending projects can be reviewed");
      }

      if (current.version !== input.expectedVersion) {
        throw new AppError(
          409,
          "Project has changed. Reload before reviewing.",
        );
      }

      // Compare-and-swap update.
      // A concurrent request must not silently overwrite
      // an already committed decision.
      const updated = await tx.project.updateMany({
        where: {
          id: projectId,
          status: "PENDING",
          version: input.expectedVersion,
        },
        data: {
          status: input.decision,
          version: { increment: 1 },
        },
      });

      if (updated.count !== 1) {
        throw new AppError(
          409,
          "Project was reviewed by another mentor. Reload.",
        );
      }

      const nextVersion = input.expectedVersion + 1;

      // Audit history is inserted within the same transaction.
      const review = await tx.review.create({
        data: {
          projectId,
          reviewerId,
          decision: input.decision,
          reason:
            input.decision === "REJECTED" ? input.reason : input.reason || null,
          projectVersion: nextVersion,
        },
        select: reviewSelection,
      });

      const project = await tx.project.findUniqueOrThrow({
        where: { id: projectId },
        select: projectSelection,
      });

      return { project, review };
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );

  return result;
}
