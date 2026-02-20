import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plus, ChevronLeft, ChevronRight, Calendar, TrendingUp, AlertCircle, Settings } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { useToast } from "../context/ToastContext";
import {
  CycleDayLog,
  CyclePrediction,
  UserCycleSettings,
} from "../types";
import {
  cycleAPI,
} from "../lib/api/cycle";

import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

// Daily Log Form removed as it is now a separate screen

const FLOW_INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light', color: '#60a5fa' },
  { value: 'medium', label: 'Medium', color: '#ec4899' },
  { value: 'heavy', label: 'Heavy', color: '#ef4444' },
  { value: 'very_heavy', label: 'Very Heavy', color: '#991b1b' },
];

const MOOD_OPTIONS = [
  { value: 'happy', label: '😊 Happy', color: '#10b981' },
  { value: 'neutral', label: '😐 Neutral', color: '#6b7280' },
  { value: 'sad', label: '😢 Sad', color: '#3b82f6' },
  { value: 'irritable', label: '😠 Irritable', color: '#f59e0b' },
  { value: 'anxious', label: '😰 Anxious', color: '#8b5cf6' },
];

const SYMPTOM_OPTIONS = [
  "Cramps", "Bloating", "Headache", "Mood swings", "Fatigue", "Back pain",
  "Breast tenderness", "Acne", "Nausea", "Food cravings", "Insomnia", "Dizziness",
  "Constipation", "Diarrhea", "Tender breasts", "Joint pain", "Low energy",
  "Hot flashes", "Night sweats", "Bloating", "Gas", "Tender abdomen", "Leg cramps"
];

const FERTILITY_SIGNS = [
  "Increased cervical mucus", "Basal body temperature rise", "Ovulation pain",
  "Breast tenderness", "Increased libido", "Light spotting", "Heightened senses"
];

const HEALTH_METRICS = [
  "Weight gain", "Weight loss", "Skin breakouts", "Hair changes", "Nail changes",
  "Sleep disturbances", "Appetite changes", "Energy levels", "Stress levels"
];

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  return { daysInMonth, startingDayOfWeek, year, month };
};

const formatDate = (date: Date): string => date.toISOString().split("T")[0];
const parseDate = (dateString: string): Date => new Date(dateString + "T00:00:00");

export const PeriodTracker = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<CycleDayLog[]>([]);
  const [predictions, setPredictions] = useState<CyclePrediction[]>([]);
  const [settings, setSettings] = useState<UserCycleSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    loadLogs(currentDate);
  }, [currentDate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMetadata();
      loadLogs(currentDate);
    });
    return unsubscribe;
  }, [navigation, currentDate]);

  const loadMetadata = async () => {
    try {
      const [predictionsData, settingsData] = await Promise.all([
        cycleAPI.getPredictions().catch(() => []),
        cycleAPI.getSettings().catch(() => null)
      ]);
      setPredictions(predictionsData || []);
      setSettings(settingsData);
    } catch (e) {
      console.error("Failed to load cycle metadata", e);
    }
  };

  const loadLogs = async (date: Date = currentDate) => {
    try {
      setIsLoading(true);
      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth() + 1;

      const logsData = await cycleAPI.getRecentLogs(undefined, targetYear, targetMonth);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to load period logs", error);
      showToast("Failed to load cycle data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(new Date(year, month, day));

    // Check if it's a period day (has flow level)
    const log = logs.find(l => l.logDate === dateStr);
    if (log?.flowLevel && log.flowLevel !== 'spotting') return "period";
    if (log?.flowLevel === 'spotting') return "spotting";

    // Check for predictions
    if (settings?.showPredictions) {
      const pred = predictions.find(p => p.estimatedDate === dateStr);
      if (pred?.predictionType === 'next_period') return "predicted";
      if (pred?.predictionType === 'ovulation') return "ovulation";

      if (settings.showFertilityInfo) {
        if (pred?.predictionType === 'fertile_window') return "fertile";
        // Check if date falls within any fertile window prediction range
        const withinFertile = predictions.some(p =>
          p.predictionType === 'fertile_window' &&
          p.estimatedEndDate &&
          dateStr >= p.estimatedDate &&
          dateStr <= p.estimatedEndDate
        );
        if (withinFertile) return "fertile";
      }
    }

    return "normal";
  };

  const handleDeleteLog = async (date: string) => {
    Alert.alert("Delete Log", "Permanently delete health data for this date?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await cycleAPI.deleteDailyLog(date);
            showToast("Log deleted", "success");
            loadLogs(currentDate);
          } catch (error) {
            showToast("Failed to delete log", "error");
          }
        }
      }
    ]);
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Period Tracker"
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ec4899" size="large" />
          <Text style={styles.loadingText}>Privacy-First Tracking...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <View style={styles.statsRow}>
            <Card style={styles.statsCard}>
              <CardContent style={styles.statsCardContent}>
                <Text style={styles.statsLabel}>Cycle Length</Text>
                <Text style={styles.statsValue}>{settings?.typicalCycleLength || '--'}d</Text>
              </CardContent>
            </Card>
            <Card style={styles.statsCard}>
              <CardContent style={styles.statsCardContent}>
                <Text style={styles.statsLabel}>Period Length</Text>
                <Text style={styles.statsValue}>{settings?.typicalPeriodLength || '--'}d</Text>
              </CardContent>
            </Card>
          </View>

          <Animated.View entering={FadeIn.duration(600)} style={styles.calendarContainer}>
            <Card>
              <CardHeader style={styles.calendarHeader}>
                <Text style={styles.calendarMonthTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <View style={styles.calendarNav}>
                  <Pressable onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
                    <ChevronLeft size={20} color="#0f172a" />
                  </Pressable>
                  <Pressable onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
                    <ChevronRight size={20} color="#0f172a" />
                  </Pressable>
                </View>
              </CardHeader>
              <CardContent style={styles.calendarContent}>
                <View style={styles.weekLabels}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <Text key={d} style={styles.weekLabelText}>{d}</Text>
                  ))}
                </View>
                <View style={styles.daysGrid}>
                  {Array(startingDayOfWeek).fill(null).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.emptyDay} />
                  ))}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const status = getDayStatus(day);
                    const dateStr = formatDate(new Date(year, month, day));
                    const hasLog = logs.some(l => l.logDate === dateStr);

                    return (
                      <Pressable
                        key={day}
                        style={styles.dayWrapper}
                        onPress={() => {
                          navigation.navigate('DailyLog', { date: dateStr, initialLog: logs.find(l => l.logDate === dateStr) });
                        }}
                      >
                        <View style={[
                          styles.dayCircle,
                          status === "period" ? styles.dayCirclePeriod :
                            status === "spotting" ? styles.dayCircleSpotting :
                              status === "fertile" ? styles.dayCircleFertile :
                                status === "predicted" ? styles.dayCirclePredicted :
                                  status === "ovulation" ? styles.dayCircleOvulation :
                                    hasLog ? styles.dayCircleLogged : null
                        ]}>
                          <Text style={[
                            styles.dayText,
                            status === "period" ? styles.dayTextPeriod :
                              status === "fertile" ? styles.dayTextFertile :
                                status === "ovulation" ? styles.dayTextOvulation :
                                  hasLog ? styles.dayTextLogged :
                                    styles.dayTextNormal
                          ]}>{day}</Text>
                        </View>
                      </Pressable>
                    );
                  })
                  }
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#fff", borderWidth: 1, borderColor: '#ec4899' }]} />
                    <Text style={styles.legendText}>Daily Log</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#ec4899" }]} />
                    <Text style={styles.legendText}>Period</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#fbcfe8" }]} />
                    <Text style={styles.legendText}>Spotting</Text>
                  </View>
                  {settings?.showPredictions && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#fce7f3", borderStyle: 'dashed', borderWidth: 1, borderColor: '#ec4899' }]} />
                      <Text style={styles.legendText}>Predicted</Text>
                    </View>
                  )}
                  {settings?.showFertilityInfo && (
                    <>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]} />
                        <Text style={styles.legendText}>Fertile</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
                        <Text style={styles.legendText}>Ovulation</Text>
                      </View>
                    </>
                  )}
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Predictions Section */}
          {settings?.showPredictions && (
            <View style={styles.predictionSection}>
              <Text style={styles.sectionTitle}>Predictions</Text>
              {predictions.length === 0 ? (
                <View style={styles.emptyPredictions}>
                  <TrendingUp size={48} color="#cbd5e1" style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>Predictions will appear automatically as you track your cycles.</Text>
                </View>
              ) : predictions.map((pred) => (
                <Card key={pred.id} style={styles.predictionCard}>
                  <CardContent style={styles.predictionCardContent}>
                    <View style={styles.predictionHeader}>
                      <View style={styles.predictionIcon}>
                        <Calendar size={20} color={
                          pred.predictionType === 'next_period' ? "#ec4899" :
                            pred.predictionType === 'ovulation' ? "#10b981" : "#8b5cf6"
                        } />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.predictionType}>
                          {pred.predictionType === 'next_period' ? 'Next Period' :
                            pred.predictionType === 'ovulation' ? 'Ovulation Day' : 'Fertile Window'}
                        </Text>
                        <Text style={styles.predictionDate}>
                          {new Date(pred.estimatedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                          {pred.estimatedEndDate && ` - ${new Date(pred.estimatedEndDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`}
                        </Text>
                      </View>
                      <View style={[styles.confidenceBadge, { backgroundColor: pred.confidenceLevel === 'high' ? '#dcfce7' : pred.confidenceLevel === 'medium' ? '#fef9c3' : '#fee2e2' }]}>
                        <Text style={[styles.confidenceText, { color: pred.confidenceLevel === 'high' ? '#166534' : pred.confidenceLevel === 'medium' ? '#854d0e' : '#991b1b' }]}>
                          {pred.confidenceLevel.toUpperCase()} CONFIDENCE
                        </Text>
                      </View>
                    </View>
                    <View style={styles.disclaimerContainer}>
                      <AlertCircle size={14} color="#64748b" />
                      <Text style={styles.disclaimerText}>{pred.medicalDisclaimer}</Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

        </ScrollView>
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation.navigate('DailyLog', { date: formatDate(new Date()) })}
        style={({ pressed }) => [{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#ec4899',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          opacity: pressed ? 0.9 : 1
        }]}
      >
        <Plus size={28} color="white" />
      </Pressable>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14,
  },
  addIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statsCardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statsLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 16,
  },
  calendarContent: {
    paddingBottom: 16,
  },
  weekLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCirclePeriod: {
    backgroundColor: '#ec4899',
  },
  dayCircleSpotting: {
    backgroundColor: '#fbcfe8',
  },
  dayCircleFertile: {
    backgroundColor: '#8b5cf6',
  },
  dayCircleOvulation: {
    backgroundColor: '#10b981',
  },
  dayCirclePredicted: {
    backgroundColor: '#fce7f3',
    borderWidth: 1,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextPeriod: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayTextFertile: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayTextOvulation: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dayTextNormal: {
    color: '#334155',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  predictionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 8,
  },
  predictionCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 0,
  },
  predictionCardContent: {
    padding: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dayCircleLogged: {
    borderWidth: 1.5,
    borderColor: '#ec4899',
    backgroundColor: '#fff',
  },
  dayTextLogged: {
    color: '#ec4899',
    fontWeight: '700',
  },
  emptyPredictions: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    gap: 12,
  },
  predictionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  predictionType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  predictionDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '800',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    fontStyle: 'italic',
  },
  historyList: {
    gap: 12,
    marginBottom: 40,
  },
  historyItem: {
    borderRadius: 16,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    gap: 12,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
    height: '90%',
  }
});
