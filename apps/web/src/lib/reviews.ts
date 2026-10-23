import { api } from "@/lib/api";

import type {
  ProjectListData,
  ReviewProject,
  ReviewStatistics,
  ReviewHistoryData,
  ReviewDecisionInput,
  StatusFilter,
  ReviewRecord,
} from "@/types/review";

export function fetchReviewProjects(
  page: number,
  limit: number,
  status: StatusFilter,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });

  return api.get<ProjectListData>(`/reviews/projects?${params.toString()}`);
}

export async function fetchReviewStats() {
  const result = await api.get<{
    statistics: ReviewStatistics;
  }>("/reviews/stats");

  return result.statistics;
}

export async function fetchReviewProject(id: string) {
  const result = await api.get<{
    project: ReviewProject;
  }>(`/reviews/projects/${encodeURIComponent(id)}`);

  return result.project;
}

export function fetchReviewHistory(id: string) {
  return api.get<ReviewHistoryData>(
    `/reviews/projects/${encodeURIComponent(id)}/history`,
  );
}

export async function submitReviewDecision(
  id: string,
  input: ReviewDecisionInput,
) {
  return api.patch<{
    project: ReviewProject;
    review: ReviewRecord;
  }>(`/reviews/projects/${encodeURIComponent(id)}/decision`, input);
}
