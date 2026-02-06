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
} from "lucide-react-native";
import { usePreferences } from "../context/PreferencesContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface TrackerCard {
  id: string;
  name: string;
  icon: any;
  description: string;
  lastEntry?: string;
  path?: string;
}

const trackers: TrackerCard[] = [
  {
    id: "cycle",
    name: "Menstrual Cycle",
    icon: Calendar,
    description: "Track period, ovulation & PMS symptoms",
    lastEntry: "Last period: Jan 10",
    path: "PeriodTracker",
  },
  {
    id: "pregnancy",
    name: "Pregnancy Progress",
    icon: Baby,
    description: "Track week-by-week pregnancy changes",
    lastEntry: "Week 22 • Baby size: Papaya",
  },
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
    path: "BabyWeightTracker",
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
  const navigation = useNavigation<any>();

  const onTrackerOpen = (tracker: TrackerCard) => {
    if (tracker.path) {
      navigation.navigate(tracker.path);
    } else {
      navigation.navigate("ComingSoon", { trackerName: tracker.name });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Trackers</Text>
          <Text style={styles.subtitle}>
            {mode === "baby"
              ? "Track your pregnancy, recovery, and your baby's daily routine."
              : "Track your own health, mood, and recovery."}
          </Text>
        </View>

        <View style={styles.trackersList}>
          {trackers
            .filter((tracker) =>
              mode === "baby"
                ? true
                : !["feeding", "growth", "meal", "pregnancy"].includes(tracker.id)
            )
            .map((tracker) => {
              const Icon = tracker.icon;
              return (
                <Card key={tracker.id} style={styles.trackerCard}>
                  <Pressable
                    onPress={() => onTrackerOpen(tracker)}
                    style={({ pressed }) => [
                      styles.cardPressable,
                      pressed && styles.cardPressed
                    ]}
                  >
                    <CardContent style={styles.cardContent}>
                      <View style={styles.iconContainer}>
                        <Icon size={24} color="#ec4899" />
                      </View>

                      <View style={styles.textContainer}>
                        <Text style={styles.trackerName}>{tracker.name}</Text>
                        <Text style={styles.trackerDescription}>
                          {tracker.description}
                        </Text>
                        {tracker.lastEntry && (
                          <Text style={styles.lastEntry}>
                            {tracker.lastEntry}
                          </Text>
                        )}
                      </View>
                    </CardContent>
                  </Pressable>
                </Card>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a', // foreground
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
    marginBottom: 8,
  },
  trackersList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 40,
  },
  trackerCard: {
    overflow: 'hidden',
  },
  cardPressable: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
  },
  textContainer: {
    flex: 1,
  },
  trackerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f172a',
  },
  trackerDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  lastEntry: {
    fontSize: 10,
    color: '#ec4899', // primary
    fontWeight: 'bold',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
