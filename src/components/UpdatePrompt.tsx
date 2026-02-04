import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { skipWaiting } from "../lib/serviceWorker";

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener("sw-update-available", handleUpdateAvailable);

    return () => {
      window.removeEventListener("sw-update-available", handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    skipWaiting();
    setShowPrompt(false);
    // The page will reload automatically when the new service worker activates
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <Card className="max-w-md mx-auto shadow-lg pointer-events-auto border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Update Available</h3>
              <p className="text-xs text-muted-foreground mb-3">
                A new version of the app is available. Refresh to get the latest features and improvements.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Update Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
