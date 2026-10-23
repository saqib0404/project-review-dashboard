export const PROJECT_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const USER_ROLES = ["STUDENT", "MENTOR", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export { projectSubmissionSchema } from "./project.schema.js";

export type {
  ProjectSubmissionInput,
  ValidatedProjectSubmission,
} from "./project.schema.js";
