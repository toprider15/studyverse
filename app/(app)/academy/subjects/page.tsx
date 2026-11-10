"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  useEffect(() => { api("/api/bootstrap").then((d) => setSubjects(d.subjects || [])).catch(()=>{}); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjects.map((s:any) => (
          <Link key={s.id} href={`/academy/subjects/${s.id}`} className="card card-hover p-5">
            <div className="font-bold">{s.name}</div>
            <div className="text-xs text-muted mt-1 capitalize">{s.category}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}