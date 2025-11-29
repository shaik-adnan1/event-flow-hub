import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const StakeholderDashboard = () => {
  const navigate = useNavigate();
  const [assignments] = useState([
    { id: 1, title: "Provide catering for 200 attendees", event: "Annual Conference 2025", date: "2025-03-15", status: "pending" },
    { id: 2, title: "Set up audio equipment", event: "Product Launch Event", date: "2025-04-20", status: "accepted" },
  ]);

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleAccept = (id: number) => {
    toast.success("Assignment accepted! The event manager has been notified.");
  };

  const handleDecline = (id: number) => {
    toast.info("Assignment declined. The event manager has been notified.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">My Assignments</h1>
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
            <CardTitle>Task Assignments</CardTitle>
            <CardDescription>View and respond to your task assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{assignment.event}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(assignment.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant={assignment.status === "accepted" ? "default" : "secondary"}>
                      {assignment.status}
                    </Badge>
                  </div>
                  
                  {assignment.status === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAccept(assignment.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDecline(assignment.id)}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                  
                  {assignment.status === "accepted" && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>You've accepted this assignment</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StakeholderDashboard;
