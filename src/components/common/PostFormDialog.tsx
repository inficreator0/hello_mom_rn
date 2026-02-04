import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { PostFormData, CommunityCategory } from "../../types";

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: PostFormData;
  onFormDataChange: (data: PostFormData) => void;
  onSubmit: () => void | Promise<void>;
  categories: CommunityCategory[];
  submitLabel?: string;
  cancelLabel?: string;
}

const PostFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onFormDataChange,
  onSubmit,
  categories,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
}: PostFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof PostFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    isSubmitting || !formData.title.trim() || !formData.content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              disabled={isSubmitting}
            >
              {categories.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flair">Flair (optional)</Label>
            <Input
              id="flair"
              placeholder="e.g., Question, Advice, Vent"
              value={formData.flair || ""}
              onChange={(e) => handleChange("flair", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={6}
              disabled={isSubmitting}
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
            disabled={isDisabled}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostFormDialog;

