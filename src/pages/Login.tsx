import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Heart } from "lucide-react";
import Loader from "../components/common/Loader";

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
  const navigate = useNavigate();
  const { onboardingCompleted } = usePreferences();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(onboardingCompleted ? "/" : "/onboarding", { replace: true });
    }
  }, [isAuthenticated, authLoading, onboardingCompleted, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const success = await login(username, password);
        if (success) {
          navigate(onboardingCompleted ? "/" : "/onboarding");
        }
      } else {
        if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
          setError("Please fill in all fields.");
          setIsLoading(false);
          return;
        }
        const success = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        if (success) {
          navigate("/onboarding");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <Loader fullScreen label="Preparing Hello Mom for you..." />;
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Heart className="h-12 w-12 text-primary fill-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Welcome to Hello Mom</CardTitle>
            <CardDescription className="text-base">
              Sign in to access your community and trackers
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLoginMode}
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLoginMode}
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!isLoginMode}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete={isLoginMode ? "current-password" : "new-password"}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? isLoginMode
                  ? "Signing in..."
                  : "Creating account..."
                : isLoginMode
                ? "Sign In"
                : "Sign Up"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                  setEmail("");
                  setFirstName("");
                  setLastName("");
                }}
                disabled={isLoading}
              >
                {isLoginMode
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

