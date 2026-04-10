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

  const activeLessons = useMemo(() => {
    return allLessons.filter(l => getSeasonFromDate(l.date) === activeSeason);
  }, [allLessons, activeSeason]);

  return (
    <>
      {/* Sélecteur de Saisons (Tabs) */}
      {seasons.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2 border-b pb-4">
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
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeLessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all hover:shadow-md ${
              lesson.isAbsent
                ? "border-slate-200 bg-slate-50 opacity-60 grayscale"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <div className="flex h-10 items-center justify-between border-b px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/50">
              {format(new Date(lesson.date), "dd MMMM yyyy", { locale: fr })}
              {lesson.isAbsent && <span className="text-red-500">Absent</span>}
            </div>
            
            <div className="flex flex-1 items-center gap-4 p-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-slate-50 ${lesson.isAbsent ? "line-through text-slate-400" : ""}`}>
                {lesson.discipline?.iconUrl ? (
                  <img src={lesson.discipline.iconUrl} alt={lesson.discipline.name} className="h-12 w-12 object-contain" />
                ) : (
                  <div className="text-xs text-slate-300">Pas de discipline</div>
                )}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                <span className={`text-sm font-bold text-slate-700 ${lesson.isAbsent ? "line-through opacity-50" : ""}`}>
                  {lesson.horse?.name || "Non assigné"}
                </span>
                <span className="truncate text-xs text-slate-500">
                  {lesson.discipline?.name || "Saut / Dressage..."}
                </span>
              </div>
            </div>

            {!lesson.isAbsent && lesson.horse?.imageUrl && (
              <div className="absolute top-12 right-4 h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                <img src={lesson.horse.imageUrl} alt={lesson.horse.name} className="h-full w-full object-cover" />
              </div>
            )}

            {lesson.isAbsent && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-px w-full bg-slate-300 rotate-12"></div>
               </div>
            )}
          </button>
        ))}
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
