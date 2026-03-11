"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. EXCEPCIÓN PARA EL LOGIN
  if (pathname === "/admin/login" || pathname === "/admin") {
    return <>{children}</>;
  }

  // 2. DISEÑO PARA EL PANEL SEGURO (Nivel Élite - Oro y Carbón)
  return (
    <div className="flex min-h-screen bg-[#000000] text-white font-sans overflow-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Luces Ambientales (Lujo Silencioso) */}
      <div className="fixed top-0 left-[15%] w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none z-0"></div>

      {/* Contenedor de la Barra Lateral con efecto Cristalizado */}
      <div className="relative z-20 shadow-[10px_0_50px_rgba(0,0,0,0.8)] border-r border-zinc-800/80 bg-[#0a0a0c]/90 backdrop-blur-xl">
        <AdminSidebar />
      </div>

      {/* Contenido Principal con mejor espaciado y scroll */}
      <main className="flex-1 relative z-10 overflow-y-auto h-screen scroll-smooth custom-scrollbar">
        
        {/* Topbar decorativa VIP para el Admin */}
<header className="sticky top-0 z-[999] bg-[#050505]/95 backdrop-blur-3xl border-b border-zinc-800/80 px-6 md:px-8 py-4 flex justify-between md:justify-end items-center shadow-xl">            
            {/* Título móvil (solo visible en celulares) */}
            <div className="md:hidden flex items-center gap-2">
               <span className="text-amber-500 font-black italic text-lg tracking-tighter">VIP ADMIN</span>
            </div>

            <div className="flex items-center gap-4 hover:bg-zinc-900/50 p-2 rounded-xl transition-colors cursor-default">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-black uppercase tracking-widest text-amber-500">Luciano Tujague</p>
                 <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-0.5 flex items-center justify-end gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Centro de Comando
                 </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                LT
              </div>
            </div>
        </header>

        {/* Aquí se inyectan tus páginas (Órdenes, Atletas, etc) */}
        <div className="p-4 md:p-8 lg:p-12">
          {children} 
        </div>
      </main>

      {/* Estilos para el scrollbar en todo el admin */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }
      `}} />
    </div>
  );
}