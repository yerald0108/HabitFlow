// src/store/uiStore.ts
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

interface UIState {
  toasts:          Toast[];
  showToast:       (message: string, type?: ToastType) => void;
  dismissToast:    (id: string) => void;
  isTabBarVisible: boolean;
  hideTabBar:      () => void;
  showTabBar:      () => void;
  isHabitFormOpen: boolean;
  editingHabitId:  string | null;
  openHabitForm:   (habitId?: string) => void;
  closeHabitForm:  () => void;
}

const useUIStore = create<UIState>((set) => ({
  toasts:          [],
  isTabBarVisible: true,
  isHabitFormOpen: false,
  editingHabitId:  null,

  showToast: (message, type = 'success') => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  hideTabBar: () => set({ isTabBarVisible: false }),
  showTabBar: () => set({ isTabBarVisible: true }),

  openHabitForm: (habitId) => set({
    isHabitFormOpen: true,
    editingHabitId:  habitId ?? null,
    isTabBarVisible: false,
  }),

  closeHabitForm: () => set({
    isHabitFormOpen: false,
    editingHabitId:  null,
    isTabBarVisible: true,
  }),
}));

export { useUIStore };