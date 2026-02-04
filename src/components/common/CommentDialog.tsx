import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
}

const CommentDialog = ({
  open,
  onOpenChange,
  title = "Add Comment",
  description = "Share your thoughts on this post.",
  value,
  onChange,
  onSubmit,
  submitLabel = "Post Comment",
  cancelLabel = "Cancel",
  placeholder = "Write your comment here...",
}: CommentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Textarea
              id="comment"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className="focus-visible:ring-1 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? "Posting..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;

