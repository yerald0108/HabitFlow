// Modelos de dominio — representan las entidades del negocio.
// Son interfaces puras sin lógica, solo estructura de datos.

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0 = domingo, 1 = lunes, ... 6 = sábado

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;           // Emoji representativo del hábito
  color: string;           // Color hex personalizado
  frequency: HabitFrequency;
  weekDays: WeekDay[];     // Días activos (para weekly y custom)
  reminderTime: string | null; // "HH:MM" o null si no hay recordatorio
  order: number;           // Para drag & drop en la lista
  isArchived: boolean;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;            // "YYYY-MM-DD" — clave de negocio
  completed: boolean;
  completedAt: string | null; // ISO 8601 del momento exacto
  note: string | null;
}

// Modelo enriquecido que combina hábito + datos calculados para la UI
export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;  // 0.0 a 1.0
  isCompletedToday: boolean;
  totalCompletions: number;
}

// Input para crear un hábito (sin campos autogenerados)
export type CreateHabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'order'>;
// Input para editar (todos los campos opcionales excepto id)
export type UpdateHabitInput = Partial<CreateHabitInput> & { id: string };