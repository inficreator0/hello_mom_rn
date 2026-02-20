import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Droplets, Plus, History, Trash2, Info } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { healthAPI, WaterIntakeResponse, WaterIntakeDailyResponse } from "../lib/api/health";
import { useToast } from "../context/ToastContext";
import { toLocalTime, formatLocalTime } from "../lib/utils/dateUtils";
import Animated, { FadeInDown } from "react-native-reanimated";

const DAILY_GOAL_ML = 3000;
const QUICK_ADDS = [250, 500, 750];

export const WaterTracker = () => {
    const { showToast } = useToast();
    const [history, setHistory] = useState<WaterIntakeDailyResponse[]>([]);
    const [todayLogs, setTodayLogs] = useState<WaterIntakeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        await Promise.all([loadAggregatedHistory(), loadTodayLogs()]);
        setIsLoading(false);
    };

    const loadAggregatedHistory = async () => {
        try {
            const data = await healthAPI.getWaterHistory();
            setHistory(data);
        } catch (e) {
            showToast("Could not load history", "error");
        }
    };

    const loadTodayLogs = async () => {
        try {
            const logsToday = await healthAPI.getTodayWaterLogs();
            setTodayLogs(logsToday);
        } catch (e) {
            showToast("Could not load today's logs", "error");
        }
    };

    const todayIntake = useMemo(() => {
        return todayLogs.reduce((sum, log) => sum + log.amountMl, 0);
    }, [todayLogs]);

    const progress = Math.min(todayIntake / DAILY_GOAL_ML, 1);

    const handleAddWater = async (amount: number) => {
        try {
            const localToday = new Date();
            const year = localToday.getFullYear();
            const month = String(localToday.getMonth() + 1).padStart(2, '0');
            const day = String(localToday.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;

            await healthAPI.logWater({
                date: todayString,
                amountMl: amount,
            });
            showToast(`Added ${amount}ml of water`, "success");
            loadTodayLogs();
            loadAggregatedHistory();
        } catch (e) {
            showToast("Failed to add water", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await healthAPI.deleteWater(id);
            showToast("Entry removed", "success");
            loadTodayLogs();
        } catch (e) {
            showToast("Failed to remove entry", "error");
        }
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader title="Water Tracker" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.progressContainer}>
                    <View style={styles.glassContainer}>
                        <View style={[styles.waterLevel, { height: `${progress * 100}%` }]} />
                        <View style={styles.glassContent}>
                            <Droplets size={48} color={progress > 0.4 ? "#fff" : "#3b82f6"} />
                            <Text style={[styles.progressValue, { color: progress > 0.6 ? "#fff" : "#1e293b" }]}>
                                {todayIntake}
                                <Text style={styles.unitText}> ml</Text>
                            </Text>
                            <Text style={[styles.goalHeader, { color: progress > 0.7 ? "rgba(255,255,255,0.8)" : "#64748b" }]}>
                                Goal: {DAILY_GOAL_ML}ml
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.quickAddSection}>
                    <Text style={styles.sectionTitle}>Quick Add</Text>
                    <View style={styles.quickAddGrid}>
                        {QUICK_ADDS.map((amount) => (
                            <Pressable
                                key={amount}
                                style={styles.quickAddBtn}
                                onPress={() => handleAddWater(amount)}
                                disabled={isSubmitting}
                            >
                                <Droplets size={24} color="#3b82f6" fill={amount > 400 ? "#3b82f6" : "transparent"} />
                                <Text style={styles.quickAddLabel}>{amount}ml</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Card style={styles.infoCard}>
                    <CardContent style={styles.infoContent}>
                        <Info size={18} color="#0284c7" />
                        <Text style={styles.infoText}>
                            Staying hydrated is vital during pregnancy and postpartum for milk production and energy.
                        </Text>
                    </CardContent>
                </Card>

                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <History size={18} color="#64748b" />
                        <Text style={styles.historyTitle}>Today's Logs</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#3b82f6" />
                    ) : todayLogs.length === 0 ? (
                        <Text style={styles.emptyText}>No water logged today. Hydrate up!</Text>
                    ) : (
                        todayLogs.map((log) => (
                            <View key={log.id} style={styles.historyItem}>
                                <View style={styles.historyDetails}>
                                    <Text style={styles.historyAmount}>{log.amountMl}ml</Text>
                                    <Text style={styles.historyTime}>
                                        {formatLocalTime(log.createdAt)}
                                    </Text>
                                </View>
                                <Pressable onPress={() => handleDelete(log.id)} style={styles.deleteBtn}>
                                    <Trash2 size={16} color="#ef4444" />
                                </Pressable>
                            </View>
                        ))
                    )}
                </View>

                {/* Intake History Section */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <History size={18} color="#64748b" />
                        <Text style={styles.historyTitle}>History</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#3b82f6" />
                    ) : (
                        (() => {
                            const now = new Date();
                            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            const pastHistory = history.filter(h => h.date !== todayStr);

                            if (pastHistory.length === 0) {
                                return <Text style={styles.emptyText}>No historical data available.</Text>;
                            }

                            return pastHistory.map((day) => (
                                <View key={day.date} style={styles.historyItem}>
                                    <View style={styles.historyDetails}>
                                        <Text style={styles.historyAmount}>{(day.totalMl / 1000).toFixed(1)}L</Text>
                                        <Text style={styles.historyTime}>
                                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View style={styles.logCountBadge}>
                                        <Text style={styles.logCountText}>{day.logCount} takes</Text>
                                    </View>
                                </View>
                            ));
                        })()
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            {/* <Pressable
                onPress={() => handleAddWater(250)}
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
                disabled={isSubmitting}
            >
                <Plus size={28} color="white" />
            </Pressable> */}
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    glassContainer: {
        width: 200,
        height: 280,
        backgroundColor: '#fff',
        borderRadius: 40,
        borderWidth: 8,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    waterLevel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        zIndex: 0,
    },
    glassContent: {
        zIndex: 1,
        alignItems: 'center',
    },
    progressValue: {
        fontSize: 32,
        fontWeight: '900',
        marginTop: 8,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '500',
    },
    goalHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    quickAddSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
        marginLeft: 4,
    },
    quickAddGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickAddBtn: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    quickAddLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3b82f6',
        marginTop: 8,
    },
    infoCard: {
        backgroundColor: '#f0f9ff',
        borderWidth: 0,
        borderRadius: 16,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#0369a1',
    },
    historySection: {
        marginBottom: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        marginLeft: 4,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyDetails: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    deleteBtn: {
        padding: 8,
    },
    logCountBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    logCountText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
        fontStyle: 'italic',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 16,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#3b82f6',
        elevation: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    }
});
