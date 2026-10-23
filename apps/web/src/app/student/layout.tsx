import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(["STUDENT"]);

  return (
    <DashboardShell user={user} section="student">
      {children}
    </DashboardShell>
  );
}
