import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Heart } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigation = useNavigation<any>();
  const { onboardingCompleted } = usePreferences();

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const success = await login(username, password);
        // Navigation will be handled by App.tsx (state-based)
      } else {
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
        <Text style={styles.authLoadingText}>Preparing Hello Mom for you...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <CardTitle style={styles.cardTitle}>Welcome to Hello Mom</CardTitle>
              <CardDescription style={styles.cardDescription}>
                {isLoginMode ? "Sign in to access your community" : "Create an account to join us"}
              </CardDescription>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              {!isLoginMode && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <Input
                      placeholder="Jane"
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <Input
                      placeholder="jane@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <Input
                  placeholder="janedoe"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
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
                  <Text style={styles.buttonText}>{isLoginMode ? "Sign In" : "Sign Up"}</Text>
                )}
              </Button>

              <Pressable
                onPress={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                }}
                style={styles.switchModeButton}
                disabled={isLoading}
              >
                <Text style={styles.switchModeText}>
                  {isLoginMode
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Text>
              </Pressable>
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#0f172a',
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

