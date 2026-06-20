// Funciones puras para cálculo de rachas y estadísticas.
// Toda la lógica de negocio de gamificación vive aquí.

import { Habit, HabitRecord, WeekDay } from '../models/Habit';
import { getTodayString, fromDateString, toDateString, getWeekDay } from './dateUtils';

/**
 * Determina si un hábito debería haberse completado en una fecha dada
 */
export function shouldHabitBeCompletedOn(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === 'daily') {
    return true;
  }

  const weekDay = getWeekDay(dateStr) as WeekDay;

  if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
    return habit.weekDays.includes(weekDay);
  }

  return false;
}

/**
 * Calcula la racha actual de un hábito.
 * La racha se rompe si hay un día esperado sin completar.
 * Si hoy aún no está completado pero el hábito es de hoy, no rompe la racha.
 */
export function calculateCurrentStreak(
  habit: Habit,
  records: HabitRecord[]
): number {
  const completedDates = new Set(
    records.filter(r => r.completed).map(r => r.date)
  );

  const today = getTodayString();
  let streak = 0;
  let checkDate = new Date();

  // Empezar desde hoy hacia atrás
  // Si hoy no está completado aún, empezamos desde ayer
  const todayShouldBeCompleted = shouldHabitBeCompletedOn(habit, today);
  const todayIsCompleted = completedDates.has(today);

  if (todayShouldBeCompleted && !todayIsCompleted) {
    // Hoy es un día esperado pero no completado:
    // Empezamos a contar desde ayer
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Recorremos hacia atrás hasta que se rompa la racha
  for (let i = 0; i < 365; i++) {
    const dateStr = toDateString(checkDate);
    const shouldComplete = shouldHabitBeCompletedOn(habit, dateStr);

    if (!shouldComplete) {
      // Día no requerido: no cuenta ni rompe
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    if (completedDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Día requerido y no completado: racha rota
      break;
    }
  }

  return streak;
}

/**
 * Calcula la racha más larga de todos los tiempos
 */
export function calculateLongestStreak(
  habit: Habit,
  records: HabitRecord[]
): number {
  if (records.length === 0) return 0;

  const completedDates = new Set(
    records.filter(r => r.completed).map(r => r.date)
  );

  // Ordenar todas las fechas completadas
  const sortedDates = Array.from(completedDates).sort();
  if (sortedDates.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;
  let checkDate = fromDateString(sortedDates[0]);
  const lastDate = fromDateString(sortedDates[sortedDates.length - 1]);

  while (checkDate <= lastDate) {
    const dateStr = toDateString(checkDate);
    const shouldComplete = shouldHabitBeCompletedOn(habit, dateStr);

    if (!shouldComplete) {
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    if (completedDates.has(dateStr)) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  return longestStreak;
}

/**
 * Calcula el porcentaje de cumplimiento en los últimos N días
 */
export function calculateCompletionRate(
  habit: Habit,
  records: HabitRecord[],
  lastDays: number = 30
): number {
  const completedDates = new Set(
    records.filter(r => r.completed).map(r => r.date)
  );

  let expectedDays = 0;
  let completedDaysCount = 0;

  const today = new Date();

  for (let i = 0; i < lastDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = toDateString(date);

    if (shouldHabitBeCompletedOn(habit, dateStr)) {
      expectedDays++;
      if (completedDates.has(dateStr)) {
        completedDaysCount++;
      }
    }
  }

  if (expectedDays === 0) return 0;
  return completedDaysCount / expectedDays;
}

/**
 * Verifica si el hábito está completado hoy
 */
export function isCompletedToday(records: HabitRecord[]): boolean {
  const today = getTodayString();
  return records.some(r => r.date === today && r.completed);
}