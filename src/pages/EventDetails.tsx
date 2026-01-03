import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Pencil, Trash2, User } from "lucide-react";
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

// Mock events data (same as AdminDashboard for consistency)
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
    description: "Our flagship annual technology conference bringing together industry leaders and innovators.",
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
    description: "Exciting product launch showcasing our latest innovations to the public and media.",
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
    description: "A relaxing team building retreat for fostering collaboration and team spirit.",
    assignedManagerId: "2",
    assignedManagerName: "Sarah Johnson",
  },
];

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Find event from mock data
  const [event, setEvent] = useState<Event | undefined>(
    mockEvents.find(e => e.id === eventId)
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The event you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvent(updatedEvent);
  };

  const confirmDelete = () => {
    toast.success(`Event "${event.name}" deleted`);
    setDeleteDialogOpen(false);
    navigate("/admin");
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "corporate":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "public":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "private":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "cultural":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
      case "personal":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
              <Badge className={getStatusColor(event.status)}>
                {event.status.replace("-", " ")}
              </Badge>
            </div>
            <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {event.time && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{event.time}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium text-foreground">{event.venue}</p>
                </div>
              </div>

              {event.attendeeCount && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Attendees</p>
                    <p className="font-medium text-foreground">{event.attendeeCount} people</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment & Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  {event.assignedManagerName ? (
                    <p className="font-medium text-foreground">{event.assignedManagerName}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No manager assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <p className="text-foreground">{event.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
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

      {/* Delete Confirmation Dialog */}
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
