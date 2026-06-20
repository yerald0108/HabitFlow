// src/navigation/AppNavigator.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useUIStore } from '../store/uiStore';
import { TodayScreen } from '../screens/Today/TodayScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── PANTALLAS PLACEHOLDER ──────────────────────────────────

const PlaceholderScreen: React.FC<{ title: string; icon: string }> = ({ title, icon }) => {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon as any} size={48} color={colors.accent} />
      <Text style={{ marginTop: spacing[4], fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ marginTop: spacing[2], fontSize: typography.fontSize.base, color: colors.textSecondary }}>
        Fase en construcción
      </Text>
    </View>
  );
};

// ─── DEFINICIÓN DE TABS ─────────────────────────────────────

const TABS = [
  { key: 'Today',    label: 'Hoy',          icon: 'sun' },
  { key: 'Stats',    label: 'Estadísticas', icon: 'bar-chart-2' },
  { key: 'Habits',   label: 'Hábitos',      icon: 'list' },
  { key: 'Settings', label: 'Ajustes',      icon: 'settings' },
] as const;

type TabKey = typeof TABS[number]['key'];

const SCREENS: Record<TabKey, React.FC> = {
  Today:    () => <TodayScreen />,
  Stats:    () => <PlaceholderScreen title="Estadísticas" icon="bar-chart-2" />,
  Habits:   () => <PlaceholderScreen title="Hábitos"      icon="list" />,
  Settings: () => <PlaceholderScreen title="Ajustes"      icon="settings" />,
};

// ─── TAB BAR FLOTANTE CON ANIMACIÓN DE VISIBILIDAD ──────────

interface FloatingTabBarProps {
  activeIndex: number;
  onPress:     (index: number) => void;
}

const FloatingTabBar: React.FC<FloatingTabBarProps> = ({ activeIndex, onPress }) => {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();
  const insets         = useSafeAreaInsets();
  const isTabBarVisible = useUIStore(s => s.isTabBarVisible);
  const bottomMargin   = insets.bottom > 0 ? insets.bottom : 16;

  // Animación de visibilidad del tab bar
  const tabBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(tabBarAnim, {
      toValue:  isTabBarVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  const tabBarTranslateY = tabBarAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [120, 0], // se desliza hacia abajo al ocultarse
  });

  return (
    <Animated.View style={{
      position:  'absolute',
      bottom:    bottomMargin,
      left:      20,
      right:     20,
      opacity:   tabBarAnim,
      transform: [{ translateY: tabBarTranslateY }],
    }}>
      <View style={{
        height:          64,
        backgroundColor: colors.tabBarBackground,
        borderRadius:    borderRadius['2xl'],
        flexDirection:   'row',
        alignItems:      'center',
        paddingHorizontal: spacing[2],
        shadowColor:     colors.shadowColor,
        shadowOffset:    { width: 0, height: 8 },
        shadowOpacity:   isDark ? 0.5 : 0.12,
        shadowRadius:    24,
        elevation:       12,
      }}>
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onPress(index)}
              activeOpacity={0.7}
              style={{
                flex:            1,
                alignItems:      'center',
                justifyContent:  'center',
                paddingVertical: spacing[2],
                gap:             3,
              }}
            >
              {isActive && (
                <View style={{
                  position:        'absolute',
                  width:           48,
                  height:          48,
                  borderRadius:    borderRadius.xl,
                  backgroundColor: colors.accentLight,
                }} />
              )}
              <Feather
                name={tab.icon as any}
                size={isActive ? 22 : 20}
                color={isActive ? colors.tabBarActive : colors.tabBarInactive}
              />
              <Text style={{
                fontSize:   typography.fontSize.xs,
                fontWeight: isActive
                  ? typography.fontWeight.semibold
                  : typography.fontWeight.regular,
                color: isActive ? colors.tabBarActive : colors.tabBarInactive,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

// ─── NAVEGADOR CON ANIMACIÓN ────────────────────────────────

function AnimatedTabNavigator() {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const previousIndex    = useRef(0);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  const TAB_BAR_TOTAL = 64 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

  const navigateTo = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    if (currentAnimation.current) {
      currentAnimation.current.stop();
      currentAnimation.current = null;
    }

    const direction = newIndex > previousIndex.current ? -1 : 1;
    previousIndex.current = newIndex;

    const exitAnim = Animated.parallel([
      Animated.timing(translateX, {
        toValue:  direction * SCREEN_WIDTH * 0.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue:  0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]);

    currentAnimation.current = exitAnim;

    exitAnim.start(({ finished }) => {
      if (!finished) return;

      setActiveIndex(newIndex);
      setDisplayIndex(newIndex);
      translateX.setValue(-direction * SCREEN_WIDTH * 0.25);

      const enterAnim = Animated.parallel([
        Animated.spring(translateX, {
          toValue:   0,
          damping:   22,
          stiffness: 250,
          mass:      0.7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:  1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]);

      currentAnimation.current = enterAnim;
      enterAnim.start(() => { currentAnimation.current = null; });
    });
  };

  const CurrentScreen = SCREENS[TABS[displayIndex].key];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View style={{
        flex:          1,
        paddingBottom: TAB_BAR_TOTAL,
        transform:     [{ translateX }],
        opacity,
      }}>
        <CurrentScreen />
      </Animated.View>

      <FloatingTabBar activeIndex={activeIndex} onPress={navigateTo} />
    </View>
  );
}

// ─── STACK Y CONTENEDOR PRINCIPAL ───────────────────────────

export type RootStackParamList = {
  Tabs:        undefined;
  CreateHabit: { habitId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AnimatedTabNavigator} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary:      colors.accent,
          background:   colors.background,
          card:         colors.surface,
          text:         colors.textPrimary,
          border:       colors.border,
          notification: colors.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium:  { fontFamily: 'System', fontWeight: '500' },
          bold:    { fontFamily: 'System', fontWeight: '700' },
          heavy:   { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}