import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UsageMode = "community" | "baby";

interface Preferences {
  mode: UsageMode;
  onboardingCompleted: boolean;
  gender?: "female" | "male" | "other" | "prefer_not_to_say";
  age?: number;
  babyName?: string;
  babyStage?: string;
  firstTimeMom?: "yes" | "no";
  focusAreas?: string[];
}

interface PreferencesContextValue extends Preferences {
  setMode: (mode: UsageMode) => void;
  completeOnboarding: () => void;
  updatePreferences: (partial: Partial<Preferences>) => void;
}

const PREFERENCES_KEY = "helloMomPreferences";

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
);

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error(
      "usePreferences must be used within a PreferencesProvider"
    );
  }
  return ctx;
};

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<Preferences>({
    mode: "community",
    onboardingCompleted: false,
    gender: undefined,
    age: undefined,
    babyName: undefined,
    babyStage: undefined,
    firstTimeMom: undefined,
    focusAreas: [],
  });

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (err) {
        console.error("Error loading preferences", err);
      }
    };
    loadPreferences();
  }, []);

  // Persist to AsyncStorage
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      } catch (err) {
        console.error("Error saving preferences", err);
      }
    };
    savePreferences();
  }, [preferences]);

  const setMode = useCallback((mode: UsageMode) => {
    setPreferences((prev) => ({ ...prev, mode }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setPreferences((prev) => ({ ...prev, onboardingCompleted: true }));
  }, []);

  const updatePreferences = useCallback((partial: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        mode: preferences.mode,
        onboardingCompleted: preferences.onboardingCompleted,
        gender: preferences.gender,
        age: preferences.age,
        babyName: preferences.babyName,
        babyStage: preferences.babyStage,
        firstTimeMom: preferences.firstTimeMom,
        focusAreas: preferences.focusAreas,
        setMode,
        completeOnboarding,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};


