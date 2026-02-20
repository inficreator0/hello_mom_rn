import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, FlatList } from 'react-native';
import { Bell, Trash2, CheckCircle2, ChevronRight, Inbox } from 'lucide-react-native';
import { PageContainer } from '../components/common/PageContainer';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import * as Notifications from 'expo-notifications';
import { useNotifications, InAppNotification } from '../context/NotificationContext';
import { formatLocalTime } from '../lib/utils/dateUtils';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

export const NotificationInbox = () => {
    const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();

    const renderItem = ({ item, index }: { item: InAppNotification; index: number }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 50)}
            layout={Layout.springify()}
        >
            <Pressable onPress={() => markAsRead(item.id)}>
                <Card style={[styles.notifCard, !item.read && styles.unreadCard]}>
                    <CardContent style={styles.cardContent}>
                        <View style={[styles.iconContainer, { backgroundColor: item.read ? '#f1f5f9' : '#ec4899' }]}>
                            <Bell size={20} color={item.read ? '#64748b' : '#fff'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                            <Text style={styles.time}>{formatLocalTime(item.timestamp)}</Text>
                        </View>
                        {!item.read && <View style={styles.unreadDot} />}
                        <ChevronRight size={18} color="#cbd5e1" />
                    </CardContent>
                </Card>
            </Pressable>
        </Animated.View>
    );

    const triggerTestNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Hello Mom! 👋",
                body: "Testing our new notification system. It works!",
                data: { screen: 'Community' },
            },
            trigger: null, // immediate
        });
    };

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title="Notifications"
                rightElement={
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable onPress={triggerTestNotification} style={styles.clearBtn}>
                            <Bell size={18} color="#ec4899" />
                        </Pressable>
                        {notifications.length > 0 && (
                            <Pressable onPress={clearAll} style={styles.clearBtn}>
                                <Trash2 size={18} color="#ef4444" />
                            </Pressable>
                        )}
                    </View>
                }
            />

            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconCircle}>
                        <Inbox size={48} color="#cbd5e1" />
                    </View>
                    <Text style={styles.emptyTitle}>Your inbox is empty</Text>
                    <Text style={styles.emptySubtitle}>We'll notify you about important updates and reminders here.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    notifCard: {
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    unreadCard: {
        borderColor: '#fdf2f8',
        backgroundColor: '#fffbff',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    unreadTitle: {
        color: '#1e293b',
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    time: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ec4899',
        marginHorizontal: 8,
    },
    clearBtn: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    }
});
