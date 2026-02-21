import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { Timer, History, Play, StopCircle, Trash2, Zap, AlertTriangle } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { pregnancyAPI, ContractionTimerResponse } from "../lib/api/pregnancy";
import { useToast } from "../context/ToastContext";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';

type Intensity = "mild" | "moderate" | "strong";

export const ContractionTimer = () => {
    const { showToast } = useToast();
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [duration, setDuration] = useState(0);
    const [intensity, setIntensity] = useState<Intensity>("moderate");
    const [history, setHistory] = useState<ContractionTimerResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const scale = useSharedValue(1);

    useEffect(() => {
        loadHistory();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await pregnancyAPI.getContractionHistory();
            setHistory(data.sort((a, b) => b.id - a.id));
        } catch (e) {
            showToast("Failed to load history", "error");
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        setIsActive(true);
        const now = new Date();
        setStartTime(now);
        setDuration(0);
        timerRef.current = setInterval(() => {
            setDuration(Math.floor((new Date().getTime() - now.getTime()) / 1000));
        }, 1000);

        scale.value = withSpring(1.1);
    };

    const stopTimer = async () => {
        if (!isActive || !startTime) return;

        if (duration < 1) { // Only ignore if less than 1 second (accidental tap)
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            scale.value = withSpring(1);
            return;
        }

        // Calculate frequency (time from start of previous to start of current)
        let frequency = 0;
        if (history.length > 0) {
            const lastStartTime = new Date(history[0].startTime);
            frequency = (startTime.getTime() - lastStartTime.getTime()) / 60000;
        }

        try {
            await pregnancyAPI.logContraction({
                startTime: startTime.toISOString(),
                endTime: new Date().toISOString(),
                durationSeconds: duration,
                frequencyMinutes: frequency,
                intensity: intensity,
            });
            showToast("Contraction recorded", "success");
            loadHistory();
        } catch (e) {
            showToast("Failed to save log", "error");
        } finally {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            scale.value = withSpring(1);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Delete Log", "Delete this contraction record?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await pregnancyAPI.deleteContraction(id);
                        showToast("Deleted", "success");
                        loadHistory();
                    } catch (e) {
                        showToast("Failed to delete", "error");
                    }
                }
            }
        ]);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getIntensityColor = (level: string) => {
        switch (level) {
            case "mild": return "#22c55e";
            case "moderate": return "#f59e0b";
            case "strong": return "#f43f5e";
            default: return "#64748b";
        }
    };

    const formatDuration = (sec: number) => {
        return `${sec}s`;
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader title="Contraction Timer" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Timer UI */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.timerSection}>
                    <LinearGradient
                        colors={['#fff', '#f5f3ff']}
                        style={styles.timerCard}
                    >
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: isActive ? '#f43f5e' : '#94a3b8' }]} />
                            <Text style={styles.statusText}>{isActive ? "RECORDING..." : "IDLE"}</Text>
                        </View>

                        <Animated.View style={[styles.timerCircle, animatedStyle]}>
                            <Text style={styles.durationText}>{duration}</Text>
                            <Text style={styles.secLabel}>SECONDS</Text>
                        </Animated.View>

                        <View style={styles.intensityPicker}>
                            <Text style={styles.intensityLabel}>INTENSITY</Text>
                            <View style={styles.intensityRow}>
                                {(['mild', 'moderate', 'strong'] as Intensity[]).map(level => (
                                    <Pressable
                                        key={level}
                                        style={[
                                            styles.intensityChip,
                                            intensity === level && { backgroundColor: getIntensityColor(level), borderColor: getIntensityColor(level) }
                                        ]}
                                        onPress={() => setIntensity(level)}
                                    >
                                        <Text style={[styles.intensityText, intensity === level && { color: '#fff' }]}>
                                            {level.toUpperCase()}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.controlRow}>
                            <Pressable
                                style={[styles.bigTimerButton, isActive && styles.bigTimerButtonActive]}
                                onPressIn={startTimer}
                                onPressOut={stopTimer}
                            >
                                <View style={styles.innerButtonCircle}>
                                    <Timer size={48} color={isActive ? "#fff" : "#8b5cf6"} />
                                    <Text style={[styles.holdText, isActive && { color: '#fff' }]}>
                                        {isActive ? "RELEASE TO SAVE" : "HOLD TO TRACK"}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Laber Guidance */}
                {history.length > 1 && history[0].frequencyMinutes < 5 && history[0].frequencyMinutes > 0 && (
                    <Animated.View entering={FadeInUp} style={styles.guidanceBox}>
                        <AlertTriangle size={20} color="#f43f5e" />
                        <View style={styles.guidanceTextContainer}>
                            <Text style={styles.guidanceTitle}>Possible Active Labor</Text>
                            <Text style={styles.guidanceDesc}>
                                Contractions are {history[0].frequencyMinutes.toFixed(1)}m apart. Consider contacting your physician.
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* History Section */}
                <View style={styles.historySection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleWithIcon}>
                            <History size={20} color="#1e293b" />
                            <Text style={styles.sectionTitle}>Recording History</Text>
                        </View>
                        <Text style={styles.historyCount}>{history.length} Logs</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#8b5cf6" style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No contractions recorded yet.</Text>
                        </View>
                    ) : (
                        history.map((item, index) => (
                            <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)}>
                                <Card style={styles.historyCard}>
                                    <CardContent style={styles.cardContent}>
                                        <View style={styles.logLeft}>
                                            <View style={[styles.intensityIndicator, { backgroundColor: getIntensityColor(item.intensity) }]} />
                                            <View>
                                                <Text style={styles.logDate}>
                                                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                                <Text style={styles.logSubDate}>
                                                    {new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.logMetrics}>
                                            <View style={styles.metric}>
                                                <Text style={styles.metricVal}>{item.durationSeconds}s</Text>
                                                <Text style={styles.metricLabel}>Length</Text>
                                            </View>
                                            <View style={styles.metric}>
                                                <Text style={styles.metricVal}>
                                                    {item.frequencyMinutes > 0 ? `${item.frequencyMinutes.toFixed(1)}m` : '--'}
                                                </Text>
                                                <Text style={styles.metricLabel}>Freq</Text>
                                            </View>
                                        </View>

                                        <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                            <Trash2 size={18} color="#cbd5e1" />
                                        </Pressable>
                                    </CardContent>
                                </Card>
                            </Animated.View>
                        ))
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfd' },
    content: { padding: 16 },
    timerSection: { marginBottom: 24 },
    timerCard: {
        borderRadius: 40,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f5f3ff',
        elevation: 4,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 2,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 10, fontWeight: '800', color: '#64748b', letterSpacing: 1 },
    timerCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        borderWidth: 12,
        borderColor: '#f5f3ff',
    },
    durationText: { fontSize: 60, fontWeight: '800', color: '#1e293b' },
    secLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', letterSpacing: 1 },
    intensityPicker: { width: '100%', marginTop: 32, alignItems: 'center' },
    intensityLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 12 },
    intensityRow: { flexDirection: 'row', gap: 8 },
    intensityChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        backgroundColor: '#fff'
    },
    intensityText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    controlRow: { marginTop: 40, width: '100%', alignItems: 'center' },
    startBtn: { backgroundColor: '#8b5cf6', borderRadius: 24, height: 60 },
    stopBtn: { backgroundColor: '#f43f5e', borderRadius: 24, height: 60 },
    btnText: { fontWeight: '800', fontSize: 16, color: '#fff', marginLeft: 8 },
    guidanceBox: {
        flexDirection: 'row',
        backgroundColor: '#fff1f2',
        padding: 16,
        borderRadius: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#fecdd3',
        alignItems: 'center',
        gap: 16
    },
    guidanceTextContainer: { flex: 1 },
    guidanceTitle: { fontSize: 16, fontWeight: '700', color: '#be123c' },
    guidanceDesc: { fontSize: 13, color: '#e11d48', marginTop: 2, lineHeight: 18 },
    historySection: { flex: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    historyCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    historyCard: { marginBottom: 12, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, paddingTop: 12 },
    logLeft: { flexDirection: 'row', alignItems: 'center', flex: 1.5, gap: 12 },
    intensityIndicator: { width: 4, height: 32, borderRadius: 2 },
    logDate: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    logSubDate: { fontSize: 11, color: '#94a3b8' },
    logMetrics: { flex: 2, flexDirection: 'row', justifyContent: 'space-around' },
    metric: { alignItems: 'center' },
    metricVal: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    metricLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
    deleteBtn: { padding: 8 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94a3b8' },
    bigTimerButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        borderWidth: 2,
        borderColor: '#f5f3ff',
    },
    bigTimerButtonActive: {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        transform: [{ scale: 1.05 }],
    },
    innerButtonCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    holdText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#8b5cf6',
        letterSpacing: 1,
        marginTop: 8,
    },
});
