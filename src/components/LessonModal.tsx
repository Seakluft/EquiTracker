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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-200 rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Modifier la séance</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100"><X /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center font-medium text-slate-500 uppercase tracking-widest text-sm">
             {format(new Date(lesson.date), "EEEE d MMMM yyyy", { locale: fr })}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border bg-slate-50 p-4">
            <span className="font-semibold">Présence</span>
            <button
              onClick={() => setIsAbsent(!isAbsent)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${isAbsent ? 'bg-slate-200' : 'bg-indigo-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isAbsent ? 'translate-x-0' : 'translate-x-5'}`} />
            </button>
            <span className={isAbsent ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
               {isAbsent ? "ABSENT" : "PRÉSENT"}
            </span>
          </div>

          {!isAbsent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cheval</label>
                <select
                  value={horseId}
                  onChange={(e) => setHorseId(e.target.value)}
                  className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Choisir un cheval --</option>
                  {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discipline</label>
                <div className="grid grid-cols-2 gap-2">
                  {disciplines.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDisciplineId(d.id)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-all ${disciplineId === d.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' : 'bg-white hover:border-slate-300'}`}
                    >
                      <img src={d.iconUrl || ""} alt="" className="h-5 w-5 object-contain opacity-70" />
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border py-2 font-medium hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-600 py-2 font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
