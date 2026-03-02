import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PageContainer } from '../components/common/PageContainer';
import { Lightbulb, Send, CheckCircle, MessageSquarePlus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const GUIDELINES = [
    {
        icon: CheckCircle,
        title: 'Be Specific',
        description: 'Clearly describe the feature you would like to see. Include details about what it should do and how it would help you.',
    },
    {
        icon: MessageSquarePlus,
        title: 'Describe the Problem',
        description: 'Explain the problem or need this feature would address. Understanding the "why" helps us prioritize better.',
    },
    {
        icon: Lightbulb,
        title: 'Share Your Ideas',
        description: 'If you have ideas about how the feature could work or look, feel free to share! Sketches, examples, or references are welcome.',
    },
];

export const FeatureRequest = () => {
    const { user } = useAuth();
    const username = user?.name || user?.username || 'User';

    const handleSubmitRequest = () => {
        const subject = encodeURIComponent(`Feature Request by ${username}`);
        const body = encodeURIComponent(
            `Hi Nova Team,\n\nI would like to request the following feature:\n\n` +
            `Feature Description:\n[Describe the feature here]\n\n` +
            `Why this would be helpful:\n[Explain the problem or need]\n\n` +
            `Any additional ideas or references:\n[Share your thoughts]\n\n` +
            `Thank you!\n${username}`
        );
        Linking.openURL(`mailto:offclockengineers@gmail.com?subject=${subject}&body=${body}`);
    };

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title="Feature Request" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Lightbulb size={32} color="#ffffff" />
                    </View>
                    <Text style={styles.headerTitle}>Have an idea?</Text>
                    <Text style={styles.headerSubtitle}>
                        We'd love to hear your suggestions! Help us make Nova better by requesting new features.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How to Request a Feature</Text>
                    {GUIDELINES.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <View key={index} style={styles.guidelineCard}>
                                <View style={styles.guidelineIconContainer}>
                                    <Icon size={22} color="#ec4899" />
                                </View>
                                <View style={styles.guidelineContent}>
                                    <Text style={styles.guidelineTitle}>{item.title}</Text>
                                    <Text style={styles.guidelineDescription}>{item.description}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ready to share?</Text>
                    <Text style={styles.readyDescription}>
                        Tap the button below to open your email app with a pre-filled template. Just fill in the details and hit send!
                    </Text>
                    <Pressable style={styles.submitButton} onPress={handleSubmitRequest}>
                        <Send size={20} color="#ffffff" style={{ marginRight: 10 }} />
                        <Text style={styles.submitButtonText}>Request a Feature</Text>
                    </Pressable>
                </View>

                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>💡 Good to know</Text>
                    <Text style={styles.noteText}>
                        We review every feature request and prioritize based on community demand. Popular requests are more likely to be implemented sooner!
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
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ec4899',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 16,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    guidelineCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    guidelineIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fdf2f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guidelineContent: {
        flex: 1,
        marginLeft: 14,
    },
    guidelineTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    guidelineDescription: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 19,
    },
    readyDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 20,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#ec4899',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    noteCard: {
        marginTop: 32,
        backgroundColor: '#fffbeb',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    noteTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 6,
    },
    noteText: {
        fontSize: 13,
        color: '#a16207',
        lineHeight: 19,
    },
});
