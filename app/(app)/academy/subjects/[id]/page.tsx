"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function SubjectDetail() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [tab, setTab] = useState<"notes" | "flashcards" | "practice">("notes");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const load = async () => {
    const b = await api("/api/bootstrap");
    setSubject((b.subjects || []).find((s:any) => s.id === id));
    const s = await api("/api/syllabus?subjectId=" + id);
    setUnits(s.units || []);
    setTopics(s.topics || []);
  };
  useEffect(() => { load().catch(()=>{}); }, [id]);

  const saveNotes = async () => {
    if (!selectedTopic) return;
    await api("/api/syllabus", { method: "PATCH", body: JSON.stringify({ topicId: selectedTopic.id, notes: noteDraft }) });
    setEditing(false);
    load();
  };

  const addUnit = async () => {
    const title = prompt("Unit title:");
    if (!title) return;
    await api("/api/syllabus", { method: "POST", body: JSON.stringify({ type: "unit", subjectId: id, title }) });
    load();
  };
  const addTopic = async (unitId: string) => {
    const title = prompt("Topic title:");
    if (!title) return;
    await api("/api/syllabus", { method: "POST", body: JSON.stringify({ type: "topic", unitId, title }) });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{subject?.name || id}</h1>
        {(user?.role === "teacher" || user?.role === "admin") && (
          <button className="btn btn-ghost" onClick={addUnit}>+ Add Unit</button>
        )}
      </div>
      <div className="flex gap-2">
        {(["notes","flashcards","practice"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab===t?"btn-primary":"btn-ghost"}`}>{t}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 space-y-3">
          {units.map((u:any) => (
            <div key={u.id}>
              <div className="font-semibold text-sm flex items-center justify-between">
                {u.title}
                {(user?.role === "teacher" || user?.role === "admin") && <button className="text-xs text-cyan" onClick={() => addTopic(u.id)}>+topic</button>}
              </div>
              <div className="ml-2 mt-1 space-y-1">
                {topics.filter((t:any) => t.unitId === u.id).map((t:any) => (
                  <button key={t.id} onClick={() => { setSelectedTopic(t); setNoteDraft(t.notes || ""); setEditing(false); }} className={`block text-left text-sm w-full px-2 py-1 rounded ${selectedTopic?.id===t.id?"bg-accent/20":"hover:bg-white/5"}`}>{t.title}</button>
                ))}
              </div>
            </div>
          ))}
          {units.length === 0 && <p className="text-muted text-sm">No units yet. Teachers can add.</p>}
        </div>

        <div className="card p-5 md:col-span-2">
          {!selectedTopic ? (
            <p className="text-muted">Select a topic to view notes and flashcards.</p>
          ) : tab === "notes" ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold">{selectedTopic.title}</h2>
                {(user?.role === "teacher" || user?.role === "admin") && (
                  editing ? (
                    <div className="flex gap-2">
                      <button className="btn btn-primary text-xs" onClick={saveNotes}>Save</button>
                      <button className="btn btn-ghost text-xs" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  ) : <button className="btn btn-ghost text-xs" onClick={() => setEditing(true)}>Edit</button>
                )}
              </div>
              {editing ? (
                <textarea className="input min-h-[200px]" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
              ) : (
                <div className="text-sm whitespace-pre-wrap text-foreground/90">{selectedTopic.notes || "No notes yet."}</div>
              )}
            </div>
          ) : tab === "flashcards" ? (
            <Flashcards topic={selectedTopic} />
          ) : (
            <Practice subjectId={id} />
          )}
        </div>
      </div>
    </div>
  );
}

function Flashcards({ topic }: any) {
  const [i, setI] = useState(0);
  const cards = topic.flashcards || [];
  if (cards.length === 0) return <p className="text-muted">No flashcards.</p>;
  const c = cards[i % cards.length];
  return (
    <div className="space-y-4">
      <div className="card p-8 text-center min-h-[160px] flex flex-col items-center justify-center">
        <div className="text-lg font-semibold">{c.q}</div>
        <div className="text-muted mt-3 text-sm">Tap to reveal</div>
      </div>
      <div className="flex justify-center gap-3">
        <button className="btn btn-ghost" onClick={() => setI((i-1+cards.length)%cards.length)}>Prev</button>
        <button className="btn btn-primary" onClick={() => { const el = document.getElementById("ans"); if (el) el.classList.toggle("hidden"); }}>Show Answer</button>
        <button className="btn btn-ghost" onClick={() => setI((i+1)%cards.length)}>Next</button>
      </div>
      <div id="ans" className="hidden text-center text-cyan font-medium">{c.a}</div>
    </div>
  );
}

function Practice({ subjectId }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  useEffect(() => {
    api("/api/questions?subjectId=" + subjectId + "&approved=true").then((d) => setQuestions(d.questions || [])).catch(()=>{});
  }, [subjectId]);
  if (questions.length === 0) return <p className="text-muted">No approved questions yet.</p>;
  if (done) return <div className="text-center space-y-3"><div className="text-2xl font-black">Score: {score}/{questions.length}</div><button className="btn btn-primary" onClick={() => { setIdx(0); setScore(0); setDone(false); setChosen(null); }}>Retry</button></div>;
  const q = questions[idx];
  const check = () => {
    if (chosen === q.answer) setScore((s) => s + 1);
    if (idx + 1 >= questions.length) setDone(true); else { setIdx(idx+1); setChosen(null); }
  };
  return (
    <div className="space-y-4">
      <div className="text-xs text-muted">Question {idx+1}/{questions.length}</div>
      <div className="font-semibold">{q.prompt}</div>
      <div className="space-y-2">
        {(q.options || []).map((o:string) => (
          <button key={o} onClick={() => setChosen(o)} className={`w-full text-left px-4 py-2 rounded-lg border ${chosen===o?"border-accent bg-accent/20":"border-border hover:border-accent/50"}`}>{o}</button>
        ))}
      </div>
      <button className="btn btn-primary" disabled={!chosen} onClick={check}>Submit</button>
    </div>
  );
}