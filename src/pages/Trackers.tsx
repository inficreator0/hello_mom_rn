import React from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Heart,
  Flame,
  Baby,
  Moon,
  Smile,
  Droplets,
  Activity,
  Calendar,
  Timer,
  BabyIcon,
  Utensils,
  Ruler,
  NotebookPen,
} from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";
import { useNavigate } from "react-router-dom";

interface TrackerCard {
  id: string;
  name: string;
  icon: any;
  description: string;
  lastEntry?: string;
}

const trackers: TrackerCard[] = [
  {
    id: "cycle",
    name: "Menstrual Cycle",
    icon: Calendar,
    description: "Track period, ovulation & PMS symptoms",
    lastEntry: "Last period: Jan 10",
  },
  {
    id: "pregnancy",
    name: "Pregnancy Progress",
    icon: Baby,
    description: "Track week-by-week pregnancy changes",
    lastEntry: "Week 22 • Baby size: Papaya",
  },
  // {
  //   id: "kick-counter",
  //   name: "Kick Counter",
  //   icon: Activity,
  //   description: "Monitor baby’s daily movement patterns",
  //   lastEntry: "Last session: 32 kicks",
  // },
  // {
  //   id: "contraction",
  //   name: "Contraction Timer",
  //   icon: Timer,
  //   description: "Measure interval & duration during labor",
  //   lastEntry: "No recent contractions",
  // },
  {
    id: "mood",
    name: "Mood & Mental Health",
    icon: Smile,
    description: "Daily mood, anxiety & stress tracking",
    lastEntry: "Today: Calm",
  },
  {
    id: "water",
    name: "Water Intake",
    icon: Droplets,
    description: "Daily hydration and drinking reminders",
    lastEntry: "6 glasses today",
  },
  {
    id: "sleep",
    name: "Sleep Tracker",
    icon: Moon,
    description: "Track night sleep, naps & interruptions",
    lastEntry: "Last night: 6h 15m",
  },
  {
    id: "weight",
    name: "Weight",
    icon: Flame,
    description: "Track pregnancy & postpartum weight",
    lastEntry: "62.4 kg",
  },
  // {
  //   id: "symptoms",
  //   name: "Symptoms",
  //   icon: NotebookPen,
  //   description: "Log nausea, fatigue, cramps & more",
  //   lastEntry: "2 symptoms today",
  // },

  // Baby trackers
  {
    id: "feeding",
    name: "Baby Feeding",
    icon: BabyIcon,
    description: "Track breastfeeding & formula sessions",
    lastEntry: "Last feed: 1h ago",
  },
  {
    id: "growth",
    name: "Baby Growth",
    icon: Ruler,
    description: "Track weight, height & head size",
    lastEntry: "Updated 3 days ago",
  },
  {
    id: "meal",
    name: "Baby Meal / Solids",
    icon: Utensils,
    description: "Track solids intake from 6+ months",
    lastEntry: "Breakfast logged",
  },
];

export const Trackers = () => {
  const { mode } = usePreferences();
  const navigate = useNavigate();

  const onTrackerOpen = (trackerId: string) => {
    if (trackerId === "cycle") {
      navigate("/trackers/period");
    } else if (trackerId === "weight" || trackerId === "growth") {
      navigate("/trackers/baby-weight");
    } else {
      // Find the tracker name for the coming soon page
      const tracker = trackers.find((t) => t.id === trackerId);
      navigate("/trackers/coming-soon", {
        state: { trackerName: tracker?.name || "this tracker" },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Health Trackers</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === "baby"
            ? "Track your pregnancy, postpartum recovery, and your baby's daily routine."
            : "Track your own health, mood, and recovery. You can enable baby-focused trackers from your profile anytime."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {trackers
            .filter((tracker) =>
              mode === "baby"
                ? true
                : !["feeding", "growth", "meal"].includes(tracker.id)
            )
            .map((tracker) => (
              <Card
                key={tracker.id}
                className="bg-card shadow-sm rounded-lg cursor-pointer hover:shadow-lg hover:-translate-y-1 transition border border-border/50"
                onClick={() => onTrackerOpen(tracker.id)}
              >
                <CardContent className="flex flex-row items-center gap-4 py-5">
                  {/* Icon */}
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <tracker.icon className="h-6 w-6" />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-medium text-lg">{tracker.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tracker.description}
                    </p>

                    {tracker.lastEntry && (
                      <p className="text-xs mt-2 text-primary font-medium">
                        {tracker.lastEntry}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
