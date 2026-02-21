import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Dimensions, TextInput, Alert, Modal } from "react-native";
import { Baby, Footprints, Timer, TrendingUp, Plus, ChevronRight, Scale, Ruler, Trash2, Edit2, Calendar, Info } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { pregnancyAPI, PregnancyProgressResponse } from "../lib/api/pregnancy";
import { useToast } from "../context/ToastContext";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { getISODateString } from "../lib/utils/dateUtils";

const { width } = Dimensions.get('window');

export const PregnancyTracker = () => {
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const [progress, setProgress] = useState<PregnancyProgressResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<PregnancyProgressResponse | null>(null);

    const [formData, setFormData] = useState({
        weekNumber: "",
        weight: "",
        bellySize: "",
        date: getISODateString(new Date()),
        notes: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await pregnancyAPI.getProgressHistory();
            setProgress(data.sort((a, b) => b.weekNumber - a.weekNumber));
        } catch (e) {
            showToast("Failed to load pregnancy data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.weekNumber || !formData.date) {
            showToast("Week number and date are required", "error");
            return;
        }

        const payload = {
            weekNumber: parseInt(formData.weekNumber),
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            bellySize: formData.bellySize ? parseFloat(formData.bellySize) : undefined,
            date: formData.date,
            notes: formData.notes,
        };

        try {
            if (editingEntry) {
                await pregnancyAPI.updateProgress(editingEntry.id, payload);
                showToast("Progress updated", "success");
            } else {
                await pregnancyAPI.logProgress(payload);
                showToast("Progress logged", "success");
            }
            setIsDialogOpen(false);
            loadData();
        } catch (e) {
            showToast("Failed to save progress", "error");
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Delete Entry", "Are you sure you want to delete this week's log?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await pregnancyAPI.deleteProgress(id);
                        showToast("Log deleted", "success");
                        loadData();
                    } catch (e) {
                        showToast("Failed to delete log", "error");
                    }
                }
            }
        ]);
    };

    const latest = progress[0];

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader title="Pregnancy Tracker" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Weekly Progress Overview */}
                <Animated.View entering={FadeInDown.duration(600)}>
                    <Card style={styles.overviewCard}>
                        <View style={styles.overviewGradient} />
                        <CardContent style={styles.overviewContent}>
                            <View style={styles.weekBadge}>
                                <Text style={styles.weekNumber}>Week {latest?.weekNumber || '--'}</Text>
                                <Text style={styles.weekLabel}>of 40</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <Scale size={20} color="#fff" />
                                    <Text style={styles.infoValue}>{latest?.weight || '--'} kg</Text>
                                    <Text style={styles.infoLabel}>Weight</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoItem}>
                                    <Ruler size={20} color="#fff" />
                                    <Text style={styles.infoValue}>{latest?.bellySize || '--'} cm</Text>
                                    <Text style={styles.infoLabel}>Belly Size</Text>
                                </View>
                            </View>
                            <Button variant="outline" style={styles.updateBtn} onPress={() => {
                                setEditingEntry(null);
                                setFormData({
                                    weekNumber: latest ? (latest.weekNumber + 1).toString() : "1",
                                    weight: latest?.weight?.toString() || "",
                                    bellySize: latest?.bellySize?.toString() || "",
                                    date: getISODateString(new Date()),
                                    notes: "",
                                });
                                setIsDialogOpen(true);
                            }}>
                                <Plus size={16} color="#ec4899" />
                                <Text style={styles.updateBtnText}>Update Progress</Text>
                            </Button>
                        </CardContent>
                    </Card>
                </Animated.View>

                {/* Quick Tools */}
                <View style={styles.toolsSection}>
                    <Text style={styles.sectionTitle}>Essential Tools</Text>
                    <View style={styles.toolsGrid}>
                        <Pressable style={styles.toolItem} onPress={() => navigation.navigate("KickCounter")}>
                            <View style={[styles.toolIcon, { backgroundColor: '#fdf2f8' }]}>
                                <Footprints size={28} color="#ec4899" />
                            </View>
                            <Text style={styles.toolName}>Kick Counter</Text>
                            <Text style={styles.toolDesc}>Track baby's movements</Text>
                        </Pressable>

                        <Pressable style={styles.toolItem} onPress={() => navigation.navigate("ContractionTimer")}>
                            <View style={[styles.toolIcon, { backgroundColor: '#f0f9ff' }]}>
                                <Timer size={28} color="#0ea5e9" />
                            </View>
                            <Text style={styles.toolName}>Contraction Timer</Text>
                            <Text style={styles.toolDesc}>Monitor labor patterns</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Recent Updates History */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Weekly Log</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#ec4899" />
                    ) : progress.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Baby size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No progress logged yet.</Text>
                        </View>
                    ) : (
                        progress.slice(0, 5).map((item: PregnancyProgressResponse, index: number) => (
                            <Animated.View key={item.id} entering={FadeInRight.delay(index * 100)}>
                                <Card style={styles.historyCard}>
                                    <CardContent style={styles.historyCardContent}>
                                        <View style={styles.historyWeek}>
                                            <Text style={styles.historyWeekNum}>{item.weekNumber}</Text>
                                            <Text style={styles.historyWeekLabel}>Week</Text>
                                        </View>
                                        <View style={styles.historyInfo}>
                                            <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                            <Text style={styles.historyStats}>Weight: {item.weight}kg • Belly: {item.bellySize}cm</Text>
                                            {item.notes && <Text style={styles.historyNotes} numberOfLines={1}>{item.notes}</Text>}
                                        </View>
                                        <View style={styles.historyActions}>
                                            <Pressable style={styles.historyBtn} onPress={() => {
                                                setEditingEntry(item);
                                                setFormData({
                                                    weekNumber: item.weekNumber.toString(),
                                                    weight: item.weight?.toString() || "",
                                                    bellySize: item.bellySize?.toString() || "",
                                                    date: item.date,
                                                    notes: item.notes || "",
                                                });
                                                setIsDialogOpen(true);
                                            }}>
                                                <Edit2 size={16} color="#64748b" />
                                            </Pressable>
                                            <Pressable style={styles.historyBtn} onPress={() => handleDelete(item.id)}>
                                                <Trash2 size={16} color="#f43f5e" />
                                            </Pressable>
                                        </View>
                                    </CardContent>
                                </Card>
                            </Animated.View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Progress Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onOpenChange={setIsDialogOpen} style={styles.luxeDialog}>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Edit Weekly Log" : "Log Weekly Progress"}</DialogTitle>
                        <DialogDescription>Track your body changes as your baby grows.</DialogDescription>
                    </DialogHeader>

                    <ScrollView style={styles.dialogForm} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGrid}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.luxeInputLabel}>Week #</Text>
                                <View style={styles.luxeInputWrapper}>
                                    <TextInput
                                        style={styles.luxeInput}
                                        value={formData.weekNumber}
                                        keyboardType="numeric"
                                        onChangeText={(t) => setFormData({ ...formData, weekNumber: t })}
                                        placeholder="12"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={styles.luxeInputLabel}>Date</Text>
                                <View style={styles.luxeInputWrapper}>
                                    <Calendar size={18} color="#94a3b8" />
                                    <TextInput
                                        style={styles.luxeInput}
                                        value={formData.date}
                                        onChangeText={(t) => setFormData({ ...formData, date: t })}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGrid}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.luxeInputLabel}>Weight (kg)</Text>
                                <View style={styles.luxeInputWrapper}>
                                    <Scale size={18} color="#94a3b8" />
                                    <TextInput
                                        style={styles.luxeInput}
                                        value={formData.weight}
                                        keyboardType="numeric"
                                        onChangeText={(t) => setFormData({ ...formData, weight: t })}
                                        placeholder="65.0"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.luxeInputLabel}>Belly (cm)</Text>
                                <View style={styles.luxeInputWrapper}>
                                    <Ruler size={18} color="#94a3b8" />
                                    <TextInput
                                        style={styles.luxeInput}
                                        value={formData.bellySize}
                                        keyboardType="numeric"
                                        onChangeText={(t) => setFormData({ ...formData, bellySize: t })}
                                        placeholder="85"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.luxeInputLabel}>Notes / Feelings</Text>
                            <View style={[styles.luxeInputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                                <TextInput
                                    style={[styles.luxeInput, { height: 80, textAlignVertical: 'top' }]}
                                    value={formData.notes}
                                    multiline
                                    onChangeText={(t) => setFormData({ ...formData, notes: t })}
                                    placeholder="How are you feeling this week?"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <Button style={styles.luxeSubmitBtn} onPress={handleSubmit}>
                            {editingEntry ? "Update Entry" : "Save Progress"}
                        </Button>
                    </ScrollView>
                </DialogContent>
            </Dialog>
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
    overviewCard: {
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: '#ec4899',
        elevation: 8,
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    overviewGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    overviewContent: {
        padding: 32,
        alignItems: 'center',
    },
    weekBadge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 16
    },
    weekNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    weekLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        marginBottom: 32,
    },
    infoItem: {
        alignItems: 'center',
        width: 100,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 20,
    },
    updateBtn: {
        backgroundColor: '#fff',
        borderRadius: 20,
        height: 48,
        paddingHorizontal: 24,
    },
    updateBtnText: {
        color: '#ec4899',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    toolsSection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    toolsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    toolItem: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    toolIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    toolDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    historySection: {
        marginTop: 32,
        marginBottom: 40,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: '#ec4899',
        fontWeight: '600',
    },
    historyCard: {
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 12
    },
    historyWeek: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    historyWeekNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    historyWeekLabel: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    historyInfo: {
        flex: 1,
    },
    historyDate: {
        fontSize: 12,
        color: '#64748b',
    },
    historyStats: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginTop: 2,
    },
    historyNotes: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 4,
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(241, 245, 249, 0.5)',
        borderRadius: 24,
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 12,
    },
    historyActions: {
        flexDirection: 'row',
        gap: 8,
    },
    historyBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    // Dialog
    luxeDialog: { borderRadius: 32, padding: 24, width: '90%', alignSelf: 'center' },
    dialogForm: { marginTop: 20 },
    inputGroup: { marginBottom: 20 },
    luxeInputLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 8, marginLeft: 4 },
    luxeInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    luxeInput: { flex: 1, height: 50, fontSize: 15, color: '#1e293b', paddingLeft: 12 },
    inputGrid: { flexDirection: 'row', gap: 12 },
    luxeSubmitBtn: { height: 56, borderRadius: 20, backgroundColor: '#ec4899', marginTop: 12 },
});
