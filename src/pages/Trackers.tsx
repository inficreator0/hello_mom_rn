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

interface TrackerCard {
  id: string;
  name: string;
  icon: any;
  description: string;
  lastEntry?: string;
  path?: string;
  section: "personal" | "baby";
}

const trackers: TrackerCard[] = [
  {
    id: "cycle",
    name: "Menstrual Cycle",
    icon: Calendar,
    description: "Track period, ovulation & PMS",
    lastEntry: "Last period: Jan 10",
    path: "PeriodTracker",
    section: "personal",
  },
  {
    id: "mood",
    name: "Mood & Mental Health",
    icon: Smile,
    description: "Daily mood, anxiety & stress",
    lastEntry: "Today: Calm",
    section: "personal",
  },
  {
    id: "water",
    name: "Water Intake",
    icon: Droplets,
    description: "Daily hydration & reminders",
    lastEntry: "6 glasses today",
    section: "personal",
  },
  {
    id: "sleep",
    name: "Sleep Tracker",
    icon: Moon,
    description: "Track night sleep & interruptions",
    lastEntry: "Last night: 6h 15m",
    section: "personal",
  },
  {
    id: "weight",
    name: "Weight",
    icon: Flame,
    description: "Track pregnancy & postpartum",
    lastEntry: "62.4 kg",
    section: "personal",
  },
  {
    id: "pregnancy",
    name: "Pregnancy Progress",
    icon: Baby,
    description: "Week-by-week changes",
    lastEntry: "Week 22 • Size: Papaya",
    section: "baby",
  },
  {
    id: "feeding",
    name: "Baby Feeding",
    icon: BabyIcon,
    description: "Breastfeeding & formula sessions",
    lastEntry: "Last feed: 1h ago",
    section: "baby",
  },
  {
    id: "growth",
    name: "Baby Growth",
    icon: Ruler,
    description: "Weight, height & head size",
    lastEntry: "Updated 3 days ago",
    path: "BabyWeightTracker",
    section: "baby",
  },
  {
    id: "meal",
    name: "Baby Meal / Solids",
    icon: Utensils,
    description: "Track solids intake (6m+)",
    lastEntry: "Breakfast logged",
    section: "baby",
  },
];

export const Trackers = () => {
  const { mode } = usePreferences();
  const navigation = useNavigation<any>();

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
              <Icon size={22} color="#ec4899" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.trackerName}>{tracker.name}</Text>
              <Text style={styles.trackerDescription} numberOfLines={1}>
                {tracker.description}
              </Text>
              {tracker.lastEntry && (
                <View style={styles.lastEntryBadge}>
                  <Text style={styles.lastEntryText}>
                    {tracker.lastEntry}
                  </Text>
                </View>
              )}
            </View>

            <ChevronRight size={18} color="#94a3b8" />
          </CardContent>
        </Pressable>
      </Card>
    );
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Trackers" showBackButton={false} />
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
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  trackerCard: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  cardPressable: {
    width: '100%',
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: '#f8fafc',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackerName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0f172a',
  },
  trackerDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  lastEntryBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  lastEntryText: {
    fontSize: 11,
    color: '#ec4899',
    fontWeight: '600',
  },
});
