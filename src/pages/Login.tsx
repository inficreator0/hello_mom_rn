import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AnimatedHeart } from "../components/ui/AnimatedHeart";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";

const Login = () => {
  const [mode, setModeState] = useState<"login" | "signup" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { login, register, isAuthenticated, isLoading: authLoading, isOnboarded, isCheckingOnboarding } = useAuth();
  const navigation = useNavigation<any>();
  const { onboardingCompleted } = usePreferences();
  const { authAPI } = require("../lib/api/auth"); // Inline or import at top

  // Handle navigation after successful login/register and onboarding check
  useEffect(() => {
    if (isAuthenticated && !authLoading && !isCheckingOnboarding && !isRegistered) {
      if (isOnboarded) {
        navigation.navigate("Main" as never);
      } else {
        navigation.navigate("Onboarding" as never);
      }
    }
  }, [isAuthenticated, isOnboarded, authLoading, isCheckingOnboarding, navigation, isRegistered]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(username, password);
        // Navigation will be handled by useEffect based on onboarding status
      } else if (mode === "signup") {
        if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
          setError("Please fill in all fields.");
          setIsLoading(false);
          return;
        }
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        setIsRegistered(true);
        navigation.navigate("VerifyEmail", { email: email.trim() });
      } else if (mode === "forgot") {
        if (!email.trim()) {
          setError("Please enter your email.");
          setIsLoading(false);
          return;
        }
        const res = await authAPI.forgotPassword(email.trim());
        setSuccess(res.message);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.authLoadingContainer}>
        <ActivityIndicator color="#ec4899" size="large" />
        <Text style={styles.authLoadingText}>Preparing Nova for you...</Text>
      </View>
    );
  }

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
                {mode === "forgot" ? "Reset Password" : "Welcome to Nova"}
              </CardTitle>
              <CardDescription style={styles.cardDescription}>
                {mode === "login"
                  ? "Sign in to access your community"
                  : mode === "signup"
                    ? "Create an account to join us"
                    : "Enter your email to receive a reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              {(mode === "signup" || mode === "forgot") && (
                <View style={styles.inputGroup}>
                  <Input
                    placeholder="Email Address *"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>
              )}

              {mode === "signup" && (
                <>
                  <View style={styles.inputGroup}>
                    <Input
                      placeholder="First Name *"
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Input
                      placeholder="Last Name *"
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!isLoading}
                    />
                  </View>
                </>
              )}

              {mode !== "forgot" && (
                <>
                  <View style={styles.inputGroup}>
                    <Input
                      placeholder="Username *"
                      autoCapitalize="none"
                      value={username}
                      onChangeText={setUsername}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Input
                      placeholder="Password *"
                      secureTextEntry
                      showPasswordToggle
                      value={password}
                      onChangeText={setPassword}
                      editable={!isLoading}
                    />
                    {mode === "login" && (
                      <Pressable
                        onPress={() => setModeState("forgot")}
                        style={styles.forgotPasswordContainer}
                      >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{success}</Text>
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
                  <Text style={styles.buttonText}>
                    {mode === "login" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
                  </Text>
                )}
              </Button>

              <Pressable
                onPress={() => {
                  setModeState(mode === "login" ? "signup" : "login");
                  setError("");
                  setSuccess("");
                }}
                style={styles.switchModeButton}
                disabled={isLoading}
              >
                <Text style={styles.switchModeText}>
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Text>
              </Pressable>
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
    backgroundColor: 'transparent', // background
  },
  authLoadingContainer: {
    flex: 1,
    backgroundColor: 'transparent', // background
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLoadingText: {
    marginTop: 16,
    color: '#64748b', // muted-foreground
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
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    padding: 20,
    borderRadius: 9999,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // destructive/10
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444', // destructive
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // success/10
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    fontSize: 14,
    color: '#10b981', // success
  },
  submitButton: {
    width: '100%',
    height: 48,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  switchModeButton: {
    paddingVertical: 8,
  },
  switchModeText: {
    color: '#ec4899', // primary
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Login;

