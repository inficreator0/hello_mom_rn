import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { clearAuthStorage } from '../lib/http';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
    isLoading: boolean;
    isCheckingOnboarding: boolean;
    setUser: (user: User | null) => void;
    setIsOnboarded: (onboarded: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    setIsCheckingOnboarding: (checking: boolean) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isOnboarded: false,
    isLoading: true,
    isCheckingOnboarding: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsCheckingOnboarding: (isCheckingOnboarding) => set({ isCheckingOnboarding }),
    logout: async () => {
        await clearAuthStorage();
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, isOnboarded: false });
    },
}));
