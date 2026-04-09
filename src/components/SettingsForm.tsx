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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Licence FFE (€)</label>
        <input
          type="number"
          step="0.01"
          value={licensePrice}
          onChange={(e) => setLicensePrice(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Forfait Annuel (€)</label>
        <input
          type="number"
          step="0.01"
          value={annualFee}
          onChange={(e) => setAnnualFee(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
