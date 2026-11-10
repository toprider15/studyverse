"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function Collectibles() {
  const { user } = useAuth();
  const [inv, setInv] = useState<any[]>([]);
  const [collectibles, setCollectibles] = useState<any[]>([]);
  const [tab, setTab] = useState<"all"|"owned">("all");

  const load = async () => {
    const d = await api("/api/inventory");
    setInv(d.inventory || []); setCollectibles(d.collectibles || []);
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const owned = (id: string) => inv.some((i) => i.collectibleId === id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Collectibles 🎁</h1>
      <p className="text-muted">Coins are cosmetic only. No academic advantages for sale.</p>
      <div className="flex gap-2">
        <button className={`btn ${tab==="all"?"btn-primary":"btn-ghost"}`} onClick={() => setTab("all")}>All</button>
        <button className={`btn ${tab==="owned"?"btn-primary":"btn-ghost"}`} onClick={() => setTab("owned")}>Owned ({inv.length})</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collectibles.filter((c:any) => tab === "all" || owned(c.id)).map((c:any) => (
          <div key={c.id} className={`card p-4 text-center ${owned(c.id)?"":"opacity-50"}`}>
            <div className="text-4xl">{c.icon}</div>
            <div className="font-bold mt-2 text-sm">{c.name}</div>
            <div className="text-xs text-muted">{c.type} · {c.rarity}</div>
            <div className="text-xs mt-1">{c.description}</div>
            {owned(c.id) ? <span className="badge badge-green mt-2">Owned</span> : <span className="badge badge-purple mt-2">Locked</span>}
          </div>
        ))}
      </div>
      {(user?.role === "admin") && (
        <div className="card p-5">
          <h2 className="font-bold mb-2">Admin: Grant collectible</h2>
          <GrantForm collectibles={collectibles} onGranted={load} />
        </div>
      )}
    </div>
  );
}

function GrantForm({ collectibles, onGranted }: any) {
  const [userId, setUserId] = useState("");
  const [cid, setCid] = useState("");
  const grant = async () => {
    await api("/api/inventory", { method: "POST", body: JSON.stringify({ userId, collectibleId: cid, source: "admin" }) });
    onGranted();
  };
  return (
    <div className="flex gap-2 flex-wrap">
      <input className="input" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <select className="input" value={cid} onChange={(e) => setCid(e.target.value)}>
        <option value="">Collectible…</option>
        {collectibles.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button className="btn btn-primary" onClick={grant}>Grant</button>
    </div>
  );
}