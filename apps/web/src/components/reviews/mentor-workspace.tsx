"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchReviewProjects, fetchReviewStats } from "@/lib/reviews";

import type {
  ProjectListData,
  ReviewProject,
  ReviewStatistics,
  StatusFilter,
} from "@/types/review";

import { ReviewDecisionDialog } from "./review-decision-dialog";
import { ReviewProjectDetails } from "./review-project-details";

type Decision = "APPROVED" | "REJECTED";

const filters: StatusFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        colors[status] ?? ""
      }`}
    >
      {status}
    </span>
  );
}

export function MentorWorkspace() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [list, setList] = useState<ProjectListData | null>(null);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState<ReviewProject | null>(null);

  const [decisionTarget, setDecisionTarget] = useState<{
    project: ReviewProject;
    decision: Decision;
  } | null>(null);

  const requestId = useRef(0);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestId.current;

    void Promise.resolve().then(async () => {
      setLoading(true);
      setError("");

      try {
        const [projectData, statistics] = await Promise.all([
          fetchReviewProjects(page, limit, filter),
          fetchReviewStats(),
        ]);

        if (cancelled || currentRequest !== requestId.current) {
          return;
        }

        // If a page becomes empty after reviews, go back one page.
        if (
          projectData.projects.length === 0 &&
          page > 1 &&
          projectData.pagination.totalPages < page
        ) {
          setPage(Math.max(1, projectData.pagination.totalPages));
          return;
        }

        setList(projectData);
        setStats(statistics);
      } catch (cause) {
        if (cancelled || currentRequest !== requestId.current) {
          return;
        }

        setList(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load the review dashboard.",
        );
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [page, limit, filter, reloadKey]);

  const cards = [
    {
      title: "Total projects",
      value: stats?.total,
      icon: FolderKanban,
    },
    {
      title: "Pending",
      value: stats?.pending,
      icon: Clock3,
    },
    {
      title: "Approved",
      value: stats?.approved,
      icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: stats?.rejected,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
            Mentor Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Review Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review student projects and track submission decisions.
          </p>
        </div>

        <Button variant="outline" onClick={reload} disabled={loading}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex flex-wrap justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {notice}
          <button onClick={() => setNotice("")} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{title}</p>
                {value === undefined ? (
                  <Skeleton className="h-9 w-14" />
                ) : (
                  <p className="text-3xl font-bold">{value}</p>
                )}
              </div>
              <Icon className="size-8 text-slate-400" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Project submissions</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                All filtering and pagination run on the server.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              Rows
              <select
                aria-label="Rows per page"
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-md border bg-white px-3 py-2"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2" aria-label="Status filter">
            {filters.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? "default" : "outline"}
                aria-pressed={filter === status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                  setNotice("");
                }}
              >
                {status === "ALL"
                  ? "All projects"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <p>{error}</p>
              <Button variant="outline" onClick={reload}>
                Try again
              </Button>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : list?.projects.length ? (
                  list.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="max-w-60">
                        <p className="truncate font-semibold">{project.name}</p>
                      </TableCell>

                      <TableCell>
                        <p>{project.student.name}</p>
                        <p className="text-xs text-slate-500">
                          {project.student.email}
                        </p>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>

                      <TableCell>{formatDate(project.createdAt)}</TableCell>

                      <TableCell>v{project.version}</TableCell>

                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(project)}
                          >
                            View
                          </Button>

                          {project.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setDecisionTarget({
                                    project,
                                    decision: "APPROVED",
                                  })
                                }
                              >
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setDecisionTarget({
                                    project,
                                    decision: "REJECTED",
                                  })
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-slate-500"
                    >
                      {error
                        ? "Projects could not be loaded."
                        : "No projects match this filter."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" aria-live="polite">
              {list
                ? `${list.pagination.total} projects · Page ${page} of ${Math.max(1, list.pagination.totalPages)}`
                : "Loading pagination..."}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading || !list?.pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={loading || !list?.pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReviewProjectDetails
        project={selected}
        onClose={() => setSelected(null)}
      />

      {decisionTarget && (
        <ReviewDecisionDialog
          key={`${decisionTarget.project.id}-${decisionTarget.decision}`}
          project={decisionTarget.project}
          decision={decisionTarget.decision}
          open
          onOpenChange={(open) => {
            if (!open) setDecisionTarget(null);
          }}
          onSuccess={() => {
            setDecisionTarget(null);
            setNotice("Review decision saved successfully.");
            reload();
          }}
          onConflict={() => {
            reload();
          }}
        />
      )}
    </div>
  );
}
