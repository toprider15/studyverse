"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type SafeUser = {
  id: string; username: string; role: "student"|"teacher"|"admin"; grade: number; classId: string;
  languageDivision: string; mathTrack: string; avatar: string; xp: number; coins: number; level: number;
  streak: number; approved: boolean;
};

type Ctx = { user: SafeUser | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; };
const AuthContext = createContext<Ctx>({ user: null, loading: true, refresh: async()=>{}, logout: async()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try { const d = await api("/api/auth/me"); setUser(d.user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  };
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }).catch(()=>{}); setUser(null); };
  useEffect(() => { refresh(); }, []);
  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);