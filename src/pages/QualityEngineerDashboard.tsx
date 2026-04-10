import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, Bug, CheckCircle, Clock, AlertCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { useBugs } from "@/hooks/useBugs";
import RaiseBugDialog from "@/components/RaiseBugDialog";
import BugDetailsDialog from "@/components/BugDetailsDialog";
import NotificationBell from "@/components/NotificationBell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

const QualityEngineerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allEvents } = useEvents();
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);

  // Filter events assigned to this QE
  const myEvents = allEvents?.filter((e: any) => e.assigned_qe_id === user?.id) || [];
  const selectedEventId = myEvents.length > 0 ? myEvents[0]?.id : undefined;

  // Get tasks and bugs for the first assigned event (or all)
  const { data: tasks } = useTasks(selectedEventId);
  const { data: bugs } = useBugs(selectedEventId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "not-started": return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "in-progress": return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "not-started": return "bg-muted text-muted-foreground";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getBugStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-destructive/10 text-destructive";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600";
      case "resolved": return "bg-green-500/10 text-green-600";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter((t: any) => t.status === "completed").length || 0,
    inProgress: tasks?.filter((t: any) => t.status === "in-progress").length || 0,
    notStarted: tasks?.filter((t: any) => t.status === "not-started").length || 0,
  };

  const openBugs = bugs?.filter((b: any) => b.status === "open").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Quality Engineer Dashboard</h1>
            <Badge variant="secondary" className="ml-2">QE</Badge>
          </div>
          <div className="flex items-center gap-2">
            {user && <NotificationBell userId={user.id} />}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{myEvents.length}</CardTitle>
              <CardDescription>Assigned Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{taskStats.total}</CardTitle>
              <CardDescription>Total Tasks</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">{taskStats.completed}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{taskStats.inProgress}</CardTitle>
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-destructive">{openBugs}</CardTitle>
              <CardDescription>Open Bugs</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {myEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No Events Assigned</p>
              <p className="text-muted-foreground">You haven't been assigned to any events yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" defaultValue={["tasks", "bugs"]} className="space-y-4">
            {/* My Events */}
            <AccordionItem value="events" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">My Assigned Events</span>
                  <Badge variant="secondary">{myEvents.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  {myEvents.map((event: any) => (
                    <div key={event.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{event.type} • {new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">📍 {event.venue}</p>
                        </div>
                        <Badge className={event.status === "in-progress" ? "bg-yellow-500/10 text-yellow-600" : "bg-muted text-muted-foreground"}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tasks */}
            <AccordionItem value="tasks" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">All Tasks</span>
                  <Badge variant="secondary">{taskStats.total}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-end mb-3">
                  {selectedEventId && tasks && (
                    <RaiseBugDialog
                      eventId={selectedEventId}
                      tasks={tasks.map((t: any) => ({ id: t.id, name: t.name, assigned_to_user_id: t.assigned_to_user_id, assigned_to_name: t.assigned_to_name }))}
                      raisedBy={user?.id || ""}
                    />
                  )}
                </div>
                {!tasks || tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No tasks found.</p>
                ) : (
                  <div className="space-y-3 pb-2">
                    {tasks.map((task: any, idx: number) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{idx + 1}</span>
                          {getTaskStatusIcon(task.status)}
                          <div>
                            <p className="font-medium text-foreground">{task.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {task.assigned_to_name && `Assigned to: ${task.assigned_to_name}`}
                              {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={getTaskStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Bugs */}
            <AccordionItem value="bugs" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  <span className="font-semibold">Bugs Raised</span>
                  <Badge className="bg-destructive/10 text-destructive">{bugs?.length || 0}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {!bugs || bugs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No bugs raised yet.</p>
                ) : (
                  <div className="space-y-3 pb-2">
                    {bugs.map((bug: any) => (
                      <div
                        key={bug.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => { setSelectedBug(bug); setBugDialogOpen(true); }}
                      >
                        <div className="flex items-center gap-3">
                          <Bug className="h-4 w-4 text-destructive" />
                          <div>
                            <p className="font-mono text-sm font-semibold text-primary">{bug.bug_number}</p>
                            <p className="text-sm text-foreground line-clamp-1">{bug.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(bug.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge className={getBugStatusColor(bug.status)}>{bug.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
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

export default QualityEngineerDashboard;
