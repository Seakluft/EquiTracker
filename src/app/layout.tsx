import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Calendar, ChartBar, Settings as SettingsIcon, Sparkles } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquiTracker",
  description: "Suivez vos séances d'équitation",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EquiTracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#78350f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#fafaf9] text-stone-900`}>
        <div className="flex min-h-screen flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-50 border-b border-stone-200/50 bg-white/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#78350f] shadow-lg shadow-orange-900/20 group-hover:bg-[#451a03] transition-colors">
                  <Sparkles className="h-6 w-6 text-[#fef3c7]" />
                </div>
                <span className="text-xl font-black tracking-tighter text-stone-800">EquiTracker</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 hover:text-[#78350f] transition-all">
                  <Calendar className="h-4 w-4" />
                  Calendrier
                </Link>
                <Link href="/stats" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 hover:text-[#78350f] transition-all">
                  <ChartBar className="h-4 w-4" />
                  Stats
                </Link>
                <Link href="/settings" className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 hover:text-[#78350f] transition-all">
                  <SettingsIcon className="h-4 w-4" />
                  Paramètres
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:block h-10 w-px bg-stone-100"></div>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200 bg-white/90 p-4 backdrop-blur-lg md:hidden">
            <Link href="/" className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#78350f]">
              <Calendar className="h-6 w-6" />
              <span className="text-[10px] font-bold">Agenda</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#78350f]">
              <ChartBar className="h-6 w-6" />
              <span className="text-[10px] font-bold">Stats</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#78350f]">
              <SettingsIcon className="h-6 w-6" />
              <span className="text-[10px] font-bold">Réglages</span>
            </Link>
          </nav>

          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="container mx-auto max-w-6xl">
              {children}
            </div>
          </main>
          <footer className="hidden md:block border-t bg-white py-6 text-center text-sm text-stone-400">
            <p>© {new Date().getFullYear()} EquiTracker - L'excellence au quotidien</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
