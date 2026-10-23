"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { fetchReviewHistory } from "@/lib/reviews";
import type { ReviewHistoryData, ReviewProject } from "@/types/review";

interface Props {
  project: ReviewProject | null;
  onClose: () => void;
}

function displayDate(date: string) {
  return new Date(date).toLocaleString();
}

export function ReviewProjectDetails({ project, onClose }: Props) {
  const [history, setHistory] = useState<ReviewHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!project) return;

    let cancelled = false;

    void Promise.resolve().then(async () => {
      setLoading(true);
      setHistory(null);
      setError("");

      try {
        const result = await fetchReviewHistory(project.id);
        if (!cancelled) setHistory(result);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load review history.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [project]);

  return (
    <Dialog
      open={project !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project?.name ?? "Project details"}</DialogTitle>
          <DialogDescription>
            Submission details and review history
          </DialogDescription>
        </DialogHeader>

        {project && (
          <div className="space-y-6 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Student" value={project.student.name} />
              <Info label="Email" value={project.student.email} />
              <Info label="Status" value={project.status} />
              <Info label="Version" value={String(project.version)} />
              <Info label="Submitted" value={displayDate(project.createdAt)} />
              <Info
                label="Last updated"
                value={displayDate(project.updatedAt)}
              />
            </div>

            <section className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="whitespace-pre-wrap break-words text-slate-600">
                {project.description}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold">Project links</h3>

              {[
                { label: "Repository", url: project.repositoryUrl },
                { label: "Live demo", url: project.liveUrl },
              ].map(
                ({ label, url }) =>
                  url && (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 break-all text-cyan-700 hover:underline"
                    >
                      <ExternalLink className="size-4 shrink-0" />
                      {label}: {url}
                    </a>
                  ),
              )}
            </section>

            <section className="space-y-3 border-t pt-5">
              <h3 className="font-semibold">Review history</h3>

              {loading && (
                <p className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="size-4 animate-spin" />
                  Loading history...
                </p>
              )}

              {error && (
                <p role="alert" className="text-red-600">
                  {error}
                </p>
              )}

              {history?.reviews.length === 0 && (
                <p className="text-slate-500">
                  No review decisions recorded yet.
                </p>
              )}

              {history?.reviews.map((review) => (
                <article key={review.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{review.decision}</strong>
                    <span className="text-xs text-slate-500">
                      Version {review.projectVersion}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-600">
                    {review.reason || "No reason provided."}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    {review.reviewer.name} · {displayDate(review.createdAt)}
                  </p>
                </article>
              ))}
            </section>

            <div className="flex justify-end border-t pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}
