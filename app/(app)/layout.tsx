"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/academy", label: "The Academy", icon: "📚" },
  { href: "/hangout", label: "The Hangout", icon: "🎮" },
];

const ACADEMY = [
  { href: "/academy/subjects", label: "Subjects", icon: "📖" },
  { href: "/academy/battles", label: "Academic Battles", icon: "⚔️" },
  { href: "/academy/tournaments", label: "Tournaments", icon: "🏆" },
  { href: "/academy/revision", label: "Revision & Exams", icon: "📝" },
  { href: "/academy/leaderboards", label: "Leaderboards", icon: "📊" },
];

const HANGOUT = [
  { href: "/hangout/space", label: "My Space", icon: "🏠" },
  { href: "/hangout/arcade", label: "Arcade", icon: "🕹️" },
  { href: "/hangout/events", label: "Events & Menu", icon: "📅" },
  { href: "/hangout/showdown", label: "Showdown", icon: "🏆" },
  { href: "/hangout/collectibles", label: "Collectibles", icon: "🎁" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (!loading && !user) router.replace("/"); }, [loading, user, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Loading STUDYVERSE…</div>;
  if (!user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur sticky top-0 h-screen">
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <span className="font-black text-xl bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">STUDYVERSE</span>
          </Link>
          <div className="text-xs text-muted mt-1">Study. Compete. Play. Collect.</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(n.href) ? "bg-accent/20 text-white border border-accent/40" : "text-muted hover:text-foreground hover:bg-white/5"}`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
          <div>
            <div className="text-xs uppercase tracking-widest text-muted px-3 mb-1">Academy</div>
            {ACADEMY.map((n) => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive(n.href) ? "bg-accent/20 text-white" : "text-muted hover:text-foreground hover:bg-white/5"}`}>
                <span>{n.icon}</span>{n.label}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted px-3 mb-1">Hangout</div>
            {HANGOUT.map((n) => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive(n.href) ? "bg-accent/20 text-white" : "text-muted hover:text-foreground hover:bg-white/5"}`}>
                <span>{n.icon}</span>{n.label}
              </Link>
            ))}
          </div>
          {user.role === "admin" && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted px-3 mb-1">Manage</div>
              {user.role === "admin" && <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive("/admin") ? "bg-accent/20 text-white" : "text-muted hover:text-foreground hover:bg-white/5"}`}>🛡️ Admin</Link>}
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center font-bold">{user.username[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.username}</div>
              <div className="text-xs text-muted">Lv {user.level} · {user.xp} XP</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost w-full mt-2 text-xs">Sign out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-black bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">STUDYVERSE</Link>
        <Link href="/dashboard" className="text-sm text-muted">☰</Link>
      </div>

      <main className="flex-1 md:ml-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}