import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Platform, ScrollView } from "react-native";
import { Moon, Sun, Calendar } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Button } from "../components/ui/button";
import { healthAPI } from "../lib/api/health";
import { useToast } from "../context/ToastContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";
import { CircularTimePicker } from "../components/sleep/CircularTimePicker";

const SLEEP_QUALITY = [
    { id: 'poor', label: 'Poor', icon: '😴', color: '#ef4444', bg: '#fee2e2' },
    { id: 'fair', label: 'Fair', icon: '🥱', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'good', label: 'Good', icon: '🙂', color: '#10b981', bg: '#dcfce7' },
    { id: 'excellent', label: 'Great', icon: '✨', color: '#0ea5e9', bg: '#e0f2fe' },
];

export const SleepLogForm = () => {
    const { showToast } = useToast();
    const navigation = useNavigation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default times: 10:00 PM yesterday and 7:00 AM today
    const [startTime, setStartTime] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(22, 0, 0, 0);
        return d;
    });
    const [endTime, setEndTime] = useState(() => {
        const d = new Date();
        d.setHours(7, 0, 0, 0);
        return d;
    });

    const [pickerMode, setPickerMode] = useState<'date' | 'start' | 'end' | null>(null);
    const [quality, setQuality] = useState("good");

    const onDateChange = (event: any, selectedDate?: Date) => {
        const mode = pickerMode;
        if (Platform.OS === 'android') {
            setPickerMode(null);
        }

        if (selectedDate && mode) {
            if (mode === 'date') {
                const newStartTime = new Date(startTime);
                newStartTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setStartTime(newStartTime);

                // Also update end time date to match or be next day
                const newEndTime = new Date(endTime);
                newEndTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                if (newEndTime < newStartTime) {
                    newEndTime.setDate(newEndTime.getDate() + 1);
                }
                setEndTime(newEndTime);
            } else if (mode === 'start') {
                setStartTime(selectedDate);
                // If end time is before new start time, move end time to next day
                if (endTime < selectedDate) {
                    const nextDay = new Date(selectedDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setEndTime(nextDay);
                }
            } else {
                setEndTime(selectedDate);
            }
        }
    };

    const calculateDuration = () => {
        const diffMs = endTime.getTime() - startTime.getTime();
        let diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 0) {
            diffMins += 1440;
        }

        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        return { h, m };
    };

    const handleLogSleep = async () => {
        if (startTime > new Date()) {
            showToast("Cannot log sleep for a future date", "error");
            return;
        }
        try {
            setIsSubmitting(true);
            await healthAPI.logSleep({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                quality: quality,
            });
            showToast("Sleep logged successfully", "success");
            navigation.goBack();
        } catch (e) {
            showToast("Failed to log sleep", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const { h, m } = calculateDuration();

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader title="Log Sleep" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(400)}>
                    <View style={styles.inputSection}>
                        <Pressable
                            style={styles.dateSelector}
                            onPress={() => setPickerMode('date')}
                        >
                            <View style={styles.iconCircleBlue}>
                                <Calendar size={20} color="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>Sleep Date</Text>
                                <Text style={styles.cardTime}>{formatDate(startTime)}</Text>
                            </View>
                        </Pressable>

                        <CircularTimePicker
                            startTime={startTime}
                            endTime={endTime}
                            onChange={(sH, sM, eH, eM) => {
                                const newStart = new Date(startTime);
                                newStart.setHours(sH, sM, 0, 0);

                                const newEnd = new Date(endTime);
                                newEnd.setHours(eH, eM, 0, 0);

                                // Adjust end time if it wraps around to the next day
                                if (newEnd < newStart) {
                                    newEnd.setDate(newEnd.getDate() + 1);
                                }

                                setStartTime(newStart);
                                setEndTime(newEnd);
                            }}
                        />

                        <View style={styles.timeInfoRow}>
                            <View style={styles.timeInfoItem}>
                                <Text style={styles.infoLabel}>Slept At</Text>
                                <Text style={styles.infoValue}>{formatTime(startTime)}</Text>
                            </View>
                            <View style={styles.timeInfoItem}>
                                <Text style={styles.infoLabel}>Woke Up</Text>
                                <Text style={styles.infoValue}>{formatTime(endTime)}</Text>
                            </View>
                        </View>

                        <View style={styles.qualitySection}>
                            <Text style={styles.sectionLabel}>Sleep Quality</Text>
                            <View style={styles.qualityGrid}>
                                {SLEEP_QUALITY.map((q) => (
                                    <Pressable
                                        key={q.id}
                                        onPress={() => setQuality(q.id)}
                                        style={[
                                            styles.qualityBtn,
                                            quality === q.id && { backgroundColor: q.bg, borderColor: q.color, borderWidth: 1.5, transform: [{ scale: 1.05 }] }
                                        ]}
                                    >
                                        <Text style={styles.qualityEmoji}>{q.icon}</Text>
                                        <Text style={[styles.qualityText, quality === q.id && { color: q.color, fontWeight: '800' }]}>
                                            {q.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <Button
                            style={styles.saveBtn}
                            onPress={handleLogSleep}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log Sleep</Text>}
                        </Button>
                    </View>
                </Animated.View>

                {pickerMode === 'date' && (
                    <DateTimePicker
                        value={startTime}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        maximumDate={new Date()}
                        onChange={onDateChange}
                    />
                )}
            </ScrollView>
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
    inputSection: {},
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#bae6fd',
        marginBottom: 16,
        gap: 16,
    },
    timeInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    timeInfoItem: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    iconCircleBlue: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0f2fe',
        alignItems: 'center',
        justifyContent: 'center',
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
});
