import { apiRequest } from '../http';

export const notificationsAPI = {
    registerDeviceToken: async (token: string) => {
        return await apiRequest<{ message: string }>(`/notifications/device-token?token=${encodeURIComponent(token)}`, {
            method: 'POST',
        });
    },
};
