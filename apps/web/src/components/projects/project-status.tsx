import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import type { ProjectStatus } from "@/types/project";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  PENDING: {
    label: "Pending review",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full",
        "border px-3 py-1.5 text-xs font-semibold",
        config.className,
      ].join(" ")}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
