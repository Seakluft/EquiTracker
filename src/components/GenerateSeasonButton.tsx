"use client";

import { generateSeason } from "@/app/actions";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function GenerateSeasonButton() {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  async function handleGenerate() {
    if (confirm(`Générer le calendrier pour la saison ${year}-${year + 1} ?`)) {
      setLoading(true);
      await generateSeason(year);
      setLoading(false);
      alert("Saison générée !");
      window.location.reload();
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Saison (début) :</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-24 rounded-md border p-1 text-sm"
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600 disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" /> {loading ? "Génération..." : "Générer la Saison"}
      </button>
    </div>
  );
}
