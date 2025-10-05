"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then(d => {
        console.log('Search results:', d);
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Search error:', error);
        setItems([]);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 px-6 py-16 text-center">
          <h1 className="text-6xl font-bold text-white mb-6 flex items-center justify-center gap-4 cosmic-glow">
            🚀 Cassini Grand Finale Explorer
          </h1>
          <p className="text-2xl text-purple-200 mb-12 max-w-3xl mx-auto glass-effect-strong rounded-2xl p-6">
            Discover the wonders of space through high-resolution imagery, AI-powered analysis, and community discussions
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search cosmic discoveries..."
                className="w-full px-8 py-6 glass-effect-strong border border-purple-500/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-lg"
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                {loading ? (
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-purple-400 text-2xl">🔍</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="glass-effect-strong rounded-2xl p-8 text-center cosmic-glow hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Deep Zoom</h3>
            <p className="text-gray-300 text-lg">Explore high-resolution space imagery with smooth zoom controls</p>
          </div>
          <div className="glass-effect-strong rounded-2xl p-8 text-center cosmic-glow hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6">🤖</div>
            <h3 className="text-2xl font-semibold text-white mb-4">AI Analysis</h3>
            <p className="text-gray-300 text-lg">Computer vision to classify and identify cosmic objects</p>
          </div>
          <div className="glass-effect-strong rounded-2xl p-8 text-center cosmic-glow hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6">💬</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Community</h3>
            <p className="text-gray-300 text-lg">Discuss discoveries with fellow space enthusiasts</p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-4 cosmic-glow">
            🌌 Cosmic Discoveries
            {items.length > 0 && (
              <span className="text-lg glass-effect-strong px-6 py-2 rounded-full border border-purple-500/30">
                {items.length} found
              </span>
            )}
          </h2>
          
          {items.length === 0 && !loading && (
            <div className="text-center py-16 glass-effect-strong rounded-2xl">
              <div className="text-8xl mb-6">🌌</div>
              <p className="text-gray-300 text-xl">No cosmic discoveries found. Try a different search term!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((it: any) => (
              <Link 
                key={it.id} 
                href={`/explore/${it.id}`} 
                className="group block glass-effect-strong rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cosmic-glow"
              >
                <div className="aspect-video relative overflow-hidden">
                  {it.thumbUrl ? (
                    <img 
                      src={it.thumbUrl} 
                      alt={it.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-purple-700">
                      <span className="text-6xl">🌌</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white text-lg font-semibold line-clamp-2">{it.title}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      Explore
                    </span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
