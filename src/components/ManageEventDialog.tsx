import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Plus, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";
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
  assignedBy?: string;
  attendeeCount?: number;
}

interface Task {
  id: string;
  name: string;
  assignedTo: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "completed";
}

interface ManageEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdate?: (eventId: string, status: string) => void;
}

// Mock stakeholders/vendors
const mockAssignees = [
  { id: "1", name: "ABC Catering", type: "vendor" },
  { id: "2", name: "XYZ Decorations", type: "vendor" },
  { id: "3", name: "John Doe", type: "stakeholder" },
  { id: "4", name: "Jane Wilson", type: "stakeholder" },
];

const ManageEventDialog = ({ event, open, onOpenChange, onEventUpdate }: ManageEventDialogProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", name: "Setup venue decorations", assignedTo: "XYZ Decorations", dueDate: event.date, status: "in-progress" },
    { id: "2", name: "Arrange catering", assignedTo: "ABC Catering", dueDate: event.date, status: "not-started" },
  ]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [newTask, setNewTask] = useState({ name: "", assignedTo: "", dueDate: "" });
  const [eventAccepted, setEventAccepted] = useState(event.status === "in-progress");

  const handleAcceptEvent = () => {
    setEventAccepted(true);
    onEventUpdate?.(event.id, "in-progress");
    toast.success("Event accepted! Tasks have been auto-created.");
  };

  const handleDeclineEvent = () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    onEventUpdate?.(event.id, "declined");
    toast.success("Event declined");
    setDeclineDialogOpen(false);
    onOpenChange(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate,
      status: "not-started",
    };
    setTasks([...tasks, task]);
    toast.success("Task added");
    setAddTaskOpen(false);
    setNewTask({ name: "", assignedTo: "", dueDate: "" });
  };

  const handleSendNotification = (task: Task) => {
    toast.success(`WhatsApp notification sent to ${task.assignedTo}`);
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "not-started":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Event</DialogTitle>
            <DialogDescription>View event details and manage tasks</DialogDescription>
          </DialogHeader>

          {/* Event Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Event Name</Label>
                  <p className="font-medium">{event.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Event Type</Label>
                  <p className="font-medium">{event.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {event.time && ` at ${event.time}`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Venue</Label>
                  <p className="font-medium">{event.venue}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned By</Label>
                  <p className="font-medium">{event.assignedBy || "Admin"}</p>
                </div>
                {event.attendeeCount && (
                  <div>
                    <Label className="text-muted-foreground">Expected Attendees</Label>
                    <p className="font-medium">{event.attendeeCount}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Actions - Show only if not yet accepted */}
          {!eventAccepted && event.status === "pending" && (
            <>
              <Separator />
              <div className="flex gap-4">
                <Button onClick={handleAcceptEvent} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Accept Event
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDeclineDialogOpen(true)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline Event
                </Button>
              </div>
            </>
          )}

          {/* Tasks Section */}
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Tasks</h3>
              <Button size="sm" onClick={() => setAddTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {task.assignedTo} • Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status.replace("-", " ")}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleSendNotification(task)}
                        title="Send WhatsApp Notification"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No tasks yet. Add a task to get started.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a task for this event</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="e.g., Setup audio equipment"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To *</Label>
              <Select 
                value={newTask.assignedTo} 
                onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stakeholder/vendor" />
                </SelectTrigger>
                <SelectContent>
                  {mockAssignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.name}>
                      {assignee.name} ({assignee.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDueDate">Due Date *</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit">Add Task</Button>
              <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Event</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for declining this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeclineReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineEvent}>Decline Event</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageEventDialog;
