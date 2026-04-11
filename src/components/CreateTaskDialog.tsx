import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateTask } from "@/hooks/useTasks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateTaskDialogProps {
  eventId: string;
  onTaskCreated?: () => void;
}

const CreateTaskDialog = ({ eventId, onTaskCreated }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const createTask = useCreateTask();

  // Fetch all profiles for assignment
  const { data: profiles } = useQuery({
    queryKey: ["all_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, email");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;

    const assignee = profiles?.find(p => p.user_id === assigneeId);

    try {
      await createTask.mutateAsync({
        event_id: eventId,
        name,
        description: description || undefined,
        due_date: dueDate || undefined,
        assigned_to_user_id: assigneeId && assigneeId !== "none" ? assigneeId : undefined,
        assigned_to_name: assignee ? (assignee.full_name || assignee.email || undefined) : undefined,
      });

      toast.success(`Task "${name}" created successfully!`);
      setOpen(false);
      setAssigneeId("");
      onTaskCreated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a task to this event and optionally assign it to a team member.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input id="taskName" name="name" placeholder="e.g., Set up stage lighting" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDescription">Description</Label>
            <Textarea id="taskDescription" name="description" placeholder="Describe the task..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {profiles?.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.full_name || p.email || "Unnamed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDueDate">Due Date</Label>
            <Input id="taskDueDate" name="dueDate" type="date" />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
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

export default CreateTaskDialog;
