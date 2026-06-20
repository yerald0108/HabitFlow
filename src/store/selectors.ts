// src/store/selectors.ts
// Hooks que derivan datos del store.
// Al estar fuera del store, no causan loops infinitos.

import { useHabitStore } from './habitStore';
import { HabitWithStats } from '../domain/models/Habit';
import { getTodayString } from '../domain/utils/dateUtils';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  isCompletedToday,
  shouldHabitBeCompletedOn,
} from '../domain/utils/streakUtils';

// Hábitos activos para el día de hoy
export function useHabitsForToday() {
  const habits  = useHabitStore(s => s.habits);
  const today   = getTodayString();
  return habits.filter(h => !h.isArchived && shouldHabitBeCompletedOn(h, today));
}

// Todos los hábitos activos (sin importar el día)
export function useActiveHabits() {
  return useHabitStore(s => s.habits.filter(h => !h.isArchived));
}

// Hábitos archivados
export function useArchivedHabits() {
  return useHabitStore(s => s.habits.filter(h => h.isArchived));
}

// Progreso del día: { completed, total, percentage }
export function useDailyProgress(date?: string) {
  const habits  = useHabitStore(s => s.habits);
  const records = useHabitStore(s => s.records);
  const target  = date ?? getTodayString();

  const todayHabits = habits.filter(
    h => !h.isArchived && shouldHabitBeCompletedOn(h, target)
  );

  const completed = todayHabits.filter(habit => {
    const habitRecords = records[habit.id] ?? [];
    return habitRecords.some(r => r.date === target && r.completed);
  }).length;

  const total      = todayHabits.length;
  const percentage = total > 0 ? completed / total : 0;

  return { completed, total, percentage };
}

// Si un hábito está completado en una fecha
export function useIsHabitCompletedOn(habitId: string, date: string) {
  return useHabitStore(s => {
    const habitRecords = s.records[habitId] ?? [];
    return habitRecords.some(r => r.date === date && r.completed);
  });
}

// Un hábito con todas sus estadísticas calculadas
export function useHabitWithStats(habitId: string): HabitWithStats | null {
  const habit   = useHabitStore(s => s.habits.find(h => h.id === habitId));
  const records = useHabitStore(s => s.records[habitId] ?? []);

  if (!habit) return null;

  return {
    ...habit,
    currentStreak:    calculateCurrentStreak(habit, records),
    longestStreak:    calculateLongestStreak(habit, records),
    completionRate:   calculateCompletionRate(habit, records),
    isCompletedToday: isCompletedToday(records),
    totalCompletions: records.filter(r => r.completed).length,
  };
}

// Todos los hábitos activos con estadísticas
export function useAllHabitsWithStats(): HabitWithStats[] {
  const habits  = useHabitStore(s => s.habits.filter(h => !h.isArchived));
  const records = useHabitStore(s => s.records);

  return habits.map(habit => {
    const habitRecords = records[habit.id] ?? [];
    return {
      ...habit,
      currentStreak:    calculateCurrentStreak(habit, habitRecords),
      longestStreak:    calculateLongestStreak(habit, habitRecords),
      completionRate:   calculateCompletionRate(habit, habitRecords),
      isCompletedToday: isCompletedToday(habitRecords),
      totalCompletions: habitRecords.filter(r => r.completed).length,
    };
  });
}