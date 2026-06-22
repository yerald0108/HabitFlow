import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, StyleSheet, View, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { db } from './src/data/database/database';
import { useHabitStore } from './src/store/habitStore';
import { NotificationService } from './src/domain/services/NotificationService';
import { Storage } from './src/domain/utils/storage';
import { OnboardingScreen } from './src/screens/Onboarding/OnboardingScreen';
import { AnimatedSplash } from './src/screens/Splash/SplashScreen';

type AppState = 'loading' | 'splash' | 'onboarding' | 'ready';

function AppContent() {
  const [appState,  setAppState]  = useState<AppState>('loading');
  const initializeStore = useHabitStore(state => state.initialize);
  const scheme = useColorScheme();

  useEffect(() => {
    async function boot() {
      try {
        await db.initialize();
        await initializeStore();

        // Reprogramar notificaciones
        const { habits } = useHabitStore.getState();
        await NotificationService.rescheduleAll(habits);

        // Verificar si ya completó el onboarding
        const onboardingDone = await Storage.get('onboarding_completed');

        if (onboardingDone === 'true') {
          setAppState('splash');
        } else {
          setAppState('onboarding');
        }
      } catch (error) {
        console.error('[App] Error crítico al arrancar:', error);
        setAppState('splash');
      }
    }
    boot();
  }, []);

  const handleOnboardingFinish = async () => {
    await Storage.set('onboarding_completed', 'true');
    setAppState('splash');
  };

  const handleSplashFinish = () => {
    setAppState('ready');
  };

  if (appState === 'loading') {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (appState === 'onboarding') {
    return (
      <View style={styles.root}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <OnboardingScreen onFinish={handleOnboardingFinish} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
      {appState === 'splash' && (
        <AnimatedSplash onFinish={handleSplashFinish} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
});