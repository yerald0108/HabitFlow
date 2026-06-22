// Sistema de migraciones versionadas.
// Cada migración es atómica: se aplica completa o no se aplica.
// Nunca modificar una migración existente; siempre agregar nuevas.

export interface Migration {
  version: number;
  description: string;
  sql: string[];  // Array de sentencias SQL a ejecutar en orden
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Crear tablas iniciales: habits y habit_records',
    sql: [
      // Tabla principal de hábitos
      `CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        emoji TEXT NOT NULL DEFAULT '✅',
        color TEXT NOT NULL DEFAULT '#6366F1',
        frequency TEXT NOT NULL DEFAULT 'daily' 
          CHECK(frequency IN ('daily', 'weekly', 'custom')),
        week_days TEXT NOT NULL DEFAULT '[]',
        reminder_time TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      // Tabla de registros diarios
      `CREATE TABLE IF NOT EXISTS habit_records (
        id TEXT PRIMARY KEY NOT NULL,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
        completed_at TEXT,
        note TEXT,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      )`,

      // Índices para consultas frecuentes
      // Buscar registros de un hábito específico
      `CREATE INDEX IF NOT EXISTS idx_habit_records_habit_id
        ON habit_records(habit_id)`,

      // Buscar registros por fecha (pantalla "Hoy")
      `CREATE INDEX IF NOT EXISTS idx_habit_records_date
        ON habit_records(date)`,

      // Buscar registros de un hábito en un rango de fechas (estadísticas)
      `CREATE INDEX IF NOT EXISTS idx_habit_records_habit_date
        ON habit_records(habit_id, date)`,

      // Tabla de control de migraciones
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL
      )`,
    ],
  },

  {
    version:     2,
    description: 'Crear tabla de almacenamiento clave-valor',
    sql: [
      `CREATE TABLE IF NOT EXISTS app_storage (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      )`,
    ],
  },
];