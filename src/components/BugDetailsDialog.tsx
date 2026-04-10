import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Image } from "lucide-react";
import { toast } from "sonner";
import { useBugComments, useAddBugComment } from "@/hooks/useBugs";
import { supabase } from "@/integrations/supabase/client";

interface Bug {
  id: string;
  bug_number: string;
  description: string;
  status: string;
  photo_url?: string | null;
  created_at: string;
}

interface BugDetailsDialogProps {
  bug: Bug;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  canClose?: boolean;
  onStatusChange?: (bugId: string, status: string) => void;
}

const BugDetailsDialog = ({ bug, open, onOpenChange, userId, canClose, onStatusChange }: BugDetailsDialogProps) => {
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { data: comments, isLoading } = useBugComments(open ? bug.id : undefined);
  const addComment = useAddBugComment();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return "bg-destructive/10 text-destructive";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "resolved": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "closed": return "bg-muted text-muted-foreground";
      case "ignored": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const filePath = `comments/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("bug-photos").upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("bug-photos").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      await addComment.mutateAsync({
        bug_id: bug.id,
        user_id: userId,
        comment: comment.trim(),
        photo_url: photoUrl,
      });
      setComment("");
      setPhotoFile(null);
      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-primary">{bug.bug_number}</span>
            <Badge className={getStatusBadge(bug.status)}>{bug.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground">{bug.description}</p>
          </div>

          {bug.photo_url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Evidence</p>
              <img src={bug.photo_url} alt="Bug evidence" className="rounded-lg max-h-48 object-cover border border-border" />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Raised on {new Date(bug.created_at).toLocaleString()}
          </p>

          {canClose && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onStatusChange?.(bug.id, "closed")}>Close Bug</Button>
              <Button size="sm" variant="ghost" onClick={() => onStatusChange?.(bug.id, "ignored")}>Ignore</Button>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-sm font-semibold mb-2">Comments</p>
            <ScrollArea className="h-40 mb-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : !comments || comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-sm text-foreground">{c.comment}</p>
                      {c.photo_url && (
                        <img src={c.photo_url} alt="Comment attachment" className="rounded max-h-24 object-cover" />
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || addComment.isPending}>
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BugDetailsDialog;
