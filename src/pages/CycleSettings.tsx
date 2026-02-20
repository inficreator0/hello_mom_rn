import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { cycleAPI } from "../lib/api/cycle";
import { UserCycleSettings } from "../types";
import { useToast } from "../context/ToastContext";
import { Shield, Bell, Eye, Database, Heart, Settings as SettingsIcon, AlertTriangle } from "lucide-react-native";

const CycleSettings = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<UserCycleSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await cycleAPI.getSettings();
            setSettings(data);
        } catch (err) {
            console.error("Failed to load cycle settings", err);
            showToast("Failed to load settings", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (updates: Partial<UserCycleSettings>) => {
        if (!settings) return;
        try {
            const newSettings = { ...settings, ...updates };
            setSettings(newSettings); // Optimistic update
            await cycleAPI.updateSettings(updates);
        } catch (err) {
            console.error("Failed to update settings", err);
            showToast("Failed to update settings", "error");
            loadSettings(); // Rollback
        }
    };

    const handleDeleteAllLogs = () => {
        Alert.alert(
            "Delete All Health Data?",
            "This will permanently delete all your cycle logs. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Everything",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsSaving(true);
                            await cycleAPI.deleteAllLogs();
                            showToast("All logs successfully deleted", "success");
                        } catch (err) {
                            showToast("Failed to delete logs", "error");
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleResetSettings = async () => {
        try {
            setIsSaving(true);
            const defaults = await cycleAPI.resetSettings();
            setSettings(defaults);
            showToast("Settings reset to defaults", "success");
        } catch (err) {
            showToast("Failed to reset settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ec4899" size="large" />
            </View>
        );
    }

    if (!settings) return null;

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader title="Cycle Settings" showBackButton />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Privacy & Visibility */}
                <Card style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardHeaderRow}>
                            <Shield size={20} color="#ec4899" />
                            <CardTitle style={styles.cardTitle}>Privacy & Visibility</CardTitle>
                        </View>
                        <CardDescription>Control how your sensitive data is used.</CardDescription>
                    </CardHeader>
                    <CardContent style={styles.cardContent}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelContainer}>
                                <Text style={styles.settingLabel}>Show Predictions</Text>
                                <Text style={styles.settingSubLabel}>Estimate your next period dates</Text>
                            </View>
                            <Switch
                                value={settings.showPredictions}
                                onValueChange={(val) => handleUpdate({ showPredictions: val })}
                                trackColor={{ true: "#f9a8d4", false: "#e2e8f0" }}
                                thumbColor={settings.showPredictions ? "#ec4899" : "#ffffff"}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelContainer}>
                                <Text style={styles.settingLabel}>Track Fertility (Opt-in)</Text>
                                <Text style={styles.settingSubLabel}>Show fertile window and ovulation</Text>
                            </View>
                            <Switch
                                value={settings.showFertilityInfo}
                                onValueChange={(val) => handleUpdate({ showFertilityInfo: val })}
                                trackColor={{ true: "#f9a8d4", false: "#e2e8f0" }}
                                thumbColor={settings.showFertilityInfo ? "#ec4899" : "#ffffff"}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelContainer}>
                                <Text style={styles.settingLabel}>Hide Pregnancy Content</Text>
                                <Text style={styles.settingSubLabel}>Trauma-aware mode for this system</Text>
                            </View>
                            <Switch
                                value={settings.hidePregnancyContent}
                                onValueChange={(val) => handleUpdate({ hidePregnancyContent: val })}
                                trackColor={{ true: "#f9a8d4", false: "#e2e8f0" }}
                                thumbColor={settings.hidePregnancyContent ? "#ec4899" : "#ffffff"}
                            />
                        </View>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardHeaderRow}>
                            <Bell size={20} color="#8b5cf6" />
                            <CardTitle style={styles.cardTitle}>Notifications</CardTitle>
                        </View>
                    </CardHeader>
                    <CardContent style={styles.cardContent}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelContainer}>
                                <Text style={styles.settingLabel}>Cycle Reminders</Text>
                                <Text style={styles.settingSubLabel}>Gentle alerts for your cycle</Text>
                            </View>
                            <Switch
                                value={settings.reminderEnabled}
                                onValueChange={(val) => handleUpdate({ reminderEnabled: val })}
                                trackColor={{ true: "#c4b5fd", false: "#e2e8f0" }}
                                thumbColor={settings.reminderEnabled ? "#8b5cf6" : "#ffffff"}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelContainer}>
                                <Text style={styles.settingLabel}>Gentle Notifications Only</Text>
                                <Text style={styles.settingSubLabel}>Avoid clinical or loud language</Text>
                            </View>
                            <Switch
                                value={settings.gentleNotificationsOnly}
                                onValueChange={(val) => handleUpdate({ gentleNotificationsOnly: val })}
                                trackColor={{ true: "#c4b5fd", false: "#e2e8f0" }}
                                thumbColor={settings.gentleNotificationsOnly ? "#8b5cf6" : "#ffffff"}
                            />
                        </View>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card style={styles.card}>
                    <CardHeader>
                        <View style={styles.cardHeaderRow}>
                            <Database size={20} color="#64748b" />
                            <CardTitle style={styles.cardTitle}>Data Management</CardTitle>
                        </View>
                    </CardHeader>
                    <CardContent style={styles.cardContent}>
                        <Button
                            variant="outline"
                            onPress={handleResetSettings}
                            style={styles.actionButton}
                        >
                            <SettingsIcon size={18} color="#64748b" style={{ marginRight: 8 }} />
                            <Text style={styles.actionButtonText}>Reset to Defaults</Text>
                        </Button>

                        <Button
                            variant="outline"
                            onPress={handleDeleteAllLogs}
                            style={[styles.actionButton, { borderColor: "#ef4444" }]}
                        >
                            <AlertTriangle size={18} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Delete All Logs Permanently</Text>
                        </Button>
                    </CardContent>
                </Card>

                <View style={styles.footer}>
                    <Shield size={16} color="#94a3b8" />
                    <Text style={styles.footerText}>
                        Medical Accuracy & Privacy First. Data is never shared with third parties.
                    </Text>
                </View>

            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
    },
    card: {
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f172a",
    },
    cardContent: {
        gap: 4,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    settingLabelContainer: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
    },
    settingSubLabel: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
    },
    actionButton: {
        height: 48,
        marginTop: 12,
        justifyContent: "center",
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },
    footer: {
        padding: 24,
        alignItems: "center",
        gap: 8,
        marginBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 18,
    },
});

export default CycleSettings;
