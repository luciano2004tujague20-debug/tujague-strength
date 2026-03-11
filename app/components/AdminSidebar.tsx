"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const links = [
    { name: "Ventas / Órdenes", href: "/admin/orders", icon: "💰" },
    { name: "Gestión de Atletas", href: "/admin/athletes", icon: "🦍" },
    { name: "Plantillas BII", href: "/admin/templates", icon: "📝" },
    { name: "Admisiones / Leads", href: "/admin/leads", icon: "🎯" },
    // 🔥 NUEVO BOTÓN PARA RECUPERACIÓN DE VENTAS 🔥
    { name: "Recuperación de Ventas", href: "/admin/recovery", icon: "🛒" },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-[#050505] flex-col sticky top-0 h-screen hidden md:flex shadow-2xl z-50">
      <div className="p-8 border-b border-zinc-800/80 bg-[#0a0a0c]">
        <h2 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-md">
          TUJAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 block text-[10px] not-italic tracking-[0.4em] mt-1">ADMIN CONTROL</span>
        </h2>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-xs tracking-widest transition-all duration-300 relative overflow-hidden ${
                isActive 
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                : "text-zinc-500 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,1)]"></div>
              )}
              <span className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors shadow-inner ${isActive ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800'}`}>
                {link.icon}
              </span> 
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Indicador de Estado del Sistema */}
      <div className="p-6 border-t border-zinc-800/80 bg-[#0a0a0c]">
        <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-inner">
           <div className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
           </div>
           <div>
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Sistemas OK</p>
             <p className="text-[8px] text-zinc-500 font-mono mt-0.5">V 3.0 - VIP COMMAND</p>
           </div>
        </div>
      </div>
    </aside>
  );
}