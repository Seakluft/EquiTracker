import { getLessons, getHorses, getSettings, getDisciplines } from "@/app/actions";
import { fetchZoneBHolidays, isHoliday } from "@/services/holiday";
import StatsView from "@/components/StatsView";

export default async function StatsPage() {
  const allLessons = await getLessons();
  const horses = await getHorses();
  const settings = await getSettings();
  const disciplines = await getDisciplines();

  // On récupère les saisons présentes dans les leçons
  const seasons = Array.from(new Set(allLessons.map(l => {
    const d = new Date(l.date);
    return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  })));

  // On récupère les vacances pour toutes les saisons concernées pour filtrage
  const holidaysByYear = await Promise.all(
    seasons.map(async (year) => ({ year, holidays: await fetchZoneBHolidays(year) }))
  );

  // Filtrage strict : on ne garde que les leçons qui NE sont PAS pendant les vacances
  const lessons = allLessons.filter(lesson => {
    const d = new Date(lesson.date);
    const yearStart = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
    const yearHolidays = holidaysByYear.find(h => h.year === yearStart)?.holidays || [];
    return !isHoliday(d, yearHolidays);
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-slate-500">Un aperçu de votre progression et de vos coûts par saison.</p>
      </header>

      <StatsView 
        lessons={lessons} 
        horses={horses} 
        disciplines={disciplines} 
        settings={settings} 
      />
    </div>
  );
}
