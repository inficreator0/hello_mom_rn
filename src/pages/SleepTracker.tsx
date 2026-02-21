import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert, Platform, Dimensions, Switch } from "react-native";
import { Moon, Sun, Star, Trash2, History, Plus, BedDouble, AlarmClock } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { healthAPI, SleepLogResponse } from "../lib/api/health";
import { notificationsAPI } from "../lib/api/notifications";
import { NotificationSettings } from "../types";
import { useToast } from "../context/ToastContext";
import { toLocalTime, formatLocalDate, formatLocalTime } from "../lib/utils/dateUtils";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const SLEEP_QUALITY = [
    { id: 'poor', label: 'Poor', icon: '😴', color: '#ef4444', bg: '#fee2e2' },
    { id: 'fair', label: 'Fair', icon: '🥱', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'good', label: 'Good', icon: '🙂', color: '#10b981', bg: '#dcfce7' },
    { id: 'excellent', label: 'Great', icon: '✨', color: '#0ea5e9', bg: '#e0f2fe' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

const SleepChart = ({ history }: { history: SleepLogResponse[] }) => {
    const chartData = useMemo(() => {
        // Get last 7 entries
        const last7 = history.slice(0, 7).reverse(); // Oldest to newest for graph
        if (last7.length === 0) return null;

        const data = last7.map(log => {
            const sDate = toLocalTime(log.startTime);
            const eDate = toLocalTime(log.endTime);
            const durationMins = (eDate.getTime() - sDate.getTime()) / (1000 * 60);
            const hours = durationMins / 60;
            return {
                day: eDate.toLocaleDateString('en-US', { weekday: 'narrow' }),
                fullDate: eDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hours: hours,
                quality: log.quality
            };
        });

        const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
        const avgHours = totalHours / data.length;

        return { data, avgHours };
    }, [history]);

    if (!chartData) return null;

    const { data, avgHours } = chartData;
    const maxHours = Math.max(...data.map(d => d.hours), 10); // Scale to at least 10h usually
    const chartHeight = 180;
    const chartWidth = SCREEN_WIDTH - 64; // Padding
    const barWidth = 24;
    const spacing = (chartWidth - (data.length * barWidth)) / (data.length + 1);

    const getBarColor = (hours: number) => {
        if (hours >= 7) return '#10b981'; // Green
        if (hours >= avgHours) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getY = (h: number) => chartHeight - (h / maxHours) * chartHeight;
    const avgY = getY(avgHours);

    return (
        <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}> Trends (Last 7 Days)</Text>
                <View style={styles.avgBadge}>
                    <Text style={styles.avgLabel}>AVG</Text>
                    <Text style={styles.avgValue}>{avgHours.toFixed(1)}h</Text>
                </View>
            </View>

            <Svg width={chartWidth} height={chartHeight + 30}>
                {/* Average Line */}
                <Line
                    x1="0"
                    y1={avgY}
                    x2={chartWidth}
                    y2={avgY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity={0.5}
                />
                <SvgText
                    x={chartWidth}
                    y={avgY - 6}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="end"
                >
                    Avg
                </SvgText>

                {data.map((item, index) => {
                    const x = spacing + index * (barWidth + spacing);
                    const barHeight = (item.hours / maxHours) * chartHeight;
                    const y = chartHeight - barHeight;

                    return (
                        <React.Fragment key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={getBarColor(item.hours)}
                                rx={4}
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={chartHeight + 16}
                                fill="#64748b"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {item.day}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
};

export const SleepTracker = () => {
    const { showToast } = useToast();
    const navigation = useNavigation<any>();
    const [history, setHistory] = useState<SleepLogResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
            loadNotifSettings();
        }, [])
    );

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
            setIsLoading(true);
            const data = await healthAPI.getSleepHistory();
            setHistory(data.sort((a, b) => b.startTime.localeCompare(a.startTime)));
        } catch (e) {
            showToast("Could not load sleep history", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Entry", "Remove this sleep log?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await healthAPI.deleteSleep(id);
                        showToast("Log deleted", "success");
                        loadHistory();
                    } catch (e) {
                        showToast("Failed to delete log", "error");
                    }
                }
            }
        ]);
    };

    const toggleNotifications = async () => {
        if (!notifSettings) return;
        const newSettings = { ...notifSettings, enableSleepReminder: !notifSettings.enableSleepReminder };
        setNotifSettings(newSettings);
        try {
            await notificationsAPI.updateSettings(newSettings);
            showToast(`Sleep notifications ${newSettings.enableSleepReminder ? 'enabled' : 'disabled'}`, "success");
        } catch (e) {
            showToast("Failed to update notifications", "error");
            loadNotifSettings();
        }
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title="Sleep Tracker"
                rightElement={
                    <Switch
                        value={notifSettings?.enableSleepReminder}
                        onValueChange={toggleNotifications}
                        trackColor={{ true: "#c7d2fe", false: "#e2e8f0" }}
                        thumbColor={notifSettings?.enableSleepReminder ? "#6366f1" : "#ffffff"}
                    />
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600)}>
                </Animated.View>

                <View style={styles.historySection}>
                    <SleepChart history={history} />

                    <View style={styles.historyHeaderRow}>
                        <History size={18} color="#64748b" />
                        <Text style={styles.historyTitle}>History</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Star size={40} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No sleep data recorded yet.</Text>
                        </View>
                    ) : (
                        history.map((log, index) => {
                            const qInfo = SLEEP_QUALITY.find(q => q.id === log.quality) || SLEEP_QUALITY[2];
                            const sDate = toLocalTime(log.startTime);
                            const eDate = toLocalTime(log.endTime);
                            const duration = Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60));
                            const hours = Math.floor(duration / 60);
                            const minutes = duration % 60;

                            return (
                                <Animated.View key={log.id} entering={FadeInDown.delay(index * 50)}>
                                    <Card style={styles.historyCard}>
                                        <CardContent style={styles.historyItemContent}>
                                            <View style={[styles.qualityIndicator, { backgroundColor: qInfo.color }]} />
                                            <View style={styles.historyMainInfo}>
                                                <Text style={styles.historyDuration}>{hours}h {minutes}m</Text>
                                                <Text style={styles.historyRange}>
                                                    {formatLocalTime(sDate)} - {formatLocalTime(eDate)}
                                                </Text>
                                                <Text style={styles.historyDate}>
                                                    {formatLocalDate(eDate, { month: 'short', day: 'numeric' })}
                                                </Text>
                                            </View>
                                            <View style={styles.historyExtra}>
                                                <View style={[styles.qualityBadge, { backgroundColor: qInfo.bg }]}>
                                                    <Text style={[styles.qualityBadgeText, { color: qInfo.color }]}>{qInfo.label}</Text>
                                                </View>
                                                <Pressable onPress={() => handleDelete(log.id)} style={styles.deleteBtn}>
                                                    <Trash2 size={16} color="#ef4444" />
                                                </Pressable>
                                            </View>
                                        </CardContent>
                                    </Card>
                                </Animated.View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                onPress={() => {
                    navigation.navigate('SleepLogForm');
                }}
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
    },
    content: {
        padding: 16,
    },
    inputSection: {

    },
    timeCardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    timeCard: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 140,
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    iconCirclePurple: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ede9fe',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconCircleOrange: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffedd5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    cardTime: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    durationContainer: {
        alignItems: 'center',
        marginBottom: 32,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    durationLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    durationValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#6366f1', // Indigo
    },
    durationUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
    },
    qualitySection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
        marginLeft: 4,
    },
    qualityGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    qualityBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qualityEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    qualityText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    saveBtn: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1e1b4b',
        shadowColor: '#1e1b4b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    historySection: {
        paddingBottom: 60,
    },
    historyHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        marginLeft: 4,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyCard: {
        paddingTop: 16,
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    historyItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    qualityIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 16,
    },
    historyMainInfo: {
        flex: 1,
    },
    historyDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyRange: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    historyDate: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    historyExtra: {
        alignItems: 'flex-end',
        gap: 8,
    },
    qualityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    qualityBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    deleteBtn: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(241, 245, 249, 0.5)',
        borderRadius: 24,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 12,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    avgBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    avgLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
    },
    avgValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
    },
});
