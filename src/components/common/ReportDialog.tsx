import * as React from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from "react-native";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

const REPORT_CATEGORIES = [
    { label: "Spam", value: "SPAM" },
    { label: "Harassment", value: "HARASSMENT" },
    { label: "Inappropriate", value: "INAPPROPRIATE" },
    { label: "Misinformation", value: "MISINFORMATION" },
    { label: "Violence", value: "VIOLENCE" },
    { label: "Hate Speech", value: "HATE_SPEECH" },
    { label: "Other", value: "OTHER" },
];

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { category: string; description?: string }) => void | Promise<void>;
}

const ReportDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: ReportDialogProps) => {
    const [category, setCategory] = React.useState<string>("");
    const [description, setDescription] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!category || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ category, description: description.trim() || undefined });
            setCategory("");
            setDescription("");
            onOpenChange(false);
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

                <View style={styles.container}>
                    <Text style={styles.label}>Reason for reporting:</Text>
                    <View style={styles.categoriesContainer}>
                        {REPORT_CATEGORIES.map((cat) => (
                            <Pressable
                                key={cat.value}
                                onPress={() => setCategory(cat.value)}
                                style={[
                                    styles.categoryChip,
                                    category === cat.value && styles.categoryChipSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat.value && styles.categoryTextSelected,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.label}>Additional Details (Optional):</Text>
                    <TextInput
                        placeholder="Tell us more..."
                        value={description}
                        onChangeText={setDescription}
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
                        disabled={isSubmitting || !category}
                    >
                        {isSubmitting ? "Reporting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    categoriesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
    },
    categoryChipSelected: {
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
    },
    categoryText: {
        fontSize: 14,
        color: "#475569",
    },
    categoryTextSelected: {
        color: "#ffffff",
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#f1f5f9",
        padding: 12,
        borderRadius: 12,
        minHeight: 80,
        color: "#0f172a",
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    flex1: {
        flex: 1,
    },
});

export default ReportDialog;
