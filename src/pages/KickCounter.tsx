import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, Switch } from "react-native";
import { Footprints, History, Play, StopCircle, Trash2, Info } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { pregnancyAPI, KickCounterResponse } from "../lib/api/pregnancy";
import { notificationsAPI } from "../lib/api/notifications";
import { NotificationSettings } from "../types";
import { useToast } from "../context/ToastContext";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';

export const KickCounter = () => {
    const { showToast } = useToast();
    const [sessionActive, setSessionActive] = useState(false);
    const [count, setCount] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [history, setHistory] = useState<KickCounterResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const scale = useSharedValue(1);

    useEffect(() => {
        loadHistory();
        loadNotifSettings();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const loadNotifSettings = async () => {
        try {
            const data = await notificationsAPI.getSettings();
            setNotifSettings(data);
        } catch (err) {
            console.error("Failed to load notification settings", err);
        }
    };

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await pregnancyAPI.getKickHistory();
            setHistory(data.sort((a, b) => b.id - a.id));
        } catch (e) {
            showToast("Failed to load kick history", "error");
        } finally {
            setLoading(false);
        }
    };

    const startSession = () => {
        setSessionActive(true);
        setCount(0);
        const now = new Date();
        setStartTime(now);
        setElapsed(0);
        timerRef.current = setInterval(() => {
            setElapsed(Math.floor((new Date().getTime() - now.getTime()) / 1000));
        }, 1000);
    };

    const stopSession = async () => {
        if (!sessionActive || !startTime) return;

        try {
            await pregnancyAPI.logKickCount({
                startTime: startTime.toISOString(),
                endTime: new Date().toISOString(),
                count: count,
            });
            showToast("Session saved", "success");
            loadHistory();
        } catch (e) {
            showToast("Failed to save session", "error");
        } finally {
            setSessionActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleKick = () => {
        if (!sessionActive) {
            startSession();
            setCount(1);
        } else {
            setCount(prev => prev + 1);
        }

        scale.value = withSpring(1.2, { damping: 2, stiffness: 80 }, () => {
            scale.value = withSpring(1);
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handleDelete = (id: number) => {
        Alert.alert("Delete Session", "Are you sure you want to delete this log?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await pregnancyAPI.deleteKickEntry(id);
                        showToast("Deleted", "success");
                        loadHistory();
                    } catch (e) {
                        showToast("Failed to delete", "error");
                    }
                }
            }
        ]);
    };

    const toggleNotifications = async () => {
        if (!notifSettings) return;
        const newSettings = { ...notifSettings, enablePregnancyTracker: !notifSettings.enablePregnancyTracker };
        setNotifSettings(newSettings);
        try {
            await notificationsAPI.updateSettings(newSettings);
            showToast(`Kick notifications ${newSettings.enablePregnancyTracker ? 'enabled' : 'disabled'}`, "success");
        } catch (e) {
            showToast("Failed to update notifications", "error");
            loadNotifSettings();
        }
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title="Kick Counter"
                rightElement={
                    <Switch
                        value={notifSettings?.enablePregnancyTracker}
                        onValueChange={toggleNotifications}
                        trackColor={{ true: "#ddd6fe", false: "#e2e8f0" }}
                        thumbColor={notifSettings?.enablePregnancyTracker ? "#8b5cf6" : "#ffffff"}
                    />
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Counter UI */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.counterSection}>
                    <LinearGradient
                        colors={['#fff', '#fff1f2']}
                        style={styles.counterCard}
                    >
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
                            <Text style={styles.timerLabel}>{sessionActive ? "Current Session" : "Previous Session"}</Text>
                        </View>

                        <Pressable onPress={handleKick}>
                            <Animated.View style={[styles.kickButton, animatedStyle]}>
                                <Footprints size={48} color="#ec4899" />
                                <View style={styles.kickBadge}>
                                    <Text style={styles.kickCount}>{count}</Text>
                                </View>
                            </Animated.View>
                        </Pressable>

                        <Text style={styles.tapPrompt}>Tap the footprints for every kick</Text>

                        <View style={styles.controlRow}>
                            {!sessionActive ? (
                                <Button style={styles.startBtn} onPress={startSession}>
                                    <Play size={18} color="#fff" />
                                    <Text style={styles.btnText}>Start New session</Text>
                                </Button>
                            ) : (
                                <Button variant="outline" style={styles.stopBtn} onPress={stopSession}>
                                    <StopCircle size={18} color="#f43f5e" />
                                    <Text style={[styles.btnText, { color: '#f43f5e' }]}>Stop & Save</Text>
                                </Button>
                            )}
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Tips Section */}
                <View style={styles.infoBox}>
                    <Info size={16} color="#64748b" />
                    <Text style={styles.infoText}>
                        Medical experts recommend tracking 10 movements within 2 hours.
                    </Text>
                </View>

                {/* History Section */}
                <View style={styles.historySection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleWithIcon}>
                            <History size={20} color="#1e293b" />
                            <Text style={styles.sectionTitle}>Session History</Text>
                        </View>
                        <Text style={styles.historyCount}>{history.length} Logs</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#ec4899" style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No sessions recorded yet.</Text>
                        </View>
                    ) : (
                        history.map((item, index) => (
                            <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)}>
                                <Card style={styles.historyCard}>
                                    <CardContent style={styles.cardContent}>
                                        <View style={styles.sessionInfo}>
                                            <Text style={styles.sessionDate}>
                                                {new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Text>
                                            <Text style={styles.sessionTime}>
                                                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <View style={styles.sessionStats}>
                                            <Text style={styles.statValue}>{item.count}</Text>
                                            <Text style={styles.statLabel}>Kicks</Text>
                                        </View>
                                        <View style={styles.sessionDuration}>
                                            <Text style={styles.durationValue}>
                                                {(() => {
                                                    const ms = new Date(item.endTime).getTime() - new Date(item.startTime).getTime();
                                                    const totalSec = Math.floor(ms / 1000);
                                                    const m = Math.floor(totalSec / 60);
                                                    const s = totalSec % 60;
                                                    return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                                })()}
                                            </Text>
                                            <Text style={styles.statLabel}>Duration</Text>
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
    content: {
        padding: 16,
    },
    counterSection: { marginBottom: 24 },
    counterCard: {
        borderRadius: 40,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff1f2',
        elevation: 4,
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    timerContainer: { alignItems: 'center', marginBottom: 32 },
    timerText: { fontSize: 40, fontWeight: '800', color: '#1e293b', letterSpacing: 1 },
    timerLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: 4 },
    kickButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        borderWidth: 8,
        borderColor: '#fdf2f8',
    },
    kickBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ec4899',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    kickCount: { color: '#fff', fontSize: 18, fontWeight: '800' },
    tapPrompt: { fontSize: 14, color: '#64748b', marginTop: 32, fontWeight: '500' },
    controlRow: { marginTop: 32, width: '100%', flexDirection: 'row', justifyContent: 'center' },
    startBtn: { backgroundColor: '#ec4899', borderRadius: 20, paddingHorizontal: 24, height: 52, elevation: 2 },
    stopBtn: { borderColor: '#f43f5e', borderRadius: 20, paddingHorizontal: 24, height: 52 },
    btnText: { fontWeight: '700', fontSize: 15, marginLeft: 8, color: 'white' },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 20,
        marginBottom: 32,
        gap: 12,
    },
    infoText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 20 },
    historySection: { flex: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    historyCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    historyCard: { marginBottom: 12, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 12 },
    sessionInfo: { flex: 1.5 },
    sessionDate: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    sessionTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
    sessionStats: { flex: 1, alignItems: 'center' },
    sessionDuration: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800', color: '#ec4899' },
    durationValue: { fontSize: 18, fontWeight: '800', color: '#0ea5e9' },
    statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
    deleteBtn: { padding: 8, marginLeft: 8 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94a3b8' },
});
