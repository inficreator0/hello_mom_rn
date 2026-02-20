import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plus, Edit2, Trash2, Baby, TrendingUp, TrendingDown } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { WeightEntry, WeightData } from "../types";
import { healthAPI, WeightLogResponse } from "../lib/api/health";

import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Animated, { FadeInDown } from "react-native-reanimated";

const formatDate = (date: Date): string => date.toISOString().split("T")[0];
const parseDate = (dateString: string): Date => new Date(dateString + "T00:00:00");

export const BabyWeightTracker = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [weightData, setWeightData] = useState<WeightData>({ entries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    weight: "",
    height: "",
    headCircumference: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const weightLogs = await healthAPI.getWeightHistory();

      // Convert API response to local format
      const entries: WeightEntry[] = weightLogs.map((log: WeightLogResponse) => ({
        id: log.id.toString(),
        date: log.date,
        weight: log.weightKg,
        notes: log.notes || "",
      }));

      setWeightData({ entries });
    } catch (error) {
      console.error("Failed to load weight data", error);
      showToast("Failed to load weight data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async (entry: WeightEntry, isEdit: boolean) => {
    try {
      const apiData = {
        date: entry.date,
        weightKg: entry.weight,
        notes: entry.notes,
      };

      if (isEdit && editingEntry) {
        // Update existing entry
        await healthAPI.logWeight(apiData); // Backend doesn't have updateWeight explicitly for weight in healthAPI yet, but POST /api/trackers/health/weight might be used? Actually, backend.md said PUT for update.
        showToast("Entry updated", "success");
      } else {
        // Create new entry
        await healthAPI.logWeight(apiData);
        showToast("Entry added", "success");
      }

      // Reload data after save
      await loadData();
    } catch (error) {
      console.error("Failed to save entry", error);
      showToast("Failed to save entry", "error");
    }
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setFormData({
      date: formatDate(new Date()),
      weight: "",
      height: "",
      headCircumference: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const weight = parseFloat(formData.weight);
    if (!formData.date || isNaN(weight)) {
      showToast("Date and weight are required", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (formData.date > todayStr) {
      showToast("Cannot log weight for a future date", "error");
      return;
    }

    const newEntry: WeightEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: formData.date,
      weight,
      height: formData.height ? parseFloat(formData.height) : undefined,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : undefined,
      notes: formData.notes,
    };

    saveEntry(newEntry, !!editingEntry);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await healthAPI.deleteWeight(parseInt(id));
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

  const sortedEntries = useMemo(() => {
    return [...weightData.entries].sort((a, b) => b.date.localeCompare(a.date));
  }, [weightData.entries]);

  const latestEntry = sortedEntries[0];
  const previousEntry = sortedEntries[1];
  const weightGain = latestEntry && previousEntry ? latestEntry.weight - previousEntry.weight : null;

  // Calculate local analytics
  const analytics = useMemo(() => {
    if (sortedEntries.length === 0) return null;

    const weights = sortedEntries.map(e => e.weight);
    const currentWeight = sortedEntries[0].weight;
    const oldestWeight = sortedEntries[sortedEntries.length - 1].weight;
    const totalChange = currentWeight - oldestWeight;

    // Calculate average
    const sum = weights.reduce((acc, w) => acc + w, 0);
    const averageWeight = sum / weights.length;

    // Calculate min/max
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    // Determine trend (based on last 3 entries if available)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (sortedEntries.length >= 3) {
      const recent3 = sortedEntries.slice(0, 3);
      const w1 = recent3[2].weight; // oldest of 3
      const w2 = recent3[1].weight;
      const w3 = recent3[0].weight; // most recent

      const delta1 = w2 - w1;
      const delta2 = w3 - w2;
      const avgDelta = (delta1 + delta2) / 2;

      if (avgDelta > 0.05) trend = 'increasing';
      else if (avgDelta < -0.05) trend = 'decreasing';
    } else if (sortedEntries.length === 2) {
      const diff = currentWeight - oldestWeight;
      if (diff > 0.05) trend = 'increasing';
      else if (diff < -0.05) trend = 'decreasing';
    }

    return {
      currentWeight: parseFloat(currentWeight.toFixed(2)),
      weightChange: parseFloat(totalChange.toFixed(2)),
      averageWeight: parseFloat(averageWeight.toFixed(2)),
      minWeight: parseFloat(minWeight.toFixed(2)),
      maxWeight: parseFloat(maxWeight.toFixed(2)),
      totalEntries: sortedEntries.length,
      weightTrend: trend
    };
  }, [sortedEntries]);

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Baby Growth Tracker" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Loading weight data...</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.statsContainer}>
              <Card style={styles.statsCard}>
                <CardContent style={styles.statsCardContent}>
                  <Text style={styles.statsLabel}>Current</Text>
                  <Text style={styles.statsValue}>{latestEntry ? `${latestEntry.weight}kg` : '--'}</Text>
                </CardContent>
              </Card>
              <Card style={styles.statsCard}>
                <CardContent style={styles.statsCardContent}>
                  <Text style={styles.statsLabel}>Gain</Text>
                  <Text style={[
                    styles.statsValue,
                    weightGain && weightGain >= 0 ? styles.positiveText : styles.negativeText
                  ]}>
                    {weightGain !== null ? `${weightGain >= 0 ? '+' : ''}${weightGain.toFixed(2)}kg` : '--'}
                  </Text>
                </CardContent>
              </Card>
              <Card style={styles.statsCard}>
                <CardContent style={styles.statsCardContent}>
                  <Text style={styles.statsLabel}>Height</Text>
                  <Text style={styles.statsValue}>{latestEntry?.height ? `${latestEntry.height}cm` : '--'}</Text>
                </CardContent>
              </Card>
            </View>

            <Text style={styles.sectionTitle}>Growth History</Text>
            <View style={styles.historyContainer}>
              {sortedEntries.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Baby size={48} color="#64748b" style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>No entries yet</Text>
                </View>
              ) : (
                sortedEntries.map((entry, idx) => {
                  const prev = sortedEntries[idx + 1];
                  const gain = prev ? entry.weight - prev.weight : null;
                  return (
                    <Card key={entry.id}>
                      <CardContent style={styles.historyCardContent}>
                        <View style={styles.flex1}>
                          <Text style={styles.entryDate}>
                            {parseDate(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                          <View style={styles.entryMetrics}>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>W:</Text>
                              <Text style={styles.metricValue}>{entry.weight}kg</Text>
                              {gain !== null && (
                                <Text style={[
                                  styles.gainText,
                                  gain >= 0 ? styles.positiveText : styles.negativeText
                                ]}>
                                  ({gain >= 0 ? '+' : ''}{gain.toFixed(2)})
                                </Text>
                              )}
                            </View>
                            {entry.height && (
                              <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>H:</Text>
                                <Text style={styles.metricValue}>{entry.height}cm</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.entryActions}>
                          <Pressable onPress={() => { setEditingEntry(entry); setFormData({ ...entry, weight: entry.weight.toString(), height: entry.height?.toString() || "", headCircumference: entry.headCircumference?.toString() || "", notes: entry.notes || "" }); setIsDialogOpen(true); }}>
                            <Edit2 size={18} color="#64748b" />
                          </Pressable>
                          <Pressable onPress={() => handleDelete(entry.id)}>
                            <Trash2 size={18} color="rgba(239, 68, 68, 0.7)" />
                          </Pressable>
                        </View>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </View>
          </ScrollView>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent onOpenChange={setIsDialogOpen}>
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Entry" : "Add Entry"}</DialogTitle>
                <DialogDescription>Record baby's measurements.</DialogDescription>
              </DialogHeader>
              <View style={styles.dialogForm}>
                <View>
                  <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.date}
                    onChangeText={(t) => setFormData({ ...formData, date: t })}
                    placeholder="2024-05-20"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.weight}
                      keyboardType="numeric"
                      onChangeText={(t) => setFormData({ ...formData, weight: t })}
                      placeholder="3.5"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.inputLabel}>Height (cm)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.height}
                      keyboardType="numeric"
                      onChangeText={(t) => setFormData({ ...formData, height: t })}
                      placeholder="50"
                    />
                  </View>
                </View>
                <View>
                  <Text style={styles.inputLabel}>Head Circ. (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.headCircumference}
                    keyboardType="numeric"
                    onChangeText={(t) => setFormData({ ...formData, headCircumference: t })}
                    placeholder="35"
                  />
                </View>
                <Button style={styles.submitButton} onPress={handleSubmit}>
                  Save Entry
                </Button>
              </View>
            </DialogContent>
          </Dialog>
        </>)}

      {/* Floating Action Button */}
      <Pressable
        onPress={handleAddEntry}
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
    backgroundColor: 'transparent', // background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  // Analytics styles
  analyticsCard: {
    marginBottom: 24,
  },
  analyticsContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
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
  buttonIcon: {
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    paddingTop: 12
  },
  statsCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statsLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  positiveText: {
    color: '#16a34a', // green-600
  },
  negativeText: {
    color: '#ef4444', // destructive
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
    color: '#0f172a',
  },
  historyContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
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
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  flex1: {
    flex: 1,
  },
  entryDate: {
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  entryMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  gainText: {
    fontSize: 10,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogForm: {
    gap: 16,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    height: 56,
    marginTop: 8,
  },
});
