import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { Baby, Footprints, Timer, TrendingUp, Plus, ChevronRight, Scale, Ruler } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { pregnancyAPI, PregnancyProgressResponse } from "../lib/api/pregnancy";
import { useToast } from "../context/ToastContext";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

export const PregnancyTracker = () => {
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const [progress, setProgress] = useState<PregnancyProgressResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                            <Button variant="outline" style={styles.updateBtn} onPress={() => {/* Add Log */ }}>
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
                        <Pressable style={styles.toolItem} onPress={() => {/* Nav to Kicks */ }}>
                            <View style={[styles.toolIcon, { backgroundColor: '#fdf2f8' }]}>
                                <Footprints size={28} color="#ec4899" />
                            </View>
                            <Text style={styles.toolName}>Kick Counter</Text>
                            <Text style={styles.toolDesc}>Track baby's movements</Text>
                        </Pressable>

                        <Pressable style={styles.toolItem} onPress={() => {/* Nav to Contractions */ }}>
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
                        <Pressable><Text style={styles.viewAllText}>View All</Text></Pressable>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#ec4899" />
                    ) : progress.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Baby size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No progress logged yet.</Text>
                        </View>
                    ) : (
                        progress.slice(0, 3).map((item, index) => (
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
                                        <ChevronRight size={20} color="#cbd5e1" />
                                    </CardContent>
                                </Card>
                            </Animated.View>
                        ))
                    )}
                </View>
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
        marginBottom: 24,
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
        fontSize: 20,
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
    }
});
