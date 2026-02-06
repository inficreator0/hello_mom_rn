import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { authAPI } from "../lib/api/auth";
import { clearAuthStorage } from "../lib/http";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
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

  const login = async (username: string, password: string): Promise<boolean> => {
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
      return true;
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
  }): Promise<boolean> => {
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
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

