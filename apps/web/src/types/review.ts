export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type StatusFilter = "ALL" | ReviewStatus;

export interface ReviewStudent {
  id: string;
  name: string;
  email: string;
}

export interface ReviewProject {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  liveUrl: string | null;
  status: ReviewStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  student: ReviewStudent;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProjectListData {
  projects: ReviewProject[];
  pagination: Pagination;
}

export interface ReviewStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ReviewRecord {
  id: string;
  decision: "APPROVED" | "REJECTED";
  reason: string | null;
  projectVersion: number;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ReviewHistoryData {
  projectId: string;
  reviews: ReviewRecord[];
  total: number;
}

export interface ReviewDecisionInput {
  decision: "APPROVED" | "REJECTED";
  expectedVersion: number;
  reason?: string;
}
