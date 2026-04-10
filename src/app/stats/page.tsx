import { getLessons, getHorses, getSettings, getDisciplines } from "@/app/actions";
import { Horse, Discipline, Lesson } from "@prisma/client";
import { fetchZoneBHolidays, isHoliday } from "@/services/holiday";

export default async function StatsPage() {
  const allLessons = await getLessons();
  const horses = await getHorses();
  const settings = await getSettings();
  const disciplines = await getDisciplines();

  // On récupère les vacances pour l'année scolaire en cours
  const firstLessonDate = allLessons.length > 0 ? new Date(allLessons[0].date) : new Date();
  const yearStart = firstLessonDate.getMonth() >= 8 ? firstLessonDate.getFullYear() : firstLessonDate.getFullYear() - 1;
  const holidays = await fetchZoneBHolidays(yearStart);

  // Filtrage strict : on ne garde que les leçons qui NE sont PAS pendant les vacances
  const lessons = allLessons.filter(lesson => !isHoliday(new Date(lesson.date), holidays));

  const presentLessons = lessons.filter(l => !l.isAbsent);
  const totalCalories = presentLessons.length * 450; // Estimation: 450 kcal per 1h session

  const horseStats = horses.map(h => ({
    name: h.name,
    count: presentLessons.filter(l => l.horseId === h.id).length
  })).sort((a, b) => b.count - a.count);

  const disciplineStats = disciplines.map(d => ({
    name: d.name,
    count: presentLessons.filter(l => l.disciplineId === d.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-slate-500">Un aperçu de votre progression et de vos coûts.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Séances totales</p>
          <p className="text-2xl font-bold">{presentLessons.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Absences</p>
          <p className="text-2xl font-bold text-red-500">{lessons.filter(l => l.isAbsent).length}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Calories brûlées (est.)</p>
          <p className="text-2xl font-bold text-orange-500">{totalCalories} kcal</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Coût total annuel</p>
          <p className="text-2xl font-bold text-indigo-600">{(settings.licensePrice + settings.annualFee).toFixed(2)} €</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Séances par Cheval</h2>
          <div className="space-y-4">
            {horseStats.map(stat => (
              <div key={stat.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-slate-500">{stat.count} séance(s)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${(stat.count / (presentLessons.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {horseStats.length === 0 && <p className="text-sm text-slate-400">Aucune donnée cheval disponible.</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Top Disciplines</h2>
          <div className="space-y-4">
            {disciplineStats.map(stat => (
              <div key={stat.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-slate-500">{stat.count} séance(s)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${(stat.count / (presentLessons.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
             {disciplineStats.length === 0 && <p className="text-sm text-slate-400">Aucune donnée discipline disponible.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
