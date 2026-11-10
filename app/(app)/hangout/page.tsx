"use client";
import Link from "next/link";
export default function Hangout() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">The Hangout 🎮</h1>
      <p className="text-muted">Entertainment and school life.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: "/hangout/space", label: "My Space", icon: "🏠", desc: "Avatar & room" },
          { href: "/hangout/arcade", label: "Arcade", icon: "🕹️", desc: "Mini-games" },
          { href: "/hangout/events", label: "Events & Menu", icon: "📅", desc: "Noticeboard" },
          { href: "/hangout/showdown", label: "Showdown", icon: "🏆", desc: "Competitive arcade" },
          { href: "/hangout/collectibles", label: "Collectibles", icon: "🎁", desc: "Inventory" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover p-5">
            <div className="text-3xl">{c.icon}</div>
            <div className="font-bold mt-2">{c.label}</div>
            <div className="text-xs text-muted">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}