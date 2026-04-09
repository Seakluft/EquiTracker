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
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 transition-colors hover:text-indigo-500">
                <Sparkles className="h-6 w-6" />
                <span className="text-xl">EquiTracker</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-600">
                  <Calendar className="h-4 w-4" />
                  Calendrier
                </Link>
                <Link href="/stats" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-600">
                  <ChartBar className="h-4 w-4" />
                  Stats
                </Link>
                <Link href="/settings" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-600">
                  <SettingsIcon className="h-4 w-4" />
                  Paramètres
                </Link>
              </nav>
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
