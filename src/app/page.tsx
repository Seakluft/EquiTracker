import { getLessons, getHorses, getDisciplines } from "@/app/actions";
import CalendarView from "@/components/CalendarView";
import { fetchZoneBHolidays, isHoliday } from "@/services/holiday";

export default async function HomePage() {
  const allLessons = await getLessons();
  const horses = await getHorses();
  const disciplines = await getDisciplines();

  // On récupère les vacances pour l'année scolaire en cours (basé sur la 1ère leçon ou date actuelle)
  const firstLessonDate = allLessons.length > 0 ? new Date(allLessons[0].date) : new Date();
  const yearStart = firstLessonDate.getMonth() >= 8 ? firstLessonDate.getFullYear() : firstLessonDate.getFullYear() - 1;
  const holidays = await fetchZoneBHolidays(yearStart);

  // Filtrage strict : on ne garde que les leçons qui NE sont PAS pendant les vacances
  const lessons = allLessons.filter(lesson => !isHoliday(new Date(lesson.date), holidays));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Calendrier</h1>
          <p className="text-slate-500">Visualisez et gérez vos séances de l'année.</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-white border shadow-sm"></div>
            <span>Présent</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <div className="h-3 w-3 rounded bg-slate-100 border border-slate-200"></div>
            <span>Absent</span>
          </div>
        </div>
      </header>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-20 text-center">
          <p className="mb-4 text-lg font-medium text-slate-600">Aucune séance générée pour le moment.</p>
          <p className="text-slate-400">Rendez-vous dans les paramètres pour initialiser votre saison.</p>
        </div>
      ) : (
        <CalendarView lessons={lessons} horses={horses} disciplines={disciplines} />
      )}
    </div>
  );
}
