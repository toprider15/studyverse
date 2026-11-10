"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Academy() {
  const [subjects, setSubjects] = useState<any[]>([]);
  useEffect(() => { api("/api/bootstrap").then((d) => setSubjects(d.subjects || [])).catch(()=>{}); }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">The Academy 📚</h1>
        <p className="text-muted">Revision, battles, tournaments and leaderboards.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/academy/subjects", label: "Subjects", icon: "📖", desc: "Units, topics, notes" },
          { href: "/academy/battles", label: "Academic Battles", icon: "⚔️", desc: "1v1 quizzes" },
          { href: "/academy/tournaments", label: "Tournaments", icon: "🏆", desc: "Championships" },
          { href: "/academy/revision", label: "Revision & Exams", icon: "📝", desc: "Flashcards & mocks" },
          { href: "/academy/leaderboards", label: "Leaderboards", icon: "📊", desc: "Rankings" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover p-5">
            <div className="text-3xl">{c.icon}</div>
            <div className="font-bold mt-2">{c.label}</div>
            <div className="text-xs text-muted">{c.desc}</div>
          </Link>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="font-bold text-lg mb-3">Subjects</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subjects.map((s:any) => (
            <Link key={s.id} href={`/academy/subjects/${s.id}`} className="bg-card-2 rounded-lg p-3 hover:border-accent border border-transparent transition">
              <div className="text-sm font-medium">{s.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}