"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const WORDS = ["STUDY","VERSE","SCHOOL","GRAVITY","PLANET","SCIENCE","HISTORY","MATH","PUZZLE","ARCADE","TROPHY","LEADER","CHAMPION","GALAXY","NEBULA","QUANTUM","PHYSICS","CHEMISTRY","BIOLOGY","HUMANITIES"];

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [best, setBest] = useState(0);
  const [matchId, setMatchId] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setMatchId(sp.get("match") || "");
  }, []);

  useEffect(() => {
    (async () => {
      const b = await api("/api/bootstrap");
      const g = (b.arcadeGames || []).find((x:any) => x.key === slug);
      if (g) setGameId(g.id);
    })();
  }, [slug]);

  const submit = async (score: number) => {
    if (!gameId) return;
    try { await api("/api/arcade/scores", { method: "POST", body: JSON.stringify({ gameId, score, difficulty: "normal" }) }); } catch {}
    setBest((b) => Math.max(b, score));
    if (matchId) {
      try {
        await api("/api/matches/" + matchId + "/score", { method: "POST", body: JSON.stringify({ score }) });
        const d = await api("/api/matches/" + matchId + "/complete", { method: "POST" });
        // redirect to a simple result view
        alert("Showdown complete! " + (d.winner ? "Winner: " + d.winner : "Draw"));
        router.push("/hangout/showdown");
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-4">
      <button className="btn btn-ghost text-xs" onClick={() => router.push("/hangout/arcade")}>← Back</button>
      <h1 className="text-3xl font-black capitalize">{slug.replace(/-/g," ")} {best>0 && <span className="text-gold text-lg">Best: {best}</span>}</h1>
      {slug === "reaction" && <ReactionGame onSubmit={submit} />}
      {slug === "memory" && <MemoryGame onSubmit={submit} />}
      {slug === "number" && <NumberPuzzle onSubmit={submit} />}
      {slug === "pattern" && <PatternGame onSubmit={submit} />}
      {slug === "word" && <WordGame onSubmit={submit} />}
      {!["reaction","memory","number","pattern","word"].includes(slug) && <p className="text-muted">Unknown game.</p>}
    </div>
  );
}

/* ---------- Reaction ---------- */
function ReactionGame({ onSubmit }: any) {
  const [state, setState] = useState<"idle"|"wait"|"go"|"result">("idle");
  const [start, setStart] = useState(0);
  const [rt, setRt] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [total, setTotal] = useState(0);

  const begin = () => {
    setState("wait");
    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => { setStart(Date.now()); setState("go"); }, delay);
  };
  const click = () => {
    if (state === "wait") { setState("result"); setRt(-1); return; }
    if (state === "go") {
      const r = Date.now() - start;
      setRt(r); setState("result");
      const score = Math.max(0, 1000 - r);
      setTotal((t) => t + score);
      setRounds((r) => r + 1);
    }
  };
  const next = () => { if (rounds >= 5) { onSubmit(total); setState("idle"); setRounds(0); setTotal(0); } else begin(); };

  return (
    <div className="card p-6 text-center space-y-4">
      <p className="text-muted text-sm">Round {Math.min(rounds+1,5)}/5. Click when green.</p>
      <button
        onClick={state === "idle" || state === "result" ? (state==="result"?next:begin) : click}
        className={`w-full h-48 rounded-xl text-2xl font-bold transition ${state==="go"?"bg-success text-black":state==="wait"?"bg-danger/30":"bg-card-2"}`}
      >
        {state==="idle" && "Start"}
        {state==="wait" && "Wait for green…"}
        {state==="go" && "CLICK!"}
        {state==="result" && (rt<0 ? "Too early!" : `${rt} ms`)}
      </button>
      {state === "result" && <button className="btn btn-primary" onClick={next}>{rounds >= 5 ? "Finish" : "Next Round"}</button>}
      <div className="text-sm text-muted">Total score: {total}</div>
    </div>
  );
}

/* ---------- Memory ---------- */
function MemoryGame({ onSubmit }: any) {
  const EMOJIS = ["🍎","🍌","🍇","🍓","🍒","🥝","🍑","🍍"];
  const [cards, setCards] = useState<{id:number;val:string;flipped:boolean;matched:boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);

  const init = () => {
    const arr = [...EMOJIS, ...EMOJIS].map((v, i) => ({ id: i, val: v, flipped: false, matched: false })).sort(() => Math.random() - 0.5);
    setCards(arr); setFlipped([]); setMoves(0); setMatched(0); setStarted(true); setLocked(false);
  };

  const flip = (i: number) => {
    if (locked || cards[i].flipped || cards[i].matched) return;
    const newCards = [...cards]; newCards[i].flipped = true; setCards(newCards);
    const newFlipped = [...flipped, i]; setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setLocked(true); setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].val === cards[b].val) {
        setTimeout(() => {
          const c = [...cards]; c[a].matched = true; c[b].matched = true; setCards(c);
          setFlipped([]); setLocked(false);
          const newMatched = matched + 1; setMatched(newMatched);
          if (newMatched === EMOJIS.length) {
            const score = Math.max(100, 2000 - moves * 50);
            onSubmit(score);
          }
        }, 400);
      } else {
        setTimeout(() => {
          const c = [...cards]; c[a].flipped = false; c[b].flipped = false; setCards(c);
          setFlipped([]); setLocked(false);
        }, 800);
      }
    }
  };

  if (!started) return <button className="btn btn-primary" onClick={init}>Start Game</button>;

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted">Moves: {moves} · Matched: {matched}/{EMOJIS.length}</div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button key={c.id} onClick={() => flip(i)} className={`h-20 text-3xl rounded-lg border transition ${c.matched?"bg-success/20 border-success":c.flipped?"bg-card-2 border-accent":"bg-card border-border"}`}>
            {c.flipped || c.matched ? c.val : "❓"}
          </button>
        ))}
      </div>
      {matched === EMOJIS.length && <div className="text-success font-bold">Complete! Score submitted.</div>}
    </div>
  );
}

/* ---------- Number Puzzle ---------- */
function NumberPuzzle({ onSubmit }: any) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  const init = () => {
    const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    setTiles(arr); setMoves(0); setStarted(true); setWon(false);
  };

  const click = (i: number) => {
    const empty = tiles.indexOf(0);
    const row = (x:number) => Math.floor(x/4), col = (x:number) => x%4;
    if (Math.abs(row(i)-row(empty)) + Math.abs(col(i)-col(empty)) !== 1) return;
    const t = [...tiles]; [t[i], t[empty]] = [t[empty], t[i]];
    setTiles(t); setMoves((m) => m + 1);
    // check win
    if (t.slice(0,15).every((v,i) => v === i+1)) { setWon(true); onSubmit(Math.max(100, 3000 - moves * 20)); }
  };

  if (!started) return <button className="btn btn-primary" onClick={init}>Start Puzzle</button>;

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted">Moves: {moves}</div>
      <div className="grid grid-cols-4 gap-2 max-w-xs">
        {tiles.map((v, i) => (
          <button key={i} onClick={() => click(i)} disabled={v===0} className={`h-16 text-xl font-bold rounded-lg border ${v===0?"bg-transparent border-transparent":"bg-card-2 border-border hover:border-accent"}`}>
            {v || ""}
          </button>
        ))}
      </div>
      {won && <div className="text-success font-bold">Solved! Score submitted.</div>}
    </div>
  );
}

/* ---------- Pattern (Simon) ---------- */
function PatternGame({ onSubmit }: any) {
  const COLORS = ["#ef4444","#22c55e","#3b82f6","#eab308"];
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [level, setLevel] = useState(0);
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);

  const start = () => { setSeq([]); setInput([]); setLevel(0); setOver(false); setStarted(true); nextRound([]); };

  const nextRound = (current: number[]) => {
    const next = [...current, Math.floor(Math.random() * 4)];
    setSeq(next); setInput([]); setLevel(next.length);
    // show sequence
    setShowing(true);
    let i = 0;
    const show = () => {
      if (i >= next.length) { setShowing(false); setActive(null); return; }
      setActive(next[i]);
      setTimeout(() => { setActive(null); i++; setTimeout(show, 300); }, 600);
    };
    setTimeout(show, 500);
  };

  const press = (c: number) => {
    if (showing || over) return;
    const newInput = [...input, c]; setInput(newInput);
    if (newInput[newInput.length-1] !== seq[newInput.length-1]) {
      setOver(true); onSubmit(level * 100); return;
    }
    if (newInput.length === seq.length) {
      setTimeout(() => nextRound(seq), 600);
    }
  };

  if (!started) return <button className="btn btn-primary" onClick={start}>Start</button>;

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted">Level: {level} {showing && "(watch)"} {over && "(game over)"}</div>
      <div className="grid grid-cols-2 gap-3 max-w-xs">
        {COLORS.map((col, i) => (
          <button key={i} onClick={() => press(i)} disabled={showing} className="h-24 rounded-xl border-4 transition" style={{ backgroundColor: active===i ? col : col+"55", borderColor: col }} />
        ))}
      </div>
      {over && <div className="text-danger font-bold">Game over. Score submitted.</div>}
    </div>
  );
}

/* ---------- Word Scramble ---------- */
function WordGame({ onSubmit }: any) {
  const [word, setWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);

  const scramble = (w: string) => w.split("").sort(() => Math.random() - 0.5).join("");

  const newWord = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w); setScrambled(scramble(w)); setInput("");
  };

  const start = () => { setScore(0); setRound(0); setOver(false); setStarted(true); setTimeLeft(30); newWord(); };

  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => setTimeLeft((x) => { if (x <= 1) { clearInterval(t); setOver(true); onSubmit(score); return 0; } return x - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, over]);

  const submitWord = () => {
    if (input.trim().toUpperCase() === word) {
      setScore((s) => s + 100); setRound((r) => r + 1); newWord();
    } else {
      setInput("");
    }
  };

  if (!started) return <button className="btn btn-primary" onClick={start}>Start (30s)</button>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="badge badge-cyan">⏱ {timeLeft}s</span>
        <span className="text-gold">Score: {score}</span>
      </div>
      <div className="card p-6 text-center">
        <div className="text-3xl font-black tracking-widest text-cyan">{scrambled}</div>
        <div className="mt-4 flex gap-2 justify-center">
          <input className="input max-w-xs" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitWord()} placeholder="Unscramble…" />
          <button className="btn btn-primary" onClick={submitWord}>Go</button>
        </div>
      </div>
      {over && <div className="text-success font-bold">Time's up! Final score: {score}. Submitted.</div>}
    </div>
  );
}