import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Calendar, ChartBar, Settings as SettingsIcon, Sparkles } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquiTracker",
  description: "Suivez vos séances d'équitation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 group-hover:bg-indigo-500 transition-colors">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">EquiTracker</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <Calendar className="h-4 w-4" />
                  Calendrier
                </Link>
                <Link href="/stats" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <ChartBar className="h-4 w-4" />
                  Stats
                </Link>
                <Link href="/settings" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <SettingsIcon className="h-4 w-4" />
                  Paramètres
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:block h-10 w-px bg-slate-100"></div>
                 <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-black text-slate-400 text-xs">
                    JR
                 </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="container mx-auto max-w-6xl">
              {children}
            </div>
          </main>
          <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} EquiTracker - Gestion de séances d'équitation</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
