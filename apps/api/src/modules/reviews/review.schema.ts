import { z } from "zod";

export const projectListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).default("ALL"),
  })
  .strict();

export const projectIdParamSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

export const reviewDecisionSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED"]),

    expectedVersion: z.number().int().positive(),

    reason: z.string().trim().max(1000).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.decision === "REJECTED" &&
      (!data.reason || data.reason.length < 10)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Rejection reason must contain at least 10 characters",
      });
    }
  });

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;
