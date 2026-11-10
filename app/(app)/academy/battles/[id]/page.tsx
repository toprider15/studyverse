"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function MatchPlay() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = async () => {
    const d = await api("/api/matches/" + id);
    setMatch(d.match);
    setQuestions(d.questions || []);
    setPlayers(d.players || []);
    if (d.match.status === "completed") setDone(true);
  };
  useEffect(() => { load().catch(()=>{}); }, [id]);

  useEffect(() => {
    if (!match || match.status !== "active" || done) return;
    const total = match.timeLimitSec || 150;
    setTimeLeft(total);
    const t = setInterval(() => setTimeLeft((x) => { if (x <= 1) { clearInterval(t); finish(); return 0; } return x - 1; }), 1000);
    return () => clearInterval(t);
  }, [match]);

  const submitAnswer = async () => {
    if (!questions[idx]) return;
    await api("/api/matches/" + id + "/answer", { method: "POST", body: JSON.stringify({ questionId: questions[idx].id, answer: chosen }) }).catch(()=>{});
    if (idx + 1 >= questions.length) finish();
    else { setIdx(idx + 1); setChosen(null); }
  };

  const finish = async () => {
    try {
      const d = await api("/api/matches/" + id + "/complete", { method: "POST" });
      setResult(d);
      setDone(true);
      load();
    } catch (e) { console.error(e); }
  };

  if (!match) return <div className="text-muted">Loading match…</div>;

  if (done) {
    const m = result?.match || match;
    const myScore = m.scores?.[user?.id || ""] ?? 0;
    const oppId = match.playerA === user?.id ? match.playerB : match.playerA;
    const oppScore = m.scores?.[oppId] ?? 0;
    const won = m.winner === user?.id;
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="text-5xl mb-2">{won ? "🏆" : m.winner ? "💪" : "🤝"}</div>
          <h1 className="text-3xl font-black">{won ? "Victory!" : m.winner ? "Defeat" : "Draw"}</h1>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-card-2 rounded-lg p-4">
              <div className="text-sm text-muted">You</div>
              <div className="text-2xl font-black">{myScore}</div>
              <div className="text-xs text-cyan">+{m.xpAwarded?.[user?.id || ""]} XP · +{m.coinsAwarded?.[user?.id || ""]} coins</div>
            </div>
            <div className="bg-card-2 rounded-lg p-4">
              <div className="text-sm text-muted">Opponent</div>
              <div className="text-2xl font-black">{oppScore}</div>
            </div>
          </div>
          <button className="btn btn-primary mt-6" onClick={() => router.push("/academy/battles")}>Back to Battles</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const opp = players.find((p:any) => p.id !== user?.id);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">{user?.username} vs {opp?.username}</div>
        <div className="badge badge-cyan">⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}</div>
      </div>
      <div className="card p-6">
        <div className="text-xs text-muted mb-2">Question {idx+1}/{questions.length}</div>
        <div className="text-lg font-semibold mb-4">{q?.prompt}</div>
        <div className="space-y-2">
          {(q?.options || []).map((o:string) => (
            <button key={o} onClick={() => setChosen(o)} className={`w-full text-left px-4 py-3 rounded-lg border transition ${chosen===o?"border-accent bg-accent/20":"border-border hover:border-accent/50"}`}>{o}</button>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <button className="btn btn-ghost" onClick={() => { if (idx+1>=questions.length) finish(); else { setIdx(idx+1); setChosen(null); } }}>Skip</button>
          <button className="btn btn-primary" disabled={!chosen} onClick={submitAnswer}>Submit & Next</button>
        </div>
      </div>
    </div>
  );
}