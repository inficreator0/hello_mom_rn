import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
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
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Post</DialogTitle>
                    <DialogDescription>
                        Help us understand what's wrong with this post. Your report will be reviewed by our moderators.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Textarea
                            id="report-reason"
                            placeholder="Tell us why you're reporting this (e.g., spam, harassment, incorrect information)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                            className="focus-visible:ring-1 focus-visible:ring-offset-0"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason.trim()}
                    >
                        {isSubmitting ? "Reporting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDialog;
