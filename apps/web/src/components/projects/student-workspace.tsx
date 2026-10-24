"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ClipboardList,
  FolderKanban,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Skeleton } from "@/components/ui/skeleton";

import { ApiError } from "@/lib/api";
import { fetchMyProject } from "@/lib/projects";

import { ProjectForm } from "./project-form";
import { ProjectDetails } from "./project-details";
import { ProjectStatusBadge } from "./project-status";

import type { StudentProject } from "@/types/project";

type WorkspaceState =
  | { type: "loading" }
  | { type: "empty" }
  | { type: "loaded"; project: StudentProject }
  | { type: "error"; message: string };

export function StudentWorkspace() {
  const router = useRouter();

  const [state, setState] = useState<WorkspaceState>({
    type: "loading",
  });

  const [isRevising, setIsRevising] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadProject = useCallback(async () => {
    setState({ type: "loading" });

    try {
      const project = await fetchMyProject();

      setState({
        type: "loaded",
        project,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setState({ type: "empty" });
          return;
        }

        if (error.status === 401) {
          router.replace("/auth/restore");
          return;
        }

        setState({
          type: "error",
          message: error.message,
        });

        return;
      }

      setState({
        type: "error",
        message: "Unable to load your project. Please try again.",
      });
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) {
        void loadProject();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadProject]);

  function handleSaved(project: StudentProject) {
    setState({ type: "loaded", project });
    setIsRevising(false);

    setSuccessMessage(
      project.version === 1
        ? "Your project has been submitted successfully."
        : "Your revised project has been resubmitted for review.",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const project = state.type === "loaded" ? state.project : null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-cyan-700 uppercase">
          Student Workspace
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          My Project Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          Submit your work, track its review status, and respond to feedback.
        </p>
      </header>

      {successMessage && (
        <Alert
          role="status"
          className="border-emerald-200 bg-emerald-50 text-emerald-900"
        >
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>{successMessage}</span>

            <button
              type="button"
              className="text-xs font-semibold underline"
              onClick={() => setSuccessMessage("")}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {state.type === "loading" && (
        <div
          className="space-y-5"
          role="status"
          aria-label="Loading your project"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-28 rounded-xl" />
            ))}
          </div>

          <Skeleton className="h-72 rounded-xl" />

          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading your submission...
          </p>
        </div>
      )}

      {state.type === "error" && (
        <Card>
          <CardContent className="space-y-5 p-8 text-center">
            <AlertCircle className="mx-auto size-10 text-red-600" />

            <h2 className="text-xl font-semibold">Unable to load project</h2>

            <p role="alert" className="text-sm text-slate-600">
              {state.message}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProject()}
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {state.type === "empty" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Projects" value="0" />
            <SummaryCard label="Current status" value="Not submitted" />
            <SummaryCard label="Version" value="—" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FolderKanban className="size-5 text-cyan-700" />
                Submit your first project
              </CardTitle>

              <p className="text-sm text-slate-500">
                Complete the form below to send your project for mentor review.
              </p>
            </CardHeader>

            <CardContent>
              <ProjectForm mode="create" onSuccess={handleSaved} />
            </CardContent>
          </Card>
        </div>
      )}

      {project && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Projects" value="1" />

            <Card>
              <CardContent className="space-y-3 pt-6">
                <p className="text-xs font-medium text-slate-500">
                  Current status
                </p>

                <ProjectStatusBadge status={project.status} />
              </CardContent>
            </Card>

            <SummaryCard label="Version" value={String(project.version)} />
          </div>

          {isRevising && project.status === "REJECTED" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-5" />
                  Revise your project
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Update your submission based on the mentor&apos;s feedback.
                </p>
              </CardHeader>

              <CardContent>
                <ProjectForm
                  key={project.id + ":" + project.version}
                  mode="revise"
                  project={project}
                  onSuccess={handleSaved}
                  onCancel={() => setIsRevising(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <ProjectDetails
              project={project}
              onRevise={() => {
                setSuccessMessage("");
                setIsRevising(true);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <p className="text-xl font-bold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}
