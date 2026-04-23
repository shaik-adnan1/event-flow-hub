import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Bug, ChevronRight, User, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { useBugs } from "@/hooks/useBugs";

const QEEventTasks = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { data: events } = useEvents();
  const { data: tasks } = useTasks(eventId);
  const { data: bugs } = useBugs(eventId);

  const event = events?.find((e: any) => e.id === eventId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "not-started": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTaskBugCount = (taskId: string) =>
    bugs?.filter((b: any) => b.task_id === taskId).length || 0;

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading event…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quality-engineer")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{event.name}</h1>
            <p className="text-sm text-muted-foreground">Tasks for this event</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Event summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{event.name}</CardTitle>
                <CardDescription className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {tasks?.length || 0} Task{(tasks?.length || 0) !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Bug className="h-3 w-3" />
                  {bugs?.length || 0} Bug{(bugs?.length || 0) !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tasks list */}
        <h2 className="text-lg font-semibold text-foreground mb-4">All Tasks</h2>
        {!tasks || tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tasks have been added to this event yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: any, idx: number) => {
              const bugCount = getTaskBugCount(task.id);
              return (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                  onClick={() => navigate(`/quality-engineer/event/${eventId}/task/${task.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{task.name}</h3>
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {task.status}
                        </Badge>
                        {bugCount > 0 && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Bug className="h-3 w-3" />
                            {bugCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assigned_to_name || "Unassigned"}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QEEventTasks;
