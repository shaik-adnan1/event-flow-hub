import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EventManagerDashboard = () => {
  const navigate = useNavigate();
  const [tasks] = useState([
    { id: 1, title: "Set up venue decorations", event: "Annual Conference 2025", dueDate: "2025-03-10", status: "not-started", assignee: "John Doe" },
    { id: 2, title: "Coordinate catering service", event: "Annual Conference 2025", dueDate: "2025-03-12", status: "in-progress", assignee: "Jane Smith" },
    { id: 3, title: "Prepare presentation materials", event: "Product Launch Event", dueDate: "2025-04-15", status: "completed", assignee: "Mike Wilson" },
    { id: 4, title: "Book audio-visual equipment", event: "Product Launch Event", dueDate: "2025-04-18", status: "in-progress", assignee: "Sarah Lee" },
  ]);

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    navigate("/login");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not-started":
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
      case "not-started":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    notStarted: tasks.filter(t => t.status === "not-started").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Event Manager Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{taskStats.total}</CardTitle>
              <CardDescription>Total Tasks</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">{taskStats.completed}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{taskStats.inProgress}</CardTitle>
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{taskStats.notStarted}</CardTitle>
              <CardDescription>Not Started</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Monitor and manage all assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="pt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.event}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Assigned to: {task.assignee}</span>
                      <span>•</span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventManagerDashboard;
