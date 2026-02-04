import { Card, CardContent } from "../ui/card";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: "comments" | "posts" | "bookmarks";
}

// Baby face illustration SVG
const BabyIllustration = () => (
    <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-80"
    >
        {/* Face circle */}
        <circle cx="60" cy="55" r="40" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
        {/* Left eye */}
        <circle cx="45" cy="50" r="5" fill="hsl(var(--foreground))" />
        <circle cx="46" cy="48" r="2" fill="white" />
        {/* Right eye */}
        <circle cx="75" cy="50" r="5" fill="hsl(var(--foreground))" />
        <circle cx="76" cy="48" r="2" fill="white" />
        {/* Smile */}
        <path d="M 45 65 Q 60 80 75 65" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Blush */}
        <circle cx="35" cy="60" r="6" fill="hsl(var(--primary) / 0.3)" />
        <circle cx="85" cy="60" r="6" fill="hsl(var(--primary) / 0.3)" />
        {/* Hair/bow */}
        <path d="M 35 25 Q 60 5 85 25" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Speech bubble */}
        <ellipse cx="95" cy="25" rx="18" ry="12" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <text x="95" y="29" textAnchor="middle" fontSize="14" fill="hsl(var(--muted-foreground))">💬</text>
    </svg>
);

export const EmptyState = ({ title, description }: EmptyStateProps) => {
    return (
        <Card className="border-dashed">
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
                <BabyIllustration />
                <div className="text-center">
                    <p className="text-lg font-medium text-foreground mb-1">
                        {title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmptyState;
