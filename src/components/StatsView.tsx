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
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-5 overflow-x-auto no-scrollbar">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => setActiveSeason(season)}
            className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300 ${
              activeSeason === season
                ? "bg-[#78350f] text-[#fef3c7] shadow-lg shadow-orange-900/20 scale-105"
                : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            Saison {season}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-100 bg-white p-6 card-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Séances (Saison)</p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-3xl font-black text-stone-900">{presentLessons.length}</p>
            <p className="text-lg font-bold text-stone-300">/ {activeLessons.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-6 card-shadow">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Absences & Impact</p>
          <p className="mt-2 text-3xl font-black text-rose-600">{activeLessons.filter(l => l.isAbsent).length}</p>
          <p className="mt-1 text-[10px] font-bold text-stone-400">-{lossFromAbsence.toFixed(2)}€ perdus</p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-6 card-shadow border-b-4 border-b-orange-400">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Calories brûlées (est.)</p>
          <p className="mt-2 text-3xl font-black text-[#78350f]">{totalCalories} <span className="text-sm font-black text-orange-300 uppercase">kcal</span></p>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-6 card-shadow border-b-4 border-b-emerald-600">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Investissement</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{seasonCost.toFixed(2)} <span className="text-sm font-black text-emerald-200 uppercase">€</span></p>
          <p className="mt-1 text-[10px] font-bold text-stone-400">~{costPerSession.toFixed(2)}€ / séance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activité Mensuelle */}
        <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 card-shadow">
          <h2 className="mb-6 text-xl font-black tracking-tight text-stone-800">Activité Mensuelle</h2>
          <div className="space-y-6">
            {monthlyActivity.map(month => (
              <div key={month.name} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-stone-500">{month.name}</span>
                  <span className="text-[#78350f]">{month.present} séance(s)</span>
                </div>
                <div className="h-4 w-full rounded-full bg-stone-100 overflow-hidden flex shadow-inner border border-stone-50">
                  <div
                    className="h-4 bg-gradient-to-r from-[#78350f] to-[#92400e] transition-all duration-1000 ease-out"
                    style={{ width: `${(month.present / (month.count || 1)) * 100}%` }}
                  ></div>
                  <div
                    className="h-4 bg-rose-200 transition-all duration-1000 ease-out"
                    style={{ width: `${((month.count - month.present) / (month.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Croisement Discipline x Cheval */}
        <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 card-shadow">
          <h2 className="mb-6 text-xl font-black tracking-tight text-stone-800">Discipline x Cheval</h2>
          <div className="space-y-8">
            {crossStats.map(stat => (
              <div key={stat.discipline} className="space-y-3">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex justify-between items-center">
                  <span>{stat.discipline}</span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-black text-stone-500">{stat.total}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stat.horses.map(h => (
                    <div key={h.name} className="bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-2 text-sm flex items-center gap-3 transition-all hover:bg-white hover:border-[#78350f]/20 group">
                      <span className="font-black text-[#78350f] bg-white shadow-sm rounded-lg w-7 h-7 flex items-center justify-center group-hover:bg-[#78350f] group-hover:text-[#fef3c7] transition-colors">{h.count}</span>
                      <span className="text-stone-700 font-bold tracking-tight">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {crossStats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Manque de données</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
