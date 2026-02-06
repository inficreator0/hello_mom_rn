import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
}

const ConfirmationDialog = ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    isLoading = false,
}: ConfirmationDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenChange={onOpenChange}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter style={styles.footer}>
                    <Button
                        variant="outline"
                        style={styles.button}
                        onPress={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="destructive"
                        style={styles.button}
                        onPress={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    button: {
        flex: 1,
    },
});

export default ConfirmationDialog;
