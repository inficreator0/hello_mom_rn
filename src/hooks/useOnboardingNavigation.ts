import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const useOnboardingNavigation = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading, isOnboarded, isCheckingOnboarding, checkOnboardingStatus } = useAuth();

  useEffect(() => {
    // Only proceed with navigation logic when auth is loaded and we're not checking onboarding
    if (!isLoading && !isCheckingOnboarding) {
      if (isAuthenticated) {
        // If authenticated and onboarding check is complete, navigate based on status
        if (isOnboarded) {
          navigation.navigate('Main' as never);
        } else {
          navigation.navigate('Onboarding' as never);
        }
      }
    }
  }, [isAuthenticated, isLoading, isOnboarded, isCheckingOnboarding, navigation]);

  return {
    isAuthenticated,
    isLoading,
    isOnboarded,
    isCheckingOnboarding,
    checkOnboardingStatus
  };
};
