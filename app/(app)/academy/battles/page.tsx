"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Battles() {
  const { user } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [opponents, setOpponents] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState("");
  const [auto, setAuto] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const b = await api("/api/bootstrap");
      setSubjects((b.subjects || []).filter((s:any) => s.category !== "language" || true));
      const m = await api("/api/matches");
      setMatches(m.matches || []);
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) { setOpponents([]); return; }
    api("/api/users").then((d) => {
      // filter eligible handled server-side; show all students
      setOpponents((d.users || []).filter((u:any) => u.role === "student" && u.id !== user?.id));
    }).catch(()=>{});
  }, [subjectId, user]);

  const start = async () => {
    setBusy(true); setErr("");
    try {
      const body: any = { subjectId, type: "academic" };
      if (!auto && selectedOpp) body.opponentId = selectedOpp;
      const d = await api("/api/matches", { method: "POST", body: JSON.stringify(body) });
      router.push("/academy/battles/" + d.match.id);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Academic Battles ⚔️</h1>
      <div className="card p-5 space-y-4">
        <div>
          <label className="text-sm text-muted">Subject</label>
          <select className="input mt-1" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject…</option>
            {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-match
          </label>
        </div>
        {!auto && (
          <div>
            <label className="text-sm text-muted">Opponent</label>
            <select className="input mt-1" value={selectedOpp} onChange={(e) => setSelectedOpp(e.target.value)}>
              <option value="">Select opponent…</option>
              {opponents.map((u:any) => <option key={u.id} value={u.id}>{u.username} ({u.classId})</option>)}
            </select>
          </div>
        )}
        {err && <div className="text-danger text-sm">{err}</div>}
        <button className="btn btn-primary" disabled={!subjectId || busy} onClick={start}>{busy ? "Matching…" : "Start Battle"}</button>
        <p className="text-xs text-muted">Matchmaking enforces language divisions and math tracks. German students can match any group (neutral questions).</p>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Match History</h2>
        <div className="space-y-2">
          {matches.length === 0 && <p className="text-muted text-sm">No matches yet.</p>}
          {matches.map((m:any) => (
            <Link key={m.id} href={`/academy/battles/${m.id}`} className="flex items-center justify-between text-sm border-b border-border pb-2 hover:bg-white/5 px-2 rounded">
              <span>{m.subjectId} · {m.status}</span>
              <span className="text-muted">{new Date(m.createdAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}