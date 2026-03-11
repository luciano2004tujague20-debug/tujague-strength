"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LeadsCRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    // Traemos las aplicaciones ordenadas por las más recientes
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  async function updateLeadStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error actualizando estado");
    } else {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    }
  }

  const getWhatsAppLink = (lead: any) => {
    let cleanPhone = lead.whatsapp.replace(/\D/g, ''); 
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('54') && cleanPhone.length === 10) cleanPhone = `549${cleanPhone}`; // Asume Arg si tiene 10 dígitos y no tiene código
    
    const message = `Hola ${lead.full_name.split(' ')[0]}! Soy el Coach Luciano Tujague. Vi tu postulación para entrar al equipo de entrenamiento. Buscás ${lead.goal.toLowerCase()} y tenés un nivel ${lead.experience_level.toLowerCase()}, ¿verdad? Contame un poco más.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">Nuevo</span>;
      case 'contacted': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Contactado</span>;
      case 'qualified': return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Calificado</span>;
      case 'rejected': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Descartado</span>;
      case 'client': return <span className="bg-amber-500 text-black px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.4)]">Es Cliente ✓</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-amber-500 font-black tracking-widest uppercase text-sm animate-pulse flex h-[50vh] items-center justify-center bg-[#000000]">Cargando Base de Datos...</div>;

  return (
<div className="space-y-8 animate-in fade-in duration-500 bg-transparent min-h-screen selection:bg-amber-500 selection:text-black relative">      
      {/* Luces VIP de fondo */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
          {/* HEADER DEL CRM */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0a0a0c] p-8 rounded-[2.5rem] border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                Centro de <span className="text-amber-500">Admisiones</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-3 font-medium tracking-wide">
                Potenciales atletas que completaron el filtro. Contactalos en menos de 24hs para mayor conversión.
              </p>
            </div>
            <div className="bg-[#050505] border border-zinc-800 px-6 py-4 rounded-2xl shadow-inner min-w-[150px]">
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center mb-1">Total Leads</p>
               <p className="text-3xl font-black text-amber-500 text-center italic tracking-tighter">{leads.length}</p>
            </div>
          </div>

          {/* LISTA DE LEADS (TARJETAS) */}
          {leads.length === 0 ? (
             <div className="bg-[#0a0a0c] border border-zinc-800 border-dashed rounded-[3rem] p-20 text-center shadow-inner">
                <span className="text-5xl block mb-6 opacity-40 drop-shadow-md">📭</span>
                <h3 className="text-zinc-400 font-black uppercase tracking-widest text-sm">Aún no hay postulaciones</h3>
                <p className="text-zinc-600 text-xs mt-2 font-medium">Los atletas que llenen el formulario en /aplicar aparecerán aquí.</p>
             </div>
          ) : (
             <div className="grid gap-6">
                {leads.map((lead) => (
                   <div key={lead.id} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] p-6 md:p-8 transition-all hover:border-amber-500/30 hover:bg-[#0d0d0f] shadow-xl flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative overflow-hidden group">
                      
                      {/* Glow de la tarjeta */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* DATOS DEL ATLETA */}
                      <div className="flex-1 w-full space-y-5 relative z-10">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">{lead.full_name}</h3>
                                  <p className="text-[10px] font-mono text-zinc-500 mt-1">{new Date(lead.created_at).toLocaleDateString('es-AR', {day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                              <div>{getStatusBadge(lead.status)}</div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#050505] p-5 rounded-2xl border border-zinc-800 shadow-inner">
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Objetivo</p>
                                 <p className="text-xs md:text-sm font-bold text-white capitalize">{lead.goal}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Experiencia</p>
                                 <p className="text-xs md:text-sm font-bold text-white capitalize">{lead.experience_level}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Días Disp.</p>
                                 <p className="text-xs md:text-sm font-bold text-white">{lead.training_days} Días</p>
                              </div>
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Maneja RIR/RPE</p>
                                 <p className="text-xs md:text-sm font-bold text-white">{lead.knows_rir ? '✅ Sí' : '❌ No'}</p>
                              </div>
                          </div>

                          {(lead.current_injuries || lead.instagram) && (
                              <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-zinc-800/80 pt-5">
                                 {lead.current_injuries && (
                                    <p className="text-xs text-zinc-400 font-medium bg-red-950/10 border border-red-900/20 px-4 py-2 rounded-xl flex-1">
                                       <span className="text-red-500 font-black uppercase tracking-widest text-[9px] block mb-1">⚠️ Dolores Previos:</span> 
                                       {lead.current_injuries}
                                    </p>
                                 )}
                                 {lead.instagram && (
                                    <p className="text-xs text-zinc-400 font-medium bg-blue-950/10 border border-blue-900/20 px-4 py-2 rounded-xl md:w-1/3">
                                       <span className="text-blue-400 font-black uppercase tracking-widest text-[9px] block mb-1">📸 Instagram:</span> 
                                       {lead.instagram}
                                    </p>
                                 )}
                              </div>
                          )}
                      </div>

                      {/* ACCIONES Y BOTON WHATSAPP */}
                      <div className="w-full lg:w-56 flex flex-col gap-3 shrink-0 relative z-10">
                          <a 
                             href={getWhatsAppLink(lead)}
                             target="_blank"
                             rel="noopener noreferrer"
                             onClick={() => updateLeadStatus(lead.id, 'contacted')}
                             className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95"
                          >
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                             Iniciar Charla
                          </a>
                          
                          <div className="flex gap-2 w-full">
                             <select 
                                value={lead.status}
                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                className="flex-1 bg-[#050505] border border-zinc-800 rounded-xl px-4 py-3 text-[10px] text-zinc-300 font-bold outline-none cursor-pointer appearance-none hover:border-amber-500 transition-colors shadow-inner"
                             >
                                <option value="pending">🟡 Pendiente</option>
                                <option value="contacted">🔵 Contactado</option>
                                <option value="qualified">🟢 Calificado (Potencial)</option>
                                <option value="rejected">🔴 Descartado</option>
                                <option value="client">👑 Ya es Cliente</option>
                             </select>
                          </div>
                      </div>

                   </div>
                ))}
             </div>
          )}
      </div>
    </div>
  );
}