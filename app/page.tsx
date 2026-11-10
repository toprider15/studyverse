"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CLASSES = [
  { id: "c9a", name: "9A" },
  { id: "c9b", name: "9B" },
  { id: "c9c", name: "9C" },
];

const DIVISIONS = [
  { value: "spanish_capable", label: "Spanish Capable" },
  { value: "spanish_emergent", label: "Spanish Emergent" },
  { value: "french_regular", label: "French Regular" },
  { value: "french_emergent", label: "French Emergent" },
  { value: "hindi", label: "Hindi" },
  { value: "german", label: "German" },
];

export default function Home() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [classId, setClassId] = useState("c9a");
  const [division, setDivision] = useState("spanish_capable");
  const [mathTrack, setMathTrack] = useState("standard");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>;
  if (user) { router.replace("/dashboard"); return null; }

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      await refresh();
      router.replace("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password, displayName, classId, languageDivision: division, mathTrack }) });
      // auto-login
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      await refresh();
      router.replace("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-5xl float">🌌</span>
            <h1 className="text-5xl font-black bg-gradient-to-r from-accent via-cyan to-pink bg-clip-text text-transparent">STUDYVERSE</h1>
          </div>
          <p className="text-2xl font-semibold text-foreground/90">Study. Compete. Play. Collect.</p>
          <p className="text-muted text-lg">The digital campus for Grade 9 — one place for revision, battles, arcade games, school life and collectibles.</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["📚 The Academy", "🎮 The Hangout", "⚔️ Academic Battles", "🕹️ Arcade Showdowns", "📅 Events & Menu", "🎁 Collectibles"].map((t) => (
              <div key={t} className="card px-4 py-3 text-foreground/80">{t}</div>
            ))}
          </div>
          <div className="text-xs text-muted">Demo accounts: <code className="text-cyan">student123</code> password for students (e.g. alex), <code className="text-cyan">teacher</code>/<code className="text-cyan">teacher123</code>, <code className="text-cyan">admin</code>/<code className="text-cyan">admin123</code>.</div>
        </div>

        <div className="card p-8 glow">
          <div className="flex gap-2 mb-6">
            <button className={`btn ${mode === "login" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("login")}>Sign in</button>
            <button className={`btn ${mode === "register" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("register")}>Create account</button>
          </div>

          {mode === "login" ? (
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="text-sm text-muted">Username</label>
                <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your username" />
              </div>
              <div>
                <label className="text-sm text-muted">Password</label>
                <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {err && <div className="text-danger text-sm">{err}</div>}
              <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Enter STUDYVERSE"}</button>
            </form>
          ) : (
            <form onSubmit={register} className="space-y-3">
              <div>
                <label className="text-sm text-muted">Username (3-20 chars)</label>
                <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="choose a username" />
              </div>
              <div>
                <label className="text-sm text-muted">Display name</label>
                <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm text-muted">Password (min 8)</label>
                <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm text-muted">Class</label>
                <select className="input mt-1" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted">Language subject & division</label>
                <select className="input mt-1" value={division} onChange={(e) => setDivision(e.target.value)}>
                  {DIVISIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted">Mathematics track</label>
                <select className="input mt-1" value={mathTrack} onChange={(e) => setMathTrack(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="extended">Extended</option>
                </select>
              </div>
              {err && <div className="text-danger text-sm">{err}</div>}
              <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create account & enter"}</button>
            </form>
          )}

          <div className="mt-6 text-xs text-muted">
            {mode === "login"
              ? "No account? Switch to “Create account” to register as a Grade 9 student."
              : "Your account is created instantly — no administrator approval needed."}
          </div>
        </div>
      </div>
    </div>
  );
}