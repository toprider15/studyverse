"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Revision() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => { api("/api/bootstrap").then((d) => setSubjects(d.subjects || [])).catch(()=>{}); }, []);

  const start = async () => {
    const d = await api("/api/questions?subjectId=" + subjectId + "&approved=true");
    setQuestions(d.questions || []);
    setIdx(0); setAnswers({}); setDone(false);
    if (mode === "exam") { setTimeLeft((d.questions||[]).length * 60); }
  };

  useEffect(() => {
    if (mode !== "exam" || done || questions.length === 0) return;
    const t = setInterval(() => setTimeLeft((x) => { if (x <= 1) { clearInterval(t); setDone(true); return 0; } return x - 1; }), 1000);
    return () => clearInterval(t);
  }, [mode, done, questions]);

  const score = questions.reduce((acc, q) => acc + (answers[q.id] && String(answers[q.id]).toLowerCase() === String(q.answer).toLowerCase() ? q.marks : 0), 0);
  const totalMarks = questions.reduce((a,q)=>a+q.marks,0);

  if (done) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-black">Results</h1>
          <div className="text-4xl font-black text-cyan mt-2">{score}/{totalMarks}</div>
          <div className="text-muted mt-1">{questions.filter(q=>answers[q.id] && String(answers[q.id]).toLowerCase()===String(q.answer).toLowerCase()).length}/{questions.length} correct</div>
          <button className="btn btn-primary mt-6" onClick={() => { setDone(false); setAnswers({}); setIdx(0); }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Revision & Exam Simulator 📝</h1>
      <div className="card p-5 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject…</option>
            {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="practice">Practice (untimed)</option>
            <option value="exam">Mock Exam (timed)</option>
          </select>
          <button className="btn btn-primary" disabled={!subjectId} onClick={start}>Start</button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="card p-6 space-y-4">
          {mode === "exam" && <div className="badge badge-cyan">⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}</div>}
          {questions.map((q, i) => (
            <div key={q.id} className="border-b border-border pb-4">
              <div className="font-medium mb-2">{i+1}. {q.prompt} <span className="text-xs text-muted">({q.marks}m)</span></div>
              {(q.options || []).map((o:string) => (
                <label key={o} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input type="radio" name={q.id} checked={answers[q.id]===o} onChange={() => setAnswers({...answers, [q.id]: o})} />
                  {o}
                </label>
              ))}
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => setDone(true)}>Submit</button>
        </div>
      )}
    </div>
  );
}