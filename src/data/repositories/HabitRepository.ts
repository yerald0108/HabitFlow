import { db } from '../database/database';
import { Habit, CreateHabitInput, UpdateHabitInput, WeekDay } from '../../domain/models/Habit';
import { generateId } from '../../domain/utils/dateUtils';

function rowToHabit(row: any): Habit {
  return {
    id:           row.id,
    name:         row.name,
    description:  row.description,
    emoji:        row.emoji,
    color:        row.color,
    frequency:    row.frequency,
    weekDays:     JSON.parse(row.week_days ?? '[]') as WeekDay[],
    reminderTime: row.reminder_time ?? null,
    order:        row.sort_order,
    isArchived:   row.is_archived === 1,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

export const HabitRepository = {

  async getActive(): Promise<Habit[]> {
    const rows = await db.getConnection().getAllAsync<any>(
      `SELECT * FROM habits WHERE is_archived = 0 ORDER BY sort_order ASC, created_at ASC`
    );
    return rows.map(rowToHabit);
  },

  async getAll(): Promise<Habit[]> {
    const rows = await db.getConnection().getAllAsync<any>(
      `SELECT * FROM habits ORDER BY is_archived ASC, sort_order ASC`
    );
    return rows.map(rowToHabit);
  },

  async getById(id: string): Promise<Habit | null> {
    const row = await db.getConnection().getFirstAsync<any>(
      `SELECT * FROM habits WHERE id = ?`, [id]
    );
    return row ? rowToHabit(row) : null;
  },

  async create(input: CreateHabitInput): Promise<Habit> {
    const id  = generateId();
    const now = new Date().toISOString();

    const orderRow = await db.getConnection().getFirstAsync<{ max_order: number }>(
      `SELECT MAX(sort_order) as max_order FROM habits`
    );
    const newOrder = (orderRow?.max_order ?? -1) + 1;

    await db.getConnection().runAsync(
      `INSERT INTO habits
        (id, name, description, emoji, color, frequency, week_days,
         reminder_time, sort_order, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, input.name, input.description, input.emoji, input.color,
       input.frequency, JSON.stringify(input.weekDays),
       input.reminderTime, newOrder, now, now]
    );

    return (await this.getById(id))!;
  },

  async update(input: UpdateHabitInput): Promise<Habit> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[]   = [];

    if (input.name         !== undefined) { fields.push('name = ?');         values.push(input.name); }
    if (input.description  !== undefined) { fields.push('description = ?');  values.push(input.description); }
    if (input.emoji        !== undefined) { fields.push('emoji = ?');         values.push(input.emoji); }
    if (input.color        !== undefined) { fields.push('color = ?');         values.push(input.color); }
    if (input.frequency    !== undefined) { fields.push('frequency = ?');     values.push(input.frequency); }
    if (input.weekDays     !== undefined) { fields.push('week_days = ?');     values.push(JSON.stringify(input.weekDays)); }
    if (input.reminderTime !== undefined) { fields.push('reminder_time = ?'); values.push(input.reminderTime); }

    fields.push('updated_at = ?');
    values.push(now, input.id);

    await db.getConnection().runAsync(
      `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values
    );

    return (await this.getById(input.id))!;
  },

  async setArchived(id: string, archived: boolean): Promise<void> {
    await db.getConnection().runAsync(
      `UPDATE habits SET is_archived = ?, updated_at = ? WHERE id = ?`,
      [archived ? 1 : 0, new Date().toISOString(), id]
    );
  },

  async delete(id: string): Promise<void> {
    await db.getConnection().runAsync(
      `DELETE FROM habits WHERE id = ?`, [id]
    );
  },

  async updateOrder(orderedIds: string[]): Promise<void> {
    const now = new Date().toISOString();
    for (let i = 0; i < orderedIds.length; i++) {
      await db.getConnection().runAsync(
        `UPDATE habits SET sort_order = ?, updated_at = ? WHERE id = ?`,
        [i, now, orderedIds[i]]
      );
    }
  },
};