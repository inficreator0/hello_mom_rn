import * as React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
      <DialogContent onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
            style={styles.input}
            textAlignVertical="top"
          />
        </View>
        <DialogFooter style={styles.footer}>
          <Button
            variant="outline"
            style={styles.flex1}
            onPress={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            style={styles.flex1}
            onPress={handleSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? "Posting..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: 16,
  },
  input: {
    backgroundColor: '#f1f5f9', // muted
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    color: '#0f172a', // foreground
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
});

export default CommentDialog;

