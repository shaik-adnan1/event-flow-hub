import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, Bug, Shield, MapPin, ChevronRight, ListChecks, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useAllTasks } from "@/hooks/useTasks";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const QualityEngineerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allEvents } = useEvents();
  const { data: allTasks } = useAllTasks();

  const myEvents = allEvents?.filter((e: any) => e.assigned_qe_id === user?.id) || [];
  const myEventIds = myEvents.map((e: any) => e.id);
  const { data: allBugsRaw } = useBugsForEvents(myEventIds);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getEventTaskCount = (eventId: string) =>
    allTasks?.filter((t: any) => t.event_id === eventId).length || 0;

  const getEventBugCount = (eventId: string) =>
    allBugsRaw?.filter((b: any) => b.event_id === eventId).length || 0;

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
              <CardTitle className="text-2xl">
                {allTasks?.filter((t: any) => myEventIds.includes(t.event_id)).length || 0}
              </CardTitle>
              <CardDescription>Total Tasks</CardDescription>
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
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-4">Your Assigned Events</h2>

        {myEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No Events Assigned</p>
              <p className="text-muted-foreground">You haven't been assigned to any events yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEvents.map((event: any, idx: number) => {
              const taskCount = getEventTaskCount(event.id);
              const bugCount = getEventBugCount(event.id);
              return (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => navigate(`/quality-engineer/event/${event.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                          <CardDescription className="space-y-1">
                            <span className="flex items-center gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(event.date).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                              <Clock className="h-3.5 w-3.5 ml-2" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.venue}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <ListChecks className="h-3 w-3" />
                        {taskCount} Task{taskCount !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Bug className="h-3 w-3" />
                        {bugCount} Bug{bugCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
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

// Custom hook to fetch bugs for multiple event IDs
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
