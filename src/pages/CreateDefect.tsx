import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useCreateBug } from "@/hooks/useBugs";
import { useCreateNotification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CreateDefect = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { data: tasks } = useTasks(eventId);
  const createBug = useCreateBug();
  const createNotification = useCreateNotification();

  const [bugName, setBugName] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskSearchOpen, setTaskSearchOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const selectedTask = useMemo(
    () => tasks?.find((t: any) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (!taskSearch) return tasks;
    return tasks.filter((t: any) =>
      t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.assigned_to_name || "").toLowerCase().includes(taskSearch.toLowerCase())
    );
  }, [tasks, taskSearch]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (newFiles.length === 0) return;
    setPhotoFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugName.trim() || !selectedTaskId || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!eventId || !user) return;

    setIsSubmitting(true);
    try {
      // Upload first image as primary photo_url (existing schema), rest as additional
      let photoUrl: string | undefined;
      if (photoFiles.length > 0) {
        const fileExt = photoFiles[0].name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-photos")
          .upload(filePath, photoFiles[0]);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("bug-photos").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      const bug = await createBug.mutateAsync({
        task_id: selectedTaskId,
        event_id: eventId,
        raised_by: user.id,
        description: description.trim(),
        photo_url: photoUrl,
        bug_name: bugName.trim(),
      });

      // Upload additional images as comments with photos
      for (let i = 1; i < photoFiles.length; i++) {
        const fileExt = photoFiles[i].name.split(".").pop();
        const filePath = `comments/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-photos")
          .upload(filePath, photoFiles[i]);
        if (uploadError) continue;
        const { data: urlData } = supabase.storage.from("bug-photos").getPublicUrl(filePath);
        await supabase.from("bug_comments").insert({
          bug_id: bug.id,
          user_id: user.id,
          comment: `Additional evidence image ${i + 1}`,
          photo_url: urlData.publicUrl,
        });
      }

      // Send notification to task assignee
      if (selectedTask?.assigned_to_user_id) {
        await createNotification.mutateAsync({
          user_id: selectedTask.assigned_to_user_id,
          title: `New Defect: ${bug.bug_number}`,
          message: `A new defect [${bug.bug_number}] has been raised for your task "${selectedTask.name}". Please review.`,
          type: "bug",
          related_bug_id: bug.id,
          related_event_id: eventId,
        });
      }

      toast.success(`Defect ${bug.bug_number} created successfully!`);
      navigate("/quality-engineer");
    } catch (err: any) {
      toast.error(err.message || "Failed to create defect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quality-engineer")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Bug / Defect</h1>
            <p className="text-sm text-muted-foreground">Report an issue against a task</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Defect Report</CardTitle>
            <CardDescription>A unique Bug ID (e.g., RBUG001) will be auto-generated on submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Bug Name */}
              <div className="space-y-2">
                <Label htmlFor="bugName">Bug Name *</Label>
                <Input
                  id="bugName"
                  value={bugName}
                  onChange={(e) => setBugName(e.target.value)}
                  placeholder="e.g. Broken chair in hall B"
                  required
                />
              </div>

              {/* 2. Select Task — hybrid search + dropdown */}
              <div className="space-y-2">
                <Label>Select Task *</Label>
                <Popover open={taskSearchOpen} onOpenChange={setTaskSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {selectedTask
                        ? selectedTask.name
                        : "Search or select a task..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search tasks..."
                        value={taskSearch}
                        onValueChange={setTaskSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No tasks found.</CommandEmpty>
                        <CommandGroup>
                          {filteredTasks.map((task: any) => (
                            <CommandItem
                              key={task.id}
                              value={task.name}
                              onSelect={() => {
                                setSelectedTaskId(task.id);
                                setTaskSearchOpen(false);
                                setTaskSearch("");
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{task.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Assigned to: {task.assigned_to_name || "Unassigned"}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 3. Assignee (auto-filled, read-only) */}
              <div className="space-y-2">
                <Label>Assignee</Label>
                {selectedTask ? (
                  <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30">
                    <Badge variant="secondary" className="text-sm">
                      {selectedTask.assigned_to_name || "Unassigned"}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 border border-border rounded-md bg-muted/20">
                    Select a task to auto-fill assignee
                  </p>
                )}
              </div>

              {/* 4. Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  required
                />
              </div>

              {/* 5. Upload Image / Evidence */}
              <div className="space-y-2">
                <Label>Upload Image / Evidence</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop images here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • JPG, PNG
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt={`Evidence ${i + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creating..." : "Create Defect"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/quality-engineer")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDefect;
