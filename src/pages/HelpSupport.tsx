import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PageContainer } from '../components/common/PageContainer';
import { Mail, MessageCircle, FileText, ChevronRight, HelpCircle } from 'lucide-react-native';

const FAQ_ITEMS = [
    {
        question: "How do I log my baby's feeding?",
        answer: "Go to the Trackers tab and select 'Baby Feeding'. You can log the time, duration, and side (left/right) for each feeding session."
    },
    {
        question: "Can I sync my data across multiple devices?",
        answer: "Yes, once you create an account and log in, your data is automatically synced to our secure cloud and will be available on any device you sign in to."
    },
    {
        question: "How do I update my pregnancy due date?",
        answer: "Go to your Profile, tap on settings if available or update your preferences in the onboarding section to set a new due date."
    },
    {
        question: "Is my data private and secure?",
        answer: "Absolutely. We use industry-standard encryption to protect your personal and health data. We never share your information with third parties without your explicit consent."
    }
];

export const HelpSupport = () => {
    const handleContactSupport = () => {
        Linking.openURL('mailto:offclockengineers@gmail.com');
    };

    const handleJoinCommunity = () => {
        // Navigate to community or external link
    };

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title="Help & Support" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <HelpCircle size={48} color="#ec4899" />
                    <Text style={styles.headerTitle}>How can we help you today?</Text>
                    <Text style={styles.headerSubtitle}>Search our FAQs or contact our support team.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {FAQ_ITEMS.map((item, index) => (
                        <View key={index} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{item.question}</Text>
                            <Text style={styles.faqAnswer}>{item.answer}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <Pressable style={styles.contactCard} onPress={handleContactSupport}>
                        <View style={[styles.contactIcon, { backgroundColor: '#f0f9ff' }]}>
                            <Mail size={24} color="#0ea5e9" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Email Support</Text>
                            <Text style={styles.contactSubtitle}>Get a response within 24 hours</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </Pressable>

                    {/* <Pressable style={styles.contactCard}>
                        <View style={[styles.contactIcon, { backgroundColor: '#fdf2f8' }]}>
                            <MessageCircle size={24} color="#ec4899" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Live Chat</Text>
                            <Text style={styles.contactSubtitle}>Available Mon-Fri, 9am - 5pm</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </Pressable> */}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal</Text>
                    <Pressable style={styles.contactCard}>
                        <View style={[styles.contactIcon, { backgroundColor: '#f8fafc' }]}>
                            <FileText size={24} color="#64748b" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Privacy Policy</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </Pressable>

                    <Pressable style={styles.contactCard}>
                        <View style={[styles.contactIcon, { backgroundColor: '#f8fafc' }]}>
                            <FileText size={24} color="#64748b" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Terms of Service</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </Pressable>
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
    headerTitle: {
        fontSize: 22,
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
    faqItem: {
        marginBottom: 24,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 16,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    contactSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
});
