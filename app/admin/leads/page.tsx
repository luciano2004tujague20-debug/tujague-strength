// app/admin/leads/page.tsx
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
      case 'pending': return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse">Nuevo</span>;
      case 'contacted': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">Contactado</span>;
      case 'qualified': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">Calificado</span>;
      case 'rejected': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">Descartado</span>;
      case 'client': return <span className="bg-emerald-500 text-black px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)]">Es Cliente ✓</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-emerald-500 font-black tracking-widest uppercase text-sm animate-pulse flex h-[50vh] items-center justify-center">Cargando Base de Datos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DEL CRM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Centro de <span className="text-emerald-500">Admisiones</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-2 font-medium tracking-wide">
            Potenciales atletas que completaron el filtro. Contactalos en menos de 24hs para mayor conversión.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center">Total Leads</p>
           <p className="text-2xl font-black text-white text-center italic">{leads.length}</p>
        </div>
      </div>

      {/* LISTA DE LEADS (TARJETAS) */}
      {leads.length === 0 ? (
         <div className="bg-zinc-900/40 border border-zinc-800 border-dashed rounded-[2rem] p-16 text-center">
            <span className="text-4xl block mb-4 opacity-50">📭</span>
            <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Aún no hay postulaciones</h3>
            <p className="text-zinc-600 text-xs mt-2">Los atletas que llenen el formulario en /aplicar aparecerán aquí.</p>
         </div>
      ) : (
         <div className="grid gap-4">
            {leads.map((lead) => (
               <div key={lead.id} className="bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-6 transition-all hover:border-emerald-500/30 shadow-lg flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  
                  {/* DATOS DEL ATLETA */}
                  <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{lead.full_name}</h3>
                              <p className="text-[10px] font-mono text-zinc-500">{new Date(lead.created_at).toLocaleDateString('es-AR', {day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <div>{getStatusBadge(lead.status)}</div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
                          <div>
                             <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Objetivo</p>
                             <p className="text-xs font-bold text-emerald-400">{lead.goal}</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Experiencia</p>
                             <p className="text-xs font-bold text-white">{lead.experience_level}</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Días Disp.</p>
                             <p className="text-xs font-bold text-white">{lead.training_days} Días</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Maneja RIR/RPE</p>
                             <p className="text-xs font-bold text-white">{lead.knows_rir ? '✅ Sí' : '❌ No'}</p>
                          </div>
                      </div>

                      {(lead.current_injuries || lead.instagram) && (
                          <div className="flex gap-4 border-t border-zinc-800/80 pt-4">
                             {lead.current_injuries && (
                                <p className="text-xs text-zinc-400 font-medium">
                                   <span className="text-red-400 font-bold">Dolores:</span> {lead.current_injuries}
                                </p>
                             )}
                             {lead.instagram && (
                                <p className="text-xs text-zinc-400 font-medium">
                                   <span className="text-blue-400 font-bold">IG:</span> {lead.instagram}
                                </p>
                             )}
                          </div>
                      )}
                  </div>

                  {/* ACCIONES Y BOTON WHATSAPP */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <a 
                         href={getWhatsAppLink(lead)}
                         target="_blank"
                         rel="noopener noreferrer"
                         onClick={() => updateLeadStatus(lead.id, 'contacted')}
                         className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.2)]"
                      >
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                         Iniciar Charla
                      </a>
                      
                      <div className="flex gap-2 w-full">
                         <select 
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-[10px] text-white font-bold outline-none cursor-pointer"
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
  );
}