import { db } from '../database/database';
import { HabitRecord } from '../../domain/models/Habit';
import { generateId } from '../../domain/utils/dateUtils';

function rowToRecord(row: any): HabitRecord {
  return {
    id:          row.id,
    habitId:     row.habit_id,
    date:        row.date,
    completed:   row.completed === 1,
    completedAt: row.completed_at ?? null,
    note:        row.note ?? null,
  };
}

export const HabitRecordRepository = {

  async getByHabitId(habitId: string): Promise<HabitRecord[]> {
    const rows = await db.getConnection().getAllAsync<any>(
      `SELECT * FROM habit_records WHERE habit_id = ? ORDER BY date DESC`, [habitId]
    );
    return rows.map(rowToRecord);
  },

  async getByHabitIdAndDateRange(
    habitId: string, startDate: string, endDate: string
  ): Promise<HabitRecord[]> {
    const rows = await db.getConnection().getAllAsync<any>(
      `SELECT * FROM habit_records
       WHERE habit_id = ? AND date BETWEEN ? AND ?
       ORDER BY date DESC`,
      [habitId, startDate, endDate]
    );
    return rows.map(rowToRecord);
  },

  async getByDate(date: string): Promise<HabitRecord[]> {
    const rows = await db.getConnection().getAllAsync<any>(
      `SELECT * FROM habit_records WHERE date = ?`, [date]
    );
    return rows.map(rowToRecord);
  },

  async getByHabitAndDate(habitId: string, date: string): Promise<HabitRecord | null> {
    const row = await db.getConnection().getFirstAsync<any>(
      `SELECT * FROM habit_records WHERE habit_id = ? AND date = ?`,
      [habitId, date]
    );
    return row ? rowToRecord(row) : null;
  },

  async toggle(habitId: string, date: string): Promise<HabitRecord> {
    const existing = await this.getByHabitAndDate(habitId, date);

    if (existing) {
      const newCompleted = !existing.completed;
      const completedAt  = newCompleted ? new Date().toISOString() : null;

      await db.getConnection().runAsync(
        `UPDATE habit_records SET completed = ?, completed_at = ?
         WHERE habit_id = ? AND date = ?`,
        [newCompleted ? 1 : 0, completedAt, habitId, date]
      );
    } else {
      const id = generateId();
      await db.getConnection().runAsync(
        `INSERT INTO habit_records (id, habit_id, date, completed, completed_at, note)
         VALUES (?, ?, ?, 1, ?, NULL)`,
        [id, habitId, date, new Date().toISOString()]
      );
    }

    return (await this.getByHabitAndDate(habitId, date))!;
  },

  async getCompletedDatesForHeatmap(
    habitId: string, startDate: string, endDate: string
  ): Promise<Set<string>> {
    const rows = await db.getConnection().getAllAsync<{ date: string }>(
      `SELECT date FROM habit_records
       WHERE habit_id = ? AND date BETWEEN ? AND ? AND completed = 1`,
      [habitId, startDate, endDate]
    );
    return new Set(rows.map(r => r.date));
  },

  async deleteByHabitId(habitId: string): Promise<void> {
    await db.getConnection().runAsync(
      `DELETE FROM habit_records WHERE habit_id = ?`, [habitId]
    );
  },
};