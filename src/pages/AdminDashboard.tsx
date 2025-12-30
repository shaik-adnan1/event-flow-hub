import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateEventDialog from "@/components/CreateEventDialog";

// Mock events data
const mockEvents = [
  {
    id: "1",
    name: "Annual Tech Conference",
    date: "2025-02-15",
    venue: "Convention Center",
    status: "pending",
  },
  {
    id: "2",
    name: "Product Launch Event",
    date: "2025-03-01",
    venue: "Grand Hotel Ballroom",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Team Building Retreat",
    date: "2025-01-20",
    venue: "Mountain Resort",
    status: "completed",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">EventFlow Admin</h1>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{mockEvents.length}</CardTitle>
              <CardDescription>Total Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{mockEvents.filter(e => e.status === 'completed').length}</CardTitle>
              <CardDescription>Completed Events</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <CreateEventDialog />
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Manage and monitor all events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">📍 {event.venue}</p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
