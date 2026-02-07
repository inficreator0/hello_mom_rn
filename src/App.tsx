import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Activity, FileText, Stethoscope, Users } from 'lucide-react-native';
import { DefaultTheme, NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

import Community from './components/Community';
import { Trackers } from './pages/Trackers';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { Profile } from './pages/Profile';
import { Consultations } from './pages/Consultations';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { Onboarding } from './pages/Onboarding';
import { PeriodTracker } from './pages/PeriodTracker';
import { BabyWeightTracker } from './pages/BabyWeightTracker';
import { ComingSoon } from './pages/ComingSoon';

import { ResetPassword } from './pages/ResetPassword';

const prefix = Linking.createURL('/');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [prefix, 'nova://', 'https://nova'],
  config: {
    screens: {
      ResetPassword: {
        path: 'reset-password',
        alias: ['rest-password']
      },
      Login: 'login',
      PostDetail: 'post/:id',
      ArticleDetail: 'article/:id',
    },
  },
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ec4899',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 5,
          paddingBottom: 8,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Community}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TrackersTab"
        component={Trackers}
        options={{
          title: 'Trackers',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ArticlesTab"
        component={Articles}
        options={{
          title: 'Articles',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ConsultTab"
        component={Consultations}
        options={{
          title: 'Consult',
          tabBarIcon: ({ color, size }) => <Stethoscope color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated, isLoading, isOnboarded, isCheckingOnboarding } = useAuth();

  if (isLoading) {
    return null; // Or a splash screen
  }

  // Show loader while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <ActivityIndicator color="#ec4899" size="large" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>Checking your profile...</Text>
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="ResetPassword" component={ResetPassword} />
            </>
          ) : !isOnboarded ? (
            <Stack.Screen name="Onboarding" component={Onboarding} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="PostDetail" component={PostDetail} />
              <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
              <Stack.Screen name="CreatePost" component={CreatePost} />
              <Stack.Screen name="PeriodTracker" component={PeriodTracker} />
              <Stack.Screen name="BabyWeightTracker" component={BabyWeightTracker} />
              <Stack.Screen name="ComingSoon" component={ComingSoon} />
              <Stack.Screen name="Onboarding" component={Onboarding} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreferencesProvider>
          <ToastProvider>
            <StatusBar style="light" backgroundColor="#603c58ff" />
            <Navigation />
          </ToastProvider>
        </PreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
