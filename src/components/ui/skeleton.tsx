import { cn } from "../../lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("rounded-md animate-shimmer bg-muted", className)}
            {...props}
        />
    );
}

// Skeleton for stat cards (posts count, comments, etc.)
function StatCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border/60 p-6 text-center">
            <Skeleton className="h-4 w-16 mx-auto mb-2" />
            <Skeleton className="h-7 w-10 mx-auto" />
        </div>
    );
}

// Skeleton for post cards
function PostCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border/60 shadow-sm p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />

            {/* Content */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    );
}

// Skeleton for profile info card
function ProfileCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border border-border/60 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-16" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export { Skeleton, StatCardSkeleton, PostCardSkeleton, ProfileCardSkeleton };
