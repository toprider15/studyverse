"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

const AVATARS = ["😀","😎","🤓","🥸","🤖","👽","🐱","🦊","🐼","🐯","🐸","🐙"];
const OUTFITS = ["Default","Hoodie","Suit","Jersey","Lab Coat"];
const ROOMS = ["Cozy","Neon","Space","Forest","Ocean"];

export default function MySpace() {
  const { user, refresh } = useAuth();
  const [inv, setInv] = useState<any[]>([]);
  const [collectibles, setCollectibles] = useState<any[]>([]);
  const [avatar, setAvatar] = useState(user?.avatar || "avatar_default");
  const [outfit, setOutfit] = useState("Default");
  const [room, setRoom] = useState("Cozy");
  const [frame, setFrame] = useState("None");

  useEffect(() => {
    api("/api/inventory").then((d) => { setInv(d.inventory || []); setCollectibles(d.collectibles || []); }).catch(()=>{});
  }, []);

  const owned = (id: string) => inv.some((i) => i.collectibleId === id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">My Space 🏠</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-bold mb-3">Avatar</h2>
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-6xl mb-4">
            {AVATARS[0]}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a, i) => (
              <button key={i} className="text-2xl p-2 rounded-lg hover:bg-white/5">{a}</button>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-bold mb-3">Room</h2>
          <div className="h-40 rounded-lg bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-border flex items-center justify-center text-muted">
            {room} room theme
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {ROOMS.map((r) => (
              <button key={r} onClick={() => setRoom(r)} className={`btn text-xs ${room===r?"btn-primary":"btn-ghost"}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Customise</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted mb-2">Outfits</div>
            {OUTFITS.map((o) => <button key={o} onClick={() => setOutfit(o)} className={`block w-full text-left px-3 py-2 rounded text-sm ${outfit===o?"bg-accent/20":"hover:bg-white/5"}`}>{o}</button>)}
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Accessories (owned)</div>
            {collectibles.filter((c:any)=>c.type==="accessory").map((c:any) => (
              <div key={c.id} className={`px-3 py-2 rounded text-sm ${owned(c.id)?"":"opacity-40"}`}>{c.icon} {c.name} {owned(c.id)?"":"(locked)"}</div>
            ))}
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Decorations (owned)</div>
            {collectibles.filter((c:any)=>c.type==="decoration").map((c:any) => (
              <div key={c.id} className={`px-3 py-2 rounded text-sm ${owned(c.id)?"":"opacity-40"}`}>{c.icon} {c.name} {owned(c.id)?"":"(locked)"}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Badges & Trophies</h2>
        <div className="flex flex-wrap gap-2">
          {inv.length === 0 && <p className="text-muted text-sm">No collectibles yet.</p>}
          {inv.map((i:any) => {
            const c = collectibles.find((x:any)=>x.id===i.collectibleId);
            return <span key={i.id} className="badge badge-gold">{c?.icon} {c?.name}</span>;
          })}
        </div>
      </div>
    </div>
  );
}