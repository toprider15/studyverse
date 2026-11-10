"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [inv, setInv] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const b = await api("/api/bootstrap");
      setData(b);
      const m = await api("/api/matches");
      setMatches(m.matches || []);
      const s = await api("/api/arcade/scores?userId=" + (user?.id || ""));
      setScores(s.scores || []);
      const i = await api("/api/inventory");
      setInv(i.inventory || []);
    })();
  }, [user]);

  if (!user) return null;

  const upcoming = (data?.events || []).slice().sort((a:any,b:any)=>String(a.startsAt||a.date).localeCompare(String(b.startsAt||b.date))).slice(0,3);
  const today = new Date().toISOString().slice(0,10);
  const todayDow = new Date().getDay(); // 0 Sun..6 Sat; map to 1..5
  const dow = todayDow === 0 ? 7 : todayDow; // 1 Mon..5 Fri (approx)
  const todayMenuRows = (data?.menus || []).filter((m:any) => Number(m.dayOfWeek) === dow);
  const recentMatch = matches[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Welcome back, {user.username} 👋</h1>
          <p className="text-muted">Level {user.level} · {user.xp} XP · {user.coins} coins · {user.streak} day streak</p>
        </div>
        <div className="flex gap-2">
          <Link href="/academy/battles" className="btn btn-primary">⚔️ Battle</Link>
          <Link href="/hangout/arcade" className="btn btn-cyan">🕹️ Play</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="XP" value={user.xp} icon="✨" />
        <StatCard label="Coins" value={user.coins} icon="🪙" />
        <StatCard label="Level" value={user.level} icon="📈" />
        <StatCard label="Streak" value={user.streak} icon="🔥" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Daily Challenge</h2>
            <span className="badge badge-gold">+50 XP</span>
          </div>
          <p className="text-muted text-sm mb-4">Answer 5 quick questions to keep your streak alive.</p>
          <Link href="/academy/revision" className="btn btn-primary">Start Challenge</Link>
        </div>
        <div className="card p-5">
          <h2 className="font-bold text-lg mb-3">Today's Menu</h2>
          {todayMenuRows.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {todayMenuRows.map((it:any, i:number) => <li key={i} className="text-foreground/80">• {it.item} — {it.description}</li>)}
            </ul>
          ) : <p className="text-muted text-sm">No menu set.</p>}
          <Link href="/hangout/events" className="text-cyan text-xs mt-2 inline-block">View full week →</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold text-lg mb-3">Upcoming Events</h2>
          <div className="space-y-2">
            {upcoming.length === 0 && <p className="text-muted text-sm">No events.</p>}
            {upcoming.map((e:any) => (
              <div key={e.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted">{e.category} · {e.startsAt || e.date}</div>
                </div>
                <Countdown date={e.startsAt || e.date} />
              </div>
            ))}
          </div>
          <Link href="/hangout/events" className="text-cyan text-xs mt-3 inline-block">All events →</Link>
        </div>
        <div className="card p-5">
          <h2 className="font-bold text-lg mb-3">Recent Activity</h2>
          <div className="space-y-2 text-sm">
            {recentMatch ? (
              <div className="flex items-center justify-between">
                <span>Match {recentMatch.status}</span>
                <span className="text-muted">{new Date(recentMatch.createdAt).toLocaleDateString()}</span>
              </div>
            ) : <p className="text-muted text-sm">No matches yet. Start a battle!</p>}
            {scores.slice(0,3).map((s:any) => (
              <div key={s.id} className="flex items-center justify-between">
                <span>Arcade score</span>
                <span className="text-cyan">{s.score}</span>
              </div>
            ))}
            {inv.slice(0,3).map((i:any) => {
              const c = (data?.collectibles||[]).find((x:any)=>x.id===i.collectibleId);
              return <div key={i.id} className="flex items-center justify-between"><span>Collectible</span><span>{c?.icon} {c?.name}</span></div>;
            })}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Subject Progress</h2>
          <Link href="/academy/subjects" className="text-cyan text-xs">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(data?.subjects||[]).slice(0,8).map((s:any) => {
            const acc = Number(s.progress?.accuracy ?? 0);
            return (
              <div key={s.id} className="bg-card-2 rounded-lg p-3">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-accent to-cyan`} style={{ width: `${Math.max(acc,5)}%` }} />
                </div>
                <div className="text-xs text-muted mt-1">{acc}% accuracy</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Leaderboard Preview</h2>
          <Link href="/academy/leaderboards" className="text-cyan text-xs">Full board →</Link>
        </div>
        <LeaderboardPreview />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="card p-4">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
function Countdown({ date }: { date: string }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return <span className="badge badge-cyan">{days >= 0 ? days + "d" : "past"}</span>;
}
function LeaderboardPreview() {
  const [board, setBoard] = useState<any[]>([]);
  useEffect(() => { api("/api/leaderboard?type=grade").then((d) => setBoard((d.leaderboard||[]).slice(0,5))).catch(()=>{}); }, []);
  return (
    <div className="space-y-2">
      {board.map((u:any) => (
        <div key={u.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 text-muted">#{u.rank}</span>
            <span className="font-medium">{u.username}</span>
          </div>
          <span className="text-cyan">{u.xp} XP</span>
        </div>
      ))}
    </div>
  );
}