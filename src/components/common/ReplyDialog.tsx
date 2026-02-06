import * as React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyingTo?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
}

const ReplyDialog = ({
  open,
  onOpenChange,
  replyingTo,
  value,
  onChange,
  onSubmit,
  submitLabel = "Reply",
  cancelLabel = "Cancel",
  placeholder = "Write your reply here...",
}: ReplyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>{replyingTo ? `Reply to ${replyingTo}` : "Share your response"}</DialogTitle>
        </DialogHeader>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            style={styles.input}
            textAlignVertical="top"
          />
        </View>
        <DialogFooter style={styles.footer}>
          <Button variant="outline" style={styles.flex1} onPress={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button style={styles.flex1} onPress={onSubmit}>
            {submitLabel}
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

export default ReplyDialog;

