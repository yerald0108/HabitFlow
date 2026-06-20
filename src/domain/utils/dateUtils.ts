// Funciones puras para manejo de fechas.
// Sin efectos secundarios, completamente testeables.
// Formato interno de fecha: "YYYY-MM-DD"

/**
 * Obtiene la fecha de hoy en formato "YYYY-MM-DD"
 */
export function getTodayString(): string {
  return toDateString(new Date());
}

/**
 * Convierte un objeto Date a "YYYY-MM-DD"
 */
export function toDateString(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte "YYYY-MM-DD" a un objeto Date (medianoche local)
 */
export function fromDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Genera un array de fechas entre dos strings (inclusive)
 */
export function getDateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const current = fromDateString(startStr);
  const end     = fromDateString(endStr);

  while (current <= end) {
    dates.push(toDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Obtiene los últimos N días como array de strings, incluido hoy
 */
export function getLastNDays(n: number): string[] {
  const today = new Date();
  const dates: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(toDateString(date));
  }

  return dates;
}

/**
 * Obtiene todas las fechas del año actual para el heatmap
 */
export function getCurrentYearDates(): string[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1); // 1 enero
  return getDateRange(toDateString(start), toDateString(today));
}

/**
 * Formatea una fecha para mostrar en la UI
 * Ejemplo: "lunes, 20 de junio"
 */
export function formatDisplayDate(dateStr: string): string {
  const date = fromDateString(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Verifica si una fecha string es hoy
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Verifica si una fecha string es ayer
 */
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === toDateString(yesterday);
}

/**
 * Obtiene el día de la semana (0=dom, 1=lun, ..., 6=sáb)
 */
export function getWeekDay(dateStr: string): number {
  return fromDateString(dateStr).getDay();
}

/**
 * Genera un ID único basado en timestamp + random
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}