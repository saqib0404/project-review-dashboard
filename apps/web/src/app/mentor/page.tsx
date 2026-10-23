import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

export default function MentorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary">Mentor Portal</Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Review Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Review submissions and manage project decisions.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ClipboardCheck className="size-5 text-cyan-600" />
            Project Review Workspace
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            Your secure mentor dashboard is ready. Statistics, the project data
            table, and review actions will be implemented in Step 8.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
