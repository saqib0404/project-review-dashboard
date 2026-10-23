import type { Metadata } from "next";

import { MentorWorkspace } from "@/components/reviews/mentor-workspace";

export const metadata: Metadata = {
  title: "Review Dashboard | ProjectFlow",
  description:
    "Review student project submissions, manage decisions and view statistics.",
};

export default function MentorDashboardPage() {
  return <MentorWorkspace />;
}
