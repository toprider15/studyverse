"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function Tournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);

  const load = async () => {
    const d = await api("/api/tournaments");
    setTournaments(d.tournaments || []);
    const b = await api("/api/bootstrap");
    setSubjects(b.subjects || []);
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const create = async () => {
    if (!name) return;
    await api("/api/tournaments", { method: "POST", body: JSON.stringify({ name, subjectId: subjectId || undefined, type: "school", track: "academic", startDate: new Date().toISOString().slice(0,10) }) });
    setName(""); load();
  };
  const register = async (id: string) => {
    await api("/api/tournaments", { method: "PATCH", body: JSON.stringify({ id, action: "register" }) });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Tournaments 🏆</h1>
      {(user?.role === "teacher" || user?.role === "admin") && (
        <div className="card p-5 space-y-3">
          <h2 className="font-bold">Create Tournament</h2>
          <input className="input" placeholder="Tournament name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Subject (optional)</option>
            {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
      )}
      <div className="space-y-3">
        {tournaments.length === 0 && <p className="text-muted">No tournaments yet.</p>}
        {tournaments.map((t:any) => (
          <div key={t.id} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{t.name}</div>
                <div className="text-xs text-muted">{t.type} · {t.track} · {t.status} · starts {t.startDate}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-purple">{t.participants?.length || 0} players</span>
                {!t.participants?.includes(user?.id) && t.status === "registration" && (
                  <button className="btn btn-cyan text-xs" onClick={() => register(t.id)}>Register</button>
                )}
                {t.participants?.includes(user?.id) && <span className="badge badge-green">Registered</span>}
              </div>
            </div>
            {t.winner && <div className="mt-2 text-gold text-sm">🏆 Winner: {t.winner}</div>}
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="font-bold text-lg mb-2">Term 1 Championship</h2>
        <p className="text-muted text-sm">The Term 1 Championship tournament will appear here once created by an administrator.</p>
      </div>
    </div>
  );
}