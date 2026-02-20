import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AnimatedHeart } from "../components/ui/AnimatedHeart";
import { PageContainer } from "../components/common/PageContainer";
import { authAPI } from "../lib/api/auth";
import { useToast } from "../context/ToastContext";
import { CheckCircle2, AlertCircle, Mail } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

const VerifyEmail = () => {
    const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">("pending");
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { showToast } = useToast();
    const { logout, isAuthenticated, checkOnboardingStatus } = useAuth();

    const email = route.params?.email;
    const token = route.params?.token;

    useEffect(() => {
        if (token) {
            handleAutoVerify(token);
        }
    }, [token]);

    // Auto-redirect on success
    useEffect(() => {
        if (status === "success") {
            const timeout = setTimeout(async () => {
                if (isAuthenticated) {
                    await logout();
                }
                navigation.navigate("Login");
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [status, isAuthenticated]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleAutoVerify = async (verificationToken: string) => {
        setStatus("verifying");
        setError("");
        try {
            await authAPI.verifyEmail(verificationToken);
            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setError(err.message || "The verification link is invalid or has expired.");
        }
    };

    const handleResend = async () => {
        if (timer > 0 || !email) return;

        setResendLoading(true);
        try {
            await authAPI.resendVerification(email);
            showToast("Verification link resent!", "success");
            setTimer(60);
        } catch (err: any) {
            showToast(err.message || "Failed to resend verification link.", "error");
        } finally {
            setResendLoading(false);
        }
    };

    const handleBackToLogin = async () => {
        if (isAuthenticated) {
            await logout();
        }
        navigation.navigate("Login");
    };

    const renderContent = () => {
        if (status === "verifying") {
            return (
                <View style={styles.statusContainer}>
                    <ActivityIndicator color="#ec4899" size="large" />
                    <Text style={styles.statusText}>Verifying your email...</Text>
                </View>
            );
        }

        if (status === "success") {
            return (
                <Animated.View entering={FadeIn} style={styles.statusContainer}>
                    <Animated.View entering={ZoomIn.delay(200)}>
                        <CheckCircle2 color="#10b981" size={80} />
                    </Animated.View>
                    <Text style={[styles.statusText, { color: "#10b981" }]}>Email Verified!</Text>
                    <Text style={styles.successDescription}>
                        Verification successful. We are redirecting you to the sign-in page...
                    </Text>
                    <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
                </Animated.View>
            );
        }

        if (status === "error") {
            return (
                <View style={styles.statusContainer}>
                    <AlertCircle color="#ef4444" size={60} />
                    <Text style={[styles.statusText, { color: "#ef4444" }]}>Verification Failed</Text>
                    <Text style={styles.errorDescription}>{error}</Text>
                    <Button style={styles.retryButton} onPress={() => token && handleAutoVerify(token)}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </Button>
                    <Pressable onPress={handleBackToLogin} style={styles.backToLogin}>
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.pendingContainer}>
                <View style={styles.mailIconContainer}>
                    <Mail size={48} color="#ec4899" />
                </View>
                <Text style={styles.pendingMainText}>
                    Verification mail has been sent to your email.
                </Text>
                <Text style={styles.pendingSubText}>
                    Please click the link in the email to verify your account.
                </Text>

                {email && (
                    <View style={styles.emailBadge}>
                        <Text style={styles.emailHighlighted}>{email}</Text>
                    </View>
                )}

                <View style={styles.resendSection}>
                    <Text style={styles.resendLabel}>Didn't receive the email?</Text>
                    <Pressable
                        onPress={handleResend}
                        disabled={timer > 0 || resendLoading || !email}
                    >
                        <Text style={[styles.resendText, (timer > 0 || !email) && styles.disabledText]}>
                            {resendLoading ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend Link"}
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={handleBackToLogin}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>Back to Login</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <PageContainer style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Card style={styles.card}>
                        <CardHeader style={styles.cardHeader}>
                            <View style={styles.heartContainer}>
                                <AnimatedHeart size={32} />
                            </View>
                            <CardTitle style={styles.cardTitle}>Email Verification</CardTitle>
                        </CardHeader>
                        <CardContent style={styles.cardContent}>
                            {renderContent()}
                        </CardContent>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        borderRadius: 24,
        paddingVertical: 10,
    },
    cardHeader: {
        alignItems: "center",
        paddingBottom: 20,
    },
    heartContainer: {
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        padding: 15,
        borderRadius: 999,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
        textAlign: "center",
    },
    cardContent: {
        paddingTop: 0,
    },
    statusContainer: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 10,
    },
    statusText: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 20,
        textAlign: "center",
    },
    successDescription: {
        textAlign: "center",
        color: "#64748b",
        marginTop: 15,
        lineHeight: 22,
        fontSize: 16,
    },
    errorDescription: {
        textAlign: "center",
        color: "#ef4444",
        marginTop: 12,
        lineHeight: 20,
        marginBottom: 24,
        fontSize: 14,
    },
    retryButton: {
        width: "100%",
        height: 50,
        borderRadius: 12,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
    pendingContainer: {
        alignItems: "center",
        paddingVertical: 10,
    },
    mailIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(236, 72, 153, 0.05)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    pendingMainText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
        textAlign: "center",
        marginBottom: 12,
        lineHeight: 26,
    },
    pendingSubText: {
        fontSize: 15,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    emailBadge: {
        backgroundColor: "#f8fafc",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 32,
    },
    emailHighlighted: {
        color: "#ec4899",
        fontWeight: "bold",
        fontSize: 15,
    },
    resendSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
    },
    resendLabel: {
        color: "#64748b",
        fontSize: 14,
    },
    resendText: {
        color: "#ec4899",
        fontSize: 14,
        fontWeight: "600",
    },
    disabledText: {
        color: "#94a3b8",
    },
    backButton: {
        paddingVertical: 10,
    },
    backText: {
        color: "#64748b",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
    },
    backToLogin: {
        marginTop: 20,
    },
    backToLoginText: {
        color: "#64748b",
        fontSize: 14,
        fontWeight: "500",
        textDecorationLine: "underline",
    },
});

export default VerifyEmail;
