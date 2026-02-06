import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Plus, Edit2, Trash2, Droplets, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { PeriodEntry, CycleData } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Animated, { FadeInDown, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

const STORAGE_KEY = "@period_tracker_data";

const SYMPTOM_OPTIONS = [
  "Cramps", "Bloating", "Headache", "Mood swings", "Fatigue", "Back pain", "Breast tenderness", "Acne", "Nausea",
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PeriodEntry | null>(null);
  const [formData, setFormData] = useState({
    startDate: formatDate(new Date()),
    endDate: "",
    symptoms: [] as string[],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCycleData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load period data", e);
    }
  };

  const saveData = async (data: CycleData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setCycleData(data);
    } catch (e) {
      showToast("Failed to save data", "error");
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
    setFormData({ startDate: formatDate(new Date()), endDate: "", symptoms: [], notes: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
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

    let updatedEntries = editingEntry
      ? cycleData.entries.map(e => e.id === editingEntry.id ? newEntry : e)
      : [...cycleData.entries, newEntry];

    // Simple avg calculation (could be more robust like web version)
    saveData({ ...cycleData, entries: updatedEntries });
    showToast(editingEntry ? "Entry updated" : "Period logged", "success");
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this period entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updated = cycleData.entries.filter(e => e.id !== id);
          saveData({ ...cycleData, entries: updated });
          showToast("Entry deleted", "success");
        }
      }
    ]);
  };

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(new Date(year, month, day));
    const isPeriod = cycleData.entries.some(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    });
    if (isPeriod) return "period";
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
                          status === "predicted" ? styles.dayCirclePredicted : null
                      ]}>
                        <Text style={[
                          styles.dayText,
                          status === "period" ? styles.dayTextPeriod : styles.dayTextNormal
                        ]}>{day}</Text>
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
                  <View style={[styles.legendDot, styles.legendDotPredicted]} />
                  <Text style={styles.legendText}>Predicted</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

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
                      <Pressable onPress={() => { setEditingEntry(entry); setFormData({ startDate: entry.startDate, endDate: entry.endDate || "", symptoms: entry.symptoms || [], notes: entry.notes || "" }); setIsDialogOpen(true); }} style={styles.actionButton}>
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
  dayCirclePredicted: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)', // primary/20
    borderWidth: 1,
    borderColor: '#ec4899',
  },
  dayText: {
    fontSize: 12,
  },
  dayTextPeriod: {
    color: '#ffffff',
  },
  dayTextNormal: {
    color: '#0f172a',
  },
  legendContainer: {
    flexDirection: 'row',
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
});
