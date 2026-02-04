import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface CommunityEmptyStateProps {
    onAction?: () => void;
    actionLabel?: string;
}

export const CommunityEmptyState = ({ onAction, actionLabel = "Create Post" }: CommunityEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in zoom-in duration-500 border-2 border-dashed border-border/60 rounded-xl bg-card/30 mx-4">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full transform scale-150 opacity-50"></div>
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 drop-shadow-sm"
                >
                    <circle cx="100" cy="100" r="90" fill="white" fillOpacity="0.5" />

                    {/* Abstract curve background */}
                    <path
                        d="M30 100C30 61.34 61.34 30 100 30C138.66 30 170 61.34 170 100"
                        stroke="#fbcfe8"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* Woman Silhouette */}
                    {/* Head */}
                    <circle cx="100" cy="70" r="20" fill="#db2777" />
                    {/* Hair bun */}
                    <circle cx="115" cy="65" r="10" fill="#db2777" />

                    {/* Body */}
                    <path
                        d="M50 180 C50 130, 70 100, 100 100 C 130 100, 150 130, 150 180"
                        fill="#f472b6"
                    />

                    {/* Arms holding baby (simple curves) */}
                    <path
                        d="M60 140 Q 90 160 120 140"
                        stroke="#be185d"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Baby Head (hint of it) */}
                    <circle cx="110" cy="120" r="14" fill="#fbcfe8" />
                </svg>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
                Share the first smile!
            </h3>
            <p className="text-muted-foreground max-w-sm mb-8 mx-auto leading-relaxed">
                "Your voice matters here. Share your journey, ask questions, or inspire others with your story today."
            </p>

            {onAction && (
                <Button onClick={onAction} className="rounded-full px-4 shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
