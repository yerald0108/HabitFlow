import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useHabitStore } from '../store/habitStore';
import { useHabitsForToday, useDailyProgress } from '../store/selectors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── PANTALLAS PLACEHOLDER ──────────────────────────────────

const PlaceholderScreen: React.FC<{ title: string; icon: string }> = ({ title, icon }) => {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Feather name={icon as any} size={48} color={colors.accent} />
      <Text style={{
        marginTop: spacing[4],
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
      }}>
        {title}
      </Text>
      <Text style={{
        marginTop: spacing[2],
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
      }}>
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

const TodayTest: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const progress = useDailyProgress();
  const habits   = useHabitsForToday();

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[6],
    }}>
      <Feather name="sun" size={48} color={colors.accent} />
      <Text style={{
        marginTop: spacing[4],
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
      }}>
        Hoy
      </Text>
      <Text style={{
        marginTop: spacing[2],
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
      }}>
        {progress.completed}/{progress.total} hábitos completados
      </Text>
      <Text style={{
        marginTop: spacing[2],
        fontSize: typography.fontSize.sm,
        color: colors.textTertiary,
      }}>
        {habits.length === 0
          ? 'Sin hábitos — se crearán en la Fase 4'
          : `${habits.length} hábito(s) para hoy`}
      </Text>
    </View>
  );
};

const SCREENS: Record<TabKey, React.FC> = {
  Today:    TodayTest,
  Stats:    () => <PlaceholderScreen title="Estadísticas" icon="bar-chart-2" />,
  Habits:   () => <PlaceholderScreen title="Hábitos"      icon="list" />,
  Settings: () => <PlaceholderScreen title="Ajustes"      icon="settings" />,
};

// ─── TAB BAR FLOTANTE ───────────────────────────────────────

interface FloatingTabBarProps {
  activeIndex: number;
  onPress: (index: number) => void;
}

const FloatingTabBar: React.FC<FloatingTabBarProps> = ({ activeIndex, onPress }) => {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;

  return (
    <View style={{
      position: 'absolute',
      bottom: bottomMargin,
      left: 20,
      right: 20,
      height: 64,
      backgroundColor: colors.tabBarBackground,
      borderRadius: borderRadius['2xl'],
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[2],
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.5 : 0.12,
      shadowRadius: 24,
      elevation: 12,
    }}>
      {TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onPress(index)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing[2],
              gap: 3,
            }}
          >
            {isActive && (
              <View style={{
                position: 'absolute',
                width: 48,
                height: 48,
                borderRadius: borderRadius.xl,
                backgroundColor: colors.accentLight,
              }} />
            )}
            <Feather
              name={tab.icon as any}
              size={isActive ? 22 : 20}
              color={isActive ? colors.tabBarActive : colors.tabBarInactive}
            />
            <Text style={{
              fontSize: typography.fontSize.xs,
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
  );
};

// ─── NAVEGADOR CON ANIMACIÓN (Animated nativo, sin Reanimated) ──

function AnimatedTabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const previousIndex = useRef(0);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const TAB_BAR_TOTAL = 64 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

  const navigateTo = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    // Cancelar animación en curso si existe
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      currentAnimation.current = null;
    }

    const direction = newIndex > previousIndex.current ? -1 : 1;
    previousIndex.current = newIndex;

    // Fase 1: salida rápida
    const exitAnim = Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction * SCREEN_WIDTH * 0.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]);

    currentAnimation.current = exitAnim;

    exitAnim.start(({ finished }) => {
      if (!finished) return; // fue cancelada, no hacer nada

      setActiveIndex(newIndex);
      setDisplayIndex(newIndex);
      translateX.setValue(-direction * SCREEN_WIDTH * 0.25);

      // Fase 2: entrada
      const enterAnim = Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 22,
          stiffness: 250,
          mass: 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]);

      currentAnimation.current = enterAnim;
      enterAnim.start(() => {
        currentAnimation.current = null;
      });
    });
  };

  const CurrentScreen = SCREENS[TABS[displayIndex].key];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View style={{
        flex: 1,
        paddingBottom: TAB_BAR_TOTAL,
        transform: [{ translateX }],
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
  Tabs: undefined;
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