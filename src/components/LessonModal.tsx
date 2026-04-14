"use client";

import { updateLesson } from "@/app/actions";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { Horse, Discipline, Lesson } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function LessonModal({
  lesson,
  horses,
  disciplines,
  onClose,
}: {
  lesson: any;
  horses: Horse[];
  disciplines: Discipline[];
  onClose: () => void;
}) {
  const [isAbsent, setIsAbsent] = useState(lesson.isAbsent);
  const [horseId, setHorseId] = useState(lesson.horseId || "");
  const [disciplineId, setDisciplineId] = useState(lesson.disciplineId || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateLesson(lesson.id, {
      isAbsent,
      horseId: horseId || null,
      disciplineId: disciplineId || null,
    });
    setLoading(false);
    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md transition-all">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300 rounded-3xl border border-white bg-white/90 shadow-2xl overflow-hidden glass">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-800">Modifier la séance</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="text-center">
             <div className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Date de la séance
             </div>
             <div className="text-lg font-bold text-slate-700 capitalize">
                {format(new Date(lesson.date), "EEEE d MMMM yyyy", { locale: fr })}
             </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800">Présence</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Êtes-vous allé au cours ?</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAbsent(!isAbsent)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${isAbsent ? 'bg-slate-200' : 'bg-indigo-600'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${isAbsent ? 'translate-x-0' : 'translate-x-5'}`} />
              </button>
              <span className={`text-xs font-black w-16 text-center ${isAbsent ? "text-rose-500" : "text-emerald-500"}`}>
                 {isAbsent ? "ABSENT" : "PRÉSENT"}
              </span>
            </div>
          </div>

          {!isAbsent && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cheval favori</label>
                <select
                  value={horseId}
                  onChange={(e) => setHorseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choisir un cheval --</option>
                  {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Discipline pratiquée</label>
                <div className="grid grid-cols-2 gap-3">
                  {disciplines.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDisciplineId(d.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-bold transition-all ${
                        disciplineId === d.id 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100 ring-2 ring-indigo-100' 
                          : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${disciplineId === d.id ? 'bg-white' : 'bg-slate-50'}`}>
                        <img src={d.iconUrl || ""} alt="" className="h-5 w-5 object-contain" />
                      </div>
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 border-t border-slate-100 p-6 bg-slate-50/30">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Calcul...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Enregistrer
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
