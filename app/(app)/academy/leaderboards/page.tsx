"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Leaderboards() {
  const [type, setType] = useState("grade");
  const [board, setBoard] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");

  const load = async () => {
    let url = "/api/leaderboard?type=" + type;
    if (type === "class" && classId) url += "&classId=" + classId;
    const d = await api(url);
    setBoard(d.leaderboard || []);
  };
  useEffect(() => { api("/api/bootstrap").then((d) => { setClasses(d.classes||[]); setSubjects(d.subjects||[]); }).catch(()=>{}); }, []);
  useEffect(() => { load().catch(()=>{}); }, [type, classId]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Leaderboards 📊</h1>
      <div className="flex gap-2 flex-wrap">
        {["grade","class"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={`btn ${type===t?"btn-primary":"btn-ghost"}`}>{t}</button>
        ))}
      </div>
      {type === "class" && (
        <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select class…</option>
          {classes.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <div className="card p-5">
        <div className="space-y-2">
          {board.map((u:any) => (
            <div key={u.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
              <div className="flex items-center gap-3">
                <span className="w-8 font-bold text-muted">#{u.rank}</span>
                <span className="font-medium">{u.username}</span>
                <span className="text-xs text-muted">{u.classId}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-cyan">{u.xp} XP</span>
                <span className="text-muted">Lv {u.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}