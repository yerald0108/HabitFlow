// src/store/selectors.ts
import { useMemo } from 'react';
import { useHabitStore } from './habitStore';
import { getTodayString } from '../domain/utils/dateUtils';
import { shouldHabitBeCompletedOn } from '../domain/utils/streakUtils';
import { Habit } from '../domain/models/Habit';

export function useHabitsForToday(): Habit[] {
  const today  = getTodayString();
  const habits = useHabitStore(s => s.habits);
  return useMemo(
    () => habits.filter(h => !h.isArchived && shouldHabitBeCompletedOn(h, today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits]
  );
}

export function useActiveHabits(): Habit[] {
  const habits = useHabitStore(s => s.habits);
  return useMemo(
    () => habits.filter(h => !h.isArchived),
    [habits]
  );
}

export function useArchivedHabits(): Habit[] {
  const habits = useHabitStore(s => s.habits);
  return useMemo(
    () => habits.filter(h => h.isArchived),
    [habits]
  );
}

export function useDailyProgress(date?: string) {
  const target  = date ?? getTodayString();
  const habits  = useHabitStore(s => s.habits);
  const records = useHabitStore(s => s.records);

  return useMemo(() => {
    const todayHabits = habits.filter(
      h => !h.isArchived && shouldHabitBeCompletedOn(h, target)
    );
    const total     = todayHabits.length;
    const completed = todayHabits.filter(habit => {
      const recs = records[habit.id] ?? [];
      return recs.some(r => r.date === target && r.completed);
    }).length;
    const percentage = total > 0 ? completed / total : 0;
    return { completed, total, percentage };
  }, [habits, records, target]);
}

export function useIsHabitCompletedOn(habitId: string, date: string): boolean {
  return useHabitStore(s => {
    const recs = s.records[habitId] ?? [];
    return recs.some(r => r.date === date && r.completed);
  });
}