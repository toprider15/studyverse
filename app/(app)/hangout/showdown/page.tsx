"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Showdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [opponents, setOpponents] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState("");
  const [auto, setAuto] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const b = await api("/api/bootstrap");
      setGames(b.arcadeGames || []);
      const m = await api("/api/matches");
      setMatches((m.matches || []).filter((x:any) => x.type === "showdown"));
      const u = await api("/api/users");
      setOpponents((u.users || []).filter((x:any) => x.role === "student" && x.id !== user?.id));
    })();
  }, [user]);

  const start = async () => {
    if (!selectedGame) return;
    setBusy(true); setErr("");
    try {
      const g = games.find((x:any) => x.id === selectedGame);
      const body: any = { subjectId: "arcade", type: "showdown", gameId: selectedGame };
      if (!auto && selectedOpp) body.opponentId = selectedOpp;
      // matchmaking for showdown: any student
      // We'll create via matches endpoint but subjectId dummy; matchmaking canMatch returns true for non-lang/math subjects
      const d = await api("/api/matches", { method: "POST", body: JSON.stringify(body) });
      const slug = g?.slug;
      router.push(`/hangout/arcade/${slug}?match=${d.match.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Showdown 🏆</h1>
      <p className="text-muted">Competitive arcade. Every showdown uses a real Arcade game.</p>
      <div className="card p-5 space-y-3">
        <div>
          <label className="text-sm text-muted">Arcade Game</label>
          <select className="input mt-1" value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
            <option value="">Select game…</option>
            {games.map((g:any) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-match opponent
        </label>
        {!auto && (
          <select className="input" value={selectedOpp} onChange={(e) => setSelectedOpp(e.target.value)}>
            <option value="">Select opponent…</option>
            {opponents.map((u:any) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        )}
        {err && <div className="text-danger text-sm">{err}</div>}
        <button className="btn btn-primary" disabled={!selectedGame || busy} onClick={start}>{busy ? "Matching…" : "Start Showdown"}</button>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Showdown History</h2>
        <div className="space-y-2">
          {matches.length === 0 && <p className="text-muted text-sm">No showdowns yet.</p>}
          {matches.map((m:any) => (
            <div key={m.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
              <span>{m.gameId} · {m.status}</span>
              <span className="text-muted">{m.winner ? "Winner: " + m.winner : "in progress"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}