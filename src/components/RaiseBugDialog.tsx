import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bug } from "lucide-react";
import { toast } from "sonner";
import { useCreateBug } from "@/hooks/useBugs";
import { useCreateNotification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  name: string;
  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;
}

interface RaiseBugDialogProps {
  eventId: string;
  tasks: Task[];
  raisedBy: string;
  onBugRaised?: () => void;
}

const RaiseBugDialog = ({ eventId, tasks, raisedBy, onBugRaised }: RaiseBugDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBug = useCreateBug();
  const createNotification = useCreateNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl: string | undefined;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-photos")
          .upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("bug-photos").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      const bug = await createBug.mutateAsync({
        task_id: selectedTask,
        event_id: eventId,
        raised_by: raisedBy,
        description: description.trim(),
        photo_url: photoUrl,
      });

      // Send notification to the task assignee
      const task = tasks.find(t => t.id === selectedTask);
      if (task?.assigned_to_user_id) {
        await createNotification.mutateAsync({
          user_id: task.assigned_to_user_id,
          title: `Bug Raised: ${bug.bug_number}`,
          message: `A bug has been raised against task "${task.name}": ${description.substring(0, 100)}`,
          type: "bug",
          related_bug_id: bug.id,
          related_event_id: eventId,
        });
      }

      toast.success(`Bug ${bug.bug_number} raised successfully!`);
      setOpen(false);
      setSelectedTask("");
      setDescription("");
      setPhotoFile(null);
      onBugRaised?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to raise bug");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Bug className="h-4 w-4 mr-2" />
          Raise Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a Bug</DialogTitle>
          <DialogDescription>Report an issue against a task. A unique Bug ID will be auto-generated.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Task *</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Photo Evidence (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            {photoFile && (
              <p className="text-xs text-muted-foreground">Selected: {photoFile.name}</p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? "Submitting..." : "Raise Bug"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseBugDialog;
