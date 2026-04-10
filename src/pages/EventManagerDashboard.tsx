import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, LogOut, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ManageEventDialog from "@/components/ManageEventDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAllBugs } from "@/hooks/useBugs";
import BugDetailsDialog from "@/components/BugDetailsDialog";
import NotificationBell from "@/components/NotificationBell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  time?: string;
  venue: string;
  status: string;
  assignedBy?: string;
  attendeeCount?: number;
}

// Mock events assigned to this manager
const initialEvents: Event[] = [
  {
    id: "1",
    name: "Annual Tech Conference",
    type: "Corporate",
    date: "2025-02-15",
    time: "09:00",
    venue: "Convention Center",
    status: "pending",
    assignedBy: "Admin User",
    attendeeCount: 500,
  },
  {
    id: "2",
    name: "Product Launch Event",
    type: "Public",
    date: "2025-03-01",
    time: "14:00",
    venue: "Grand Hotel Ballroom",
    status: "in-progress",
    assignedBy: "Admin User",
    attendeeCount: 200,
  },
];

const EventManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const { data: allBugs } = useAllBugs();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleManageEvent = (event: Event) => {
    setSelectedEvent(event);
    setManageDialogOpen(true);
  };

  const handleEventUpdate = (eventId: string, status: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, status } : e
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const eventStats = {
    total: events.length,
    completed: events.filter(e => e.status === "completed").length,
    inProgress: events.filter(e => e.status === "in-progress").length,
    pending: events.filter(e => e.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Event Manager Dashboard</h1>
            <Badge variant="secondary" className="ml-2">Manager</Badge>
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
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{eventStats.total}</CardTitle>
              <CardDescription>Total Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">{eventStats.completed}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{eventStats.inProgress}</CardTitle>
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{eventStats.pending}</CardTitle>
              <CardDescription>Pending</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Event Management */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Events</CardTitle>
            <CardDescription>Events assigned to you for management</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="pt-1">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{event.type}</p>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📍 {event.venue}</span>
                        <span>•</span>
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleManageEvent(event)}>
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No events assigned to you yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Bugs Section */}
        <Accordion type="multiple" className="mt-6">
          <AccordionItem value="bugs" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                <span className="font-semibold text-foreground">Bugs / Defects</span>
                <Badge className="bg-destructive/10 text-destructive">{allBugs?.length || 0}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {!allBugs || allBugs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No bugs reported.</p>
              ) : (
                <div className="space-y-3 pb-2">
                  {allBugs.map((bug: any) => (
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
                        </div>
                      </div>
                      <Badge className={
                        bug.status === "open" ? "bg-destructive/10 text-destructive" :
                        bug.status === "closed" ? "bg-muted text-muted-foreground" :
                        "bg-yellow-500/10 text-yellow-600"
                      }>
                        {bug.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Manage Event Dialog */}
      {selectedEvent && (
        <ManageEventDialog
          event={selectedEvent}
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          onEventUpdate={handleEventUpdate}
        />
      )}

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

export default EventManagerDashboard;
