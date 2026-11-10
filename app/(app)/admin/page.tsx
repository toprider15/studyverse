"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const load = async () => {
    const d = await api("/api/users");
    setUsers(d.users || []);
    const b = await api("/api/bootstrap");
    setStats({ subjects: b.subjects?.length, events: b.events?.length, games: b.arcadeGames?.length });
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const updateRole = async (id: string, role: string) => { await api("/api/users", { method: "PATCH", body: JSON.stringify({ id, role }) }); load(); };
  const remove = async (id: string) => { if (!confirm("Delete user?")) return; await api("/api/users?id=" + id, { method: "DELETE" }); load(); };

  if (user?.role !== "admin") return <div className="text-danger">Access denied.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Admin Dashboard 🛡️</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center"><div className="text-2xl font-black">{users.length}</div><div className="text-xs text-muted">Users</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-black">{stats.subjects}</div><div className="text-xs text-muted">Subjects</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-black">{stats.events}</div><div className="text-xs text-muted">Events</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-black">{stats.games}</div><div className="text-xs text-muted">Arcade Games</div></div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Create Student Account</h2>
        <CreateUser onCreated={load} />
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted text-xs">
              <tr><th className="text-left py-2">Username</th><th>Role</th><th>Class</th><th>Lang</th><th>Math</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u:any) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="py-2">{u.username}</td>
                  <td>
                    <select className="input text-xs py-1" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.classId}</td>
                  <td className="text-xs">{u.languageDivision}</td>
                  <td className="text-xs">{u.mathTrack}</td>
                  <td>
                    <button className="btn btn-danger text-xs" onClick={() => remove(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateUser({ onCreated }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [classId, setClassId] = useState("c9a");
  const [lang, setLang] = useState("spanish_capable");
  const [math, setMath] = useState("standard");
  const submit = async () => {
    if (!username || !password) return;
    await api("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password, role, classId, languageDivision: lang, mathTrack: math }) });
    setUsername(""); setPassword(""); onCreated();
  };
  return (
    <div className="grid md:grid-cols-3 gap-2">
      <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="input" value={role} onChange={(e) => setRole(e.target.value)}><option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option></select>
      <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="c9a">9A</option><option value="c9b">9B</option><option value="c9c">9C</option></select>
      <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="spanish_capable">Spanish Capable</option>
        <option value="spanish_emergent">Spanish Emergent</option>
        <option value="french_regular">French Regular</option>
        <option value="french_emergent">French Emergent</option>
        <option value="hindi">Hindi</option>
        <option value="german">German</option>
      </select>
      <select className="input" value={math} onChange={(e) => setMath(e.target.value)}><option value="standard">Standard</option><option value="extended">Extended</option></select>
      <button className="btn btn-primary md:col-span-3" onClick={submit}>Create Account</button>
    </div>
  );
}