import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock events visible to stakeholders
const mockEvents = [
  {
    id: "1",
    name: "Annual Tech Conference",
    type: "Corporate",
    date: "2025-02-15",
    venue: "Convention Center",
    status: "pending",
    attendee_count: 500,
  },
  {
    id: "2",
    name: "Product Launch Event",
    type: "Public",
    date: "2025-03-01",
    venue: "Grand Hotel Ballroom",
    status: "in-progress",
    attendee_count: 200,
  },
];

const StakeholderDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Stakeholder Dashboard</h1>
            <Badge variant="secondary" className="ml-2">Stakeholder</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>View upcoming and past events</CardDescription>
          </CardHeader>
          <CardContent>
            {mockEvents.length > 0 ? (
              <div className="space-y-4">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{event.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{event.type}</p>
                        <p className="text-sm text-muted-foreground">
                          📍 {event.venue} •{" "}
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expected attendees: {event.attendee_count}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    {event.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Event completed</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No events available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakeholderDashboard;
