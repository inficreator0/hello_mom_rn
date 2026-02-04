import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract tracker name from URL or state
  // Extract tracker name from location state
  const state = location.state as { trackerName?: string } | null;
  const trackerName = state?.trackerName || "this tracker";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-2xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/trackers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Coming Soon</h1>
        </div>

        <Card className="text-center">
          <CardContent className="pt-12 pb-12 px-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Clock className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">We're Working on It!</h2>
            <p className="text-muted-foreground mb-6">
              {trackerName.charAt(0).toUpperCase() + trackerName.slice(1)} is currently under development.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We're working hard to bring you this feature soon. Check back later for updates!
            </p>
            <Button onClick={() => navigate("/trackers")}>
              Back to Trackers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
