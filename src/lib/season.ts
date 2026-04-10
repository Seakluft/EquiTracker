import { Lesson } from "@prisma/client";

export function getSeasonFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = d.getMonth(); // 0-11 (Jan-Dec)
  const year = d.getFullYear();
  
  // La saison commence en septembre (8)
  const seasonStartYear = month >= 8 ? year : year - 1;
  return `${seasonStartYear}-${seasonStartYear + 1}`;
}

export function groupLessonsBySeason<T extends { date: Date | string }>(lessons: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  lessons.forEach((lesson) => {
    const season = getSeasonFromDate(lesson.date);
    if (!groups[season]) {
      groups[season] = [];
    }
    groups[season].push(lesson);
  });
  
  return groups;
}

export function getCurrentSeason(): string {
  const now = new Date();
  return getSeasonFromDate(now);
}
