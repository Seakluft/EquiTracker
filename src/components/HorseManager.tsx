"use client";

import { addHorse, deleteHorse, updateHorse } from "@/app/actions";
import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";

export default function HorseManager({ initialHorses }: { initialHorses: any[] }) {
  const [horses, setHorses] = useState(initialHorses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addHorse({ name: newName, imageUrl: newImageUrl });
    setNewName("");
    setNewImageUrl("");
    setIsAdding(false);
    // Refresh list (normally revalidatePath does it, but we can update local state for better UX)
    window.location.reload();
  }

  async function handleUpdate(id: string) {
    await updateHorse(id, { name: newName, imageUrl: newImageUrl });
    setEditingId(null);
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (confirm("Supprimer ce cheval ?")) {
      await deleteHorse(id);
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
          <Plus className="h-4 w-4" /> Ajouter un cheval
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 rounded-lg border bg-slate-50 p-4">
          <input
            placeholder="Nom du cheval"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-md border p-2 text-sm"
            required
          />
          <input
            placeholder="URL de l'image (optionnel)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 rounded-md border p-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-green-600 p-2 text-white"><Check className="h-4 w-4" /></button>
            <button type="button" onClick={() => setIsAdding(false)} className="rounded-md bg-slate-400 p-2 text-white"><X className="h-4 w-4" /></button>
          </div>
        </form>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {horses.map((horse) => (
          <div key={horse.id} className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 card-shadow card-hover group">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-50 transition-transform group-hover:scale-105">
              {horse.imageUrl ? (
                <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300 font-bold text-xl">?</div>
              )}
            </div>
            
            {editingId === horse.id ? (
              <div className="flex flex-1 flex-col gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                />
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="rounded-xl border border-slate-100 px-3 py-1 text-[10px] text-slate-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                  placeholder="URL de l'image"
                />
                <div className="flex gap-3 mt-1">
                  <button onClick={() => handleUpdate(horse.id)} className="text-emerald-500 hover:text-emerald-600 p-1 rounded-lg hover:bg-emerald-50 transition-colors"><Check className="h-5 w-5" /></button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"><X className="h-5 w-5" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 font-black text-slate-800 tracking-tight">{horse.name}</div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setEditingId(horse.id);
                    setNewName(horse.name);
                    setNewImageUrl(horse.imageUrl || "");
                  }} className="text-slate-300 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(horse.id)} className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all">
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
