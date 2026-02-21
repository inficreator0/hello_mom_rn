import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CycleDayLog, FlowLevel } from "../../types";
import { cycleAPI } from "../../lib/api/cycle";
import { useToast } from "../../context/ToastContext";
import { Heart, Zap, Droplets, MessageSquare, Save } from "lucide-react-native";
import { MultiSelect } from "../ui/multi-select";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

interface CycleDayLogFormProps {
    date: string;
    initialLog?: CycleDayLog;
    onSave?: (log: CycleDayLog) => void;
    onClose?: () => void;
}

const FLOW_LEVELS: { value: FlowLevel; label: string; color: string; droplets: number }[] = [
    { value: 'spotting', label: 'Spotting', color: '#fbcfe8', droplets: 1 },
    { value: 'light', label: 'Light', color: '#f9a8d4', droplets: 2 },
    { value: 'medium', label: 'Medium', color: '#ec4899', droplets: 3 },
    { value: 'heavy', label: 'Heavy', color: '#be185d', droplets: 4 },
];



const SYMPTOMS = ["Bloating", "Cramps", "Headache", "Acne", "Back pain", "Breast tenderness", "Nausea", "Fatigue", "Insomnia", "Cravings"];
const MOODS = ["Happy", "Neutral", "Sad", "Irritable", "Anxious", "Calm", "Energetic", "Tearful", "Frustrated"];
const PAIN_LOCATIONS = ["No Pain", "Lower Abdomen", "Lower Back", "Breasts", "Head", "Pelvis", "Legs"];

const { width } = Dimensions.get('window');

// Custom Droplet Stack Component
const DropletStack = ({ selected, onSelect }: { selected: FlowLevel | null, onSelect: (val: FlowLevel) => void }) => {
    return (
        <View style={styles.dropletStackContainer}>
            {FLOW_LEVELS.map((level) => (
                <Pressable
                    key={level.value}
                    onPress={() => onSelect(level.value as FlowLevel)}
                    style={styles.dropletItem}
                >
                    <View style={styles.dropletIconWrapper}>
                        {Array.from({ length: level.droplets }).map((_, i) => (
                            <Droplets
                                key={i}
                                size={20 + (i * 2)}
                                color={selected === level.value ? level.color : '#cbd5e1'}
                                fill={selected === level.value ? level.color : 'transparent'}
                                style={{ marginTop: i > 0 ? -12 : 0, zIndex: 10 - i }}
                            />
                        ))}
                    </View>
                    <Text style={[
                        styles.dropletLabel,
                        selected === level.value && { color: level.color, fontWeight: '700' }
                    ]}>
                        {level.label}
                    </Text>
                    {selected === level.value && (
                        <Animated.View entering={FadeInDown} style={styles.activeIndicator} />
                    )}
                </Pressable>
            ))}
        </View>
    );
};

// Custom Sentiment Scale Component
const SentimentScale = ({
    value,
    onChange,
    max = 5,
    colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
    icons = ['😊', '🙂', '😐', '😟', '😫']
}: {
    value: number,
    onChange: (val: number) => void,
    max?: number,
    colors?: string[],
    icons?: string[]
}) => {
    const steps = Array.from({ length: max }, (_, i) => i + 1);

    return (
        <View style={styles.sentimentContainer}>
            {steps.map((step) => {
                const iconIndex = Math.min(Math.floor(((step - 1) / max) * icons.length), icons.length - 1);
                const colorIndex = Math.min(Math.floor(((step - 1) / max) * colors.length), colors.length - 1);

                return (
                    <Pressable
                        key={step}
                        onPress={() => onChange(step)}
                        style={[
                            styles.sentimentStep,
                            value === step && { backgroundColor: `${colors[colorIndex]}20`, borderColor: colors[colorIndex] }
                        ]}
                    >
                        <Text style={styles.sentimentIcon}>{icons[iconIndex]}</Text>

                    </Pressable>
                );
            })}
        </View>
    );
};

export const CycleDayLogForm: React.FC<CycleDayLogFormProps> = ({ date, initialLog, onSave, onClose }) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [log, setLog] = useState<CycleDayLog>({
        logDate: date,
        flowLevel: null,
        painLevel: 0,
        painLocations: [],
        moodTags: [],
        energyLevel: 3,
        symptoms: [],
        notes: "",
    });

    useEffect(() => {
        if (initialLog) {
            setLog(initialLog);
        } else {
            setLog({
                logDate: date,
                flowLevel: null,
                painLevel: 0,
                painLocations: [],
                moodTags: [],
                energyLevel: 3,
                symptoms: [],
                notes: "",
            });
        }
    }, [date, initialLog]);

    const handleSave = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            if (log.logDate > today) {
                showToast("Cannot log health data for a future date", "error");
                return;
            }
            setIsLoading(true);
            const savedLog = await cycleAPI.updateDailyLog(log);
            showToast("Log saved successfully", "success");
            onSave?.(savedLog);
        } catch (err: any) {
            showToast(err.message || "Failed to save log", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.content}>

                {/* Flow Selection Section */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Card style={styles.sectionCard}>
                        <CardContent>
                            <View style={styles.sectionHeader}>
                                <Droplets size={20} color="#ec4899" />
                                <Text style={styles.sectionTitle}>Menstrual Flow</Text>
                            </View>
                            <DropletStack
                                selected={log.flowLevel ?? null}
                                onSelect={(val: FlowLevel) => setLog({ ...log, flowLevel: log.flowLevel === val ? null : val })}
                            />

                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Vital Signs Section */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <Card style={styles.sectionCard}>
                        <CardContent>
                            <View style={styles.sectionHeader}>
                                <Heart size={20} color="#ef4444" />
                                <Text style={styles.sectionTitle}>Physical Comfort & Pain</Text>
                            </View>
                            <SentimentScale
                                value={log.painLevel || 0}
                                max={5}
                                onChange={(val) => setLog({ ...log, painLevel: val })}
                                icons={['😌', '🙂', '😑', '😣', '😫']}
                                colors={['#22c55e', '#facc15', '#f97316', '#ef4444', '#991b1b']}
                            />

                            {log.painLevel !== undefined && log.painLevel > 0 && (
                                <Animated.View entering={FadeInRight} style={styles.subSection}>
                                    <Text style={styles.subLabel}>Where does it hurt?</Text>
                                    <View style={styles.chipGrid}>
                                        {PAIN_LOCATIONS.map(loc => (
                                            <Pressable
                                                key={loc}
                                                onPress={() => {
                                                    const current = log.painLocations || [];
                                                    let next;
                                                    if (loc === "No Pain") {
                                                        next = current.includes("No Pain") ? [] : ["No Pain"];
                                                    } else {
                                                        next = current.filter(i => i !== "No Pain");
                                                        next = next.includes(loc) ? next.filter(i => i !== loc) : [...next, loc];
                                                    }
                                                    setLog({ ...log, painLocations: next });
                                                }}
                                                style={[
                                                    styles.chip,
                                                    log.painLocations?.includes(loc) && (loc === "No Pain" ? styles.chipSelectedGreen : styles.chipSelectedRed)
                                                ]}
                                            >
                                                <Text style={[styles.chipText, log.painLocations?.includes(loc) && styles.chipTextSelected]}>
                                                    {loc}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </Animated.View>
                            )}
                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Energy & Wellness */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <Card style={styles.sectionCard}>
                        <CardContent >
                            <View style={styles.sectionHeader}>
                                <Zap size={20} color="#eab308" />
                                <Text style={styles.sectionTitle}>Energy & Vitality</Text>
                            </View>
                            <SentimentScale
                                value={log.energyLevel || 3}
                                max={5}
                                onChange={(val) => setLog({ ...log, energyLevel: val })}
                                icons={['😴', '🥱', '😐', '🙂', '⚡']}
                                colors={['#94a3b8', '#fbbf24', '#f59e0b', '#eab308', '#fbbf24']}
                            />
                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Symptoms & Mood */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Card style={styles.sectionCard}>
                        <CardContent >
                            <View style={styles.section}>
                                <MultiSelect
                                    label="Health Symptoms"
                                    options={SYMPTOMS}
                                    selectedValues={log.symptoms || []}
                                    onChange={(vals) => setLog({ ...log, symptoms: vals })}
                                    placeholder="Select any symptoms..."
                                />
                            </View>

                            <View style={[styles.section, { marginTop: 24 }]}>
                                <MultiSelect
                                    label="Emotional State"
                                    options={MOODS}
                                    selectedValues={log.moodTags || []}
                                    onChange={(vals) => setLog({ ...log, moodTags: vals })}
                                    placeholder="How's your mood?"
                                />
                            </View>
                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Journal Entry */}
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <Card style={styles.sectionCard}>
                        <CardContent >
                            <View style={styles.sectionHeader}>
                                <MessageSquare size={20} color="#6366f1" />
                                <Text style={styles.sectionTitle}>Notes</Text>
                            </View>
                            <Input
                                placeholder="Write down any thoughts or reflections..."
                                value={log.notes}
                                onChangeText={(text) => setLog({ ...log, notes: text })}
                                multiline
                                numberOfLines={4}
                                style={styles.notesInput}
                            />
                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Save Button with Gradient */}
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <Pressable onPress={handleSave} disabled={isLoading}>
                        <LinearGradient
                            colors={['#ec4899', '#be185d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveButtonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <View style={styles.saveButtonContent}>
                                    <Save size={20} color="white" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </Pressable>
                </Animated.View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
        gap: 20,
    },
    sectionCard: {
        paddingTop: 20,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 0,
    },
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1e293b",
        letterSpacing: -0.5,
    },
    subSection: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    subLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#64748b",
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dropletStackContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    dropletItem: {
        alignItems: 'center',
        width: (width - 80) / 4,
    },
    dropletIconWrapper: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dropletLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    activeIndicator: {
        height: 4,
        width: 4,
        borderRadius: 2,
        backgroundColor: '#ec4899',
        marginTop: 6,
    },
    sentimentContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    sentimentStep: {
        flex: 1,
        height: 70,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    sentimentIcon: {
        fontSize: 24,
    },
    sentimentText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '700',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        backgroundColor: "#f8fafc",
    },
    chipSelectedPink: {
        backgroundColor: "#f43f5e",
        borderColor: "#f43f5e",
    },
    chipSelectedRed: {
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
    },
    chipSelectedGreen: {
        backgroundColor: "#22c55e",
        borderColor: "#22c55e",
    },
    chipText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
    },
    chipTextSelected: {
        color: "#ffffff",
    },
    notesInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        fontSize: 16,
        minHeight: 140,
        color: '#1e293b',
    },
    saveButtonGradient: {
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#ec4899",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
