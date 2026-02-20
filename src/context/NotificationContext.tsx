import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../lib/services/NotificationService';
import { notificationsAPI } from '../lib/api/notifications';
import { useAuth } from './AuthContext';

export interface InAppNotification {
    id: string;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    data?: any;
}

interface NotificationContextType {
    pushToken: string | null;
    notifications: InAppNotification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (isAuthenticated) {
            // 1. Get Push Token
            NotificationService.registerForPushNotificationsAsync().then(async (token) => {
                if (token) {
                    setPushToken(token);
                    try {
                        await notificationsAPI.registerDeviceToken(token);
                        console.log("Device token registered with backend");
                    } catch (error) {
                        console.error("Failed to register device token with backend", error);
                    }
                }
            });

            // 2. Setup Listeners
            const cleanup = NotificationService.addNotificationListeners(
                (notification) => {
                    // Handle foreground notification
                    const newNotif: InAppNotification = {
                        id: notification.request.identifier,
                        title: notification.request.content.title ?? 'New Notification',
                        body: notification.request.content.body ?? '',
                        timestamp: Date.now(),
                        read: false,
                        data: notification.request.content.data,
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                },
                (response) => {
                    // Handle response (tap)
                    console.log('User tapped notification:', response.notification.request.content.data);
                    // Potential navigation logic here
                }
            );

            return cleanup;
        }
    }, [isAuthenticated]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const clearAll = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ pushToken, notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
