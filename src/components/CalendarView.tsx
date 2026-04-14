"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import LessonModal from "./LessonModal";
import { Horse, Discipline, Lesson } from "@prisma/client";
import { groupLessonsBySeason, getSeasonFromDate } from "@/lib/season";
import { NotebookText, Plus, X, Filter, Search } from "lucide-react";
import { createLesson } from "@/app/actions";

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
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));

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

  async function handleAddManualLesson() {
     const date = new Date(newDate);
     date.setHours(12, 0, 0, 0); // Heure standard
     await createLesson(date);
     setIsAddingDate(false);
     window.location.reload();
  }

  return (
    <>
      {/* Barre de Saisons et Actions */}
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-4">
          {seasons.length > 0 && (
            <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
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
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border px-5 py-2 text-sm font-black transition-all active:scale-95 md:hidden ${
                showFilters ? "bg-stone-100 border-stone-300 text-stone-900" : "bg-white border-stone-200 text-stone-500"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtrer
            </button>
            <button 
              onClick={() => setIsAddingDate(true)}
              className="flex-[2] sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-2 text-sm font-black text-[#fef3c7] shadow-xl shadow-stone-200 hover:bg-stone-800 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Nouvelle séance
            </button>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
          showFilters ? "block" : "hidden md:grid"
        }`}>
          <div className="relative group sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Rechercher un cheval..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white p-4 pl-12 text-sm font-bold text-stone-700 focus:ring-4 focus:ring-orange-100 focus:border-[#78350f]/40 outline-none transition-all card-shadow"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#78350f] transition-colors">
               <Search className="h-5 w-5" />
            </div>
          </div>

          <div className="relative">
            <select
              value={filterHorse}
              onChange={(e) => setFilterHorse(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm font-black text-stone-700 focus:ring-4 focus:ring-orange-100 outline-none transition-all card-shadow appearance-none cursor-pointer"
            >
              <option value="">Tous les chevaux</option>
              {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm font-black text-stone-700 focus:ring-4 focus:ring-orange-100 outline-none transition-all card-shadow appearance-none cursor-pointer"
            >
              <option value="">Toutes disciplines</option>
              {disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
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
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={`truncate text-xs font-bold transition-colors ${
                      lesson.isAbsent ? "text-stone-300" : isFilled ? "text-[#78350f]" : "text-stone-300"
                    }`}>
                      {lesson.discipline?.name || "Repos"}
                    </span>
                    {lesson.notes && (
                      <NotebookText className="h-3 w-3 text-emerald-600 shrink-0" />
                    )}
                  </div>
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

      {/* Modal d'ajout de date manuelle */}
      {isAddingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-white bg-white/90 p-8 shadow-2xl glass animate-in zoom-in duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-stone-800">Nouvelle séance</h2>
              <button onClick={() => setIsAddingDate(false)} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-stone-400">Date du cours</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white p-4 font-black text-stone-700 outline-none focus:ring-4 focus:ring-orange-100"
                />
              </div>
              
              <button
                onClick={handleAddManualLesson}
                className="w-full rounded-2xl bg-[#78350f] py-4 font-black text-[#fef3c7] shadow-xl shadow-orange-900/20 hover:bg-[#451a03] transition-all active:scale-95"
              >
                Créer la séance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
