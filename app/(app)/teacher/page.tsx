"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Teacher() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  const load = async () => {
    const d = await api("/api/questions");
    setQuestions(d.questions || []);
    setPending((d.questions || []).filter((q:any) => !q.approved));
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const approve = async (id: string) => { await api("/api/questions", { method: "PATCH", body: JSON.stringify({ id, approved: true }) }); load(); };

  if (user?.role !== "teacher" && user?.role !== "admin") {
    return <div className="text-danger">Access denied.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Teacher Dashboard 🧰</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/academy/subjects" className="card card-hover p-4 text-center"><div className="text-2xl">📖</div><div className="text-sm mt-1">Syllabus</div></Link>
        <Link href="/academy/battles" className="card card-hover p-4 text-center"><div className="text-2xl">⚔️</div><div className="text-sm mt-1">Battles</div></Link>
        <Link href="/hangout/events" className="card card-hover p-4 text-center"><div className="text-2xl">📅</div><div className="text-sm mt-1">Events & Menu</div></Link>
        <Link href="/academy/tournaments" className="card card-hover p-4 text-center"><div className="text-2xl">🏆</div><div className="text-sm mt-1">Tournaments</div></Link>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Pending Question Approvals ({pending.length})</h2>
        <div className="space-y-2">
          {pending.length === 0 && <p className="text-muted text-sm">None pending.</p>}
          {pending.map((q:any) => (
            <div key={q.id} className="border-b border-border pb-2 text-sm">
              <div className="font-medium">{q.prompt}</div>
              <div className="text-xs text-muted">{q.subjectId} · {q.difficulty} · {q.marks}m</div>
              <button className="btn btn-cyan text-xs mt-1" onClick={() => approve(q.id)}>Approve</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Create Question</h2>
        <CreateQuestion onCreated={load} />
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">All Questions ({questions.length})</h2>
        <div className="max-h-64 overflow-y-auto space-y-1 text-sm">
          {questions.map((q:any) => (
            <div key={q.id} className="flex items-center justify-between border-b border-border pb-1">
              <span className="truncate">{q.prompt}</span>
              <span className={`badge ${q.approved?"badge-green":"badge-purple"}`}>{q.approved?"approved":"pending"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateQuestion({ onCreated }: any) {
  const [subjectId, setSubjectId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [marks, setMarks] = useState(1);
  const [subjects, setSubjects] = useState<any[]>([]);
  useEffect(() => { api("/api/bootstrap").then((d) => setSubjects(d.subjects || [])).catch(()=>{}); }, []);
  const submit = async () => {
    if (!subjectId || !prompt || !answer) return;
    await api("/api/questions", { method: "POST", body: JSON.stringify({
      subjectId, prompt, answer, difficulty, marks,
      options: options.split("\n").map((s) => s.trim()).filter(Boolean),
    }) });
    setPrompt(""); setOptions(""); setAnswer(""); onCreated();
  };
  return (
    <div className="space-y-2">
      <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
        <option value="">Subject…</option>
        {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <textarea className="input" placeholder="Question prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <textarea className="input" placeholder="Options (one per line)" value={options} onChange={(e) => setOptions(e.target.value)} />
      <input className="input" placeholder="Correct answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option>
        </select>
        <input className="input" type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
      </div>
      <button className="btn btn-primary" onClick={submit}>Create Question</button>
    </div>
  );
}