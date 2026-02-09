import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Platform, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Plus, Edit2, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { PeriodEntry, CycleData } from "../types";
import { cycleAPI, MenstrualCycleResponse, CycleAnalytics, FertilityPrediction } from "../lib/api/cycle";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Animated, { FadeInDown, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { Heart, Thermometer, Droplets, Calendar, TrendingUp, AlertCircle } from "lucide-react-native";

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
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycleData, setCycleData] = useState<CycleData>({
    entries: [],
    averageCycleLength: 28,
    averagePeriodLength: 5,
  });
  const [analytics, setAnalytics] = useState<CycleAnalytics | null>(null);
  const [fertilityPrediction, setFertilityPrediction] = useState<FertilityPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PeriodEntry | null>(null);
  const [formData, setFormData] = useState({
    startDate: formatDate(new Date()),
    endDate: "",
    symptoms: [] as string[],
    fertilitySigns: [] as string[],
    healthMetrics: [] as string[],
    notes: "",
    flowIntensity: 'medium' as 'light' | 'medium' | 'heavy' | 'very_heavy',
    mood: 'neutral' as 'happy' | 'sad' | 'irritable' | 'anxious' | 'neutral',
    painLevel: 5,
    ovulationDate: "",
    basalBodyTemp: 98.6,
    cervicalMucus: 'dry' as 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white',
    medications: [] as string[],
    supplements: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cycles, analyticsData, fertilityData] = await Promise.all([
        cycleAPI.getCycleHistory(),
        cycleAPI.getCycleAnalytics().catch(() => null), // Analytics might not be implemented yet
        cycleAPI.getFertilityPrediction().catch(() => null) // Fertility prediction might not be implemented yet
      ]);
      
      // Convert API response to local format
      const entries: PeriodEntry[] = cycles.map((cycle: MenstrualCycleResponse) => ({
        id: cycle.id.toString(),
        startDate: cycle.startDate,
        endDate: cycle.endDate || undefined,
        symptoms: cycle.symptoms || [],
        fertilitySigns: cycle.fertilitySigns || [],
        healthMetrics: cycle.healthMetrics || [],
        notes: cycle.notes || "",
        flowIntensity: cycle.flowIntensity,
        mood: cycle.mood,
        painLevel: cycle.painLevel,
        ovulationDate: cycle.ovulationDate,
        basalBodyTemp: cycle.basalBodyTemp,
        cervicalMucus: cycle.cervicalMucus,
        intercourseDays: cycle.intercourseDays,
        medications: cycle.medications,
        supplements: cycle.supplements,
      }));

      setCycleData(prev => ({ ...prev, entries }));
      if (analyticsData) {
        setAnalytics(analyticsData);
        setCycleData(prev => ({ 
          ...prev, 
          averageCycleLength: analyticsData.averageCycleLength,
          averagePeriodLength: analyticsData.averagePeriodLength 
        }));
      }
      if (fertilityData) {
        setFertilityPrediction(fertilityData);
      }
    } catch (error) {
      console.error("Failed to load period data", error);
      showToast("Failed to load cycle data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async (entry: PeriodEntry, isEdit: boolean) => {
    try {
      const apiData = {
        startDate: entry.startDate,
        endDate: entry.endDate,
        notes: entry.notes,
        flowIntensity: entry.flowIntensity,
        symptoms: entry.symptoms,
        fertilitySigns: entry.fertilitySigns,
        healthMetrics: entry.healthMetrics,
        mood: entry.mood,
        painLevel: entry.painLevel,
        ovulationDate: entry.ovulationDate,
        basalBodyTemp: entry.basalBodyTemp,
        cervicalMucus: entry.cervicalMucus,
        intercourseDays: entry.intercourseDays,
        medications: entry.medications,
        supplements: entry.supplements,
      };

      if (isEdit && editingEntry) {
        // Update existing entry
        await cycleAPI.updateCycle(parseInt(entry.id), apiData);
        showToast("Entry updated", "success");
      } else {
        // Create new entry
        await cycleAPI.logCycle(apiData);
        showToast("Period logged", "success");
      }
      
      // Reload data after save
      await loadData();
    } catch (error) {
      console.error("Failed to save entry", error);
      showToast("Failed to save entry", "error");
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const calculateNextPeriod = (entries: PeriodEntry[]): Date | null => {
    if (!entries.length) return null;
    const sorted = [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate));
    const last = sorted[0];
    const next = parseDate(last.startDate);
    next.setDate(next.getDate() + cycleData.averageCycleLength);
    return next;
  };

  const nextPeriod = useMemo(() => calculateNextPeriod(cycleData.entries), [cycleData.entries, cycleData.averageCycleLength]);

  const handleAddPeriod = () => {
    setEditingEntry(null);
    setFormData({ 
      startDate: formatDate(new Date()), 
      endDate: "", 
      symptoms: [], 
      fertilitySigns: [],
      healthMetrics: [],
      notes: "",
      flowIntensity: 'medium',
      mood: 'neutral',
      painLevel: 5,
      ovulationDate: "",
      basalBodyTemp: 98.6,
      cervicalMucus: 'dry',
      medications: [],
      supplements: [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.startDate) {
      showToast("Start date is required", "error");
      return;
    }

    const newEntry: PeriodEntry = {
      id: editingEntry?.id || Date.now().toString(),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      symptoms: formData.symptoms,
      notes: formData.notes,
    };

    await saveEntry(newEntry, !!editingEntry);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this period entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await cycleAPI.deleteCycle(parseInt(id));
            showToast("Entry deleted", "success");
            await loadData();
          } catch (error) {
            console.error("Failed to delete entry", error);
            showToast("Failed to delete entry", "error");
          }
        }
      }
    ]);
  };

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(new Date(year, month, day));
    
    // Check if it's a period day
    const isPeriod = cycleData.entries.some(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    });
    if (isPeriod) return "period";
    
    // Check if it's an ovulation day
    const isOvulation = cycleData.entries.some(e => e.ovulationDate === dateStr);
    if (isOvulation) return "ovulation";
    
    // Check if it's in fertile window (5 days before ovulation to 1 day after)
    const isInFertileWindow = cycleData.entries.some(e => {
      if (!e.ovulationDate) return false;
      const ovulationDate = new Date(e.ovulationDate);
      const checkDate = new Date(dateStr);
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(ovulationDate.getDate() - 5);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(ovulationDate.getDate() + 1);
      return checkDate >= fertileStart && checkDate <= fertileEnd;
    });
    if (isInFertileWindow) return "fertile";
    
    // Check if it's predicted period
    if (nextPeriod && dateStr === formatDate(nextPeriod)) return "predicted";
    
    return "normal";
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Period Tracker"
        rightElement={
          <Button size="sm" onPress={handleAddPeriod}>
            <Plus size={16} color="white" style={styles.addIcon} />
            <Text style={styles.buttonText}>Log</Text>
          </Button>
        }
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ec4899" size="large" />
          <Text style={styles.loadingText}>Loading cycle data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <Card style={styles.statsCard}>
              <CardContent style={styles.statsCardContent}>
                <Text style={styles.statsLabel}>Avg Cycle</Text>
                <Text style={styles.statsValue}>{cycleData.averageCycleLength}d</Text>
              </CardContent>
            </Card>
            <Card style={styles.statsCard}>
              <CardContent style={styles.statsCardContent}>
                <Text style={styles.statsLabel}>Next Period</Text>
                <Text style={[styles.statsValue, styles.primaryText]}>
                  {nextPeriod ? nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
                </Text>
              </CardContent>
            </Card>
          </View>

        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.calendarContainer}
        >
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
                  return (
                    <View key={day} style={styles.dayWrapper}>
                      <View style={[
                        styles.dayCircle,
                        status === "period" ? styles.dayCirclePeriod :
                          status === "ovulation" ? styles.dayCircleOvulation :
                          status === "fertile" ? styles.dayCircleFertile :
                          status === "predicted" ? styles.dayCirclePredicted : null
                      ]}>
                        <Text style={[
                          styles.dayText,
                          status === "period" ? styles.dayTextPeriod : 
                          status === "ovulation" ? styles.dayTextOvulation :
                          status === "fertile" ? styles.dayTextFertile :
                          styles.dayTextNormal
                        ]}>{day}</Text>
                        {status === "ovulation" && (
                          <View style={styles.ovulationIndicator}>
                            <Droplets size={8} color="#ffffff" />
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotPeriod]} />
                  <Text style={styles.legendText}>Period</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotOvulation]} />
                  <Text style={styles.legendText}>Ovulation</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotFertile]} />
                  <Text style={styles.legendText}>Fertile Window</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotPredicted]} />
                  <Text style={styles.legendText}>Predicted</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Fertility Insights Section */}
        {fertilityPrediction && (
          <Animated.View entering={FadeInDown.delay(800).springify()}>
            <Card style={styles.fertilityCard}>
              <CardHeader style={styles.fertilityHeader}>
                <View style={styles.fertilityHeaderContent}>
                  <Heart size={20} color="#ec4899" />
                  <Text style={styles.fertilityTitle}>Fertility Insights</Text>
                </View>
              </CardHeader>
              <CardContent style={styles.fertilityContent}>
                <View style={styles.fertilityRow}>
                  <View style={styles.fertilityItem}>
                    <Text style={styles.fertilityLabel}>Next Ovulation</Text>
                    <Text style={styles.fertilityValue}>
                      {fertilityPrediction.nextOvulationDate ? 
                        new Date(fertilityPrediction.nextOvulationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                        : '--'
                      }
                    </Text>
                  </View>
                  <View style={styles.fertilityItem}>
                    <Text style={styles.fertilityLabel}>Fertile Window</Text>
                    <Text style={styles.fertilityValue}>
                      {fertilityPrediction.fertileWindowStart && fertilityPrediction.fertileWindowEnd ? 
                        `${new Date(fertilityPrediction.fertileWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(fertilityPrediction.fertileWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : '--'
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.fertilityRow}>
                  <View style={styles.fertilityItem}>
                    <Text style={styles.fertilityLabel}>Period Due</Text>
                    <Text style={styles.fertilityValue}>
                      {fertilityPrediction.periodDueDate ? 
                        new Date(fertilityPrediction.periodDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                        : '--'
                      }
                    </Text>
                  </View>
                  <View style={styles.fertilityItem}>
                    <Text style={styles.fertilityLabel}>Conception Chance</Text>
                    <Text style={[styles.fertilityValue, { color: fertilityPrediction.conceptionProbability > 50 ? '#10b981' : '#6b7280' }]}>
                      {fertilityPrediction.conceptionProbability}%
                    </Text>
                  </View>
                </View>
                {fertilityPrediction.recommendedActions && fertilityPrediction.recommendedActions.length > 0 && (
                  <View style={styles.recommendationsContainer}>
                    <Text style={styles.recommendationsTitle}>Recommendations</Text>
                    {fertilityPrediction.recommendedActions.map((action, index) => (
                      <Text key={index} style={styles.recommendationItem}>• {action}</Text>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          </Animated.View>
        )}

        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.historyList}>
          {cycleData.entries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Droplets size={48} color="#64748b" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No history yet</Text>
            </View>
          ) : (
            cycleData.entries.sort((a, b) => b.startDate.localeCompare(a.startDate)).map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(index * 100).springify()}
                exiting={FadeOut.duration(300)}
                layout={LinearTransition}
              >
                <Card>
                  <CardContent style={styles.historyItemContent}>
                    <View style={styles.historyItemInfo}>
                      <Text style={styles.historyItemDate}>
                        {parseDate(entry.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {entry.endDate && ` - ${parseDate(entry.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </Text>
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <Text style={styles.historyItemSymptoms} numberOfLines={1}>
                          {entry.symptoms.join(", ")}
                        </Text>
                      )}
                    </View>
                    <View style={styles.historyItemActions}>
                      <Pressable onPress={() => { 
                        setEditingEntry(entry); 
                        setFormData({ 
                          startDate: entry.startDate, 
                          endDate: entry.endDate || "", 
                          symptoms: entry.symptoms || [], 
                          fertilitySigns: entry.fertilitySigns || [],
                          healthMetrics: entry.healthMetrics || [],
                          notes: entry.notes || "",
                          flowIntensity: entry.flowIntensity || 'medium',
                          mood: entry.mood || 'neutral',
                          painLevel: entry.painLevel || 5,
                          ovulationDate: entry.ovulationDate || "",
                          basalBodyTemp: entry.basalBodyTemp || 98.6,
                          cervicalMucus: entry.cervicalMucus || 'dry',
                          medications: entry.medications || [],
                          supplements: entry.supplements || [],
                        }); 
                        setIsDialogOpen(true); 
                      }} style={styles.actionButton}>
                        <Edit2 size={18} color="#64748b" />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(entry.id)} style={styles.actionButton}>
                        <Trash2 size={18} color="#ef4444" />
                      </Pressable>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            ))
          )}
        </View>
        </ScrollView>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent onOpenChange={setIsDialogOpen}>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Log Period"}</DialogTitle>
            <DialogDescription>Record your start and end dates.</DialogDescription>
          </DialogHeader>
          <View style={styles.dialogForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formData.startDate}
                onChangeText={(t) => setFormData({ ...formData, startDate: t })}
                placeholder="2024-05-20"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.endDate}
                onChangeText={(t) => setFormData({ ...formData, endDate: t })}
                placeholder="2024-05-25"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Symptoms</Text>
              <View style={styles.symptomsGrid}>
                {SYMPTOM_OPTIONS.map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]
                    }))}
                    style={[
                      styles.symptomChip,
                      formData.symptoms.includes(s) ? styles.symptomChipSelected : styles.symptomChipUnselected
                    ]}
                  >
                    <Text style={[
                      styles.symptomText,
                      formData.symptoms.includes(s) ? styles.symptomTextSelected : styles.symptomTextUnselected
                    ]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Flow Intensity</Text>
              <View style={styles.flowIntensityGrid}>
                {FLOW_INTENSITY_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => setFormData(prev => ({ ...prev, flowIntensity: option.value as 'light' | 'medium' | 'heavy' | 'very_heavy' }))}
                    style={[
                      styles.intensityChip,
                      formData.flowIntensity === option.value ? styles.intensityChipSelected : styles.intensityChipUnselected,
                      { borderColor: option.color }
                    ]}
                  >
                    <Text style={[
                      styles.intensityText,
                      formData.flowIntensity === option.value ? styles.intensityTextSelected : styles.intensityTextUnselected,
                      { color: formData.flowIntensity === option.value ? '#ffffff' : option.color }
                    ]}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mood</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => setFormData(prev => ({ ...prev, mood: option.value as 'happy' | 'sad' | 'irritable' | 'anxious' | 'neutral' }))}
                    style={[
                      styles.moodChip,
                      formData.mood === option.value ? styles.moodChipSelected : styles.moodChipUnselected,
                      { borderColor: option.color }
                    ]}
                  >
                    <Text style={[
                      styles.moodText,
                      formData.mood === option.value ? styles.moodTextSelected : styles.moodTextUnselected,
                      { color: formData.mood === option.value ? '#ffffff' : option.color }
                    ]}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pain Level (1-10)</Text>
              <View style={styles.painLevelContainer}>
                <Text style={styles.painLevelValue}>{formData.painLevel}</Text>
                <View style={styles.painLevelButtons}>
                  <Pressable 
                    onPress={() => setFormData(prev => ({ ...prev, painLevel: Math.max(1, prev.painLevel - 1) }))}
                    style={styles.painLevelButton}
                  >
                    <Text style={styles.painLevelButtonText}>-</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setFormData(prev => ({ ...prev, painLevel: Math.min(10, prev.painLevel + 1) }))}
                    style={styles.painLevelButton}
                  >
                    <Text style={styles.painLevelButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ovulation Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.ovulationDate}
                onChangeText={(t) => setFormData({ ...formData, ovulationDate: t })}
                placeholder="2024-05-15"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={formData.notes}
                onChangeText={(t) => setFormData({ ...formData, notes: t })}
                placeholder="Add any additional notes..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />
            </View>
            <Button style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b', // muted-foreground
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)', // border/50
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
    color: '#0f172a',
  },
  addIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
  },
  statsCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statsLabel: {
    fontSize: 10,
    color: '#64748b', // muted-foreground
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  primaryText: {
    color: '#ec4899', // primary
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  calendarMonthTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f172a',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarContent: {
    paddingBottom: 16,
  },
  weekLabels: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b', // muted-foreground
    fontWeight: 'bold',
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
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCirclePeriod: {
    backgroundColor: '#ec4899', // primary
  },
  dayCircleOvulation: {
    backgroundColor: '#10b981', // green
  },
  dayCircleFertile: {
    backgroundColor: '#f59e0b', // amber
  },
  dayCirclePredicted: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)', // primary/20
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  dayTextPeriod: {
    color: '#ffffff',
  },
  dayTextOvulation: {
    color: '#ffffff',
  },
  dayTextFertile: {
    color: '#ffffff',
  },
  dayTextNormal: {
    color: '#0f172a',
  },
  ovulationIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 9999,
  },
  legendDotPeriod: {
    backgroundColor: '#ec4899',
  },
  legendDotOvulation: {
    backgroundColor: '#10b981',
  },
  legendDotFertile: {
    backgroundColor: '#f59e0b',
  },
  legendDotPredicted: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
    color: '#0f172a',
  },
  historyList: {
    gap: 12,
    paddingBottom: 40,
  },
  emptyHistory: {
    paddingVertical: 40,
    alignItems: 'center',
    opacity: 0.4,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748b',
    fontWeight: '500',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemDate: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  historyItemSymptoms: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  historyItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  dialogForm: {
    gap: 16,
    paddingVertical: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#0f172a',
  },
  input: {
    height: 48,
    backgroundColor: '#f1f5f9', // muted
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#0f172a',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  symptomChipSelected: {
    backgroundColor: '#ec4899', // primary
    borderColor: '#ec4899',
  },
  symptomChipUnselected: {
    backgroundColor: 'transparent',
    borderColor: '#e2e8f0', // border
  },
  symptomText: {
    fontSize: 10,
  },
  symptomTextSelected: {
    color: '#ffffff',
  },
  symptomTextUnselected: {
    color: '#0f172a',
  },
  saveButton: {
    height: 56,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Enhanced form styles
  flowIntensityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intensityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  intensityChipSelected: {
    backgroundColor: '#ec4899',
  },
  intensityChipUnselected: {
    backgroundColor: 'transparent',
  },
  intensityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  intensityTextSelected: {
    color: '#ffffff',
  },
  intensityTextUnselected: {
    color: '#0f172a',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  moodChipSelected: {
    backgroundColor: '#ec4899',
  },
  moodChipUnselected: {
    backgroundColor: 'transparent',
  },
  moodText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  moodTextSelected: {
    color: '#ffffff',
  },
  moodTextUnselected: {
    color: '#0f172a',
  },
  painLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  painLevelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  painLevelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  painLevelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  painLevelButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Fertility insights styles
  fertilityCard: {
    marginBottom: 24,
  },
  fertilityHeader: {
    paddingBottom: 8,
  },
  fertilityHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fertilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  fertilityContent: {
    paddingTop: 8,
  },
  fertilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fertilityItem: {
    flex: 1,
    alignItems: 'center',
  },
  fertilityLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fertilityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
});
