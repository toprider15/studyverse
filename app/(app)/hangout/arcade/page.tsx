"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Arcade() {
  const [games, setGames] = useState<any[]>([]);
  const [bests, setBests] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      const b = await api("/api/bootstrap");
      setGames(b.arcadeGames || []);
      // personal bests
      const u = await api("/api/auth/me").catch(()=>null);
      if (u?.user) {
        const s = await api("/api/arcade/scores?userId=" + u.user.id);
        const map: Record<string, number> = {};
        (s.scores || []).forEach((x:any) => { map[x.gameId] = Math.max(map[x.gameId]||0, x.score); });
        setBests(map);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Arcade 🕹️</h1>
      <p className="text-muted">Play mini-games, beat your personal best.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((g:any) => (
          <Link key={g.key} href={`/hangout/arcade/${g.key}`} className="card card-hover p-5">
            <div className="text-3xl">🎮</div>
            <div className="font-bold mt-2">{g.name}</div>
            <div className="text-xs text-muted mt-1">{g.description}</div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="badge badge-cyan">{g.unit}</span>
              <span className="text-gold">Best: {bests[g.key] ?? 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}