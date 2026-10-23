import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(["MENTOR", "ADMIN"]);

  return (
    <DashboardShell user={user} section="mentor">
      {children}
    </DashboardShell>
  );
}
