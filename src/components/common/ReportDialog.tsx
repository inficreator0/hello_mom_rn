import * as React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => void | Promise<void>;
}

const ReportDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: ReportDialogProps) => {
    const [reason, setReason] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!reason.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit(reason);
            setReason(""); // Clear on success
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenChange={onOpenChange}>
                <DialogHeader>
                    <DialogTitle>Report Post</DialogTitle>
                    <DialogDescription>
                        Help us understand what's wrong. Moderators will review your report.
                    </DialogDescription>
                </DialogHeader>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Why are you reporting this? (e.g., spam, harassment)..."
                        value={reason}
                        onChangeText={setReason}
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
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        style={styles.flex1}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !reason.trim()}
                    >
                        {isSubmitting ? "Reporting..." : "Submit Report"}
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

export default ReportDialog;
