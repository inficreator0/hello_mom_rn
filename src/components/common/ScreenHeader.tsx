import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, Bell, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationContext';

interface ScreenHeaderProps {
    title: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    showBackButton?: boolean;
    showNotificationBell?: boolean;
    showMenuButton?: boolean;
}

export const ScreenHeader = ({
    title,
    onBack,
    rightElement,
    showBackButton = true,
    showNotificationBell = true,
    showMenuButton = false
}: ScreenHeaderProps) => {
    const navigation = useNavigation<any>();
    const { unreadCount } = useNotifications();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const canGoBack = navigation.canGoBack() && showBackButton;

    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                {canGoBack && (
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color="#ffffff" />
                    </Pressable>
                )}
                {showMenuButton && (
                    <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
                        <Menu size={24} color="#ffffff" />
                    </Pressable>
                )}
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>

            <View style={styles.rightSection}>
                {rightElement || (showNotificationBell && (
                    <Pressable
                        onPress={() => navigation.navigate("NotificationInbox")}
                        style={styles.notifButton}
                    >
                        <Bell size={24} color="#ffffff" />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#603c58ff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
        zIndex: 10,
    },
    leftSection: {
        minWidth: 0,
        justifyContent: 'center',
    },
    rightSection: {
        minWidth: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    backButton: {
        marginLeft: -8,
        padding: 8,
        marginRight: 8,
    },
    menuButton: {
        marginLeft: -8,
        padding: 8,
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    notifButton: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#603c58ff',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});
