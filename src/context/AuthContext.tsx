import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { authAPI } from "../lib/api/auth";
import { clearAuthStorage } from "../lib/http";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; isOnboarded: boolean; onboardingType: string | null }>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; isOnboarded: boolean; onboardingType: string | null }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  isCheckingOnboarding: boolean;
  checkOnboardingStatus: () => Promise<{ isOnboarded: boolean; onboardingType: string | null }>;
  setIsOnboarded: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true);
    try {
      const status = await authAPI.getOnboardingStatus();
      setIsOnboarded(status.isOnboarded);
      return status;
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      return { isOnboarded: false, onboardingType: null };
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          await checkOnboardingStatus();
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; isOnboarded: boolean; onboardingType: string | null }> => {
    try {
      const response = await authAPI.login(username, password);

      const newUser: User = {
        id: response.userId,
        userId: response.userId,
        email: response.email,
        username: response.username,
        name: response.username,
      };

      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      
      // Check onboarding status after successful login
      const onboardingStatus = await checkOnboardingStatus();
      
      return { 
        success: true, 
        isOnboarded: onboardingStatus.isOnboarded, 
        onboardingType: onboardingStatus.onboardingType 
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; isOnboarded: boolean; onboardingType: string | null }> => {
    try {
      const response = await authAPI.register(data);

      const newUser: User = {
        id: response.userId,
        userId: response.userId,
        email: response.email,
        username: response.username,
        name: response.username,
      };

      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      
      // Check onboarding status after successful registration
      const onboardingStatus = await checkOnboardingStatus();
      
      return { 
        success: true, 
        isOnboarded: onboardingStatus.isOnboarded, 
        onboardingType: onboardingStatus.onboardingType 
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsOnboarded(false);
    clearAuthStorage();
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        isOnboarded,
        isCheckingOnboarding,
        checkOnboardingStatus,
        setIsOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

