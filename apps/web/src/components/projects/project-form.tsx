"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertCircle,
  GitBranch,
  Globe,
  Loader2,
  Save,
  Send,
} from "lucide-react";

import {
  projectSubmissionSchema,
  type ProjectSubmissionInput,
  type ValidatedProjectSubmission,
} from "@project/contracts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ApiError } from "@/lib/api";

import { createStudentProject, reviseStudentProject } from "@/lib/projects";

import type { StudentProject } from "@/types/project";

interface ProjectFormProps {
  mode: "create" | "revise";
  project?: StudentProject;
  onSuccess: (project: StudentProject) => void;
  onCancel?: () => void;
}

export function ProjectForm({
  mode,
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectSubmissionInput, unknown, ValidatedProjectSubmission>({
    resolver: zodResolver(projectSubmissionSchema),

    defaultValues: {
      name: project?.name ?? "",
      repositoryUrl: project?.repositoryUrl ?? "",
      liveUrl: project?.liveUrl ?? "",
      description: project?.description ?? "",
    },
  });

  async function onSubmit(values: ValidatedProjectSubmission) {
    setServerError("");

    try {
      const saved =
        mode === "create"
          ? await createStudentProject(values)
          : await reviseStudentProject(values);

      onSuccess(saved);
    } catch (error) {
      if (error instanceof ApiError) {
        for (const issue of error.errors) {
          if (
            issue.field === "name" ||
            issue.field === "repositoryUrl" ||
            issue.field === "liveUrl" ||
            issue.field === "description"
          ) {
            setError(issue.field, {
              type: "server",
              message: issue.message,
            });
          }
        }

        if (error.status === 409) {
          setServerError(
            "Submission conflict: " +
              error.message +
              ". Refresh your project status before trying again.",
          );
        } else if (error.status === 429) {
          setServerError(
            "Too many attempts. Please try again after the rate-limit window.",
          );
        } else if (error.status === 503) {
          setServerError(
            "Submission service is temporarily unavailable. Please try again later.",
          );
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError("Something went wrong while saving your project.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="project-name">
          Project name <span aria-hidden="true">*</span>
        </Label>

        <Input
          id="project-name"
          placeholder="e.g. ProjectFlow Dashboard"
          maxLength={150}
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "project-name-error" : undefined}
          {...register("name")}
        />

        {errors.name && (
          <p
            id="project-name-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="repository-url">
          GitHub repository URL <span aria-hidden="true">*</span>
        </Label>

        <div className="relative">
          <GitBranch
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />

          <Input
            id="repository-url"
            type="url"
            placeholder="https://github.com/username/repository"
            className="pl-10"
            aria-invalid={Boolean(errors.repositoryUrl)}
            aria-describedby={
              errors.repositoryUrl
                ? "repository-url-error"
                : "repository-url-help"
            }
            {...register("repositoryUrl")}
          />
        </div>

        <p id="repository-url-help" className="text-xs text-slate-500">
          Use a direct GitHub repository URL. Your repository may remain private
          until the submission deadline.
        </p>

        {errors.repositoryUrl && (
          <p
            id="repository-url-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.repositoryUrl.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="live-url">
          Live demo URL <span className="text-slate-400">(optional)</span>
        </Label>

        <div className="relative">
          <Globe
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />

          <Input
            id="live-url"
            type="url"
            placeholder="https://your-project.vercel.app"
            className="pl-10"
            aria-invalid={Boolean(errors.liveUrl)}
            aria-describedby={errors.liveUrl ? "live-url-error" : undefined}
            {...register("liveUrl")}
          />
        </div>

        {errors.liveUrl && (
          <p id="live-url-error" role="alert" className="text-sm text-red-600">
            {errors.liveUrl.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Project description <span aria-hidden="true">*</span>
        </Label>

        <textarea
          id="description"
          rows={6}
          maxLength={5000}
          placeholder="Explain the problem, your solution, the technologies used, and the key features of your project..."
          className="flex w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:border-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-600/20 aria-invalid:border-red-500"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "description-error" : "description-help"
          }
          {...register("description")}
        />

        <p id="description-help" className="text-xs text-slate-500">
          Minimum 30 characters, maximum 5,000.
        </p>

        {errors.description && (
          <p
            id="description-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button type="submit" disabled={isSubmitting} className="min-w-44">
          {isSubmitting ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          ) : mode === "revise" ? (
            <Save className="mr-2 size-4" aria-hidden="true" />
          ) : (
            <Send className="mr-2 size-4" aria-hidden="true" />
          )}

          {isSubmitting
            ? "Saving project..."
            : mode === "revise"
              ? "Resubmit project"
              : "Submit project"}
        </Button>

        {mode === "revise" && onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
