import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, Switch } from "react-native";
import { Baby, Utensils, Clock, Trash2, History as HistoryIcon, ChevronLeft, ChevronRight, Droplet, Star } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { babyAPI, BabyFeedingResponse, FeedingSummary } from "../lib/api/baby";
import { notificationsAPI } from "../lib/api/notifications";
import { NotificationSettings } from "../types";
import { useToast } from "../context/ToastContext";
import { formatLocalDate, formatLocalTime } from "../lib/utils/dateUtils";
import * as Haptics from "expo-haptics";
import Animated, {
    FadeInDown,
    FadeIn,
    FadeOut,
    LinearTransition,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    Layout,
    SlideInRight,
    SlideOutLeft,
    SlideInLeft,
    SlideOutRight
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 16,
    },
    dashboard: {
        marginBottom: 24,
    },
    summaryCard: {
        borderRadius: 24,
        padding: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    todayDate: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#f1f5f9',
    },
    lastFeedingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    lastFeedingText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    mainCard: {
        borderRadius: 24,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardContent: {
        paddingTop: 12,
        padding: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    tabActive: {
    },
    tabHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#0f172a',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: '20%',
        right: '20%',
        height: 3,
        backgroundColor: '#ec4899',
        borderRadius: 3,
    },
    optionsContainer: {
        marginBottom: 32,
    },
    optionSection: {
        marginBottom: 24,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    sideSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    sideCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sideCardActive: {
        backgroundColor: '#fff',
        borderColor: '#ec4899',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    sideIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    sideIconCircleActive: {
        backgroundColor: '#fdf2f8',
    },
    sideIconText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    sideIconTextActive: {
        color: '#ec4899',
    },
    sideLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
    },
    sideLabelActive: {
        color: '#0f172a',
    },
    counterSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        padding: 8,
    },
    counterValueContainer: {
        alignItems: 'center',
        minWidth: 80,
    },
    counterValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    counterUnit: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        marginTop: -4,
    },
    counterBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    logBtn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    historySection: {
        marginTop: 32,
        paddingBottom: 40,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        marginLeft: 4,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    dateHeaderText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateHeaderBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateHeaderBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
    },
    historyCard: {
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    historyItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingTop: 12
    },
    historyIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyType: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historySubInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    historyTime: {
        fontSize: 12,
        color: '#64748b',
    },
    deleteBtn: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
        fontStyle: 'italic',
    },
    presetsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    presetBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    presetBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    loadMoreBtn: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    }
});

const ScalePressable = ({ children, onPress, style, ...props }: any) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    };

    return (
        <AnimatedPressable
            {...props}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};

const SideCard = ({ active, label, sub, onPress }: any) => (
    <ScalePressable
        style={[styles.sideCard, active && styles.sideCardActive]}
        onPress={onPress}
    >
        <View style={[styles.sideIconCircle, active && styles.sideIconCircleActive]}>
            <Text style={[styles.sideIconText, active && styles.sideIconTextActive]}>
                {sub}
            </Text>
        </View>
        <Text style={[styles.sideLabel, active && styles.sideLabelActive]}>{label}</Text>
    </ScalePressable>
);

const CounterSelector = ({ value, unit, onIncrement, onDecrement }: any) => (
    <View style={styles.counterSelector}>
        <ScalePressable onPress={onDecrement} style={styles.counterBtn}>
            <ChevronLeft size={24} color="#64748b" />
        </ScalePressable>
        <Animated.View layout={LinearTransition} style={styles.counterValueContainer}>
            <Animated.Text key={value} entering={FadeInDown} style={styles.counterValue}>{value}</Animated.Text>
            <Text style={styles.counterUnit}>{unit}</Text>
        </Animated.View>
        <ScalePressable onPress={onIncrement} style={styles.counterBtn}>
            <ChevronRight size={24} color="#64748b" />
        </ScalePressable>
    </View>
);

export const FeedingTracker = () => {
    const { showToast } = useToast();
    const [history, setHistory] = useState<BabyFeedingResponse[]>([]);
    const [summary, setSummary] = useState<FeedingSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const [type, setType] = useState<"BREAST" | "BOTTLE">("BREAST");
    const [side, setSide] = useState<"LEFT" | "RIGHT" | "BOTH">("LEFT");
    const [amount, setAmount] = useState(120); // for formula
    const [duration, setDuration] = useState(15); // for breastfeeding (minutes)

    useEffect(() => {
        loadData();
        loadNotifSettings();
    }, []);

    const loadNotifSettings = async () => {
        try {
            const data = await notificationsAPI.getSettings();
            setNotifSettings(data);
        } catch (err) {
            console.error("Failed to load notification settings", err);
        }
    };

    const loadData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([loadHistory(0, true), loadSummary()]);
        } catch (e) {
            showToast("Could not load data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const data = await babyAPI.getFeedingSummary();
            setSummary(data);
        } catch (e) {
            console.error("Failed to load summary", e);
        }
    };

    const loadHistory = async (pageToLoad: number, reset = false) => {
        try {
            if (pageToLoad > 0) setIsMoreLoading(true);
            const data = await babyAPI.getFeedingHistory(pageToLoad, 10);

            if (reset) {
                setHistory(data.content);
            } else {
                setHistory(prev => [...prev, ...data.content]);
            }

            setPage(data.number);
            setHasMore(!data.last);
        } catch (e) {
            showToast("Could not load history", "error");
        } finally {
            setIsMoreLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!hasMore || isMoreLoading) return;
        loadHistory(page + 1);
    };

    const handleLogFeeding = async () => {
        try {
            setIsSubmitting(true);
            const now = new Date();

            await babyAPI.logFeeding({
                feedingTime: now.toISOString(),
                durationMinutes: type === "BREAST" ? duration : 0,
                type,
                side: type === "BREAST" ? side : null,
                amountMl: type === "BOTTLE" ? amount : 0,
            });
            showToast("Feeding logged", "success");
            setPage(0);
            loadHistory(0, true);
            loadSummary();
        } catch (e) {
            showToast("Failed to log feeding", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Entry", "Remove this feeding log?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await babyAPI.deleteFeeding(id);
                        showToast("Log deleted", "success");
                        setPage(0);
                        loadHistory(0, true);
                        loadSummary();
                    } catch (e) {
                        showToast("Failed to delete log", "error");
                    }
                }
            }
        ]);
    };

    const toggleNotifications = async () => {
        if (!notifSettings) return;
        const newSettings = { ...notifSettings, enableFeedingReminders: !notifSettings.enableFeedingReminders };
        setNotifSettings(newSettings);
        try {
            await notificationsAPI.updateSettings(newSettings);
            showToast(`Feeding notifications ${newSettings.enableFeedingReminders ? 'enabled' : 'disabled'}`, "success");
        } catch (e) {
            showToast("Failed to update notifications", "error");
            loadNotifSettings();
        }
    };

    const getGroupedHistory = () => {
        const groups: { [key: string]: BabyFeedingResponse[] } = {};
        history.forEach(log => {
            const date = formatLocalDate(log.feedingTime);
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    };

    const getDailyTotal = (logs: BabyFeedingResponse[]) => {
        let formula = 0;
        let breast = 0;
        logs.forEach(l => {
            if (l.type === "BOTTLE") formula += l.amountMl;
            else breast += 1;
        });
        return { formula, breast };
    };

    const lastFeeding = summary?.lastSession;
    const todayTotals = {
        breast: summary?.breastFeedingSessions || 0,
        formula: summary?.totalFormulaMl || 0
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title="Feeding Tracker"
                rightElement={
                    <Switch
                        value={notifSettings?.enableFeedingReminders}
                        onValueChange={toggleNotifications}
                        trackColor={{ true: "#f9a8d4", false: "#e2e8f0" }}
                        thumbColor={notifSettings?.enableFeedingReminders ? "#ec4899" : "#ffffff"}
                    />
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Dashboard Summary */}
                <Animated.View entering={FadeInDown.duration(600)}>
                    <View style={styles.dashboard}>
                        <LinearGradient
                            colors={['#fff9fb', '#fff']}
                            style={styles.summaryCard}
                        >
                            <View style={styles.summaryHeader}>
                                <View style={styles.summaryTitleContainer}>
                                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                    <Text style={styles.summaryTitle}>Quick Summary</Text>
                                </View>
                                <Text style={styles.todayDate}>{formatLocalDate(new Date().toISOString())}</Text>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{todayTotals.breast}</Text>
                                    <Text style={styles.statLabel}>Breast Sessions</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{todayTotals.formula}ml</Text>
                                    <Text style={styles.statLabel}>Formula Total</Text>
                                </View>
                            </View>

                            {lastFeeding && (
                                <View style={styles.lastFeedingBanner}>
                                    <Clock size={14} color="#64748b" />
                                    <Text style={styles.lastFeedingText}>
                                        Last: {lastFeeding.type === 'BREAST' ? `Breast (${lastFeeding.side})` : `Formula ${lastFeeding.amountMl}ml`}, {formatLocalTime(lastFeeding.feedingTime)}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(400)}>
                    <Card style={styles.mainCard}>
                        <CardContent style={styles.cardContent}>
                            <View style={styles.tabsContainer}>
                                <ScalePressable
                                    style={[styles.tab, type === "BREAST" && styles.tabActive]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setType("BREAST");
                                    }}
                                >
                                    <View style={styles.tabHeader}>
                                        <Baby size={18} color={type === "BREAST" ? "#ec4899" : "#64748b"} />
                                        <Text style={[styles.tabText, type === "BREAST" && styles.tabTextActive]}>Breast</Text>
                                    </View>
                                    {type === "BREAST" && <Animated.View layout={LinearTransition} entering={FadeInDown} style={styles.tabIndicator} />}
                                </ScalePressable>
                                <ScalePressable
                                    style={[styles.tab, type === "BOTTLE" && styles.tabActive]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setType("BOTTLE");
                                    }}
                                >
                                    <View style={styles.tabHeader}>
                                        <Utensils size={18} color={type === "BOTTLE" ? "#0ea5e9" : "#64748b"} />
                                        <Text style={[styles.tabText, type === "BOTTLE" && styles.tabTextActive]}>Formula</Text>
                                    </View>
                                    {type === "BOTTLE" && <Animated.View layout={LinearTransition} entering={FadeInDown} style={styles.tabIndicator} />}
                                </ScalePressable>
                            </View>

                            <View style={{ overflow: 'hidden' }}>
                                {type === "BREAST" ? (
                                    <Animated.View
                                        key="breast"
                                        entering={SlideInLeft.duration(400)}
                                        exiting={SlideOutRight.duration(400)}
                                        style={styles.optionsContainer}
                                    >
                                        <View style={styles.optionSection}>
                                            <Text style={styles.optionLabel}>Select Side</Text>
                                            <View style={styles.sideSelector}>
                                                {[
                                                    { id: 'LEFT', label: 'Left', sub: 'L' },
                                                    { id: 'BOTH', label: 'Both', sub: 'L + R' },
                                                    { id: 'RIGHT', label: 'Right', sub: 'R' }
                                                ].map((s) => (
                                                    <SideCard
                                                        key={s.id}
                                                        active={side === s.id}
                                                        label={s.label}
                                                        sub={s.sub}
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                            setSide(s.id as any);
                                                        }}
                                                    />
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.optionSection}>
                                            <Text style={styles.optionLabel}>Feeding Duration</Text>
                                            <CounterSelector
                                                value={duration}
                                                unit="mins"
                                                onDecrement={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setDuration(Math.max(1, duration - 5));
                                                }}
                                                onIncrement={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setDuration(duration + 5);
                                                }}
                                            />
                                            <View style={styles.presetsContainer}>
                                                {[1, 3, 5].map((min) => (
                                                    <ScalePressable
                                                        key={min}
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                            setDuration(prev => prev + min);
                                                        }}
                                                        style={styles.presetBtn}
                                                    >
                                                        <Text style={styles.presetBtnText}>+{min}m</Text>
                                                    </ScalePressable>
                                                ))}
                                            </View>
                                        </View>
                                    </Animated.View>
                                ) : (
                                    <Animated.View
                                        key="formula"
                                        entering={SlideInRight.duration(400)}
                                        exiting={SlideOutLeft.duration(400)}
                                        style={styles.optionsContainer}
                                    >
                                        <View style={styles.optionSection}>
                                            <Text style={styles.optionLabel}>Formula Amount</Text>
                                            <CounterSelector
                                                value={amount}
                                                unit="ml"
                                                onDecrement={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setAmount(Math.max(0, amount - 10));
                                                }}
                                                onIncrement={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setAmount(amount + 10);
                                                }}
                                            />
                                        </View>
                                    </Animated.View>
                                )}
                            </View>

                            <ScalePressable
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    handleLogFeeding();
                                }}
                                disabled={isSubmitting}
                            >
                                <LinearGradient
                                    colors={type === 'BREAST' ? ['#ec4899', '#db2777'] : ['#0ea5e9', '#0284c7']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.logBtn}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.btnText}>Log {type === 'BREAST' ? `${duration}m ` : ''}Feeding</Text>
                                    )}
                                </LinearGradient>
                            </ScalePressable>
                        </CardContent>
                    </Card>
                </Animated.View>

                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <HistoryIcon size={18} color="#64748b" />
                        <Text style={styles.historyTitle}>Activity History</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#ec4899" />
                    ) : history.length === 0 ? (
                        <Text style={styles.emptyText}>No feedings logged yet.</Text>
                    ) : (
                        Object.entries(getGroupedHistory()).map(([date, logs], groupIndex) => (
                            <View key={date} style={styles.historyGroup}>
                                <View style={styles.dateHeader}>
                                    <Text style={styles.dateHeaderText}>{date}</Text>
                                    {/* <View style={styles.dateHeaderBadge}>
                                        <Text style={styles.dateHeaderBadgeText}>
                                            {getDailyTotal(logs).breast}B • {getDailyTotal(logs).formula}ml
                                        </Text>
                                    </View> */}
                                </View>
                                {logs.map((log, index) => (
                                    <Animated.View key={log.id} entering={FadeInDown.delay(index * 50 + groupIndex * 100)}>
                                        <Card style={styles.historyCard}>
                                            <CardContent style={styles.historyItemContent}>
                                                <View style={[styles.historyIcon, { backgroundColor: log.type === 'BREAST' ? '#fdf2f8' : '#f0f9ff' }]}>
                                                    {log.type === "BREAST" ? <Baby size={20} color="#ec4899" /> : <Droplet size={20} color="#0ea5e9" />}
                                                </View>
                                                <View style={styles.historyInfo}>
                                                    <Text style={styles.historyType}>
                                                        {log.type === "BREAST" ? `Breast (${log.side})` : `Formula`}
                                                    </Text>
                                                    <View style={styles.historySubInfo}>
                                                        <Clock size={10} color="#94a3b8" />
                                                        <Text style={styles.historyTime}>
                                                            {formatLocalTime(log.feedingTime)}
                                                            {log.type === 'BOTTLE' ? ` • ${log.amountMl}ml` : ` • ${log.durationMinutes}m`}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <ScalePressable onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                    handleDelete(log.id);
                                                }} style={styles.deleteBtn}>
                                                    <Trash2 size={18} color="#ef4444" />
                                                </ScalePressable>
                                            </CardContent>
                                        </Card>
                                    </Animated.View>
                                ))}
                            </View>
                        ))
                    )}

                    {hasMore && (
                        <ScalePressable
                            onPress={handleLoadMore}
                            disabled={isMoreLoading}
                            style={styles.loadMoreBtn}
                        >
                            {isMoreLoading ? (
                                <ActivityIndicator size="small" color="#64748b" />
                            ) : (
                                <Text style={styles.loadMoreText}>Load More</Text>
                            )}
                        </ScalePressable>
                    )}
                </View>
            </ScrollView>
        </PageContainer>
    );
};

