export type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProjectFeedback {
  reason: string | null;
  reviewedAt: string;
}

export interface StudentProject {
  id: string;
  studentId: string;
  name: string;
  description: string;
  repositoryUrl: string;
  liveUrl: string | null;
  status: ProjectStatus;
  version: number;
  createdAt: string;
  updatedAt: string;

  reviewFeedback: ProjectFeedback | null;
}

export interface StudentProjectResponse {
  project: StudentProject;
}
