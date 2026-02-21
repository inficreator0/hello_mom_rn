import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plus, Edit2, Trash2, Flame, TrendingUp, TrendingDown, Target, ChevronRight } from "lucide-react-native";
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../context/ToastContext";
import { healthAPI, WeightLogResponse } from "../lib/api/health";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Animated, { FadeInDown } from "react-native-reanimated";
import { getISODateString } from "../lib/utils/dateUtils";

interface WeightEntry {
    id: string;
    date: string;
    weight: number;
    notes: string;
}

interface WeightData {
    entries: WeightEntry[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_HEIGHT = 220;
const CHART_PADDING = 20;

const formatDate = getISODateString;
const parseDate = (dateString: string): Date => new Date(dateString + "T00:00:00");

export const WeightTracker = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [weightData, setWeightData] = useState<WeightData>({ entries: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Goal State
    const [goalWeight, setGoalWeight] = useState<string>("");
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [goalInput, setGoalInput] = useState("");

    const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
    const [formData, setFormData] = useState({
        date: formatDate(new Date()),
        weight: "",
        notes: "",
    });

    useEffect(() => {
        loadData();
        loadGoal();
    }, []);

    const loadGoal = async () => {
        try {
            const response = await healthAPI.getTargetWeight();
            if (response.targetWeightKg !== null) {
                setGoalWeight(response.targetWeightKg.toString());
            }
        } catch (e) {
            console.error("Failed to load goal", e);
        }
    };

    const saveGoal = async () => {
        try {
            const weight = parseFloat(goalInput);
            if (isNaN(weight)) {
                showToast("Please enter a valid weight", "error");
                return;
            }
            await healthAPI.setTargetWeight({ targetWeightKg: weight });
            setGoalWeight(goalInput);
            setIsGoalDialogOpen(false);
            showToast("Goal updated", "success");
        } catch (e) {
            showToast("Failed to save goal", "error");
        }
    };

    const loadData = async () => {
        try {
            setIsLoading(true);
            const weightLogs = await healthAPI.getWeightHistory();

            const entries: WeightEntry[] = weightLogs.map((log: WeightLogResponse) => ({
                id: log.id.toString(),
                date: log.date,
                weight: log.weightKg,
                notes: log.notes || "",
            }));

            setWeightData({ entries });

            // Also update goal if available from the latest log
            if (weightLogs.length > 0 && weightLogs[0].targetWeightKg !== null) {
                setGoalWeight(weightLogs[0].targetWeightKg.toString());
            } else {
                await loadGoal();
            }
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
                if (editingEntry.id) await healthAPI.deleteWeight(parseInt(editingEntry.id));
                await healthAPI.logWeight(apiData);
                showToast("Entry updated", "success");
            } else {
                await healthAPI.logWeight(apiData);
                showToast("Entry added", "success");
            }

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
    const weightChange = latestEntry && previousEntry ? latestEntry.weight - previousEntry.weight : null;

    // Chart Data Preparation
    const chartData = useMemo(() => {
        // Get last 10 entries (chronological)
        const data = [...sortedEntries].slice(0, 10).reverse();
        if (data.length < 2) return null;

        const weights = data.map(d => d.weight);
        const dates = data.map(d => parseDate(d.date));

        let minWeight = Math.min(...weights);
        let maxWeight = Math.max(...weights);

        // Include goal in scale if set
        if (goalWeight) {
            const gw = parseFloat(goalWeight);
            if (!isNaN(gw)) {
                minWeight = Math.min(minWeight, gw);
                maxWeight = Math.max(maxWeight, gw);
            }
        }

        const range = maxWeight - minWeight || 1;
        // Add padding to range
        minWeight = Math.max(0, minWeight - range * 0.1);
        maxWeight = maxWeight + range * 0.1;

        return { data, minWeight, maxWeight, weights };
    }, [sortedEntries, goalWeight]);

    const Chart = () => {
        if (!chartData) return null;

        const { data, minWeight, maxWeight } = chartData;
        const width = SCREEN_WIDTH - 32; // Card padding removed
        const chartWidth = width - 40; // Internal chart padding
        const height = CHART_HEIGHT;
        const range = maxWeight - minWeight;

        const getX = (index: number) => (index / (data.length - 1)) * chartWidth + 20;
        const getY = (weight: number) => height - ((weight - minWeight) / range) * (height - 40) - 20;

        const pathData = data.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.weight)}`
        ).join(' ');

        const goalY = goalWeight ? getY(parseFloat(goalWeight)) : null;

        return (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Svg width={width} height={height}>
                    {/* Goal Line */}
                    {goalY !== null && (
                        <>
                            <Line
                                x1="20"
                                y1={goalY}
                                x2={width - 20}
                                y2={goalY}
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="5, 5"
                                opacity={0.6}
                            />
                            <SvgText
                                x={width - 25}
                                y={goalY - 8}
                                fill="#10b981"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="end"
                            >
                                Goal
                            </SvgText>
                        </>
                    )}

                    {/* Gradient Defs (optional, but nice) */}
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#ec4899" stopOpacity="0.5" />
                            <Stop offset="1" stopColor="#ec4899" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>

                    {/* Line Path */}
                    <Path
                        d={pathData}
                        stroke="#ec4899"
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <Circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.weight)}
                            r="4"
                            fill="#ec4899"
                            stroke="white"
                            strokeWidth="2"
                        />
                    ))}

                    {/* X Axis Labels (First and Last) */}
                    <SvgText
                        x={getX(0)}
                        y={height - 2}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                    >
                        {parseDate(data[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </SvgText>
                    <SvgText
                        x={getX(data.length - 1)}
                        y={height - 2}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                    >
                        {parseDate(data[data.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </SvgText>
                </Svg>
            </View>
        );
    };

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title="Weight Tracker" />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ec4899" />
                    <Text style={styles.loadingText}>Loading weight data...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Goal Section */}
                    <Pressable onPress={() => { setGoalInput(goalWeight); setIsGoalDialogOpen(true); }}>
                        <Card style={styles.goalCard}>
                            <CardContent style={styles.goalContent}>
                                <View style={styles.goalRow}>
                                    <View>
                                        <Text style={styles.goalLabel}>Current Weight</Text>
                                        <Text style={styles.goalValue}>{latestEntry ? `${latestEntry.weight} kg` : '--'}</Text>
                                    </View>
                                    <View style={styles.goalSeparator} />
                                    <View>
                                        <Text style={styles.goalLabel}>Target Weight</Text>
                                        <Text style={[styles.goalValue, { color: '#10b981' }]}>
                                            {goalWeight ? `${goalWeight} kg` : 'Set Goal'}
                                        </Text>
                                    </View>
                                </View>

                                {goalWeight && latestEntry && (
                                    <View style={styles.progressSection}>
                                        <Text style={styles.progressText}>
                                            {Math.abs(latestEntry.weight - parseFloat(goalWeight)).toFixed(1)} kg
                                            <Text style={{ fontWeight: 'normal', color: '#64748b' }}> to go</Text>
                                        </Text>
                                        <ChevronRight size={16} color="#94a3b8" />
                                    </View>
                                )}
                            </CardContent>
                        </Card>
                    </Pressable>

                    {/* Chart Section */}
                    {chartData && (
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <Card style={styles.chartCard}>
                                <CardContent style={{ paddingVertical: 16 }}>
                                    <Text style={styles.sectionTitleSmall}>Progress History</Text>
                                    <Chart />
                                </CardContent>
                            </Card>
                        </Animated.View>
                    )}

                    {/* Analytics Section */}
                    {/* Only show if we have data but no chart (e.g. 1 entry) or as supplementary */}


                    <Text style={styles.sectionTitle}>History</Text>
                    <View style={styles.historyContainer}>
                        {sortedEntries.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Flame size={48} color="#64748b" style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No weight entries yet</Text>
                            </View>
                        ) : (
                            sortedEntries.map((entry, idx) => {
                                const prev = sortedEntries[idx + 1];
                                const gain = prev ? entry.weight - prev.weight : null;
                                return (
                                    <Card key={entry.id} style={styles.historyCard}>
                                        <CardContent style={styles.historyCardContent}>
                                            <View style={styles.flex1}>
                                                <Text style={styles.entryDate}>
                                                    {parseDate(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                                <View style={styles.entryMetrics}>
                                                    <View style={styles.metricItem}>
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
                                                </View>
                                            </View>
                                            <View style={styles.entryActions}>
                                                <Pressable onPress={() => { setEditingEntry(entry); setFormData({ ...entry, weight: entry.weight.toString(), notes: entry.notes || "" }); setIsDialogOpen(true); }}>
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
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onOpenChange={setIsDialogOpen}>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Edit Weight" : "Add Weight"}</DialogTitle>
                        <DialogDescription>Log your weight.</DialogDescription>
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
                        <View>
                            <Text style={styles.inputLabel}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.weight}
                                keyboardType="numeric"
                                onChangeText={(t) => setFormData({ ...formData, weight: t })}
                                placeholder="65.5"
                            />
                        </View>
                        <Button style={styles.submitButton} onPress={handleSubmit}>
                            Save Entry
                        </Button>
                    </View>
                </DialogContent>
            </Dialog>

            {/* Goal Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent onOpenChange={setIsGoalDialogOpen}>
                    <DialogHeader>
                        <DialogTitle>Set Weight Goal</DialogTitle>
                        <DialogDescription>What is your target weight?</DialogDescription>
                    </DialogHeader>
                    <View style={styles.dialogForm}>
                        <View>
                            <Text style={styles.inputLabel}>Target Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={goalInput}
                                keyboardType="numeric"
                                onChangeText={setGoalInput}
                                placeholder="60.0"
                                autoFocus
                            />
                        </View>
                        <Button style={styles.submitButton} onPress={saveGoal}>
                            Save Goal
                        </Button>
                    </View>
                </DialogContent>
            </Dialog>

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
        backgroundColor: 'transparent',
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
    goalCard: {
        paddingTop: 12,
        marginBottom: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    goalContent: {
        padding: 20,
    },
    goalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalSeparator: {
        width: 1,
        height: 40,
        backgroundColor: '#e2e8f0',
    },
    goalLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    goalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    progressSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    chartCard: {
        marginBottom: 24,
        overflow: 'hidden',
    },
    sectionTitleSmall: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 8,
        marginTop: 4
    },
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
        color: '#16a34a',
    },
    negativeText: {
        color: '#ef4444',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        color: '#0f172a',
    },
    historyContainer: {
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
    historyCard: {
        paddingTop: 16,
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
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
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    gainText: {
        fontSize: 12,
        fontWeight: 'normal',
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
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        color: '#0f172a',
    },
    submitButton: {
        height: 56,
        marginTop: 8,
    },
});
