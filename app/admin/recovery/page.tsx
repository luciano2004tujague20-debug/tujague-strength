"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AbandonedCheckoutsPage() {
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  async function fetchAbandonedCarts() {
    const { data, error } = await supabase
      .from("abandoned_checkouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener registros incompletos:", error);
    } else {
      setAbandonedCarts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Está seguro de que desea descartar este registro de forma permanente?")) return;
    
    setDeleting(id);
    const { error } = await supabase
      .from("abandoned_checkouts")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Ha ocurrido un error al intentar eliminar el registro.");
    } else {
      setAbandonedCarts(abandonedCarts.filter(cart => cart.id !== id));
    }
    setDeleting(null);
  }

  const getFormalWhatsAppLink = (cart: any) => {
    if (!cart.phone) return "#";
    let cleanPhone = cart.phone.replace(/\D/g, ''); 
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('54') && cleanPhone.length === 10) cleanPhone = `549${cleanPhone}`; 
    
    const clientName = cart.name ? cart.name.split(' ')[0] : 'Atleta';
    const planName = cart.plan_title ? `el programa ${cart.plan_title}` : 'nuestro programa de entrenamiento';

    // Mensaje con tono estrictamente formal y profesional
    const message = `Estimado/a ${clientName},\n\nLe saluda el Head Coach Luciano Tujague.\n\nEl sistema me ha notificado que su proceso de inscripción para ${planName} ha quedado incompleto.\n\n¿Ha experimentado algún inconveniente técnico con nuestra pasarela de pago o requiere asistencia adicional?\n\nQuedo a su entera disposición para ayudarle a finalizar su ingreso al equipo.`;
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="text-amber-500 font-black tracking-widest uppercase text-sm animate-pulse flex h-[50vh] items-center justify-center bg-[#000000]">Sincronizando Base de Datos de Ventas...</div>;

  return (
<div className="space-y-8 animate-in fade-in duration-500 bg-transparent min-h-screen selection:bg-amber-500 selection:text-black relative">      
      {/* Luces VIP de fondo */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
          
          {/* ENCABEZADO DEL PANEL */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0a0a0c] p-8 rounded-[2.5rem] border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                Recuperación de <span className="text-orange-500">Ventas</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-3 font-medium tracking-wide">
                Gestión de usuarios que iniciaron el proceso de inscripción y no concretaron el pago.
              </p>
            </div>
            <div className="bg-[#050505] border border-zinc-800 px-6 py-4 rounded-2xl shadow-inner min-w-[150px]">
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center mb-1">Registros Activos</p>
               <p className="text-3xl font-black text-orange-500 text-center italic tracking-tighter">{abandonedCarts.length}</p>
            </div>
          </div>

          {/* LISTADO DE CARRITOS ABANDONADOS */}
          {abandonedCarts.length === 0 ? (
             <div className="bg-[#0a0a0c] border border-zinc-800 border-dashed rounded-[3rem] p-20 text-center shadow-inner">
                <span className="text-5xl block mb-6 opacity-40 drop-shadow-md">📋</span>
                <h3 className="text-zinc-400 font-black uppercase tracking-widest text-sm">Sin registros pendientes</h3>
                <p className="text-zinc-600 text-xs mt-2 font-medium">No existen inscripciones abandonadas en este momento.</p>
             </div>
          ) : (
             <div className="grid gap-6">
                {abandonedCarts.map((cart) => (
                   <div key={cart.id} className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2.5rem] p-6 md:p-8 transition-all hover:border-orange-500/30 hover:bg-[#0d0d0f] shadow-xl flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative overflow-hidden group">
                      
                      {/* Glow de la tarjeta */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* INFORMACIÓN DEL ATLETA POTENCIAL */}
                      <div className="flex-1 w-full space-y-5 relative z-10">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-orange-400 transition-colors">
                                      {cart.name || "Usuario Anónimo"}
                                  </h3>
                                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                                      Fecha de intento: {new Date(cart.created_at).toLocaleDateString('es-AR', {day: '2-digit', month: 'long', hour: '2-digit', minute:'2-digit'})}
                                  </p>
                              </div>
                              <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                                  Pago Pendiente
                              </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#050505] p-5 rounded-2xl border border-zinc-800 shadow-inner">
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Programa Seleccionado</p>
                                 <p className="text-xs md:text-sm font-bold text-white uppercase">{cart.plan_title || "No especificado"}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Monto de Inversión</p>
                                 <p className="text-xs md:text-sm font-bold text-emerald-400">
                                    {cart.plan_price ? `$${cart.plan_price.toLocaleString()} ARS` : "Variable"}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1.5">Correo Electrónico</p>
                                 <p className="text-xs md:text-sm font-bold text-zinc-300 font-mono">{cart.email || "No registrado"}</p>
                              </div>
                          </div>
                      </div>

                      {/* ACCIONES FORMALES */}
                      <div className="w-full lg:w-56 flex flex-col gap-3 shrink-0 relative z-10">
                          {cart.phone ? (
                              <a 
                                 href={getFormalWhatsAppLink(cart)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95"
                              >
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                                 Contactar Atleta
                              </a>
                          ) : (
                              <div className="w-full bg-[#050505] border border-zinc-800 text-zinc-500 px-6 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center cursor-not-allowed shadow-inner">
                                 Sin Teléfono
                              </div>
                          )}
                          
                          <button 
                             onClick={() => handleDelete(cart.id)}
                             disabled={deleting === cart.id}
                             className="w-full bg-[#050505] border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 px-6 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-inner hover:shadow-none"
                          >
                             {deleting === cart.id ? 'Descartando...' : 'Descartar Registro'}
                          </button>
                      </div>

                   </div>
                ))}
             </div>
          )}
      </div>
    </div>
  );
}