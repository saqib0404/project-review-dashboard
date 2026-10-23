import { z } from "zod";

const httpsUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL is too long")
  .refine((value) => {
    try {
      const url = new URL(value);

      return (
        url.protocol === "https:" &&
        Boolean(url.hostname) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Enter a valid HTTPS URL");

export const projectSubmissionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Project name must have at least 3 characters")
      .max(150, "Project name cannot exceed 150 characters"),

    repositoryUrl: httpsUrl,

    liveUrl: z
      .union([httpsUrl, z.literal(""), z.null()])
      .optional()
      .transform((value) => value || null),

    description: z
      .string()
      .trim()
      .min(30, "Description must have at least 30 characters")
      .max(5000, "Description cannot exceed 5000 characters"),
  })
  .strict();

export type ProjectSubmissionInput = z.input<typeof projectSubmissionSchema>;

export type ValidatedProjectSubmission = z.output<
  typeof projectSubmissionSchema
>;
