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

      <div className="space-y-2">
        {disciplines.map((disc) => (
          <div key={disc.id} className="flex items-center gap-3 rounded-lg border p-2">
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-slate-100 p-1">
              {disc.iconUrl ? (
                <img src={disc.iconUrl} alt={disc.name} className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full bg-slate-300" />
              )}
            </div>
            
            {editingId === disc.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 rounded border px-2 py-1 text-sm"
                />
                <button onClick={() => handleUpdate(disc.id)} className="text-green-600"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-400"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <div className="flex-1 text-sm font-medium">{disc.name}</div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingId(disc.id);
                    setNewName(disc.name);
                    setNewIconUrl(disc.iconUrl || "");
                  }} className="text-slate-400 hover:text-indigo-600">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleDelete(disc.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
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
