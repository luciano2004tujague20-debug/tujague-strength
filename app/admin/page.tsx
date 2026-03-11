"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { }

      if (!res.ok) throw new Error(json?.error || "Contraseña incorrecta");
      
      router.push("/admin/orders");
    } catch (e: any) {
      setErr(e?.message || "Error al ingresar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* Luces Ambientales VIP */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-[2.5rem] border border-zinc-800/80 bg-[#0a0a0c] p-10 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center backdrop-blur-xl relative overflow-hidden animate-in zoom-in duration-500">
        
        {/* Glow superior de la tarjeta */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        
        {/* LOGO CLICKEABLE AL HOME */}
        <Link href="/" className="inline-block hover:scale-105 transition-transform relative z-10">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">
            Tujague <span className="text-amber-500">Strength</span>
          </h2>
        </Link>
        
        <div className="mt-10 space-y-6 relative z-10">
          <div className="flex flex-col items-center gap-2">
             <div className="w-14 h-14 bg-[#050505] border border-zinc-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-2">🔒</div>
             <p className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">
               Centro de Comando
             </p>
          </div>

          <input
            type="password"
            className="w-full bg-[#050505] border border-zinc-800 rounded-2xl py-5 px-6 text-center text-white text-lg md:text-xl focus:border-amber-500 outline-none transition-all font-black tracking-[0.3em] shadow-inner placeholder:text-zinc-700 placeholder:font-medium placeholder:tracking-widest"
            placeholder="CREDENCIAL"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            autoFocus
          />

          {err && (
            <p className="text-red-500 text-[10px] md:text-xs font-black uppercase tracking-widest bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20 animate-pulse">{err}</p>
          )}

          <button
            onClick={login}
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black py-5 rounded-2xl transition-all shadow-[0_10px_40px_rgba(245,158,11,0.2)] uppercase tracking-[0.2em] text-xs disabled:opacity-50 active:scale-95 border border-amber-200 mt-2"
          >
            {loading ? "VALIDANDO..." : "INGRESAR AL PANEL"}
          </button>
        </div>
      </div>
    </main>
  );
}