import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet, ActivityIndicator, Switch, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Plus, Edit2, Trash2, Baby, TrendingUp, TrendingDown,
  Calendar, Info, Ruler, Brain, Sparkles, ChevronRight,
  ChevronLeft, Award, Settings
} from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { babyAPI, BabyGrowthResponse, BabyProfileResponse } from "../lib/api/baby";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { usePreferences } from "../context/PreferencesContext";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { getISODateString } from "../lib/utils/dateUtils";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const BabyGrowthTracker = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { mode, babyName: prefBabyName } = usePreferences();

  // State
  const [babies, setBabies] = useState<BabyProfileResponse[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<BabyProfileResponse | null>(null);
  const [growthEntries, setGrowthEntries] = useState<BabyGrowthResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BabyGrowthResponse | null>(null);

  const [formData, setFormData] = useState({
    logDate: getISODateString(new Date()),
    weightKg: "",
    heightCm: "",
    headCircumferenceCm: "",
    notes: "",
  });

  // Load babies on mount
  useEffect(() => {
    loadBabies();
  }, []);

  // Load growth history when baby changes
  useEffect(() => {
    if (selectedBaby) {
      loadGrowthHistory(selectedBaby.id);
    }
  }, [selectedBaby]);

  const loadBabies = async () => {
    try {
      setIsLoading(true);
      const data = await babyAPI.getBabies();

      if (data.length > 0) {
        setBabies(data);
        setSelectedBaby(data[0]);
      } else if (mode === 'baby') {
        // Auto-provision if in baby mode but no backend profile
        setIsProvisioning(true);
        try {
          const newBaby = await babyAPI.createBaby({
            name: prefBabyName || "My Baby",
            gender: "UNKNOWN"
          });
          setBabies([newBaby]);
          setSelectedBaby(newBaby);
        } catch (err) {
          console.error("Auto-provisioning failed", err);
          // Fallback - setIsLoading(false) will show empty state
        } finally {
          setIsProvisioning(false);
        }
      }
    } catch (error) {
      console.error("Failed to load babies", error);
      showToast("Failed to load baby profiles", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGrowthHistory = async (babyId: number) => {
    try {
      setIsLoading(true);
      const data = await babyAPI.getGrowthHistory(babyId);
      setGrowthEntries(data);
    } catch (error) {
      console.error("Failed to load growth history", error);
      showToast("Failed to load growth data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBaby) return;

    if (!formData.logDate || (!formData.weightKg && !formData.heightCm && !formData.headCircumferenceCm)) {
      showToast("Please provide at least one measurement", "error");
      return;
    }

    if (formData.logDate > getISODateString(new Date())) {
      showToast("Cannot record future dates", "error");
      return;
    }

    const payload = {
      logDate: formData.logDate,
      weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
      heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
      headCircumferenceCm: formData.headCircumferenceCm ? parseFloat(formData.headCircumferenceCm) : undefined,
      notes: formData.notes,
    };

    try {
      if (editingEntry) {
        await babyAPI.updateGrowth(editingEntry.id, payload);
        showToast("Entry updated successfully", "success");
      } else {
        await babyAPI.logGrowth(selectedBaby.id, payload);
        showToast("Entry added successfully", "success");
      }
      setIsDialogOpen(false);
      loadGrowthHistory(selectedBaby.id);
    } catch (error) {
      console.error("Failed to save growth entry", error);
      showToast("Failed to save entry", "error");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this growth log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await babyAPI.deleteGrowth(id);
            showToast("Entry deleted", "success");
            if (selectedBaby) loadGrowthHistory(selectedBaby.id);
          } catch (error) {
            console.error("Failed to delete entry", error);
            showToast("Failed to delete entry", "error");
          }
        }
      }
    ]);
  };

  const sortedEntries = useMemo(() => {
    return [...growthEntries].sort((a, b) => b.logDate.localeCompare(a.logDate));
  }, [growthEntries]);

  const latest = sortedEntries[0];
  const previous = sortedEntries[1];

  const calculateChange = (current?: number, prev?: number) => {
    if (current === undefined || prev === undefined) return null;
    return current - prev;
  };

  const weightChange = calculateChange(latest?.weightKg, previous?.weightKg);
  const heightChange = calculateChange(latest?.heightCm, previous?.heightCm);
  const headChange = calculateChange(latest?.headCircumferenceCm, previous?.headCircumferenceCm);

  if ((isLoading || isProvisioning) && babies.length === 0) {
    return (
      <PageContainer style={styles.container} edges={['top']}>
        <ScreenHeader title="Baby Growth" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>
            {isProvisioning ? "Personalizing your tracker..." : "Loading profiles..."}
          </Text>
        </View>
      </PageContainer>
    );
  }

  if (babies.length === 0 && !isLoading) {
    return (
      <PageContainer style={styles.container} edges={['top']}>
        <ScreenHeader title="Baby Growth" />
        <View style={styles.emptyContainer}>
          <View style={styles.luxeEmptyIcon}>
            <Baby size={64} color="#e2e8f0" />
          </View>
          <Text style={styles.emptyTitle}>No Baby Profiles Found</Text>
          <Text style={styles.emptySubtitle}>Add a baby profile to start tracking their growth journey.</Text>
          <Button style={styles.createBabyBtn} onPress={() => (navigation as any).navigate("Onboarding")}>
            Setup Baby Profile
          </Button>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader
        title={"Baby's Growth"}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Luxe Header Card */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.luxeHeaderCard}>
          <LinearGradient
            colors={['#4f46e5', '#818cf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerLabel}>ACTIVE TRACKING</Text>
              <Text style={styles.headerBabyName}>{selectedBaby?.name}'s Journey</Text>
              <View style={styles.headerBadge}>
                <Sparkles size={12} color="#fff" />
                <Text style={styles.headerBadgeText}>Elite Growth</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatarCircle}>
                <Baby size={32} color="#4f46e5" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats Tiles - Dashboard Style */}
        <View style={styles.statsGrid}>
          <Card style={styles.luxeStatTile}>
            <CardContent style={styles.tileContent}>
              <View style={[styles.tileIconBox, { backgroundColor: '#eef2ff' }]}>
                <TrendingUp size={20} color="#4f46e5" />
              </View>
              <View>
                <Text style={styles.tileLabel}>Weight</Text>
                <Text style={styles.tileValue}>{latest?.weightKg ? `${latest.weightKg} kg` : '--'}</Text>
                {weightChange !== null && (
                  <Text style={[styles.tileTrend, weightChange >= 0 ? styles.trendUp : styles.trendDown]}>
                    {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(2)} kg
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>

          <Card style={styles.luxeStatTile}>
            <CardContent style={styles.tileContent}>
              <View style={[styles.tileIconBox, { backgroundColor: '#fdf2f8' }]}>
                <Ruler size={20} color="#ec4899" />
              </View>
              <View>
                <Text style={styles.tileLabel}>Height</Text>
                <Text style={styles.tileValue}>{latest?.heightCm ? `${latest.heightCm} cm` : '--'}</Text>
                {heightChange !== null && (
                  <Text style={[styles.tileTrend, heightChange >= 0 ? styles.trendUp : styles.trendDown]}>
                    {heightChange >= 0 ? '+' : ''}{heightChange.toFixed(1)} cm
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.luxeStatTile}>
            <CardContent style={styles.tileContent}>
              <View style={[styles.tileIconBox, { backgroundColor: '#f0fdf4' }]}>
                <Brain size={20} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.tileLabel}>Head Circ.</Text>
                <Text style={styles.tileValue}>{latest?.headCircumferenceCm ? `${latest.headCircumferenceCm} cm` : '--'}</Text>
                {headChange !== null && (
                  <Text style={[styles.tileTrend, headChange >= 0 ? styles.trendUp : styles.trendDown]}>
                    {headChange >= 0 ? '+' : ''}{headChange.toFixed(1)} cm
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>

          <Card style={[styles.luxeStatTile, { backgroundColor: '#4f46e5' }]}>
            <Pressable style={styles.addTilePressable} onPress={() => { setEditingEntry(null); setIsDialogOpen(true); }}>
              <Plus size={24} color="#fff" />
              <Text style={[styles.tileTitle, { color: '#fff' }]}>Add Record</Text>
            </Pressable>
          </Card>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Growth Logs</Text>
            <Pressable style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Monthly View</Text>
            </Pressable>
          </View>

          <View style={styles.logsList}>
            {sortedEntries.length === 0 ? (
              <Card style={styles.glassCard}>
                <CardContent style={styles.emptyLogsContent}>
                  <Info size={24} color="#94a3b8" />
                  <Text style={styles.emptyLogsText}>No measurements recorded for this profile yet.</Text>
                </CardContent>
              </Card>
            ) : (
              sortedEntries.map((entry, index) => (
                <Animated.View
                  key={entry.id}
                  entering={FadeInRight.delay(index * 100).duration(500)}
                >
                  <Card style={styles.luxeLogCard}>
                    <CardContent style={styles.logCardContent}>
                      <View style={styles.logDateBox}>
                        <Text style={styles.logDay}>{entry.logDate.split('-')[2]}</Text>
                        <Text style={styles.logMonth}>{new Date(entry.logDate).toLocaleString('default', { month: 'short' })}</Text>
                      </View>

                      <View style={styles.logMetricsBox}>
                        <View style={styles.logMetricItem}>
                          <Text style={styles.logMetricValue}>{entry.weightKg || '--'}kg</Text>
                          <Text style={styles.logMetricLabel}>Weight</Text>
                        </View>
                        <View style={styles.logMetricItem}>
                          <Text style={styles.logMetricValue}>{entry.heightCm || '--'}cm</Text>
                          <Text style={styles.logMetricLabel}>Height</Text>
                        </View>
                        <View style={styles.logMetricItem}>
                          <Text style={styles.logMetricValue}>{entry.headCircumferenceCm || '--'}cm</Text>
                          <Text style={styles.logMetricLabel}>Brain</Text>
                        </View>
                      </View>

                      <View style={styles.logActions}>
                        <Pressable style={styles.logActionBtn} onPress={() => {
                          setEditingEntry(entry);
                          setFormData({
                            logDate: entry.logDate,
                            weightKg: entry.weightKg?.toString() || "",
                            heightCm: entry.heightCm?.toString() || "",
                            headCircumferenceCm: entry.headCircumferenceCm?.toString() || "",
                            notes: entry.notes || "",
                          });
                          setIsDialogOpen(true);
                        }}>
                          <Edit2 size={16} color="#64748b" />
                        </Pressable>
                        <Pressable style={styles.logActionBtn} onPress={() => handleDelete(entry.id)}>
                          <Trash2 size={16} color="#f43f5e" />
                        </Pressable>
                      </View>
                    </CardContent>
                    {entry.notes && (
                      <View style={styles.logNotes}>
                        <Text style={styles.logNotesText}>{entry.notes}</Text>
                      </View>
                    )}
                  </Card>
                </Animated.View>
              ))
            )}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modern Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onOpenChange={setIsDialogOpen} style={styles.luxeDialog}>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Update Records" : "New Growth Record"}</DialogTitle>
            <DialogDescription>Maintain accurate growth data for {selectedBaby?.name}.</DialogDescription>
          </DialogHeader>

          <ScrollView style={styles.dialogForm} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.luxeInputLabel}>Log Date</Text>
              <View style={styles.luxeInputWrapper}>
                <Calendar size={18} color="#94a3b8" />
                <TextInput
                  style={styles.luxeInput}
                  value={formData.logDate}
                  onChangeText={(t) => setFormData({ ...formData, logDate: t })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGrid}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.luxeInputLabel}>Weight (kg)</Text>
                <View style={styles.luxeInputWrapper}>
                  <TrendingUp size={18} color="#94a3b8" />
                  <TextInput
                    style={styles.luxeInput}
                    value={formData.weightKg}
                    keyboardType="numeric"
                    onChangeText={(t) => setFormData({ ...formData, weightKg: t })}
                    placeholder="3.5"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.luxeInputLabel}>Height (cm)</Text>
                <View style={styles.luxeInputWrapper}>
                  <Ruler size={18} color="#94a3b8" />
                  <TextInput
                    style={styles.luxeInput}
                    value={formData.heightCm}
                    keyboardType="numeric"
                    onChangeText={(t) => setFormData({ ...formData, heightCm: t })}
                    placeholder="50"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.luxeInputLabel}>Head Circumference (cm)</Text>
              <View style={styles.luxeInputWrapper}>
                <Brain size={18} color="#94a3b8" />
                <TextInput
                  style={styles.luxeInput}
                  value={formData.headCircumferenceCm}
                  keyboardType="numeric"
                  onChangeText={(t) => setFormData({ ...formData, headCircumferenceCm: t })}
                  placeholder="35"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.luxeInputLabel}>Observations</Text>
              <View style={[styles.luxeInputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[styles.luxeInput, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.notes}
                  multiline
                  onChangeText={(t) => setFormData({ ...formData, notes: t })}
                  placeholder="Any growth milestones?"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Button style={styles.luxeSubmitBtn} onPress={handleSubmit}>
              {editingEntry ? "Update Dataset" : "Secure Record"}
            </Button>
          </ScrollView>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 16 },
  scrollView: { flex: 1, paddingHorizontal: 16 },

  // Header
  babySelector: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  babySelectorText: { fontSize: 13, fontWeight: '700', color: '#4f46e5' },

  luxeHeaderCard: {
    height: 140,
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 16,
    elevation: 8,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  headerGradient: { ...StyleSheet.absoluteFillObject },
  headerContent: { flex: 1, flexDirection: 'row', padding: 24, alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flex: 1 },
  headerRight: { width: 60, alignItems: 'flex-end' },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1 },
  headerBabyName: { fontSize: 22, color: '#fff', fontWeight: '800', marginTop: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 12, alignSelf: 'flex-start' },
  headerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  luxeStatTile: { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', paddingTop: 12 },
  tileContent: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  tileIconBox: { padding: 10, borderRadius: 14 },
  tileLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  tileValue: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 2 },
  tileTrend: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  trendUp: { color: '#22c55e' },
  trendDown: { color: '#f43f5e' },
  addTilePressable: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 4 },
  tileTitle: { fontSize: 14, fontWeight: '700' },

  // History
  historySection: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  viewAllBtn: { padding: 6 },
  viewAllText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },

  logsList: { marginTop: 16, gap: 12 },
  luxeLogCard: { borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  logCardContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 16 },
  logDateBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, minWidth: 55},
  logDay: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  logMonth: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  logMetricsBox: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  logMetricItem: { alignItems: 'center' },
  logMetricValue: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  logMetricLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  logActions: { flexDirection: 'row', gap: 8 },
  logActionBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f8fafc' },
  logNotes: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  logNotesText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },

  // Empty
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  luxeEmptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  createBabyBtn: { marginTop: 32, borderRadius: 16, backgroundColor: '#4f46e5', width: '100%' },
  glassCard: { borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' },
  emptyLogsContent: { padding: 32, alignItems: 'center', gap: 12 },
  emptyLogsText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },

  // Dialog
  luxeDialog: { borderRadius: 32, padding: 24, width: '90%', alignSelf: 'center' },
  dialogForm: { marginTop: 20 },
  inputGroup: { marginBottom: 20 },
  luxeInputLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 8, marginLeft: 4 },
  luxeInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  luxeInput: { flex: 1, height: 50, fontSize: 15, color: '#1e293b', paddingLeft: 12 },
  inputGrid: { flexDirection: 'row', gap: 12 },
  luxeSubmitBtn: { height: 56, borderRadius: 20, backgroundColor: '#4f46e5', marginTop: 12 },
});
