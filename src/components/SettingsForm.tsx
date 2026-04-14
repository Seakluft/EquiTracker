"use client";

import { updateSettings } from "@/app/actions";
import { useState } from "react";

export default function SettingsForm({ settings }: { settings: any }) {
  const [licensePrice, setLicensePrice] = useState(settings.licensePrice);
  const [annualFee, setAnnualFee] = useState(settings.annualFee);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateSettings({ licensePrice, annualFee });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 sm:grid-cols-2">
      <div className="rounded-3xl border border-white bg-white p-6 card-shadow space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Licence FFE (€)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={licensePrice}
              onChange={(e) => setLicensePrice(parseFloat(e.target.value))}
              className="block w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">EUR</div>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed px-1">
          Le prix de votre licence fédérale annuelle pour l'assurance et les compétitions.
        </p>
      </div>

      <div className="rounded-3xl border border-white bg-white p-6 card-shadow space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Forfait Annuel (€)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={annualFee}
              onChange={(e) => setAnnualFee(parseFloat(e.target.value))}
              className="block w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 font-black text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">EUR</div>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed px-1">
          Le coût total de votre forfait club pour l'année complète.
        </p>
      </div>

      <div className="sm:col-span-2 flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Enregistrement...
            </span>
          ) : (
            "Mettre à jour mes paramètres"
          )}
        </button>
      </div>
    </form>
  );
}
