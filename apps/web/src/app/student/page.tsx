import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderPlus } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary">Student Portal</Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          My Project Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your submission and follow its review status.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FolderPlus className="size-5 text-cyan-600" />
            Project Submission
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            Your project submission workspace is ready. The complete project
            form and status tracking will be added in Step 7.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
