import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

class Database {
  private connection: SQLite.SQLiteDatabase | null = null;

  getConnection(): SQLite.SQLiteDatabase {
    if (!this.connection) {
      throw new Error('Base de datos no inicializada. Llama a initialize() primero.');
    }
    return this.connection;
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await SQLite.openDatabaseAsync('habitflow.db');

      await this.connection.execAsync('PRAGMA journal_mode = WAL');
      await this.connection.execAsync('PRAGMA foreign_keys = ON');

      await this.runMigrations();

      console.log('[DB] Base de datos inicializada correctamente');
    } catch (error) {
      console.error('[DB] Error al inicializar:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    const conn = this.getConnection();

    await conn.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);

    const applied = await conn.getAllAsync<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version ASC'
    );
    const appliedVersions = new Set(applied.map(r => r.version));

    for (const migration of MIGRATIONS) {
      if (appliedVersions.has(migration.version)) continue;

      console.log(`[DB] Aplicando migración v${migration.version}: ${migration.description}`);

      for (const sql of migration.sql) {
        await conn.execAsync(sql);
      }

      await conn.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        [migration.version, new Date().toISOString()]
      );

      console.log(`[DB] Migración v${migration.version} aplicada`);
    }
  }

  close(): void {
    if (this.connection) {
      this.connection.closeAsync();
      this.connection = null;
    }
  }
}

export const db = new Database();