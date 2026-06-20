import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, StyleSheet, View, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { db } from './src/data/database/database';
import { useHabitStore } from './src/store/habitStore';

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const initializeStore = useHabitStore(state => state.initialize);
  const scheme = useColorScheme();

  useEffect(() => {
    async function boot() {
      try {
        await db.initialize();
        await initializeStore();
        setIsReady(true);
      } catch (error) {
        console.error('[App] Error crítico al arrancar:', error);
      }
    }
    boot();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
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
  root:    { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
});