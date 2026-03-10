import { useState, useCallback } from 'react';
import * as Updates from 'expo-updates';

export interface AppUpdateState {
    isChecking: boolean;
    isDownloading: boolean;
    updateAvailable: boolean;
    error: string | null;
    lastChecked: Date | null;
}

export const useAppUpdates = () => {
    const [state, setState] = useState<AppUpdateState>({
        isChecking: false,
        isDownloading: false,
        updateAvailable: false,
        error: null,
        lastChecked: null,
    });

    const isDevMode = __DEV__;

    const checkForUpdate = useCallback(async () => {
        if (isDevMode) {
            setState(prev => ({
                ...prev,
                error: 'Updates are not available in development mode.',
                lastChecked: new Date(),
            }));
            return false;
        }

        setState(prev => ({ ...prev, isChecking: true, error: null }));

        try {
            const result = await Updates.checkForUpdateAsync();
            setState(prev => ({
                ...prev,
                isChecking: false,
                updateAvailable: result.isAvailable,
                lastChecked: new Date(),
            }));
            return result.isAvailable;
        } catch (e: any) {
            setState(prev => ({
                ...prev,
                isChecking: false,
                error: e.message || 'Failed to check for updates.',
                lastChecked: new Date(),
            }));
            return false;
        }
    }, [isDevMode]);

    const downloadAndApply = useCallback(async () => {
        if (isDevMode) return;

        setState(prev => ({ ...prev, isDownloading: true, error: null }));

        try {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (e: any) {
            setState(prev => ({
                ...prev,
                isDownloading: false,
                error: e.message || 'Failed to download update.',
            }));
        }
    }, [isDevMode]);

    return {
        ...state,
        isDevMode,
        updateId: Updates.updateId,
        channel: Updates.channel,
        runtimeVersion: Updates.runtimeVersion,
        checkForUpdate,
        downloadAndApply,
    };
};
