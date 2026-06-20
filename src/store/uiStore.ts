// Estado de la interfaz: modales, toasts, estados visuales.
// Separado del store de datos para mantener responsabilidades claras.

import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;

  // Modal de creación/edición
  isHabitFormOpen: boolean;
  editingHabitId: string | null;
  openHabitForm: (habitId?: string) => void;
  closeHabitForm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts:          [],
  isHabitFormOpen: false,
  editingHabitId:  null,

  showToast: (message, type = 'success') => {
    const id = Date.now().toString();
    set(state => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-dismiss después de 3 segundos
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id),
      }));
    }, 3000);
  },

  dismissToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  openHabitForm: (habitId) => {
    set({ isHabitFormOpen: true, editingHabitId: habitId ?? null });
  },

  closeHabitForm: () => {
    set({ isHabitFormOpen: false, editingHabitId: null });
  },
}));