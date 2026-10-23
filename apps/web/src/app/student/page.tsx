import type { Metadata } from "next";

import { StudentWorkspace } from "@/components/projects/student-workspace";

export const metadata: Metadata = {
  title: "My Project Dashboard | ProjectFlow",
  description: "Manage project submissions and track mentor review status.",
};

export default function StudentDashboardPage() {
  return <StudentWorkspace />;
}
