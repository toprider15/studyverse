"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"] as const;

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [tab, setTab] = useState<"events"|"menu">("events");

  // event form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [cat, setCat] = useState("school");

  const load = async () => {
    const e = await api("/api/events"); setEvents(e.events || []);
    const m = await api("/api/menus"); setMenus(m.menus || []);
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const addEvent = async () => {
    if (!title || !date) return;
    await api("/api/events", { method: "POST", body: JSON.stringify({ title, description: desc, date, category: cat }) });
    setTitle(""); setDesc(""); setDate(""); load();
  };
  const delEvent = async (id: string) => { await api("/api/events?id=" + id, { method: "DELETE" }); load(); };

  const saveMenu = async (day: string) => {
    const items = prompt("Menu items for " + day + " (comma separated name:description)?");
    if (items === null) return;
    const parsed = items.split(",").map((s) => { const [n, d] = s.split(":"); return { name: (n||"").trim(), description: (d||"").trim() }; }).filter((x) => x.name);
    await api("/api/menus", { method: "POST", body: JSON.stringify({ day, items: parsed, weekOf: new Date().toISOString().slice(0,10) }) });
    load();
  };

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">School Events & Menu 📅</h1>
      <div className="flex gap-2">
        <button className={`btn ${tab==="events"?"btn-primary":"btn-ghost"}`} onClick={() => setTab("events")}>Events</button>
        <button className={`btn ${tab==="menu"?"btn-primary":"btn-ghost"}`} onClick={() => setTab("menu")}>Lunch Menu</button>
      </div>

      {tab === "events" && (
        <div className="space-y-4">
          {(user?.role === "teacher" || user?.role === "admin") && (
            <div className="card p-5 space-y-3">
              <h2 className="font-bold">Add Event</h2>
              <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="input" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="school">School</option>
                  <option value="tournament">Tournament</option>
                  <option value="sports">Sports</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={addEvent}>Add Event</button>
            </div>
          )}
          <div className="space-y-3">
            {events.length === 0 && <p className="text-muted">No events.</p>}
            {events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map((e:any) => (
              <div key={e.id} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{e.title}</div>
                  <div className="text-xs text-muted">{e.category} · {e.date}</div>
                  <div className="text-sm mt-1">{e.description}</div>
                </div>
                {(user?.role === "teacher" || user?.role === "admin") && (
                  <button className="btn btn-danger text-xs" onClick={() => delEvent(e.id)}>Delete</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div className="space-y-3">
          {DAYS.map((day) => {
            const m = menus.find((x:any) => x.day === day);
            return (
              <div key={day} className={`card p-4 ${day === todayName ? "border-accent" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">{day} {day === todayName && <span className="badge badge-cyan ml-2">Today</span>}</div>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <button className="btn btn-ghost text-xs" onClick={() => saveMenu(day)}>Edit</button>
                  )}
                </div>
                {m ? (
                  <ul className="text-sm space-y-1">
                    {m.items.map((it:any, i:number) => <li key={i}>• <span className="font-medium">{it.name}</span> — {it.description}</li>)}
                    {m.specialNote && <li className="text-gold text-xs mt-1">{m.specialNote}</li>}
                  </ul>
                ) : <p className="text-muted text-sm">No menu set.</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}