import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface OnboardingNavigationHandlerProps {
  children: React.ReactNode;
}

export const OnboardingNavigationHandler = ({ children }: OnboardingNavigationHandlerProps) => {
  const { isAuthenticated, isLoading, isOnboarded, checkOnboardingStatus } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const handleOnboardingCheck = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const status = await checkOnboardingStatus();
          
          // If user is onboarded, navigate to Community (Main)
          if (status.isOnboarded) {
            navigation.navigate('Main' as never);
          }
        } catch (error) {
          console.error('Error in onboarding navigation handler:', error);
        }
      }
    };

    handleOnboardingCheck();
  }, [isAuthenticated, isLoading, navigation, checkOnboardingStatus]);

  return <>{children}</>;
};
