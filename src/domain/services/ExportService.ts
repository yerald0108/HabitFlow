// src/domain/services/ExportService.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Habit, HabitRecord } from '../models/Habit';
import { getTodayString } from '../utils/dateUtils';

interface ExportData {
  exportedAt: string;
  version:    number;
  habits:     Habit[];
  records:    HabitRecord[];
}

export const ExportService = {

  async exportToJSON(
    habits:  Habit[],
    records: Record<string, HabitRecord[]>
  ): Promise<void> {
    const allRecords = Object.values(records).flat();

    const data: ExportData = {
      exportedAt: new Date().toISOString(),
      version:    1,
      habits,
      records:    allRecords,
    };

    const json     = JSON.stringify(data, null, 2);
    const fileName = `habitflow-backup-${getTodayString()}.json`;

    // API nueva de expo-file-system v2
    const fileUri = FileSystem.Paths.document + '/' + fileName;

    await FileSystem.writeAsStringAsync(fileUri, json);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType:    'application/json',
        dialogTitle: 'Exportar datos de HabitFlow',
      });
    }
  },

  async exportToCSV(
    habits:  Habit[],
    records: Record<string, HabitRecord[]>
  ): Promise<void> {
    const lines: string[] = ['Hábito,Fecha,Completado'];

    for (const habit of habits) {
      const habitRecords = records[habit.id] ?? [];
      for (const record of habitRecords) {
        lines.push(
          `"${habit.name}",${record.date},${record.completed ? 'Sí' : 'No'}`
        );
      }
    }

    const csv      = lines.join('\n');
    const fileName = `habitflow-${getTodayString()}.csv`;
    const fileUri  = FileSystem.Paths.document + '/' + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csv);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType:    'text/csv',
        dialogTitle: 'Exportar datos de HabitFlow',
      });
    }
  },
};