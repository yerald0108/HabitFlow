// src/domain/utils/storage.ts
import { db } from '../../data/database/database';

export const Storage = {
  async get(key: string): Promise<string | null> {
    try {
      const row = await db.getConnection().getFirstAsync<{ value: string }>(
        `SELECT value FROM app_storage WHERE key = ?`, [key]
      );
      return row?.value ?? null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    await db.getConnection().runAsync(
      `INSERT OR REPLACE INTO app_storage (key, value) VALUES (?, ?)`,
      [key, value]
    );
  },
};