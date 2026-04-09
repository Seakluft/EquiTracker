import { getSettings, getHorses, getDisciplines } from "@/app/actions";
import SettingsForm from "@/components/SettingsForm";
import HorseManager from "@/components/HorseManager";
import DisciplineManager from "@/components/DisciplineManager";
import GenerateSeasonButton from "@/components/GenerateSeasonButton";

export default async function SettingsPage() {
  const settings = await getSettings();
  const horses = await getHorses();
  const disciplines = await getDisciplines();

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-slate-500">Gérez vos tarifs, vos chevaux et vos disciplines.</p>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Forfaits & Tarifs</h2>
            <SettingsForm settings={settings} />
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Initialisation du Calendrier</h2>
            <p className="mb-4 text-sm text-slate-500">
              Générez tous les samedis de la saison (septembre à juin) en tenant compte des vacances de la Zone B.
            </p>
            <GenerateSeasonButton />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Disciplines</h2>
            <DisciplineManager initialDisciplines={disciplines} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Mes Chevaux</h2>
        <HorseManager initialHorses={horses} />
      </section>
    </div>
  );
}
