import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/bottom-sheet';
import { Button } from './ui/button';
import { Download, RefreshCw, CheckCircle } from 'lucide-react-native';
import * as Updates from 'expo-updates';

export const UpdateBottomSheet = () => {
    const [visible, setVisible] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (__DEV__) return;

        const checkOnStartup = async () => {
            try {
                const result = await Updates.checkForUpdateAsync();
                if (result.isAvailable) {
                    setVisible(true);
                }
            } catch (e) {
                // Silently fail on startup check
                console.log('[UpdateBottomSheet] Startup check failed:', e);
            }
        };

        // Small delay to let the app settle before checking
        const timer = setTimeout(checkOnStartup, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleUpdate = useCallback(async () => {
        setIsDownloading(true);
        setError(null);
        try {
            await Updates.fetchUpdateAsync();
            setDownloadComplete(true);
            // Short delay to show success state, then reload
            setTimeout(async () => {
                await Updates.reloadAsync();
            }, 1000);
        } catch (e: any) {
            setIsDownloading(false);
            setError(e.message || 'Failed to download update.');
        }
    }, []);

    // Prevent dismissal - this is a forced update
    const handleOpenChange = useCallback((_open: boolean) => {
        // Do not allow closing
    }, []);

    if (!visible) return null;

    return (
        <Sheet open={visible} onOpenChange={handleOpenChange}>
            <SheetContent style={styles.content}>
                <SheetHeader style={styles.header}>
                    <SheetTitle>Update Available</SheetTitle>
                </SheetHeader>

                <View style={styles.body}>
                    <View style={styles.iconContainer}>
                        {downloadComplete ? (
                            <CheckCircle size={48} color="#22c55e" />
                        ) : isDownloading ? (
                            <ActivityIndicator size="large" color="#ec4899" />
                        ) : (
                            <Download size={48} color="#ec4899" />
                        )}
                    </View>

                    <Text style={styles.title}>
                        {downloadComplete
                            ? 'Update Ready!'
                            : isDownloading
                                ? 'Downloading Update...'
                                : 'A New Version is Available'}
                    </Text>

                    <Text style={styles.description}>
                        {downloadComplete
                            ? 'The app will restart momentarily to apply the update.'
                            : isDownloading
                                ? 'Please wait while we download the latest version. This may take a moment.'
                                : 'We\'ve made improvements and fixes to give you a better experience. Please update to continue.'}
                    </Text>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {!downloadComplete && (
                        <Button
                            onPress={handleUpdate}
                            style={styles.updateButton}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <View style={styles.buttonContent}>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text style={styles.buttonText}>  Downloading...</Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContent}>
                                    <RefreshCw size={18} color="#ffffff" />
                                    <Text style={styles.buttonText}>  Update Now</Text>
                                </View>
                            )}
                        </Button>
                    )}
                </View>
            </SheetContent>
        </Sheet>
    );
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: 350,
        width: '100%',
    },
    header: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 8,
    },
    body: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    iconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#fdf2f8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        fontSize: 13,
        color: '#dc2626',
        textAlign: 'center',
    },
    updateButton: {
        width: '100%',
        paddingVertical: 14,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
