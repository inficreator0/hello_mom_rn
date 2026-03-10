import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PageContainer } from '../components/common/PageContainer';
import { Download, RefreshCw, CheckCircle, AlertCircle, Info, Smartphone } from 'lucide-react-native';
import { useAppUpdates } from '../hooks/useAppUpdates';
import pkg from '../../package.json';

export const AppUpdates = () => {
    const {
        isChecking,
        isDownloading,
        updateAvailable,
        error,
        lastChecked,
        isDevMode,
        updateId,
        channel,
        checkForUpdate,
        downloadAndApply,
    } = useAppUpdates();

    const formatTime = (date: Date | null) => {
        if (!date) return 'Never';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title="App Updates" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Info Header */}
                <View style={styles.header}>
                    <View style={styles.appIconContainer}>
                        <Smartphone size={32} color="#ffffff" />
                    </View>
                    <Text style={styles.appName}>Nova</Text>
                    <Text style={styles.appVersion}>Version {pkg.version}</Text>
                </View>

                {/* Dev Mode Warning */}
                {isDevMode && (
                    <View style={styles.devWarning}>
                        <AlertCircle size={18} color="#d97706" />
                        <Text style={styles.devWarningText}>
                            OTA updates are not available in development mode. Build a preview or production version to test updates.
                        </Text>
                    </View>
                )}

                {/* Current Update Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Build</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>App Version</Text>
                            <Text style={styles.infoValue}>{pkg.version}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Update ID</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {updateId?.slice(0, 12) || 'Embedded'}
                            </Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Channel</Text>
                            <Text style={styles.infoValue}>
                                {channel || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Last Checked</Text>
                            <Text style={styles.infoValue}>{formatTime(lastChecked)}</Text>
                        </View>
                    </View>
                </View>

                {/* Update Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Status</Text>

                    {/* Status Card */}
                    <View style={[
                        styles.statusCard,
                        updateAvailable ? styles.statusCardUpdate : styles.statusCardOk
                    ]}>
                        {updateAvailable ? (
                            <>
                                <Download size={28} color="#ec4899" />
                                <View style={styles.statusTextContainer}>
                                    <Text style={styles.statusTitle}>Update Available!</Text>
                                    <Text style={styles.statusDescription}>
                                        A new version is ready to download. Tap the button below to update.
                                    </Text>
                                </View>
                            </>
                        ) : lastChecked ? (
                            <>
                                <CheckCircle size={28} color="#22c55e" />
                                <View style={styles.statusTextContainer}>
                                    <Text style={styles.statusTitle}>You're up to date</Text>
                                    <Text style={styles.statusDescription}>
                                        No updates available. You're running the latest version.
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <Info size={28} color="#64748b" />
                                <View style={styles.statusTextContainer}>
                                    <Text style={styles.statusTitle}>Check for updates</Text>
                                    <Text style={styles.statusDescription}>
                                        Tap the button below to check for available updates.
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Error */}
                    {error && !isDevMode && (
                        <View style={styles.errorContainer}>
                            <AlertCircle size={16} color="#dc2626" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    {updateAvailable ? (
                        <Pressable
                            style={[styles.actionButton, styles.downloadButton]}
                            onPress={downloadAndApply}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text style={styles.actionButtonText}>  Downloading & Installing...</Text>
                                </>
                            ) : (
                                <>
                                    <Download size={20} color="#ffffff" />
                                    <Text style={styles.actionButtonText}>  Download & Install</Text>
                                </>
                            )}
                        </Pressable>
                    ) : (
                        <Pressable
                            style={[styles.actionButton, styles.checkButton, isDevMode && styles.disabledButton]}
                            onPress={checkForUpdate}
                            disabled={isChecking || isDevMode}
                        >
                            {isChecking ? (
                                <>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text style={styles.actionButtonText}>  Checking...</Text>
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={20} color="#ffffff" />
                                    <Text style={styles.actionButtonText}>  Check for Updates</Text>
                                </>
                            )}
                        </Pressable>
                    )}
                </View>

                {/* Info Note */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>ℹ️ About Updates</Text>
                    <Text style={styles.noteText}>
                        We regularly release updates with new features, bug fixes, and performance improvements. Updates are downloaded in the background and applied when you restart the app.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    appIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: '#ec4899',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 14,
    },
    appVersion: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    devWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fef3c7',
        borderRadius: 12,
        padding: 14,
        marginTop: 20,
        gap: 10,
    },
    devWarningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 19,
    },
    section: {
        marginTop: 28,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 14,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        maxWidth: '50%',
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 16,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 14,
    },
    statusCardUpdate: {
        backgroundColor: '#fdf2f8',
        borderColor: '#fce7f3',
    },
    statusCardOk: {
        backgroundColor: '#f0fdf4',
        borderColor: '#dcfce7',
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    statusDescription: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 19,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#dc2626',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkButton: {
        backgroundColor: '#6366f1',
    },
    downloadButton: {
        backgroundColor: '#ec4899',
    },
    disabledButton: {
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    noteCard: {
        marginTop: 28,
        backgroundColor: '#f0f9ff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0f2fe',
    },
    noteTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0c4a6e',
        marginBottom: 6,
    },
    noteText: {
        fontSize: 13,
        color: '#0369a1',
        lineHeight: 19,
    },
});
