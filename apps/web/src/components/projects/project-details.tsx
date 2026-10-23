import {
  CalendarDays,
  ExternalLink,
  GitBranch,
  Globe,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { ProjectStatusBadge } from "./project-status";

import type { StudentProject } from "@/types/project";

interface ProjectDetailsProps {
  project: StudentProject;
  onRevise: () => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProjectDetails({ project, onRevise }: ProjectDetailsProps) {
  const isRejected = project.status === "REJECTED";

  return (
    <div className="space-y-6">
      {isRejected && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 text-red-900"
        >
          <AlertDescription>
            <p className="font-semibold">Your project needs revision</p>

            <p className="mt-2 whitespace-pre-wrap">
              {project.reviewFeedback?.reason ??
                "Your submission was rejected. Contact your mentor for further details."}
            </p>

            {project.reviewFeedback?.reviewedAt && (
              <p className="mt-3 text-xs opacity-80">
                Reviewed on {formatDate(project.reviewFeedback.reviewedAt)}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {project.status === "APPROVED" && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertDescription>
            Your project has been approved. The approved submission is now
            locked.
          </AlertDescription>
        </Alert>
      )}

      {project.status === "PENDING" && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertDescription>
            Your project has been submitted successfully and is waiting for
            mentor review.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{project.name}</CardTitle>

            <p className="text-sm text-slate-500">
              Project version {project.version}
            </p>
          </div>

          <ProjectStatusBadge status={project.status} />
        </CardHeader>

        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Description
            </h3>

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {project.description}
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-slate-50"
            >
              <GitBranch className="size-5 text-slate-700" aria-hidden="true" />

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  GitHub repository
                </span>

                <span className="block truncate text-xs text-slate-500">
                  {project.repositoryUrl}
                </span>
              </span>

              <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            </a>

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-slate-50"
              >
                <Globe className="size-5 text-cyan-700" aria-hidden="true" />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    Live application
                  </span>

                  <span className="block truncate text-xs text-slate-500">
                    {project.liveUrl}
                  </span>
                </span>

                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
                No live demo URL provided.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-5 border-t pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Submitted {formatDate(project.createdAt)}
            </span>

            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Updated {formatDate(project.updatedAt)}
            </span>
          </div>

          {isRejected && (
            <div className="border-t pt-5">
              <Button type="button" onClick={onRevise}>
                <RotateCcw className="mr-2 size-4" />
                Revise and resubmit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
