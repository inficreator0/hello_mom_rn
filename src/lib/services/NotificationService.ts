import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const NotificationService = {
    /**
     * Primary method to retrieve the Expo Push Token.
     * This is how we unique identify the device for push notifications.
     */
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                alert('Permission denied for notifications');
                return null;
            }

            // Project ID is required for SDK 52
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data;
                console.log("Expo push token:", token);
            } catch (e) {
                console.error("Error fetching push token", e);
            }
        } else {
            alert("Must use physical device for push notifications");
        }

        return token;
    },

    // Setup listeners for when notifications are received or interacted with
    addNotificationListeners: (
        onReceived: (notification: Notifications.Notification) => void,
        onResponse: (response: Notifications.NotificationResponse) => void
    ) => {
        const notificationListener = Notifications.addNotificationReceivedListener(onReceived);
        const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }
};
