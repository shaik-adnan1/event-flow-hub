import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Bug, Plus, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useBugs } from "@/hooks/useBugs";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import BugDetailsDialog from "@/components/BugDetailsDialog";

const QETaskDetails = () => {
  const navigate = useNavigate();
  const { eventId, taskId } = useParams<{ eventId: string; taskId: string }>();
  const { user } = useAuth();
  const { data: events } = useEvents();
  const { data: tasks } = useTasks(eventId);
  const { data: bugs } = useBugs(eventId);
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);

  const event = events?.find((e: any) => e.id === eventId);
  const task = tasks?.find((t: any) => t.id === taskId);
  const taskBugs = bugs?.filter((b: any) => b.task_id === taskId) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "not-started": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getBugStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-destructive/10 text-destructive";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "resolved": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading task…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/quality-engineer/event/${eventId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Task Details</h1>
            <p className="text-sm text-muted-foreground">{event?.name}</p>
          </div>
          <Button
            variant="destructive"
            onClick={() =>
              navigate(`/quality-engineer/create-defect/${eventId}?taskId=${taskId}`)
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Bug / Issue
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Task overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{task.name}</CardTitle>
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                </div>
                <CardDescription className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {task.assigned_to_name || "Unassigned"}
                  </span>
                  {task.due_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Due {new Date(task.due_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {task.description && (
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Bugs raised on this task */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Bugs raised on this task
                </CardTitle>
                <CardDescription>
                  {taskBugs.length} defect{taskBugs.length !== 1 ? "s" : ""} reported
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {taskBugs.length === 0 ? (
              <div className="py-8 text-center">
                <Bug className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No bugs reported yet for this task.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/quality-engineer/create-defect/${eventId}?taskId=${taskId}`)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report the first bug
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-[100px_1fr_100px_120px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Bug ID</span>
                  <span>Bug Name</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {taskBugs.map((bug: any) => (
                  <div
                    key={bug.id}
                    className="grid grid-cols-[100px_1fr_100px_120px] gap-2 px-4 py-3 border-t border-border hover:bg-accent cursor-pointer transition-colors items-center"
                    onClick={() => { setSelectedBug(bug); setBugDialogOpen(true); }}
                  >
                    <span className="font-mono text-sm font-semibold text-primary">
                      {bug.bug_number}
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {bug.bug_name || "—"}
                    </span>
                    <Badge className={`${getBugStatusColor(bug.status)} text-xs w-fit`}>
                      {bug.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(bug.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedBug && (
        <BugDetailsDialog
          bug={selectedBug}
          open={bugDialogOpen}
          onOpenChange={setBugDialogOpen}
          userId={user?.id || ""}
        />
      )}
    </div>
  );
};

export default QETaskDetails;
