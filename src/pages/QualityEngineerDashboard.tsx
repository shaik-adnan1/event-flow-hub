import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, Bug, Shield, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useBugs } from "@/hooks/useBugs";
import { useAllTasks } from "@/hooks/useTasks";
import BugDetailsDialog from "@/components/BugDetailsDialog";
import NotificationBell from "@/components/NotificationBell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

const QualityEngineerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allEvents } = useEvents();
  const { data: allTasks } = useAllTasks();
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);

  const myEvents = allEvents?.filter((e: any) => e.assigned_qe_id === user?.id) || [];

  // Collect all bugs for all assigned events
  const myEventIds = myEvents.map((e: any) => e.id);

  // We need bugs for all events — fetch all and filter
  const { data: allBugsRaw } = useBugsForEvents(myEventIds);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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

  const getEventBugs = (eventId: string) => {
    return allBugsRaw?.filter((b: any) => b.event_id === eventId) || [];
  };

  const getTaskName = (taskId: string) => {
    return allTasks?.find((t: any) => t.id === taskId)?.name || "—";
  };

  const getTaskAssignee = (taskId: string) => {
    return allTasks?.find((t: any) => t.id === taskId)?.assigned_to_name || "Unassigned";
  };

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
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{myEvents.length}</CardTitle>
              <CardDescription>Assigned Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{allBugsRaw?.length || 0}</CardTitle>
              <CardDescription>Total Bugs</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-destructive">
                {allBugsRaw?.filter((b: any) => b.status === "open").length || 0}
              </CardTitle>
              <CardDescription>Open Bugs</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                {allBugsRaw?.filter((b: any) => b.status === "resolved").length || 0}
              </CardTitle>
              <CardDescription>Resolved</CardDescription>
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
          <div className="space-y-6">
            {myEvents.map((event: any) => {
              const eventBugs = getEventBugs(event.id);
              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.venue}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                          <Bug className="h-3 w-3" />
                          {eventBugs.length} Bug{eventBugs.length !== 1 ? "s" : ""} Reported
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => navigate(`/quality-engineer/create-defect/${event.id}`)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Bug / Defect
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {eventBugs.length > 0 && (
                    <CardContent className="pt-0">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="bugs" className="border-none">
                          <AccordionTrigger className="hover:no-underline py-2 text-sm font-medium text-muted-foreground">
                            View {eventBugs.length} Bug{eventBugs.length !== 1 ? "s" : ""}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="rounded-lg border border-border overflow-hidden">
                              {/* Table header */}
                              <div className="grid grid-cols-[100px_1fr_1fr_1fr_100px_120px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                <span>Bug ID</span>
                                <span>Bug Name</span>
                                <span>Linked Task</span>
                                <span>Assignee</span>
                                <span>Status</span>
                                <span>Date</span>
                              </div>
                              {eventBugs.map((bug: any) => (
                                <div
                                  key={bug.id}
                                  className="grid grid-cols-[100px_1fr_1fr_1fr_100px_120px] gap-2 px-4 py-3 border-t border-border hover:bg-accent cursor-pointer transition-colors items-center"
                                  onClick={() => { setSelectedBug(bug); setBugDialogOpen(true); }}
                                >
                                  <span className="font-mono text-sm font-semibold text-primary">{bug.bug_number}</span>
                                  <span className="text-sm text-foreground truncate">{bug.bug_name || "—"}</span>
                                  <span className="text-sm text-foreground truncate">{getTaskName(bug.task_id)}</span>
                                  <span className="text-sm text-muted-foreground truncate">{getTaskAssignee(bug.task_id)}</span>
                                  <Badge className={`${getBugStatusColor(bug.status)} text-xs`}>{bug.status}</Badge>
                                  <span className="text-xs text-muted-foreground">{new Date(bug.created_at).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
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

// Custom hook to fetch bugs for multiple event IDs
import { useQuery } from "@tanstack/react-query";
const useBugsForEvents = (eventIds: string[]) => {
  return useQuery({
    queryKey: ["bugs_for_events", eventIds],
    queryFn: async () => {
      if (eventIds.length === 0) return [];
      const { data, error } = await supabase
        .from("bugs")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: eventIds.length > 0,
  });
};

export default QualityEngineerDashboard;
