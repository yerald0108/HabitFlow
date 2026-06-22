// Módulo independiente que encapsula toda la lógica de notificaciones.
// El resto de la app nunca importa expo-notifications directamente.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Habit } from '../models/Habit';

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
  }),
});

export const NotificationService = {

  // Solicitar permisos al usuario
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('[Notifications] Emulador detectado — permisos omitidos');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habitflow', {
        name:       'HabitFlow Recordatorios',
        importance: Notifications.AndroidImportance.HIGH,
        sound:      'default',
      });
    }

    return status === 'granted';
  },

  // Programar notificación diaria para un hábito
  async scheduleHabitReminder(habit: Habit): Promise<string | null> {
    if (!habit.reminderTime) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Cancelar notificación previa del mismo hábito
    await this.cancelHabitReminder(habit.id);

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);

    try {
      // Determinar trigger según frecuencia
      let trigger: any;

      if (habit.frequency === 'daily') {
        trigger = {
            type:    Notifications.SchedulableTriggerInputTypes.DAILY,
            hour:    hours,
            minute:  minutes,
        };
      } else if (
        (habit.frequency === 'weekly' || habit.frequency === 'custom') &&
        habit.weekDays.length > 0
      ) {
        // Programar una notificación por cada día de la semana configurado
        const ids: string[] = [];
        for (const weekDay of habit.weekDays) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ ${habit.emoji} ${habit.name}`,
              body:  '¡Es hora de mantener tu hábito!',
              data:  { habitId: habit.id },
              sound: 'default',
            },
            trigger: {
                type:    Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: weekDay === 0 ? 1 : weekDay + 1,
                hour:    hours,
                minute:  minutes,
            },
          });
          ids.push(id);
        }
        // Guardar todos los IDs como JSON en el primer ID
        return JSON.stringify(ids);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${habit.emoji} ${habit.name}`,
          body:  '¡Es hora de mantener tu hábito!',
          data:  { habitId: habit.id },
          sound: 'default',
        },
        trigger,
      });

      console.log(`[Notifications] Recordatorio programado para "${habit.name}": ${id}`);
      return id;

    } catch (error) {
      console.error('[Notifications] Error al programar:', error);
      return null;
    }
  },

  // Cancelar notificaciones de un hábito
  async cancelHabitReminder(habitId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel  = scheduled.filter(
        n => n.content.data?.habitId === habitId
      );
      for (const notif of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    } catch (error) {
      console.error('[Notifications] Error al cancelar:', error);
    }
  },

  // Cancelar todas las notificaciones
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Reprogramar todas las notificaciones (al reiniciar la app)
  async rescheduleAll(habits: Habit[]): Promise<void> {
    for (const habit of habits) {
      if (!habit.isArchived && habit.reminderTime) {
        await this.scheduleHabitReminder(habit);
      }
    }
  },

  // Verificar si los permisos están concedidos
  async hasPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },
};