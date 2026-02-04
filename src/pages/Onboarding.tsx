import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Baby, Users, ArrowRight } from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";
import Loader from "../components/common/Loader";

export const Onboarding = () => {
  const { mode, setMode, completeOnboarding, updatePreferences } = usePreferences();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPurpose, setSelectedPurpose] = useState<"baby" | "community" | null>(
    mode
  );
  const [babyName, setBabyName] = useState("");
  const [babyStage, setBabyStage] = useState("newborn");
  const [firstTimeMom, setFirstTimeMom] = useState<"yes" | "no" | null>(null);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleNextFromPurpose = () => {
    if (!selectedPurpose) return;
    setMode(selectedPurpose);
    if (selectedPurpose === "baby") {
      setStep(2);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save baby-related preferences for later use in profile/trackers
      updatePreferences({
        babyName: babyName || undefined,
        babyStage,
        firstTimeMom: firstTimeMom || undefined,
        focusAreas,
      });
      completeOnboarding();
      navigate("/", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return <Loader fullScreen label="Setting up your experience..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex items-center justify-center px-4 pb-20">
      <Card className="w-full max-w-xl shadow-lg border border-border/60 bg-card/95 animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome to Hello Mom</CardTitle>
          <CardDescription>
            Let&apos;s personalize your experience in just a few steps.
          </CardDescription>
        </CardHeader>
        <CardContent key={step} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                How do you plan to use Hello Mom?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`border rounded-lg p-4 text-left flex flex-col gap-2 hover:border-primary transition ${
                    selectedPurpose === "baby"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  onClick={() => setSelectedPurpose("baby")}
                >
                  <Baby className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">For my baby</p>
                    <p className="text-xs text-muted-foreground">
                      Track feeding, sleep, growth and get baby-specific insights.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  className={`border rounded-lg p-4 text-left flex flex-col gap-2 hover:border-primary transition ${
                    selectedPurpose === "community"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                  onClick={() => setSelectedPurpose("community")}
                >
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Community & basics</p>
                    <p className="text-xs text-muted-foreground">
                      Join the community and use basic wellness trackers.
                    </p>
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step 1 of 2</span>
                <span>You can change this later from your profile</span>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleNextFromPurpose}
                  disabled={!selectedPurpose}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Tell us a bit about your baby so we can highlight the most relevant
                tools. You can change this later from your profile.
              </p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium" htmlFor="babyName">
                    Baby&apos;s name (optional)
                  </label>
                  <input
                    id="babyName"
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    placeholder="e.g., Aanya"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium" htmlFor="babyStage">
                    Baby stage
                  </label>
                  <select
                    id="babyStage"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={babyStage}
                    onChange={(e) => setBabyStage(e.target.value)}
                  >
                    <option value="newborn">0-3 months</option>
                    <option value="infant">3-12 months</option>
                    <option value="toddler">1-3 years</option>
                    <option value="pregnant">I&apos;m currently pregnant</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium">Is this your first baby?</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={firstTimeMom === "yes" ? "default" : "outline"}
                      onClick={() => setFirstTimeMom("yes")}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={firstTimeMom === "no" ? "default" : "outline"}
                      onClick={() => setFirstTimeMom("no")}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    What would you like to focus on right now?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Feeding", "Sleep", "Growth", "Mental health", "Community support"].map(
                      (area) => {
                        const selected = focusAreas.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() =>
                              setFocusAreas((prev) =>
                                selected
                                  ? prev.filter((a) => a !== area)
                                  : [...prev, area]
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs border transition ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary"
                            }`}
                          >
                            {area}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button onClick={handleFinish}>
                  Finish setup
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-right">
                Step 2 of 2
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


