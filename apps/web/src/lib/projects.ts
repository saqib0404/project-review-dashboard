import { api } from "@/lib/api";

import type { StudentProject, StudentProjectResponse } from "@/types/project";

import type { ValidatedProjectSubmission } from "@project/contracts";

export async function fetchMyProject(): Promise<StudentProject> {
  const result = await api.get<StudentProjectResponse>("/projects/me");

  return result.project;
}

export async function createStudentProject(
  values: ValidatedProjectSubmission,
): Promise<StudentProject> {
  const result = await api.post<StudentProjectResponse>("/projects", values);

  return result.project;
}

export async function reviseStudentProject(
  values: ValidatedProjectSubmission,
): Promise<StudentProject> {
  const result = await api.patch<StudentProjectResponse>(
    "/projects/me",
    values,
  );

  return result.project;
}
