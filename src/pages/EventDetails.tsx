import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Pencil,
  Trash2,
  User,
  Tag,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import EditEventDialog from "@/components/EditEventDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  time?: string;
  venue: string;
  status: string;
  description?: string;
  attendeeCount?: number;
  assignedManagerId?: string;
  assignedManagerName?: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    name: "Annual Tech Conference",
    type: "Corporate",
    date: "2025-02-15",
    time: "09:00",
    venue: "Convention Center",
    status: "pending",
    attendeeCount: 500,
    description:
      "Our flagship annual technology conference bringing together industry leaders and innovators. Featuring keynote speakers, panel discussions, workshops, and networking opportunities across three days of immersive tech experiences.",
    assignedManagerId: "1",
    assignedManagerName: "John Smith",
  },
  {
    id: "2",
    name: "Product Launch Event",
    type: "Public",
    date: "2025-03-01",
    time: "14:00",
    venue: "Grand Hotel Ballroom",
    status: "in-progress",
    attendeeCount: 200,
    description:
      "Exciting product launch showcasing our latest innovations to the public and media. Live demonstrations, press briefings, and exclusive previews for attendees.",
  },
  {
    id: "3",
    name: "Team Building Retreat",
    type: "Private",
    date: "2025-01-20",
    time: "10:00",
    venue: "Mountain Resort",
    status: "completed",
    attendeeCount: 50,
    description:
      "A relaxing team building retreat for fostering collaboration and team spirit. Activities include outdoor challenges, creative workshops, and group dining experiences.",
    assignedManagerId: "2",
    assignedManagerName: "Sarah Johnson",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: AlertCircle, label: "Pending" };
    case "in-progress":
      return { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Timer, label: "In Progress" };
    case "completed":
      return { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: CheckCircle2, label: "Completed" };
    case "deleted":
      return { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Trash2, label: "Deleted" };
    default:
      return { color: "bg-muted text-muted-foreground", icon: Activity, label: status };
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "corporate":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "public":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "private":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "cultural":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
    case "personal":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (timeStr: string) => {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const getDaysUntil = (dateStr: string) => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [event, setEvent] = useState<Event | undefined>(
    mockEvents.find((e) => e.id === eventId)
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntil(event.date);

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvent(updatedEvent);
  };

  const confirmDelete = () => {
    toast.success(`Event "${event.name}" deleted`);
    setDeleteDialogOpen(false);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={getTypeColor(event.type)}>
                <Tag className="h-3 w-3 mr-1" />
                {event.type}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                <Hash className="h-3 w-3 mr-1" />
                ID: {event.id}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{event.name}</h1>
            {event.description && (
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.time ? formatTime(event.time) : "TBD"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Attendees</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.attendeeCount ? event.attendeeCount.toLocaleString() : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Countdown</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.status === "completed"
                    ? "Completed"
                    : daysUntil === 0
                    ? "Today!"
                    : daysUntil > 0
                    ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""} left`
                    : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} ago`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Date</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {event.time ? formatTime(event.time) : "To be determined"}
                    </p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Venue</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{event.venue}</p>
                    </div>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected Attendees</p>
                    <p className="text-sm font-medium text-foreground">
                      {event.attendeeCount ? `${event.attendeeCount.toLocaleString()} people` : "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Type</p>
                    <p className="text-sm font-medium text-foreground">{event.type}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</p>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className="h-3.5 w-3.5" />
                      <p className="text-sm font-medium text-foreground">{statusConfig.label}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            {event.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Manager Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Assigned Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.assignedManagerName ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.assignedManagerName}</p>
                      <p className="text-xs text-muted-foreground">Event Manager</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <User className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No manager assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Event Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </CardContent>
            </Card>

            {/* Timeline / Key Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-foreground">{statusConfig.label}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Countdown</p>
                      <p className="text-sm font-medium text-foreground">
                        {event.status === "completed"
                          ? "Event completed"
                          : daysUntil === 0
                          ? "Happening today!"
                          : daysUntil > 0
                          ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""} remaining`
                          : `Passed ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} ago`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Event Dialog */}
      <EditEventDialog
        event={event}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEventUpdated={handleEventUpdated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetails;
