import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, CardContent } from "../components/ui/card";
import {
  Baby,
  Moon,
  Smile,
  Droplets,
  Calendar,
  BabyIcon,
  Utensils,
  Ruler,
  Flame,
  ChevronRight
} from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { usePreferences } from "../context/PreferencesContext";
import { healthAPI } from "../lib/api/health";
import { cycleAPI } from "../lib/api/cycle";
import { babyAPI } from "../lib/api/baby";
import { pregnancyAPI } from '../lib/api/pregnancy';
import { toLocalTime, formatLocalDate, formatRelativeTime } from '../lib/utils/dateUtils';
import { useFocusEffect } from "@react-navigation/native";

interface TrackerCard {
  id: string;
  name: string;
  icon: any;
  description: string;
  path?: string;
  section: "personal" | "baby";
  color: string;
  bg: string;
}

const trackers: TrackerCard[] = [
  {
    id: "cycle",
    name: "Menstrual Cycle",
    icon: Calendar,
    description: "Track period & ovulation",
    path: "PeriodTracker",
    section: "personal",
    color: "#ec4899", // Pink
    bg: "#fdf2f8",
  },
  {
    id: "mood",
    name: "Mood & Mental",
    icon: Smile,
    description: "Daily mood & stress",
    path: "MoodTracker",
    section: "personal",
    color: "#6366f1", // Indigo
    bg: "#eef2ff",
  },
  {
    id: "water",
    name: "Water Intake",
    icon: Droplets,
    description: "Hydration & reminders",
    path: "WaterTracker",
    section: "personal",
    color: "#0ea5e9", // Sky
    bg: "#f0f9ff",
  },
  {
    id: "sleep",
    name: "Sleep Tracker",
    icon: Moon,
    description: "Night sleep & quality",
    path: "SleepTracker",
    section: "personal",
    color: "#8b5cf6", // Violet
    bg: "#f5f3ff",
  },
  {
    id: "weight",
    name: "Weight",
    icon: Flame,
    description: "Pregnancy & postpartum",
    path: "WeightTracker",
    section: "personal",
    color: "#f97316", // Orange
    bg: "#fff7ed",
  },
  {
    id: "pregnancy",
    name: "Pregnancy",
    icon: Baby,
    description: "Week-by-week progress",
    path: "PregnancyTracker",
    section: "baby",
    color: "#f43f5e", // Rose
    bg: "#fff1f2",
  },
  {
    id: "feeding",
    name: "Baby Feeding",
    icon: BabyIcon,
    description: "Breast & formula sessions",
    path: "FeedingTracker",
    section: "baby",
    color: "#f59e0b", // Amber
    bg: "#fffbeb",
  },
  {
    id: "growth",
    name: "Baby Growth",
    icon: Ruler,
    description: "Weight & height logs",
    path: "BabyWeightTracker",
    section: "baby",
    color: "#14b8a6", // Teal
    bg: "#f0fdfa",
  },
  {
    id: "meal",
    name: "Baby Meal",
    icon: Utensils,
    description: "Solids intake (6m+)",
    section: "baby",
    color: "#10b981", // Emerald
    bg: "#ecfdf5",
  },
];

export const Trackers = () => {
  const { mode } = usePreferences();
  const navigation = useNavigation<any>();
  const [data, setData] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const todayString = new Date().toISOString().split('T')[0];

      const [
        sleepHistory,
        waterHistory,
        moodHistory,
        weightHistory,
        cyclePredictions,
        recentCycleLogs,
        feedingHistory,
        pregnancyHistory
      ] = await Promise.all([
        healthAPI.getSleepHistory(),
        healthAPI.getWaterHistory(),
        healthAPI.getMoodHistory(),
        healthAPI.getWeightHistory().catch(() => []),
        cycleAPI.getPredictions().catch(() => []),
        cycleAPI.getRecentLogs(7).catch(() => []),
        babyAPI.getFeedingHistory().catch(() => ({ content: [] })),
        pregnancyAPI.getProgressHistory().catch(() => []),
      ]);

      const newData: Record<string, string> = {};

      // Format Sleep
      if (sleepHistory.length > 0) {
        const last = sleepHistory[0];
        const start = toLocalTime(last.startTime);
        const end = toLocalTime(last.endTime);
        const diffMins = Math.floor((end.getTime() - start.getTime()) / 60000);
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        newData.sleep = `${h}h ${m}m last night`;
      }

      // Format Water
      const todayWater = waterHistory.find(w => w.date === todayString);
      if (todayWater && todayWater.totalMl > 0) {
        newData.water = `${(todayWater.totalMl / 1000).toFixed(1)}L today`;
      }

      // Format Mood
      const lastMood = moodHistory.find(m => m.date === todayString) || moodHistory[0];
      if (lastMood) {
        newData.mood = `Feeling ${lastMood.mood}`;
      }

      // Format Weight
      if (weightHistory.length > 0) {
        const latestWeight = weightHistory[0];
        let weightStr = `${latestWeight.weightKg}kg`;
        if (latestWeight.targetWeightKg) {
          const diff = latestWeight.targetWeightKg - latestWeight.weightKg;
          weightStr += ` (${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg to goal)`;
        }
        newData.weight = weightStr;
      }

      // Format Cycle
      if (cyclePredictions.length > 0) {
        const next = cyclePredictions.find(p => p.predictionType === 'next_period');
        if (next) {
          const daysTo = Math.ceil((toLocalTime(next.estimatedDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          newData.cycle = daysTo > 0 ? `Period in ${daysTo} days` : 'Period expected today';
        }
      } else if (recentCycleLogs.length > 0) {
        const last = recentCycleLogs[0];
        newData.cycle = `Last log: ${formatLocalDate(last.logDate, { month: 'short', day: 'numeric' })}`;
      }

      // Format Feeding
      if (feedingHistory && feedingHistory.content && feedingHistory.content.length > 0) {
        const last = feedingHistory.content[0];
        newData.feeding = formatRelativeTime(last.feedingTime);
      }

      // Format Pregnancy
      if (pregnancyHistory.length > 0) {
        const last = pregnancyHistory[0];
        newData.pregnancy = `Week ${last.weekNumber}`;
      }

      setData(newData);
    } catch (e) {
      console.error("Failed to fetch trackers data", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const personalTrackers = trackers.filter(t => t.section === "personal");
  const babyTrackers = trackers.filter(t => t.section === "baby");

  const onTrackerOpen = (tracker: TrackerCard) => {
    if (tracker.path) {
      navigation.navigate(tracker.path);
    } else {
      navigation.navigate("ComingSoon", { trackerName: tracker.name });
    }
  };

  const renderTrackerItem = (tracker: TrackerCard) => {
    const Icon = tracker.icon;
    const lastEntry = data[tracker.id];

    return (
      <Pressable
        key={tracker.id}
        onPress={() => onTrackerOpen(tracker)}
        style={({ pressed }) => [
          styles.trackerCard,
          { borderColor: tracker.color + '20', backgroundColor: '#fff' },
          pressed && { backgroundColor: tracker.bg }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: tracker.bg }]}>
          <Icon size={24} color={tracker.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.trackerName}>{tracker.name}</Text>
          <Text style={styles.trackerDescription} numberOfLines={1}>
            {tracker.description}
          </Text>
        </View>

        <View style={styles.entrySection}>
          {lastEntry ? (
            <View style={[styles.lastEntryBadge, { backgroundColor: tracker.color + '15' }]}>
              <Text style={[styles.lastEntryText, { color: tracker.color }]}>
                {lastEntry}
              </Text>
            </View>
          ) : (
            <ChevronRight size={18} color="#cbd5e1" />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Trackers" showBackButton={false} showMenuButton={true} />
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.trackersList}>
          {personalTrackers.map(renderTrackerItem)}

          {mode === "baby" && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Baby's Health</Text>
              {babyTrackers.map(renderTrackerItem)}
            </>
          )}
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 24,
  },
  trackersList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 4,
  },
  trackerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  trackerName: {
    fontWeight: '900',
    fontSize: 17,
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  trackerDescription: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  entrySection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  lastEntryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lastEntryText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
