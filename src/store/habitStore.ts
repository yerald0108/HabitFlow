// src/store/habitStore.ts
import { create } from 'zustand';
import {
  Habit, HabitRecord,
  CreateHabitInput, UpdateHabitInput,
} from '../domain/models/Habit';
import { HabitRepository } from '../data/repositories/HabitRepository';
import { HabitRecordRepository } from '../data/repositories/HabitRecordRepository';
import { getTodayString, getLastNDays } from '../domain/utils/dateUtils';
import { NotificationService } from '../domain/services/NotificationService';

interface HabitState {
  habits:        Habit[];
  records:       Record<string, HabitRecord[]>;
  isLoading:     boolean;
  isInitialized: boolean;
  error:         string | null;

  initialize:          () => Promise<void>;
  createHabit:         (input: CreateHabitInput) => Promise<Habit>;
  updateHabit:         (input: UpdateHabitInput) => Promise<void>;
  archiveHabit:        (id: string) => Promise<void>;
  unarchiveHabit:      (id: string) => Promise<void>;
  deleteHabit:         (id: string) => Promise<void>;
  reorderHabits:       (orderedIds: string[]) => Promise<void>;
  toggleHabit:         (habitId: string, date?: string) => Promise<void>;
  loadRecordsForHabit: (habitId: string) => Promise<void>;
}

const useHabitStore = create<HabitState>((set, get) => ({
  habits:        [],
  records:       {},
  isLoading:     false,
  isInitialized: false,
  error:         null,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, error: null });
    try {
      const habits    = await HabitRepository.getAll();
      const startDate = getLastNDays(365)[0];
      const today     = getTodayString();
      const records: Record<string, HabitRecord[]> = {};

      for (const habit of habits) {
        records[habit.id] = await HabitRecordRepository.getByHabitIdAndDateRange(
          habit.id, startDate, today
        );
      }

      set({ habits, records, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ error: 'No se pudieron cargar los hábitos', isLoading: false });
      console.error('[Store] Error al inicializar:', error);
    }
  },

  createHabit: async (input) => {
    const habit = await HabitRepository.create(input);
    set(state => ({
      habits:  [...state.habits, habit],
      records: { ...state.records, [habit.id]: [] },
    }));
    return habit;
  },

  updateHabit: async (input) => {
    const updated = await HabitRepository.update(input);
    set(state => ({
      habits: state.habits.map(h => h.id === updated.id ? updated : h),
    }));
  },

  archiveHabit: async (id) => {
    await HabitRepository.setArchived(id, true);
    await NotificationService.cancelHabitReminder(id);
    set(state => ({
      habits: state.habits.map(h =>
        h.id === id ? { ...h, isArchived: true } : h
      ),
    }));
  },

  unarchiveHabit: async (id) => {
    await HabitRepository.setArchived(id, false);
    set(state => ({
      habits: state.habits.map(h =>
        h.id === id ? { ...h, isArchived: false } : h
      ),
    }));
  },

  deleteHabit: async (id) => {
    await HabitRepository.delete(id);
    set(state => {
      const newRecords = { ...state.records };
      delete newRecords[id];
      return {
        habits:  state.habits.filter(h => h.id !== id),
        records: newRecords,
      };
    });
  },

  reorderHabits: async (orderedIds) => {
    await HabitRepository.updateOrder(orderedIds);
    set(state => {
      const habitMap     = new Map(state.habits.map(h => [h.id, h]));
      const reordered    = orderedIds
        .map((id, index) => habitMap.has(id) ? { ...habitMap.get(id)!, order: index } : null)
        .filter(Boolean) as Habit[];
      const reorderedSet = new Set(orderedIds);
      const rest         = state.habits.filter(h => !reorderedSet.has(h.id));
      return { habits: [...reordered, ...rest] };
    });
  },

  toggleHabit: async (habitId, date) => {
    const targetDate = date ?? getTodayString();
    const record     = await HabitRecordRepository.toggle(habitId, targetDate);

    set(state => {
      const habitRecords  = [...(state.records[habitId] ?? [])];
      const existingIndex = habitRecords.findIndex(
        r => r.habitId === habitId && r.date === targetDate
      );

      if (existingIndex >= 0) {
        habitRecords[existingIndex] = record;
      } else {
        habitRecords.push(record);
      }

      return { records: { ...state.records, [habitId]: habitRecords } };
    });
  },

  loadRecordsForHabit: async (habitId) => {
    const startDate = getLastNDays(365)[0];
    const today     = getTodayString();
    const records   = await HabitRecordRepository.getByHabitIdAndDateRange(
      habitId, startDate, today
    );
    set(state => ({ records: { ...state.records, [habitId]: records } }));
  },
}));

export { useHabitStore };