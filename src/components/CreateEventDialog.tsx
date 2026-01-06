import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

// Mock managers data
const mockManagers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
];

interface CreateEventDialogProps {
  onEventCreated?: () => void;
}

const CreateEventDialog = ({ onEventCreated }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [assignmentMode, setAssignmentMode] = useState<string>("now");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const eventName = formData.get("name") as string;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success(`Event "${eventName}" created successfully!`);
    setIsSubmitting(false);
    setOpen(false);
    setSelectedManager("");
    setAssignmentMode("now");
    onEventCreated?.();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Fill in the details below to create a new event</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Annual Conference 2025"
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Event Type *</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                min={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Event Time *</Label>
              <Input
                id="time"
                name="time"
                type="time"
                required
              />
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              name="venue"
              placeholder="e.g., Grand Ballroom, City Convention Center"
              required
            />
          </div>

          {/* Attendee Count */}
          <div className="space-y-2">
            <Label htmlFor="attendeeCount">Expected Attendees *</Label>
            <Input
              id="attendeeCount"
              name="attendeeCount"
              type="number"
              min="1"
              placeholder="e.g., 150"
              required
            />
          </div>

          {/* Assignment Mode */}
          <div className="space-y-2">
            <Label>Assignment Mode</Label>
            <Select value={assignmentMode} onValueChange={setAssignmentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Assign Now</SelectItem>
                <SelectItem value="later">Assign Later</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign Event Manager - only show if assign now */}
          {assignmentMode === "now" && (
            <div className="space-y-2">
              <Label htmlFor="manager">Assign Event Manager</Label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager assigned</SelectItem>
                  {mockManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide additional details about the event..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          {/* Suggestions Section */}
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">💡 Recommendations</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-default">
                📝 Use descriptive names
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-default">
                📅 Plan 2+ weeks ahead
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-default">
                📍 Include full venue address
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-default">
                👤 Assign manager early
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-default">
                ✍️ Add detailed description
              </span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
