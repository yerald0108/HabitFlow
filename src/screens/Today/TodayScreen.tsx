import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useHabitStore } from '../../store/habitStore';
import {
  useHabitsForToday,
  useDailyProgress,
  useIsHabitCompletedOn,
} from '../../store/selectors';
import { HabitRow } from '../../components/habits/HabitRow';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { EmptyState } from '../../components/ui/EmptyState';
import { getTodayString, formatDisplayDate } from '../../domain/utils/dateUtils';
import { calculateCurrentStreak } from '../../domain/utils/streakUtils';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { HabitFormScreen } from '../Habits/HabitFormScreen';
import { useUIStore } from '../../store/uiStore';
import { Confetti } from '../../components/ui/Confetti';

// ─── FILA DE HÁBITO CONECTADA AL STORE ──────────────────────
// Componente interno para que cada fila se suscriba a su propio estado

const ConnectedHabitRow: React.FC<{
  habitId: string;
  habit:   ReturnType<typeof useHabitsForToday>[0];
  onPress: () => void;
  index?:  number;
}> = ({ habit, onPress, index = 0 }) => {
  const today       = getTodayString();
  const isCompleted = useIsHabitCompletedOn(habit.id, today);
  const records     = useHabitStore(s => s.records[habit.id] ?? []);
  const toggleHabit = useHabitStore(s => s.toggleHabit);

  const streak = calculateCurrentStreak(habit, records);

  return (
    <HabitRow
      habit={habit}
      isCompleted={isCompleted}
      currentStreak={streak}
      onToggle={() => toggleHabit(habit.id)}
      onPress={onPress}
      index={index}
    />
  );
};

// ─── HEADER ─────────────────────────────────────────────────

const TodayHeader: React.FC<{ onSettingsPress: () => void }> = ({ onSettingsPress }) => {
  const { colors, typography, spacing } = useTheme();
  const today = getTodayString();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' :
    hour < 18 ? 'Buenas tardes' :
                'Buenas noches';

  return (
    <View style={{
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      paddingHorizontal: spacing[5],
      paddingTop:     spacing[4],
      paddingBottom:  spacing[2],
    }}>
      <View>
        <Text style={{
          fontSize:     typography.fontSize.sm,
          color:        colors.textTertiary,
          fontWeight:   typography.fontWeight.medium,
          letterSpacing: typography.letterSpacing.wide,
          textTransform: 'uppercase',
        }}>
          {greeting}
        </Text>
        <Text style={{
          fontSize:     typography.fontSize['2xl'],
          fontWeight:   typography.fontWeight.bold,
          color:        colors.textPrimary,
          letterSpacing: typography.letterSpacing.tight,
          marginTop:    2,
        }}>
          Hoy
        </Text>
        <Text style={{
          fontSize:  typography.fontSize.sm,
          color:     colors.textSecondary,
          marginTop: 2,
        }}>
          {formatDisplayDate(today)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onSettingsPress}
        style={{
          width:  40,
          height: 40,
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="bell" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

// ─── TARJETA DE PROGRESO ────────────────────────────────────

const ProgressCard: React.FC = () => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const { completed, total, percentage } = useDailyProgress();

  const animatedWidth = useRef(new Animated.Value(percentage)).current;
  const isComplete    = percentage >= 1 && total > 0;

  const motivationalText =
    total === 0      ? 'Agrega tu primer hábito ↓' :
    percentage === 0 ? '¡Comienza tu día!'          :
    percentage < 0.5 ? '¡Vas bien, sigue adelante!' :
    percentage < 1   ? '¡Casi lo logras!'            :
                       '¡Día perfecto! 🎉';

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue:         percentage,
      damping:         20,
      stiffness:       60,
      mass:            1,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const barWidth = animatedWidth.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{
      marginHorizontal: spacing[5],
      marginVertical:   spacing[4],
      backgroundColor:  isComplete ? colors.successLight : colors.accentLight,
      borderRadius:     borderRadius.xl,
      padding:          spacing[5],
      flexDirection:    'row',
      alignItems:       'center',
      gap:              spacing[5],
      ...shadows.sm,
    }}>
      <CircularProgress
        percentage={percentage}
        completed={completed}
        total={total}
        size={100}
        strokeWidth={8}
      />

      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize:      typography.fontSize.lg,
          fontWeight:    typography.fontWeight.bold,
          color:         isComplete ? colors.success : colors.accent,
          letterSpacing: typography.letterSpacing.tight,
        }}>
          {total === 0
            ? 'Sin hábitos'
            : isComplete
            ? '¡Completado!'
            : `${Math.round(percentage * 100)}%`}
        </Text>

        <Text style={{
          fontSize:   typography.fontSize.sm,
          color:      colors.textSecondary,
          marginTop:  spacing[1],
          lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
        }}>
          {motivationalText}
        </Text>

        {total > 0 && (
          <View style={{
            marginTop:       spacing[3],
            height:          6,
            backgroundColor: colors.accentMedium,
            borderRadius:    3,
            overflow:        'hidden',
          }}>
            <Animated.View style={{
              height:          6,
              borderRadius:    3,
              backgroundColor: isComplete ? colors.success : colors.accent,
              width:           barWidth,
            }} />
          </View>
        )}
      </View>
    </View>
  );
};

// ─── PANTALLA PRINCIPAL ─────────────────────────────────────

export const TodayScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const insets       = useSafeAreaInsets();
  const habitsToday  = useHabitsForToday();
  const initialize   = useHabitStore(s => s.initialize);
  const [refreshing,      setRefreshing]      = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const prevPercentage = React.useRef(0);
  const openHabitForm  = useUIStore(s => s.openHabitForm);
  const closeHabitForm = useUIStore(s => s.closeHabitForm);
  const isFormVisible  = useUIStore(s => s.isHabitFormOpen);
  const editingHabitId = useUIStore(s => s.editingHabitId);

  const TAB_BAR_TOTAL = useTabBarHeight();

  const { percentage } = useDailyProgress();

  React.useEffect(() => {
    if (percentage >= 1 && prevPercentage.current < 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    prevPercentage.current = percentage;
  }, [percentage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  }, []);

  // Animación del FAB
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.92,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header fijo */}
      <View style={{ paddingTop: insets.top }}>
        <TodayHeader onSettingsPress={() => {}} />
      </View>

      {/* Contenido scrolleable */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow:      1,
          paddingBottom: TAB_BAR_TOTAL + spacing[8],
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Tarjeta de progreso */}
        <ProgressCard />

        {/* Sección de hábitos */}
        {habitsToday.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Tu día está en blanco"
            subtitle="Crea tu primer hábito y empieza a construir la mejor versión de ti."
          />
        ) : (
          <View style={{ paddingHorizontal: spacing[5] }}>
            <Text style={{
              fontSize:     typography.fontSize.xs,
              fontWeight:   typography.fontWeight.semibold,
              color:        colors.textTertiary,
              letterSpacing: typography.letterSpacing.widest,
              textTransform: 'uppercase',
              marginBottom:  spacing[3],
            }}>
              Hábitos de hoy
            </Text>

            {habitsToday.map((habit, index) => (
              <ConnectedHabitRow
                key={habit.id}
                habitId={habit.id}
                habit={habit}
                index={index}
                onPress={() => {}}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB — Botón flotante para crear hábito */}
      <Animated.View style={{
        position:  'absolute',
        right:     spacing[5],
        bottom:    TAB_BAR_TOTAL + spacing[4],
        transform: [{ scale: fabScale }],
        ...shadows.lg,
      }}>
        <TouchableOpacity
          onPress={() => openHabitForm()}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
          style={{
            width:           56,
            height:          56,
            borderRadius:    28,
            backgroundColor: colors.accent,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <Feather name="plus" size={26} color={colors.textOnAccent} />
        </TouchableOpacity>
      </Animated.View>
      {/* Modal de formulario */}
        {isFormVisible && (
            <View style={StyleSheet.absoluteFill}>
                <HabitFormScreen
                    habitId={editingHabitId ?? undefined}
                    onClose={() => closeHabitForm()}
                />
            </View>
        )}
        {/* Confeti al completar el día */}
        <Confetti visible={showConfetti} />
    </View>
  );
};