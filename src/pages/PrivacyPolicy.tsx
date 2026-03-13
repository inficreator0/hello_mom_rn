import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PageContainer } from '../components/common/PageContainer';
import { ScreenHeader } from '../components/common/ScreenHeader';

export const PrivacyPolicy = () => {
    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title="Privacy Policy" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.text}>Effective Date: March 13, 2026</Text>
                    <Text style={styles.text}>Last Updated: March 13, 2026</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.text}>
                        Welcome to the Nova Community App ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines our practices regarding the collection, use, disclosure, and protection of your data when you use our mobile application (the "App") and related services.
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        By downloading, accessing, or using the App, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the App.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. HEALTH AND MEDICAL DISCLAIMER (CRITICAL)</Text>
                    <Text style={styles.text}>
                        The Nova Community App is NOT a medical device, and the services provided are NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        The App providing informational content, community forums, and health tracking tools (such as pregnancy progress, contraction timing, fetal kicks, weight tracking, and menstrual cycle tracking) is for educational and personal organization purposes only.
                    </Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>Always seek the advice of your physician, obstetrician, or other qualified healthcare provider with any questions you may have regarding a medical condition or your pregnancy.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>Never disregard professional medical advice or delay in seeking it because of something you have read or tracked on this App.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>In the event of a medical emergency, call your doctor or emergency services (e.g., 911) immediately.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.text}>
                        We collect information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with you ("Personal Data").
                    </Text>

                    <Text style={[styles.text, styles.boldText, { marginTop: 8 }]}>A. Information You Voluntarily Provide</Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Account Data:</Text> When you register, we collect your name, username, email address, password, and profile picture.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Sensitive Health Data:</Text> To provide the core functionality of our trackers, you may voluntarily input sensitive physical and health-related data, including but not limited to: pregnancy due dates, menstrual cycle dates, contraction frequency/duration, fetal movement logs, and weight logs.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>User-Generated Content:</Text> Any posts, comments, likes, or other content you voluntarily publish in the public community forums within the App. Note: Content posted in public forums is visible to all registered users. Do not share sensitive health information in public forums unless you intend for it to be public.</Text>
                        </View>
                    </View>

                    <Text style={[styles.text, styles.boldText, { marginTop: 8 }]}>B. Information Collected Automatically</Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Device & Usage Data:</Text> We automatically collect certain information when you access the App, including your device's Internet Protocol (IP) address, device type, operating system version, unique device identifiers, and diagnostic data regarding your interaction with the App (e.g., time and date of use, articles viewed).</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.text}>
                        We strictly limit the use of your Personal Data and Sensitive Health Data to the following purposes:
                    </Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>To Provide and Maintain the App:</Text> Including creating your account, facilitating secure login (via JWT tokens), and enabling the functionality of the health trackers.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>To Protect User Security:</Text> We use your email address to send verification emails and password reset links to ensure the security of your account.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>To Foster Community Interaction:</Text> Your username and profile picture are used to identify you in the community forums when you choose to post or comment.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>To Comply with Legal Obligations:</Text> We may use your data as required by applicable laws, legal processes, or governmental requests.</Text>
                        </View>
                    </View>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        We DO NOT sell, rent, lease, or trade your Personal Data or Sensitive Health Data to third parties, data brokers, or advertisers.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. How We Share Your Information</Text>
                    <Text style={styles.text}>
                        We only share your information with trusted third parties under the following strict conditions:
                    </Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Service Providers:</Text> We employ third-party companies and individuals to facilitate our App (e.g., database hosting, email delivery). These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Hosting:</Text> Our backend infrastructure and databases are securely hosted on Amazon Web Services (AWS).</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Email Delivery:</Text> We use Google (Gmail SMTP) to transmit account verification emails. You can review Google's Privacy Policy here: https://policies.google.com/privacy.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Legal Requirements:</Text> We may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, prevent or investigate possible wrongdoing in connection with the App, or protect the personal safety of users or the public.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Data Security</Text>
                    <Text style={styles.text}>
                        We prioritize the security of your Personal Data and Sensitive Health Data. We have implemented commercially reasonable and appropriate technical, administrative, and physical security measures designed to protect your data from unauthorized access, disclosure, alteration, or destruction. These include:
                    </Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>Secure HTTPS/SSL encryption for data in transit.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>JWT authentication for secure API access.</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}>Password hashing and secure database storage.</Text>
                        </View>
                    </View>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Data Retention and Account Deletion</Text>
                    <Text style={styles.text}>
                        We retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        <Text style={styles.boldText}>Your Right to Deletion (Right to be Forgotten):</Text> You have the right to request the complete deletion of your account and all associated Personal and Sensitive Health Data at any time.
                    </Text>
                    <View style={styles.bulletList}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>In-App Deletion:</Text> You may permanently delete your account and all associated data directly by navigating to the "Settings" or "Profile" section within the App and selecting "Delete Account."</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.bulletText}><Text style={styles.boldText}>Manual Request:</Text> Alternatively, you may contact us at offclockengineers@gmail.com with the subject line "Account Deletion Request." We will process your request and permanently delete or anonymize your data within 30 days.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Children's Privacy (COPPA Compliance)</Text>
                    <Text style={styles.text}>
                        Our App is intended for adult users. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us immediately. If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we will take immediate steps to remove that information from our servers.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Your Regional Privacy Rights</Text>
                    <Text style={styles.text}>
                        <Text style={styles.boldText}>For California Residents (CCPA/CPRA):</Text> You have the right to request know what personal information we collect, use, and disclose. You have the right to request the deletion of your personal information. We explicitly state that we do not sell your personal information.
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        <Text style={styles.boldText}>For European Economic Area (EEA) Residents (GDPR):</Text> If you are a resident of the EEA, you have certain data protection rights, including the right to access, update, or delete the information we have on you, the right of rectification, the right to object, the right of restriction, and the right to data portability. We process your data based on your explicit consent and the necessity to provide the App's services.
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        To exercise any of these rights, please contact us at offclockengineers@gmail.com.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Changes to This Privacy Policy</Text>
                    <Text style={styles.text}>
                        We reserve the right to update or change our Privacy Policy at any time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date." You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Contact Us</Text>
                    <Text style={styles.text}>
                        If you have any questions, concerns, or requests regarding this Privacy Policy, your health data, or our practices, please contact us at:
                    </Text>
                    <Text style={[styles.text, { marginTop: 8 }]}>
                        Email: offclockengineers@gmail.com
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
        paddingTop: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    text: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    disclaimerText: {
        fontSize: 14,
        color: '#b45309', // amber-700
        backgroundColor: '#fef3c7', // amber-50
        padding: 16,
        borderRadius: 12,
        lineHeight: 22,
        borderWidth: 1,
        borderColor: '#fde68a', // amber-200
        overflow: 'hidden',
    },
    boldText: {
        fontWeight: 'bold',
    },
    bulletList: {
        marginTop: 8,
        paddingLeft: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 14,
        color: '#475569',
        marginRight: 8,
        lineHeight: 22,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    }
});
