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

  const presentLessons = useMemo(() => 
    activeLessons.filter(l => !l.isAbsent && (l.horseId || l.disciplineId)), 
    [activeLessons]
  );
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
    <div className="space-y-10">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-5">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => setActiveSeason(season)}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all duration-200 ${
              activeSeason === season
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            Saison {season}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white bg-white p-6 card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Séances (Saison)</p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl font-black text-slate-900">{presentLessons.length}</p>
            <p className="text-lg font-medium text-slate-400">/ {activeLessons.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white bg-white p-6 card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Absences & Impact</p>
          <p className="mt-2 text-3xl font-black text-rose-500">{activeLessons.filter(l => l.isAbsent).length}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">-{lossFromAbsence.toFixed(2)}€ perdus</p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-6 card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Calories brûlées (est.)</p>
          <p className="mt-2 text-3xl font-black text-orange-500">{totalCalories} <span className="text-lg font-bold text-orange-300">kcal</span></p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-6 card-shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Investissement Saison</p>
          <p className="mt-2 text-3xl font-black text-indigo-600">{seasonCost.toFixed(2)} <span className="text-lg font-bold text-indigo-300">€</span></p>
          <p className="mt-1 text-xs font-semibold text-slate-400">~{costPerSession.toFixed(2)}€ / séance</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Activité Mensuelle */}
        <div className="rounded-3xl border border-white bg-white p-8 card-shadow">
          <h2 className="mb-6 text-xl font-black tracking-tight text-slate-800">Activité Mensuelle</h2>
          <div className="space-y-5">
            {monthlyActivity.map(month => (
              <div key={month.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-slate-600">{month.name}</span>
                  <span className="text-indigo-500">{month.present} séance(s)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  <div
                    className="h-3 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 ease-out"
                    style={{ width: `${(month.present / (month.count || 1)) * 100}%` }}
                  ></div>
                  <div
                    className="h-3 bg-rose-200 transition-all duration-1000 ease-out"
                    style={{ width: `${((month.count - month.present) / (month.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Croisement Discipline x Cheval */}
        <div className="rounded-3xl border border-white bg-white p-8 card-shadow">
          <h2 className="mb-6 text-xl font-black tracking-tight text-slate-800">Discipline x Cheval</h2>
          <div className="space-y-8">
            {crossStats.map(stat => (
              <div key={stat.discipline} className="space-y-3">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                  <span>{stat.discipline}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">{stat.total} séances</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stat.horses.map(h => (
                    <div key={h.name} className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm flex items-center gap-3 transition-colors hover:bg-white hover:border-indigo-100 group">
                      <span className="font-black text-indigo-600 bg-white shadow-sm rounded-lg w-7 h-7 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">{h.count}</span>
                      <span className="text-slate-700 font-bold">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {crossStats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-slate-400">Pas encore assez de données croisées.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
