import { apiRequest } from '../http';
import { NotificationSettings } from '../../types';

export const notificationsAPI = {
    registerDeviceToken: async (token: string) => {
        return await apiRequest<{ message: string }>(`/notifications/device-token?token=${encodeURIComponent(token)}`, {
            method: 'POST',
        });
    },

    getSettings: async () => {
        return await apiRequest<NotificationSettings>('/notifications/settings', {
            method: 'GET',
        });
    },

    updateSettings: async (settings: NotificationSettings) => {
        return await apiRequest<NotificationSettings>('/notifications/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    testNotification: async (username: string, title?: string, message?: string) => {
        let url = `/notifications/test-user?username=${encodeURIComponent(username)}`;
        if (title) url += `&title=${encodeURIComponent(title)}`;
        if (message) url += `&message=${encodeURIComponent(message)}`;
        return await apiRequest<string>(url, {
            method: 'POST',
        });
    },
};
