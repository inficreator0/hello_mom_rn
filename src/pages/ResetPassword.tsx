import { useState } from "react";
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Heart } from "lucide-react-native";
import { PageContainer } from "../components/common/PageContainer";
import { authAPI } from "../lib/api/auth";
import { useToast } from "../context/ToastContext";

export const ResetPassword = () => {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { showToast } = useToast();

    // Optionally get token from route params if deep linked
    useState(() => {
        if (route.params?.token) {
            setToken(route.params.token);
        }
    });

    const handleSubmit = async () => {
        if (!token.trim() || !newPassword.trim()) {
            setError("Please fill in all fields.");
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
                                <Heart size={40} color="#ec4899" fill="#ec4899" />
                            </View>
                            <CardTitle style={styles.cardTitle}>Create New Password</CardTitle>
                            <CardDescription style={styles.cardDescription}>
                                Enter the token from your email and your new password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent style={styles.cardContent}>
                            <View style={styles.inputGroup}>
                                <Input
                                    placeholder="Reset Token *"
                                    value={token}
                                    onChangeText={setToken}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Input
                                    placeholder="New Password *"
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Input
                                    placeholder="Confirm New Password *"
                                    secureTextEntry
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
        fontSize: 20,
        textAlign: 'center',
    },
    cardDescription: {
        textAlign: 'center',
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
