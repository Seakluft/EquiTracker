"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import LessonModal from "./LessonModal";
import { Horse, Discipline, Lesson } from "@prisma/client";
import { groupLessonsBySeason, getSeasonFromDate } from "@/lib/season";

type LessonWithDetails = Lesson & { horse: Horse | null; discipline: Discipline | null };

export default function CalendarView({
  lessons: allLessons,
  horses,
  disciplines,
}: {
  lessons: LessonWithDetails[];
  horses: Horse[];
  disciplines: Discipline[];
}) {
  const [selectedLesson, setSelectedLesson] = useState<LessonWithDetails | null>(null);

  // Grouper les leçons par saison
  const seasons = useMemo(() => {
    const grouped = groupLessonsBySeason(allLessons);
    return Object.keys(grouped).sort().reverse(); // Plus récentes en premier
  }, [allLessons]);

  // Saison active (par défaut la plus récente)
  const [activeSeason, setActiveSeason] = useState<string>(seasons[0] || "");
  
  // Filtres
  const [search, setSearch] = useState("");
  const [filterHorse, setFilterHorse] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");

  const filteredLessons = useMemo(() => {
    return allLessons
      .filter(l => getSeasonFromDate(l.date) === activeSeason)
      .filter(l => {
        const matchesSearch = 
          (l.horse?.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (l.discipline?.name || "").toLowerCase().includes(search.toLowerCase());
        
        const matchesHorse = filterHorse === "" || l.horseId === filterHorse;
        const matchesDiscipline = filterDiscipline === "" || l.disciplineId === filterDiscipline;
        
        return matchesSearch && matchesHorse && matchesDiscipline;
      });
  }, [allLessons, activeSeason, search, filterHorse, filterDiscipline]);

  return (
    <>
      {/* Sélecteur de Saisons (Tabs) */}
      <div className="mb-8 flex flex-col gap-6">
        {seasons.length > 1 && (
          <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4 overflow-x-auto no-scrollbar">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-black transition-all duration-300 ${
                  activeSeason === season
                    ? "bg-[#78350f] text-[#fef3c7] shadow-lg shadow-orange-900/20 scale-105"
                    : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                Saison {season}
              </button>
            ))}
          </div>
        )}

        {/* Barre de Recherche et Filtres */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative group sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Rechercher un cheval ou une discipline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white p-4 pl-12 text-sm font-bold text-stone-700 focus:ring-4 focus:ring-orange-100 focus:border-[#78350f]/40 outline-none transition-all card-shadow"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#78350f] transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
          </div>

          <select
            value={filterHorse}
            onChange={(e) => setFilterHorse(e.target.value)}
            className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-black text-stone-700 focus:ring-4 focus:ring-orange-100 outline-none transition-all card-shadow appearance-none cursor-pointer"
          >
            <option value="">Tous les chevaux</option>
            {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>

          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-black text-stone-700 focus:ring-4 focus:ring-orange-100 outline-none transition-all card-shadow appearance-none cursor-pointer"
          >
            <option value="">Toutes disciplines</option>
            {disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredLessons.map((lesson) => {
          const isFilled = lesson.horseId || lesson.disciplineId;
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all card-hover card-shadow ${
                lesson.isAbsent
                  ? "border-stone-100 bg-stone-50/50 grayscale"
                  : isFilled 
                    ? "border-white bg-white hover:border-[#78350f]/20" 
                    : "border-stone-200 bg-white/50 border-dashed"
              }`}
            >
              <div className={`flex h-10 items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${
                lesson.isAbsent ? "text-stone-400" : "text-stone-500"
              }`}>
                {format(new Date(lesson.date), "dd MMMM yyyy", { locale: fr })}
                {lesson.isAbsent && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-500">Absent</span>}
              </div>
              
              <div className="flex flex-1 items-center gap-4 p-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  lesson.isAbsent 
                    ? "border-stone-100 bg-stone-100/50" 
                    : isFilled ? "border-amber-50 bg-[#fef3c7]/30 group-hover:bg-[#fef3c7]/50" : "border-stone-100 bg-stone-50"
                }`}>
                  {lesson.discipline?.iconUrl ? (
                    <img src={lesson.discipline.iconUrl} alt={lesson.discipline.name} className="h-10 w-10 object-contain drop-shadow-sm transition-transform group-hover:rotate-6" />
                  ) : (
                    <div className="text-[10px] text-center px-1 text-stone-300 font-medium italic">Pas d'activité</div>
                  )}
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-base font-black tracking-tight transition-colors ${
                    lesson.isAbsent ? "text-stone-400 line-through" : isFilled ? "text-stone-900" : "text-stone-400 italic font-bold"
                  }`}>
                    {lesson.horse?.name || "À définir"}
                  </span>
                  <span className={`truncate text-xs font-bold transition-colors ${
                    lesson.isAbsent ? "text-stone-300" : isFilled ? "text-[#78350f]" : "text-stone-300"
                  }`}>
                    {lesson.discipline?.name || "Repos"}
                  </span>
                </div>
              </div>

              {!lesson.isAbsent && lesson.horse?.imageUrl && (
                <div className="absolute top-12 right-5 h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110">
                  <img src={lesson.horse.imageUrl} alt={lesson.horse.name} className="h-full w-full object-cover" />
                </div>
              )}

              {lesson.isAbsent && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="h-[2px] w-full bg-stone-400 rotate-12"></div>
                 </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          horses={horses}
          disciplines={disciplines}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </>
  );
}
