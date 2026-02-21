import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, TextInput, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Smile, Frown, Meh, HeartPulse, Zap, Trash2, Calendar as CalendarIcon, Plus, Bell } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { healthAPI, MoodLogResponse } from "../lib/api/health";
import { notificationsAPI } from "../lib/api/notifications";
import { NotificationSettings } from "../types";
import { useToast } from "../context/ToastContext";
import { formatLocalDate } from "../lib/utils/dateUtils";
import Animated, { FadeInDown } from "react-native-reanimated";

const MOODS = [
    { id: 'happy', label: 'Happy', icon: Smile, color: '#22c55e', bg: '#dcfce7' },
    { id: 'calm', label: 'Calm', icon: HeartPulse, color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: '#64748b', bg: '#f1f5f9' },
    { id: 'tired', label: 'Tired', icon: Zap, color: '#eab308', bg: '#fef9c3' },
    { id: 'sad', label: 'Sad', icon: Frown, color: '#ef4444', bg: '#fee2e2' },
];

export const MoodTracker = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [history, setHistory] = useState<MoodLogResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

    useEffect(() => {
        loadHistory();
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

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const data = await healthAPI.getMoodHistory();
            setHistory(data.sort((a, b) => b.date.localeCompare(a.date)));
        } catch (e) {
            showToast("Could not load mood history", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogMood = async () => {
        if (!selectedMood) {
            showToast("Please select a mood", "error");
            return;
        }

        try {
            setIsSubmitting(true);
            const localToday = new Date();
            const year = localToday.getFullYear();
            const month = String(localToday.getMonth() + 1).padStart(2, '0');
            const day = String(localToday.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;

            await healthAPI.logMood({
                date: todayString,
                mood: selectedMood,
                notes: notes.trim() || undefined,
            });
            showToast("Mood logged successfully", "success");
            setSelectedMood(null);
            setNotes("");
            loadHistory();
        } catch (e) {
            showToast("Failed to log mood", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Entry", "Remove this mood log?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await healthAPI.deleteMood(id);
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
        const newSettings = { ...notifSettings, enableMoodReminder: !notifSettings.enableMoodReminder };
        setNotifSettings(newSettings);
        try {
            await notificationsAPI.updateSettings(newSettings);
            showToast(`Mood notifications ${newSettings.enableMoodReminder ? 'enabled' : 'disabled'}`, "success");
        } catch (e) {
            showToast("Failed to update notifications", "error");
            loadNotifSettings();
        }
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title="Mood Tracker"
                rightElement={
                    <Switch
                        value={notifSettings?.enableMoodReminder}
                        onValueChange={toggleNotifications}
                        trackColor={{ true: "#ddd6fe", false: "#e2e8f0" }}
                        thumbColor={notifSettings?.enableMoodReminder ? "#8b5cf6" : "#ffffff"}
                    />
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Animated.View entering={FadeInDown.duration(400)}>

                    <Card style={styles.inputCard}>
                        <CardContent style={styles.cardContent}>
                            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
                            <View style={styles.moodGrid}>
                                {MOODS.map((m) => {
                                    const Icon = m.icon;
                                    const isSelected = selectedMood === m.id;
                                    return (
                                        <Pressable
                                            key={m.id}
                                            style={[
                                                styles.moodBtn,
                                                isSelected && { backgroundColor: m.bg, borderColor: m.color, borderWidth: 2 }
                                            ]}
                                            onPress={() => setSelectedMood(m.id)}
                                        >
                                            <View style={[styles.iconWrapper, { backgroundColor: m.bg }]}>
                                                <Icon size={28} color={m.color} />
                                            </View>
                                            <Text style={[styles.moodLabel, isSelected && { color: m.color, fontWeight: 'bold' }]}>
                                                {m.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <TextInput
                                style={styles.notesInput}
                                placeholder="Add a note (optional)..."
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                            />

                            <Button
                                style={styles.logBtn}
                                disabled={isSubmitting || !selectedMood}
                                onPress={handleLogMood}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log Today's Mood</Text>}
                            </Button>
                        </CardContent>
                    </Card>
                </Animated.View>

                <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>History</Text>
                    {isLoading ? (
                        <ActivityIndicator color="#ec4899" style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <CalendarIcon size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No logs yet. Start tracking your mood!</Text>
                        </View>
                    ) : (
                        history.map((log, index) => {
                            const moodInfo = MOODS.find(m => m.id === log.mood) || MOODS[2];
                            const Icon = moodInfo.icon;
                            return (
                                <Animated.View key={log.id} entering={FadeInDown.delay(index * 50)}>
                                    <Card style={styles.historyCard}>
                                        <CardContent style={styles.historyContent}>
                                            <View style={[styles.historyIconWrapper, { backgroundColor: moodInfo.bg }]}>
                                                <Icon size={20} color={moodInfo.color} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.historyMood}>{moodInfo.label}</Text>
                                                <Text style={styles.historyDate}>{formatLocalDate(log.date, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                                                {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}
                                            </View>
                                            <Pressable onPress={() => handleDelete(log.id)} style={styles.deleteBtn}>
                                                <Trash2 size={18} color="#ef4444" />
                                            </Pressable>
                                        </CardContent>
                                    </Card>
                                </Animated.View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            {/* <Pressable
                onPress={() => {
                    // Scroll to top to show input
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
            </Pressable> */}
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    inputCard: {
        paddingTop: 16,
        borderRadius: 24,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    iconButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    moodBtn: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    notesInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: '#1e293b',
        marginBottom: 20,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    logBtn: {
        height: 56,
        borderRadius: 28,
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
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
        marginLeft: 4,
    },
    historyCard: {
        paddingTop: 16,
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    historyIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyMood: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyDate: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    historyNotes: {
        fontSize: 13,
        color: '#475569',
        marginTop: 8,
        fontStyle: 'italic',
    },
    deleteBtn: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        backgroundColor: 'rgba(241, 245, 249, 0.5)',
        borderRadius: 24,
        marginTop: 8,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    }
});
