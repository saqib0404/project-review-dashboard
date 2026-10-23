"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ApiError } from "@/lib/api";
import { submitReviewDecision } from "@/lib/reviews";
import type { ReviewProject } from "@/types/review";

interface Props {
  project: ReviewProject;
  decision: "APPROVED" | "REJECTED";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onConflict: () => void;
}

export function ReviewDecisionDialog({
  project,
  decision,
  open,
  onOpenChange,
  onSuccess,
  onConflict,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const rejecting = decision === "REJECTED";
  const validReason = reason.trim().length >= 10;

  function close() {
    if (saving) return;
    setReason("");
    setError("");
    onOpenChange(false);
  }

  async function submit() {
    if (saving || (rejecting && !validReason)) return;

    setSaving(true);
    setError("");

    try {
      await submitReviewDecision(project.id, {
        decision,
        expectedVersion: project.version,
        ...(rejecting ? { reason: reason.trim() } : {}),
      });

      setReason("");
      onOpenChange(false);
      onSuccess();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        setError(
          "This project has changed or was already reviewed. Reload the latest version before deciding.",
        );
        onConflict();
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to save the review decision.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rejecting ? "Reject project" : "Approve project"}
          </DialogTitle>
          <DialogDescription>
            {project.name} — version {project.version}. This decision will be
            recorded in review history.
          </DialogDescription>
        </DialogHeader>

        {rejecting && (
          <div className="space-y-2">
            <label htmlFor="review-reason" className="text-sm font-medium">
              Rejection reason
            </label>

            <Textarea
              id="review-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              maxLength={1000}
              aria-invalid={reason.length > 0 && !validReason}
              placeholder="Explain what the student needs to improve..."
            />

            <p className="text-xs text-slate-500">
              At least 10 characters; maximum 1,000.
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            disabled={saving}
            onClick={close}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={rejecting ? "destructive" : "default"}
            disabled={saving || (rejecting && !validReason)}
            onClick={() => void submit()}
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}

            {saving
              ? "Saving..."
              : rejecting
                ? "Confirm rejection"
                : "Confirm approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
