import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AnimatedHeart } from "../components/ui/AnimatedHeart";
import { PageContainer } from "../components/common/PageContainer";
import { authAPI } from "../lib/api/auth";
import { useToast } from "../context/ToastContext";

export const ResetPassword = () => {
    const route = useRoute<any>();
    const [token, setToken] = useState(route.params?.token || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigation = useNavigation<any>();
    const { showToast } = useToast();

    // Update token if it changes in route params
    useEffect(() => {
        if (route.params?.token) {
            setToken(route.params.token);
        }
    }, [route.params?.token]);

    const handleSubmit = async () => {
        if (!token) {
            setError("Invalid or missing reset token. Please use the link sent to your email.");
            return;
        }

        if (!newPassword.trim()) {
            setError("Please enter a new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            await authAPI.resetPassword({ token: token.trim(), newPassword });
            showToast("Password reset successfully!", "success");
            navigation.navigate("Login");
        } catch (err: any) {
            setError(err.message || "Failed to reset password. The token might be invalid or expired.");
        } finally {
            setIsLoading(false);
        }
    };

    const isTokenMissing = !token;

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
                            <View style={styles.iconContainer}>
                                <AnimatedHeart size={40} />
                            </View>
                            <CardTitle style={styles.cardTitle}>
                                {isTokenMissing ? "Invalid Link" : "Create New Password"}
                            </CardTitle>
                            <CardDescription style={styles.cardDescription}>
                                {isTokenMissing
                                    ? "This password reset link appears to be invalid or expired. Please request a new one."
                                    : "Enter your new password below ."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent style={styles.cardContent}>
                            {!isTokenMissing ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Input
                                            placeholder="New Password *"
                                            secureTextEntry
                                            showPasswordToggle
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            editable={!isLoading}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Input
                                            placeholder="Confirm New Password *"
                                            secureTextEntry
                                            showPasswordToggle
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            editable={!isLoading}
                                        />
                                    </View>

                                    {error ? (
                                        <View style={styles.errorContainer}>
                                            <Text style={styles.errorText}>{error}</Text>
                                        </View>
                                    ) : null}

                                    <Button
                                        style={styles.submitButton}
                                        onPress={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={styles.buttonText}>Reset Password</Text>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <View style={styles.errorContainer}>
                                    <Text style={[styles.errorText, { textAlign: 'center' }]}>
                                        Token missing. Please check your email for the correct reset link.
                                    </Text>
                                </View>
                            )}

                            <Button
                                variant="outline"
                                style={styles.backButton}
                                onPress={() => navigation.navigate("Login")}
                                disabled={isLoading}
                            >
                                Back to Login
                            </Button>
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
        backgroundColor: 'transparent',
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
    },
    card: {
        width: '100%',
    },
    cardHeader: {
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 20,
        borderRadius: 9999,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#0f172a',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 16,
        textAlign: 'center',
        color: '#64748b',
        paddingHorizontal: 16,
    },
    cardContent: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#0f172a',
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
    },
    submitButton: {
        width: '100%',
        height: 48,
        marginTop: 8,
    },
    backButton: {
        width: '100%',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
