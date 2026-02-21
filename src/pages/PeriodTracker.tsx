import { useState, useEffect, useRef } from "react";
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
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { getISODateString } from "../lib/utils/dateUtils";
import { Badge } from "../components/ui/badge";

const CYCLE_COLORS = {
  primary: '#ec4899',
  period: '#ec4899',
  spotting: '#e7a4c9ff',
  fertile: '#604eb8ff',
  ovulation: '#10b981',
  predicted: '#e7a4c9ff',
  logged: '#ec4899',
  normal: '#0f172a',
  muted: '#64748b',
  border: '#f1f5f9',
  bg: '#ffffff',
  bgMuted: '#f8fafc',
  disabled: '#4d4e50',
  text: '#334155',
  textMuted: '#94a3b8',
  white: '#ffffff',
};

// Daily Log Form removed as it is now a separate screen

const FLOW_INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light', color: '#60a5fa' },
  { value: 'medium', label: 'Medium', color: CYCLE_COLORS.period },
  { value: 'heavy', label: 'Heavy', color: '#ef4444' },
  { value: 'very_heavy', label: 'Very Heavy', color: '#991b1b' },
];

const MOOD_OPTIONS = [
  { value: 'happy', label: '😊 Happy', color: CYCLE_COLORS.ovulation },
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

const formatDate = (date: Date) => getISODateString(date);
const parseDate = (dateString: string): Date => new Date(dateString + "T00:00:00");

export const PeriodTracker = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<CycleDayLog[]>([]);
  const [predictions, setPredictions] = useState<CyclePrediction[]>([]);
  const [settings, setSettings] = useState<UserCycleSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const isFirstLoad = useRef(true);
  const slideAnim = useSharedValue(0);
  const calendarOpacity = useSharedValue(1);

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
    opacity: calendarOpacity.value,
  }));

  // Helper called on JS thread - Date objects cannot cross into the UI runtime
  const setMonthByValues = (y: number, m: number) => {
    setCurrentDate(new Date(y, m, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const slideOut = direction === 'next' ? -350 : 350;
    const slideIn = direction === 'next' ? 350 : -350;
    // Extract primitives BEFORE entering the Reanimated worklet
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const newYear = direction === 'next' ? (m === 11 ? y + 1 : y) : (m === 0 ? y - 1 : y);
    const newMonth = direction === 'next' ? (m + 1) % 12 : (m + 11) % 12;
    slideAnim.value = withTiming(slideOut, { duration: 200 }, () => {
      runOnJS(setMonthByValues)(newYear, newMonth);
      slideAnim.value = slideIn;
      slideAnim.value = withTiming(0, { duration: 200 });
    });
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      loadLogs(currentDate, true);
    } else {
      loadLogs(currentDate, false);
    }
  }, [currentDate]);

  useEffect(() => {
    // Load metadata on initial mount
    loadMetadata();
  }, []);

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
      const predictionsWithNormalizedDates = (predictionsData || []).map((p: any) => ({
        ...p,
        estimatedDate: p.estimatedDate ? p.estimatedDate.split('T')[0] : '',
        estimatedEndDate: p.estimatedEndDate ? p.estimatedEndDate.split('T')[0] : undefined,
      }));
      setPredictions(predictionsWithNormalizedDates);
      setSettings(settingsData);
    } catch (e) {
      console.error("Failed to load cycle metadata", e);
    }
  };

  const loadLogs = async (date: Date = currentDate, isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      else setIsCalendarLoading(true);
      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth() + 1;

      const logsData = await cycleAPI.getRecentLogs(undefined, targetYear, targetMonth);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to load period logs", error);
      showToast("Failed to load cycle data", "error");
    } finally {
      setIsLoading(false);
      setIsCalendarLoading(false);
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
    const showPredictions = settings?.showPredictions ?? true;
    const showFertilityInfo = settings?.showFertilityInfo ?? true;

    if (showPredictions) {
      const pred = predictions.find(p => p.estimatedDate === dateStr);
      if (pred?.predictionType === 'next_period') return "predicted";
      if (pred?.predictionType === 'ovulation') return "ovulation";

      if (showFertilityInfo) {
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

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Period Tracker"
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={CYCLE_COLORS.primary} size="large" />
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
                  <Pressable onPress={() => navigateMonth('prev')} hitSlop={20}>
                    <ChevronLeft size={24} color="#0f172a" />
                  </Pressable>
                  <Pressable onPress={() => navigateMonth('next')} hitSlop={20}>
                    <ChevronRight size={24} color="#0f172a" />
                  </Pressable>
                </View>
              </CardHeader>
              <CardContent style={[styles.calendarContent, { overflow: 'hidden' }]}>
                <Animated.View style={calendarAnimatedStyle}>
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
                            const today = new Date().toISOString().split("T")[0];
                            if (dateStr > today) {
                              showToast("Cannot log health data for a future date", "error");
                              return;
                            }
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
                                      hasLog ? styles.dayCircleLogged : null,
                            (dateStr > formatDate(new Date()) && status === "normal" && !hasLog) && styles.dayCircleDisabled
                          ]}>
                            <Text style={[
                              styles.dayText,
                              status === "period" ? styles.dayTextPeriod :
                                status === "fertile" ? styles.dayTextFertile :
                                  status === "ovulation" ? styles.dayTextOvulation :
                                    status === "predicted" ? styles.dayTextPredicted :
                                      hasLog ? styles.dayTextLogged :
                                        styles.dayTextNormal,
                              (dateStr > formatDate(new Date()) && status === "normal" && !hasLog) && styles.dayTextDisabled
                            ]}>{day}</Text>
                            {(status === "fertile" || status === "ovulation") && (
                              <View style={[
                                styles.fertileIndicator,
                                status === "ovulation" && styles.ovulationIndicator
                              ]} />
                            )}
                          </View>
                        </Pressable>
                      );
                    })
                    }

                  </View>
                </Animated.View>

                {isCalendarLoading && (
                  <View style={styles.calendarOverlay}>
                    <ActivityIndicator color={CYCLE_COLORS.primary} />
                  </View>
                )}

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CYCLE_COLORS.period }]} />
                    <Text style={styles.legendText}>Period</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CYCLE_COLORS.spotting }]} />
                    <Text style={styles.legendText}>Spotting</Text>
                  </View>
                  {(settings?.showPredictions ?? true) && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: CYCLE_COLORS.period,
                        borderRadius: 5
                      }]} />
                      <Text style={styles.legendText}>Predicted</Text>
                    </View>
                  )}
                  {(settings?.showFertilityInfo ?? true) && (
                    <>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, {
                          backgroundColor: CYCLE_COLORS.fertile,
                          borderRadius: 5
                        }]} />
                        <Text style={styles.legendText}>Fertile</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: CYCLE_COLORS.ovulation, borderRadius: 5 }]} />
                        <Text style={styles.legendText}>Ovulation</Text>
                      </View>
                    </>
                  )}
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Predictions Section */}
          {(settings?.showPredictions ?? true) && (
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
                          pred.predictionType === 'next_period' ? CYCLE_COLORS.period :
                            pred.predictionType === 'ovulation' ? CYCLE_COLORS.ovulation : CYCLE_COLORS.fertile
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
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

        </ScrollView>
      )
      }

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          const today = new Date().toISOString().split("T")[0];
          navigation.navigate('DailyLog', { date: today });
        }}
        style={({ pressed }) => [{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: CYCLE_COLORS.primary,
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
    </PageContainer >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CYCLE_COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: CYCLE_COLORS.muted,
    fontSize: 14,
  },
  addIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: CYCLE_COLORS.white,
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
    borderColor: CYCLE_COLORS.border,
  },
  statsCardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statsLabel: {
    fontSize: 12,
    color: CYCLE_COLORS.muted,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CYCLE_COLORS.normal,
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
    color: CYCLE_COLORS.normal,
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 16,
  },
  calendarContent: {
    paddingBottom: 16,
    position: 'relative',
  },
  calendarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: CYCLE_COLORS.textMuted,
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
    backgroundColor: CYCLE_COLORS.period,
    borderRadius: 20
  },
  dayCircleSpotting: {
    backgroundColor: CYCLE_COLORS.spotting,
    borderRadius: 20
  },
  dayCircleFertile: {
    backgroundColor: CYCLE_COLORS.fertile,
    borderRadius: 20
  },
  dayCircleOvulation: {
    backgroundColor: CYCLE_COLORS.ovulation,
    borderRadius: 20
  },
  dayCirclePredicted: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: CYCLE_COLORS.period,
    borderRadius: 20
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextPeriod: {
    color: CYCLE_COLORS.white,
    fontWeight: 'bold',
  },
  dayTextFertile: {
    color: '#eeecf0',
    fontWeight: '500',
  },
  dayTextOvulation: {
    color: CYCLE_COLORS.white,
    fontWeight: 'bold',
  },
  dayTextPredicted: {
    color: CYCLE_COLORS.period,
    fontWeight: '700',
  },
  dayTextNormal: {
    color: CYCLE_COLORS.text,
  },
  dayCircleDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    opacity: 0.3,
  },
  dayTextDisabled: {
    color: CYCLE_COLORS.disabled,
    fontWeight: 'normal',
  },
  fertileIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: CYCLE_COLORS.fertile,
    marginTop: 1,
    position: 'absolute',
    bottom: 4,
  },
  ovulationIndicator: {
    backgroundColor: CYCLE_COLORS.white,
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
    color: CYCLE_COLORS.muted,
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
    backgroundColor: CYCLE_COLORS.bgMuted,
    borderWidth: 0,
  },
  predictionCardContent: {
    padding: 12,
    paddingTop: 12
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dayCircleLogged: {
    borderWidth: 1.5,
    borderColor: CYCLE_COLORS.logged,
    backgroundColor: CYCLE_COLORS.white,
  },
  dayTextLogged: {
    color: CYCLE_COLORS.logged,
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
    backgroundColor: CYCLE_COLORS.white,
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
    color: CYCLE_COLORS.normal,
  },
  predictionDate: {
    fontSize: 13,
    color: CYCLE_COLORS.muted,
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
    backgroundColor: CYCLE_COLORS.white,
    padding: 8,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: CYCLE_COLORS.muted,
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
    color: CYCLE_COLORS.normal,
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
    color: CYCLE_COLORS.muted,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: CYCLE_COLORS.border,
    borderRadius: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: CYCLE_COLORS.bgMuted,
    borderRadius: 16,
    gap: 12,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: CYCLE_COLORS.textMuted,
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
    height: '90%',
  }
});
