import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

type UsageMode = "community" | "baby";

interface Preferences {
  mode: UsageMode;
  onboardingCompleted: boolean;
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
    babyName: undefined,
    babyStage: undefined,
    firstTimeMom: undefined,
    focusAreas: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
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
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (err) {
      console.error("Error saving preferences", err);
    }
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


