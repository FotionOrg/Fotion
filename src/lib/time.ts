export interface TimePeriod {
  start: Date;
  end: Date;
}

const MS_PER_SECOND = 1000;
const MS_PER_DAY = 24 * 60 * 60 * MS_PER_SECOND;

export function getActivityDay(date: Date, dayBoundaryMinutes: number): TimePeriod {
  const start = new Date(date);
  start.setHours(0, dayBoundaryMinutes, 0, 0);

  if (date.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 1);
  }

  const end = new Date(start.getTime() + MS_PER_DAY);
  return { start, end };
}

export function getWeekPeriods(date: Date, dayBoundaryMinutes: number): TimePeriod[] {
  const day = getActivityDay(date, dayBoundaryMinutes).start;
  const mondayOffset = (day.getDay() + 6) % 7;
  const monday = new Date(day);
  monday.setDate(day.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const start = new Date(monday.getTime() + index * MS_PER_DAY);
    const end = new Date(start.getTime() + MS_PER_DAY);
    return { start, end };
  });
}

export function toAwTimePeriod(period: TimePeriod): string {
  return `${period.start.toISOString()}/${period.end.toISOString()}`;
}

export function clampDateRange(start: Date, end: Date, period: TimePeriod): TimePeriod | null {
  const clampedStart = new Date(Math.max(start.getTime(), period.start.getTime()));
  const clampedEnd = new Date(Math.min(end.getTime(), period.end.getTime()));
  if (clampedEnd.getTime() <= clampedStart.getTime()) {
    return null;
  }
  return { start: clampedStart, end: clampedEnd };
}

export function secondsBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_SECOND);
}

export function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string, fallback: Date): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return fallback;
  }
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatHourLabel(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
