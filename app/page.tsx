"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json()).then(d => setItems(d.items || []));
  }, [q]);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Cassini Grand Finale Explorer</h1>
      <input
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Search title (or leave blank)"
        className="border rounded p-2 w-full max-w-xl"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it:any)=>(
          <Link key={it.id} href={`/explore/${it.id}`} className="block border rounded p-2">
            <div className="aspect-video bg-gray-200 rounded" />
            <div className="mt-2 text-sm">{it.title}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
