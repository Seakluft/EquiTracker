"use client";

import { useState, useMemo } from "react";
import { Horse, Discipline, Lesson, Settings } from "@prisma/client";
import { groupLessonsBySeason, getSeasonFromDate } from "@/lib/season";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

type LessonWithDetails = Lesson & { horse: Horse | null; discipline: Discipline | null };

export default function StatsView({
  lessons: allLessons,
  horses,
  disciplines,
  settings,
}: {
  lessons: LessonWithDetails[];
  horses: Horse[];
  disciplines: Discipline[];
  settings: Settings;
}) {
  const seasons = useMemo(() => {
    const grouped = groupLessonsBySeason(allLessons);
    return Object.keys(grouped).sort().reverse();
  }, [allLessons]);

  const [activeSeason, setActiveSeason] = useState<string>(seasons[0] || "");

  const activeLessons = useMemo(() => {
    return allLessons.filter(l => getSeasonFromDate(l.date) === activeSeason);
  }, [allLessons, activeSeason]);

  const presentLessons = useMemo(() => activeLessons.filter(l => !l.isAbsent), [activeLessons]);
  const totalCalories = presentLessons.length * 450;

  // Calcul financier
  const seasonCost = settings.licensePrice + settings.annualFee;
  const costPerSession = activeLessons.length > 0 ? seasonCost / activeLessons.length : 0;
  const lossFromAbsence = activeLessons.filter(l => l.isAbsent).length * costPerSession;

  // Stats Chevaux par Discipline
  const crossStats = useMemo(() => {
    return disciplines.map(d => {
      const disciplineLessons = presentLessons.filter(l => l.disciplineId === d.id);
      const horseCounts = horses.map(h => ({
        name: h.name,
        count: disciplineLessons.filter(l => l.horseId === h.id).length
      })).filter(h => h.count > 0).sort((a, b) => b.count - a.count);

      return {
        discipline: d.name,
        total: disciplineLessons.length,
        horses: horseCounts
      };
    }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);
  }, [presentLessons, horses, disciplines]);

  // Activité Mensuelle
  const monthlyActivity = useMemo(() => {
    if (activeLessons.length === 0) return [];
    
    const dates = activeLessons.map(l => new Date(l.date));
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const months = eachMonthOfInterval({ start: startOfMonth(start), end: endOfMonth(end) });
    
    return months.map(month => ({
      name: format(month, "MMMM", { locale: fr }),
      count: activeLessons.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      }).length,
      present: presentLessons.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      }).length
    }));
  }, [activeLessons, presentLessons]);

  if (seasons.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-20 text-center">
          <p className="text-slate-400">Aucune statistique disponible. Générez une saison d'abord.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => setActiveSeason(season)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              activeSeason === season
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border hover:bg-slate-50"
            }`}
          >
            Saison {season}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Séances (Saison)</p>
          <p className="text-2xl font-bold">{presentLessons.length} / {activeLessons.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Absences & Impact</p>
          <p className="text-2xl font-bold text-red-500">{activeLessons.filter(l => l.isAbsent).length}</p>
          <p className="text-xs text-slate-400">-{lossFromAbsence.toFixed(2)}€ perdus</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Calories brûlées (est.)</p>
          <p className="text-2xl font-bold text-orange-500">{totalCalories} kcal</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Investissement Saison</p>
          <p className="text-2xl font-bold text-indigo-600">{seasonCost.toFixed(2)} €</p>
          <p className="text-xs text-slate-400">~{costPerSession.toFixed(2)}€ / séance</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Activité Mensuelle */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Activité Mensuelle</h2>
          <div className="space-y-3">
            {monthlyActivity.map(month => (
              <div key={month.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{month.name}</span>
                  <span className="text-slate-500">{month.present} séance(s)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-2 bg-indigo-500 transition-all"
                    style={{ width: `${(month.present / (month.count || 1)) * 100}%` }}
                  ></div>
                  <div
                    className="h-2 bg-red-200 transition-all"
                    style={{ width: `${((month.count - month.present) / (month.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Croisement Discipline x Cheval */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Discipline x Cheval</h2>
          <div className="space-y-6">
            {crossStats.map(stat => (
              <div key={stat.discipline} className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700 flex justify-between">
                  <span>{stat.discipline}</span>
                  <span className="text-xs font-normal text-slate-400">{stat.total} séances</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stat.horses.map(h => (
                    <div key={h.name} className="bg-slate-50 border rounded-lg px-3 py-1 text-xs flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">{h.count}</span>
                      <span className="text-slate-600">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {crossStats.length === 0 && <p className="text-sm text-slate-400">Pas encore assez de données croisées.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
