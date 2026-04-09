import { isAfter, isBefore, parseISO, startOfDay, addDays, getDay, eachDayOfInterval, format } from "date-fns";

export interface Holiday {
  start_date: string;
  end_date: string;
  description: string;
}

export async function fetchZoneBHolidays(yearStart: number): Promise<Holiday[]> {
  const anneeScolaire = `${yearStart}-${yearStart + 1}`;
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?where=location%20%3D%20%22Zone%20B%22%20AND%20annee_scolaire%20%3D%20%22${anneeScolaire}%22&order_by=start_date%20ASC&limit=50`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch holidays");
    const data = await response.json();
    return data.results.map((record: any) => ({
      start_date: record.start_date,
      end_date: record.end_date,
      description: record.description,
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
}

export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const d = startOfDay(date);
  
  for (const holiday of holidays) {
    const start = startOfDay(parseISO(holiday.start_date));
    const end = startOfDay(parseISO(holiday.end_date));

    // Si les vacances commencent un vendredi soir, le samedi qui suit est MAINTENU.
    // L'API donne souvent le start_date comme le samedi matin si les vacances commencent le vendredi soir.
    // Vérifions si le start_date est un samedi.
    const startDay = getDay(start);
    
    let effectiveStart = start;
    if (startDay === 5 || startDay === 6) { // Vendredi ou Samedi
      // Si les vacances commencent le vendredi soir ou le samedi, on maintient CE samedi.
      // On commence les "vacances" le dimanche.
      // On trouve le dimanche suivant le début des vacances.
      const daysToAdd = (7 - startDay) % 7;
      effectiveStart = addDays(start, daysToAdd === 0 ? 1 : daysToAdd);
      // Wait, simple logic: if it's Fri (5), add 2 days -> Sunday.
      // If it's Sat (6), add 1 day -> Sunday.
      if (startDay === 5) effectiveStart = addDays(start, 2);
      if (startDay === 6) effectiveStart = addDays(start, 1);
    }

    if (isAfter(d, addDays(effectiveStart, -1)) && isBefore(d, addDays(end, 1))) {
      return true;
    }
  }
  return false;
}

export function generateSaturdays(yearStart: number): Date[] {
  const start = new Date(yearStart, 8, 1); // 1er Septembre
  const end = new Date(yearStart + 1, 5, 30); // 30 Juin
  
  return eachDayOfInterval({ start, end }).filter(d => getDay(d) === 6);
}
