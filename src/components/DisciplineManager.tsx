"use client";

import { addDiscipline, deleteDiscipline, updateDiscipline } from "@/app/actions";
import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";

export default function DisciplineManager({ initialDisciplines }: { initialDisciplines: any[] }) {
  const [disciplines, setDisciplines] = useState(initialDisciplines);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addDiscipline({ name: newName, iconUrl: newIconUrl });
    setNewName("");
    setNewIconUrl("");
    setIsAdding(false);
    window.location.reload();
  }

  async function handleUpdate(id: string) {
    await updateDiscipline(id, { name: newName, iconUrl: newIconUrl });
    setEditingId(null);
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (confirm("Supprimer cette discipline ?")) {
      await deleteDiscipline(id);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-lg border bg-slate-50 p-4">
          <input
            placeholder="Nom (ex: Obstacle, Dressage)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-md border p-2 text-sm"
            required
          />
          <input
            placeholder="URL icône PNG"
            value={newIconUrl}
            onChange={(e) => setNewIconUrl(e.target.value)}
            className="rounded-md border p-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-green-600 p-2 text-white"><Check className="h-4 w-4" /></button>
            <button type="button" onClick={() => setIsAdding(false)} className="rounded-md bg-slate-400 p-2 text-white"><X className="h-4 w-4" /></button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {disciplines.map((disc) => (
          <div key={disc.id} className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 card-shadow card-hover group">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-indigo-50/50 p-2 transition-transform group-hover:scale-110">
              {disc.iconUrl ? (
                <img src={disc.iconUrl} alt={disc.name} className="h-full w-full object-contain drop-shadow-sm" />
              ) : (
                <div className="h-full w-full bg-slate-100 rounded-md" />
              )}
            </div>
            
            {editingId === disc.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                />
                <button onClick={() => handleUpdate(disc.id)} className="text-emerald-500 p-2 hover:bg-emerald-50 rounded-xl transition-colors"><Check className="h-5 w-5" /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-300 p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
              </div>
            ) : (
              <>
                <div className="flex-1 text-sm font-black text-slate-800 tracking-tight">{disc.name}</div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setEditingId(disc.id);
                    setNewName(disc.name);
                    setNewIconUrl(disc.iconUrl || "");
                  }} className="text-slate-300 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(disc.id)} className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
