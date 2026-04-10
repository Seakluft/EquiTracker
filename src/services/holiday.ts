import { isAfter, isBefore, parseISO, startOfDay, addDays, getDay, eachDayOfInterval, format } from "date-fns";

export interface Holiday {
  start_date: string;
  end_date: string;
  description: string;
}

export async function fetchZoneBHolidays(yearStart: number): Promise<Holiday[]> {
  const anneeScolaire = `${yearStart}-${yearStart + 1}`;
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?where=zones%20%3D%20%22Zone%20B%22%20AND%20annee_scolaire%20%3D%20%22${anneeScolaire}%22&order_by=start_date%20ASC&limit=100`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch holidays");
    const data = await response.json();
    
    // On ne garde qu'un seul enregistrement par période de vacances (unique start_date/end_date)
    const uniqueHolidays: Holiday[] = [];
    const seen = new Set<string>();

    for (const record of data.results) {
      const key = `${record.start_date}_${record.end_date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHolidays.push({
          start_date: record.start_date,
          end_date: record.end_date,
          description: record.description,
        });
      }
    }

    return uniqueHolidays;
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

    // Règle : Le samedi qui suit le dernier vendredi de cours est AFFICHÉ.
    // L'API donne souvent le début des vacances le samedi (ou le vendredi soir).
    // On considère que les vacances pour notre calendrier (qui n'affiche que les samedis)
    // commencent réellement le DIMANCHE qui suit le début officiel.
    
    // Si start est un samedi, le premier samedi de vacances est ce jour là, on veut l'afficher.
    // Si start est un vendredi, le samedi suivant est le lendemain, on veut aussi l'afficher.
    
    const startDay = getDay(start);
    let effectiveStartHoliday = start;
    
    if (startDay === 6) { // Samedi
      // Si les vacances commencent le samedi, on commence à masquer à partir du samedi SUIVANT.
      effectiveStartHoliday = addDays(start, 1);
    } else if (startDay === 5) { // Vendredi
      // Si les vacances commencent le vendredi soir, on maintient le samedi (le lendemain).
      effectiveStartHoliday = addDays(start, 2);
    }
    // Pour les autres jours (rare pour le début des vacances), on laisse tel quel.

    // On masque si d est >= effectiveStartHoliday et d < end
    if ((d.getTime() >= effectiveStartHoliday.getTime()) && (d.getTime() < end.getTime())) {
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
