// src/screens/Stats/StatsScreen.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useHabitStore } from '../../store/habitStore';
import { getLastNDays, toDateString } from '../../domain/utils/dateUtils';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  shouldHabitBeCompletedOn,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
} from '../../domain/utils/streakUtils';

// ─── NÚMERO ANIMADO ──────────────────────────────────────────

const AnimatedNumber: React.FC<{ value: number; style?: any }> = ({ value, style }) => {
  const [display, setDisplay] = useState(0);
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animVal.setValue(0);
    const anim = Animated.spring(animVal, {
      toValue:         value,
      damping:         18,
      stiffness:       60,
      useNativeDriver: false,
    });
    anim.start();
    const listener = animVal.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => {
      anim.stop();
      animVal.removeListener(listener);
    };
  }, [value]);

  return <Text style={style}>{display}</Text>;
};

// ─── BARRA ANIMADA ───────────────────────────────────────────

const AnimatedBar: React.FC<{ heightPct: number; maxH: number; color: string }> = ({
  heightPct, maxH, color,
}) => {
  const animH = useRef(new Animated.Value(0)).current;
  const targetH = Math.max(heightPct * maxH, heightPct > 0 ? 4 : 0);

  useEffect(() => {
    Animated.spring(animH, {
      toValue:         targetH,
      damping:         18,
      stiffness:       60,
      useNativeDriver: false,
    }).start();
  }, [targetH]);

  return (
    <Animated.View style={{
      width:           '100%',
      height:          animH,
      backgroundColor: color,
      borderRadius:    4,
    }} />
  );
};

// ─── TARJETA DE RACHA ────────────────────────────────────────

const StreakCard: React.FC<{
  label:   string;
  value:   number;
  icon:    string;
  color:   string;
  bgColor: string;
}> = ({ label, value, icon, color, bgColor }) => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  return (
    <View style={{
      flex:            1,
      backgroundColor: bgColor,
      borderRadius:    borderRadius.xl,
      padding:         spacing[4],
      alignItems:      'center',
      ...shadows.sm,
    }}>
      <Text style={{ fontSize: 28, marginBottom: spacing[2] }}>{icon}</Text>
      <AnimatedNumber value={value} style={{
        fontSize:      typography.fontSize['3xl'],
        fontWeight:    typography.fontWeight.bold,
        color,
        letterSpacing: typography.letterSpacing.tight,
      }} />
      <Text style={{
        fontSize:   typography.fontSize.xs,
        color:      colors.textSecondary,
        marginTop:  spacing[1],
        fontWeight: typography.fontWeight.medium,
        textAlign:  'center',
      }}>
        {label}
      </Text>
    </View>
  );
};

// ─── HEATMAP ─────────────────────────────────────────────────

const HeatmapCalendar: React.FC<{ habitId: string; color: string }> = ({
  habitId, color,
}) => {
  const { colors } = useTheme();
  const records = useHabitStore(s => s.records[habitId] ?? []);
  const habit   = useHabitStore(s => s.habits.find(h => h.id === habitId) ?? null);

  const { completedSet, weeks } = useMemo(() => {
    const completed = new Set(records.filter(r => r.completed).map(r => r.date));
    const today     = new Date();
    const start     = new Date(today);
    start.setDate(today.getDate() - 125);
    const dow = start.getDay();
    start.setDate(start.getDate() - dow);

    const ws: { date: string; isFuture: boolean }[][] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const week: { date: string; isFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        week.push({ date: toDateString(cursor), isFuture: cursor > today });
        cursor.setDate(cursor.getDate() + 1);
      }
      ws.push(week);
    }
    return { completedSet: completed, weeks: ws };
  }, [records.length]);

  const CELL = 12;
  const GAP  = 3;
  const DAYS = ['D','L','M','X','J','V','S'];

  const getCellColor = (date: string, isFuture: boolean) => {
    if (isFuture) return 'transparent';
    if (completedSet.has(date)) return color;
    if (habit && !shouldHabitBeCompletedOn(habit, date)) return colors.backgroundSecondary;
    return colors.border;
  };

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ marginRight: GAP }}>
          {DAYS.map((day, i) => (
            <View key={day} style={{ height: CELL, marginBottom: GAP, justifyContent: 'center' }}>
              <Text style={{ fontSize: 8, color: colors.textTertiary, width: 10 }}>
                {i % 2 === 0 ? day : ''}
              </Text>
            </View>
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: GAP }}
        >
          {weeks.map((week, wi) => (
            <View key={wi} style={{ gap: GAP }}>
              {week.map(({ date, isFuture }, di) => (
                <View
                  key={di}
                  style={{
                    width:           CELL,
                    height:          CELL,
                    borderRadius:    2,
                    backgroundColor: getCellColor(date, isFuture),
                    opacity:         completedSet.has(date) ? 1 : 0.5,
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'flex-end', marginTop: 8, gap: 4,
      }}>
        <Text style={{ fontSize: 10, color: colors.textTertiary }}>Menos</Text>
        {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
          <View key={i} style={{
            width: CELL, height: CELL, borderRadius: 2,
            backgroundColor: color, opacity: op,
          }} />
        ))}
        <Text style={{ fontSize: 10, color: colors.textTertiary }}>Más</Text>
      </View>
    </View>
  );
};

// ─── GRÁFICO SEMANAL ─────────────────────────────────────────

const WeeklyChart: React.FC<{ habitId: string; color: string }> = ({
  habitId, color,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const records = useHabitStore(s => s.records[habitId] ?? []);
  const habit   = useHabitStore(s => s.habits.find(h => h.id === habitId) ?? null);

  const weeks = useMemo(() => {
    const completedSet = new Set(records.filter(r => r.completed).map(r => r.date));
    const last28 = getLastNDays(28);
    return [3, 2, 1, 0].map(w => {
      const days      = last28.slice(w * 7, w * 7 + 7);
      const total     = habit ? days.filter(d => shouldHabitBeCompletedOn(habit, d)).length : 7;
      const completed = days.filter(d => completedSet.has(d)).length;
      const pct       = total > 0 ? completed / total : 0;
      const label     = w === 0 ? 'Esta sem.' : `Hace ${w}s`;
      return { label, completed, total, pct };
    });
  }, [records.length, habit?.id]);

  const BAR_H = 100;

  return (
    <View style={{
      flexDirection:  'row',
      alignItems:     'flex-end',
      justifyContent: 'space-around',
      height:         BAR_H + 48,
      paddingTop:     spacing[3],
    }}>
      {weeks.map((week, i) => (
        <View key={i} style={{ alignItems: 'center', flex: 1, gap: spacing[2] }}>
          <Text style={{
            fontSize:   typography.fontSize.xs,
            color:      week.total > 0 ? colors.textSecondary : colors.textTertiary,
            fontWeight: typography.fontWeight.medium,
          }}>
            {week.total > 0 ? `${Math.round(week.pct * 100)}%` : '—'}
          </Text>
          <View style={{
            width:           28,
            height:          BAR_H,
            justifyContent:  'flex-end',
            backgroundColor: colors.backgroundSecondary,
            borderRadius:    borderRadius.sm,
            overflow:        'hidden',
          }}>
            <AnimatedBar
              heightPct={week.pct}
              maxH={BAR_H}
              color={week.pct >= 1 ? colors.success : color}
            />
          </View>
          <Text style={{ fontSize: 9, color: colors.textTertiary, textAlign: 'center' }}>
            {week.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────

export const StatsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  // Leer datos primitivos directamente del store — sin selectores que devuelvan arrays nuevos
  const habits  = useHabitStore(s => s.habits.filter(h => !h.isArchived));
  const records = useHabitStore(s => s.records);

  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [selectorOpen,  setSelectorOpen]  = useState(false);

  // Inicializar selectedId solo una vez cuando llegan hábitos
  useEffect(() => {
    if (selectedId === null && habits.length > 0) {
      setSelectedId(habits[0].id);
    }
  }, [habits.length]);

  const TAB_BAR_TOTAL = useTabBarHeight();

  // Calcular stats del hábito seleccionado con useMemo
  const selectedHabit = useMemo(
    () => habits.find(h => h.id === selectedId) ?? null,
    [selectedId, habits.length]
  );

  const habitRecords = useMemo(
    () => selectedId ? (records[selectedId] ?? []) : [],
    [selectedId, records]
  );

  const stats = useMemo(() => {
    if (!selectedHabit) return null;
    return {
      currentStreak:    calculateCurrentStreak(selectedHabit, habitRecords),
      longestStreak:    calculateLongestStreak(selectedHabit, habitRecords),
      completionRate:   calculateCompletionRate(selectedHabit, habitRecords),
      totalCompletions: habitRecords.filter(r => r.completed).length,
      color:            selectedHabit.color,
    };
  }, [selectedHabit?.id, habitRecords.length]);

  if (habits.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: insets.top }}>
          <View style={{ paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] }}>
            <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, letterSpacing: typography.letterSpacing.tight }}>
              Estadísticas
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[10] }}>
          <Text style={{ fontSize: 56, marginBottom: spacing[4] }}>📊</Text>
          <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing[2] }}>
            Sin datos aún
          </Text>
          <Text style={{ fontSize: typography.fontSize.base, color: colors.textSecondary, textAlign: 'center' }}>
            Crea y completa hábitos para ver tus estadísticas aquí.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] }}>
          <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, letterSpacing: typography.letterSpacing.tight }}>
            Estadísticas
          </Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            Tu progreso a lo largo del tiempo
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL + spacing[4] }}
      >
        {/* Selector de hábito */}
        <TouchableOpacity
          onPress={() => setSelectorOpen(true)}
          style={{
            flexDirection:     'row',
            alignItems:        'center',
            backgroundColor:   colors.surface,
            borderRadius:      borderRadius.lg,
            paddingHorizontal: spacing[4],
            paddingVertical:   spacing[3],
            marginHorizontal:  spacing[5],
            marginBottom:      spacing[4],
            gap:               spacing[3],
            ...shadows.sm,
          }}
        >
          {selectedHabit && (
            <View style={{
              width:           36, height: 36,
              borderRadius:    borderRadius.sm,
              backgroundColor: selectedHabit.color + '25',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>{selectedHabit.emoji}</Text>
            </View>
          )}
          <Text style={{ flex: 1, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>
            {selectedHabit?.name ?? 'Selecciona un hábito'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {stats && selectedId && selectedHabit && (
          <>
            {/* Tarjetas de racha */}
            <View style={{ flexDirection: 'row', paddingHorizontal: spacing[5], gap: spacing[3], marginBottom: spacing[4] }}>
              <StreakCard label="Racha actual"  value={stats.currentStreak}    icon="🔥" color={colors.streak}  bgColor={colors.streakLight} />
              <StreakCard label="Mejor racha"   value={stats.longestStreak}    icon="🏆" color={colors.accent}  bgColor={colors.accentLight} />
              <StreakCard label="Completados"   value={stats.totalCompletions} icon="✅" color={colors.success} bgColor={colors.successLight} />
            </View>

            {/* Heatmap */}
            <View style={{ marginHorizontal: spacing[5], marginBottom: spacing[4], backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], ...shadows.sm }}>
              <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[4] }}>
                Actividad — últimas 18 semanas
              </Text>
              <HeatmapCalendar habitId={selectedId} color={selectedHabit.color} />
            </View>

            {/* Gráfico semanal */}
            <View style={{ marginHorizontal: spacing[5], marginBottom: spacing[4], backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], ...shadows.sm }}>
              <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] }}>
                Últimas 4 semanas
              </Text>
              <Text style={{ fontSize: typography.fontSize.xs, color: colors.textTertiary, marginBottom: spacing[4] }}>
                Porcentaje de cumplimiento semanal
              </Text>
              <WeeklyChart habitId={selectedId} color={selectedHabit.color} />
            </View>

            {/* Tasa de cumplimiento */}
            <View style={{ marginHorizontal: spacing[5], backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], ...shadows.sm }}>
              <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
                Tasa de cumplimiento (30 días)
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[4], gap: spacing[4] }}>
                <AnimatedNumber
                  value={Math.round(stats.completionRate * 100)}
                  style={{
                    fontSize:      typography.fontSize['4xl'],
                    fontWeight:    typography.fontWeight.bold,
                    color:         stats.completionRate >= 0.8 ? colors.success : stats.completionRate >= 0.5 ? colors.streak : colors.accent,
                    letterSpacing: typography.letterSpacing.tight,
                  }}
                />
                <Text style={{ fontSize: typography.fontSize['2xl'], color: colors.textTertiary, fontWeight: typography.fontWeight.regular, marginTop: spacing[2] }}>%</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: typography.fontSize.sm * 1.6 }}>
                    {stats.completionRate >= 0.8 ? '¡Excelente consistencia!' : stats.completionRate >= 0.5 ? 'Buen progreso, sigue así' : 'Hay margen para mejorar'}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: spacing[4], height: 8, backgroundColor: colors.backgroundSecondary, borderRadius: 4, overflow: 'hidden' }}>
                <AnimatedBar heightPct={stats.completionRate} maxH={8} color={stats.completionRate >= 0.8 ? colors.success : stats.completionRate >= 0.5 ? colors.streak : colors.accent} />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal selector */}
      <Modal visible={selectorOpen} transparent animationType="fade" onRequestClose={() => setSelectorOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setSelectorOpen(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], padding: spacing[5], gap: spacing[2] }}>
              <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[2], textAlign: 'center' }}>
                Selecciona un hábito
              </Text>
              {habits.map(habit => (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => { setSelectedId(habit.id); setSelectorOpen(false); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: spacing[3], borderRadius: borderRadius.md, gap: spacing[3],
                    backgroundColor: habit.id === selectedId ? colors.accentLight : colors.backgroundSecondary,
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: habit.color + '25', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: habit.id === selectedId ? colors.accent : colors.textPrimary }}>
                    {habit.name}
                  </Text>
                  {habit.id === selectedId && <Feather name="check" size={18} color={colors.accent} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setSelectorOpen(false)}
                style={{ marginTop: spacing[2], paddingVertical: spacing[4], alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg }}
              >
                <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};