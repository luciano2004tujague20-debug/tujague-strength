"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ESTADO: CONTROL DE PESTAÑAS
  const [activeTab, setActiveTab] = useState<'finanzas' | 'coaching'>('finanzas');

  // Estados para la edición manual del código de referido
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [savingCode, setSavingCode] = useState(false);

  // Estados para la IA de Auditoría Biomecánica
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // ESTADO PARA EL AUTOPILOT DE RUTINAS
  const [autopilotLoading, setAutopilotLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, plans(*)") 
      .eq("order_id", orderId)
      .single();

    if (error) {
        console.error("Error:", error);
    }
    
    if (data) {
        setOrder(data);
        setNewReferralCode(data.referral_code || ""); 
    }
    setLoading(false);
  }

  // --- FUNCIÓN: CAMBIAR ESTADO Y PAGAR COMISIONES ---
  async function updateStatus(newStatus: string) {
    if (!confirm(`¿Confirmás cambiar el estado a ${newStatus.toUpperCase()}?`)) return;
    
    setUpdating(true);
    
    try {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("order_id", orderId);

        if (error) throw error;

        // INYECCIÓN DE CRÉDITOS AUTOMÁTICA Y DINÁMICA
        if (newStatus === 'paid' && order.referred_by) {
            
            const montoPagado = Number(order.amount_ars) || 0;
            const COMISION_DINAMICA = Math.round(montoPagado * 0.10); 
            
            const { data: ambassador, error: embError } = await supabase
                .from("orders")
                .select("id, wallet_balance")
                .eq("referral_code", order.referred_by)
                .single();

            if (ambassador && !embError) {
                const currentBalance = Number(ambassador.wallet_balance || 0);
                const newBalance = currentBalance + COMISION_DINAMICA;

                await supabase
                    .from("orders")
                    .update({ wallet_balance: newBalance })
                    .eq("id", ambassador.id);
                
                alert(`✅ Pago aprobado. Se inyectaron $${COMISION_DINAMICA} a la billetera de ${order.referred_by}.`);
            } else {
                alert(`✅ Pago aprobado (El código ${order.referred_by} no es un alumno, no se pagan comisiones).`);
            }
        } else {
            alert(`✅ Orden actualizada a: ${newStatus.toUpperCase()}`);
        }

        setOrder({ ...order, status: newStatus });
    } catch (err: any) {
        alert("Error crítico al actualizar: " + err.message);
    } finally {
        setUpdating(false);
    }
  }

  // --- FUNCIÓN: ELIMINAR ORDEN ---
  async function deleteOrder() {
    const confirmDelete = confirm("⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTA ORDEN?\n\nEsta acción es irreversible. Se borrarán todos los datos, rutinas y pagos asociados.");
    
    if (!confirmDelete) return;

    setUpdating(true);
    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("order_id", orderId);

    if (error) {
        alert("❌ Error al eliminar: " + error.message);
        setUpdating(false);
    } else {
        alert("🗑️ Orden eliminada correctamente.");
        router.push("/admin/orders"); 
    }
  }

  // --- FUNCIÓN: GUARDAR CÓDIGO DE REFERIDO ---
  async function saveReferralCode() {
      if (!newReferralCode.trim()) {
          alert("El código no puede estar vacío.");
          return;
      }
      
      const cleanCode = newReferralCode.trim().toUpperCase();
      setSavingCode(true);

      try {
          const { error } = await supabase
              .from("orders")
              .update({ referral_code: cleanCode })
              .eq("order_id", orderId);

          if (error) throw error;

          setOrder({ ...order, referral_code: cleanCode });
          setIsEditingCode(false);
          alert("✅ Código de referido asignado con éxito.");
      } catch (err: any) {
          alert("Error al guardar el código. ¿Quizás ya existe? Detalles: " + err.message);
      } finally {
          setSavingCode(false);
      }
  }

  // --- FUNCIÓN: AUTO-GENERAR CÓDIGO DE REFERIDO ---
  function autoGenerateCode() {
      if (!order?.customer_name) return;
      const firstName = order.customer_name.split(' ')[0].toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewReferralCode(`${firstName}${randomNum}`);
  }

  const getReceiptUrl = (path: string) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${path}`;
  };

  const getWhatsAppApprovalLink = () => {
     if (!order?.onboarding_data?.phone) return "#";
     
     const rawPhone = order.onboarding_data.phone;
     let cleanPhone = rawPhone.replace(/\D/g, ''); 
     if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
     if (!cleanPhone.startsWith('54')) cleanPhone = `549${cleanPhone}`; 

     const clientName = order.customer_name.split(' ')[0];
     const planName = order.plans?.name || 'su plan de entrenamiento';
     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tujague.com';

     const message = `Estimado ${clientName},\n\nLe saluda el Head Coach Luciano Tujague.\n\nLe confirmo que su pago ha sido verificado con éxito y su acceso al programa *${planName}* se encuentra activo en nuestra base de datos.\n\nPor favor, ingrese a su Panel de Control y complete su Auditoría Clínica para que pueda iniciar el diseño de su estructura de entrenamiento:\n\n${siteUrl}/login\n\nQuedo a su disposición ante cualquier consulta técnica.`;
     
     return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // 🔥 COPILOTO IA PARA AUDITORÍA TÉCNICA (CERO ASTERISCOS GARANTIZADO) 🔥
  const handleGenerateFeedback = async (liftId: string, liftName: string) => {
      const notes = draftNotes[liftId];
      if (!notes) return alert("Debe ingresar apuntes en crudo para generar la devolución.");

      setAiLoading(prev => ({ ...prev, [liftId]: true }));

      try {
          const res = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  messages: [{
                      role: "user",
                      content: `Actúa como el Head Coach Luciano Tujague (Experto en biomecánica BII-Vintage).
                      Redacta una devolución formal y técnica para el alumno sobre su ejecución de ${liftName}.
                      Utiliza estas notas en crudo: "${notes}".
                      Mejora la redacción, usa vocabulario técnico y sé directo. No saludes.
                      REGLA ESTRICTA E INQUEBRANTABLE: Escribe en texto plano y limpio. Está TERMINANTEMENTE PROHIBIDO usar asteriscos (**), negritas, hashtags (#) o cualquier formato Markdown.`
                  }] 
              })
          });

          const data = await res.json();
          
          if (data.reply) {
              setOrder({ ...order, [`feedback_${liftId}`]: data.reply });
              setDraftNotes({ ...draftNotes, [liftId]: "" }); 
          } else {
              alert("Error generando devolución.");
          }
      } catch (error) {
          alert("Error de conexión con Tujague AI.");
      } finally {
          setAiLoading(prev => ({ ...prev, [liftId]: false }));
      }
  };

  const handleSaveFeedback = async (liftId: string) => {
      const finalFeedback = order[`feedback_${liftId}`];
      
      setUpdating(true);
      try {
          const { error } = await supabase
              .from('orders')
              .update({ [`feedback_${liftId}`]: finalFeedback })
              .eq('id', order.id);

          if (error) throw error;
          alert("✅ Devolución técnica guardada y enviada al atleta.");
      } catch (err: any) {
          alert("Error guardando evaluación: " + err.message);
      } finally {
          setUpdating(false);
      }
  };

  // 🔥 AUTOPILOT DE RUTINAS (MANDA EL MESOCICLO AL BUZÓN IA) 🔥
  const handleGenerateAutopilot = async () => {
    setAutopilotLoading(true);

    try {
      const daysToProgram = order.training_days || 3;

      const res = await fetch('/api/admin/autopilot', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          athleteData: order, 
          days: daysToProgram 
        })
      });

      const data = await res.json();

      if (data.result) {
        const mesocicloGenerado = data.result;
        
        // 1. Guardar en el BUZÓN DE IA (ai_draft_text) poniendo lo más nuevo arriba
        const fechaHoy = new Date().toLocaleDateString('es-AR');
        const bloqueMesociclo = `=================================\n🗓️ MESOCICLO CREADO POR IA: ${fechaHoy}\n=================================\n${mesocicloGenerado}\n\n`;
        
        const historialAnterior = order.ai_draft_text || "";
        const nuevoHistorial = bloqueMesociclo + historialAnterior;

        // Guarda silenciosamente en Supabase
        const { error } = await supabase
            .from('orders')
            .update({ ai_draft_text: nuevoHistorial })
            .eq('id', order.id);

        if (error) throw error;

        // Actualiza la vista local
        setOrder({ ...order, ai_draft_text: nuevoHistorial });

        alert("✅ IA: Mesociclo de 4 Semanas generado con éxito.\n\nSe ha guardado en el 'Buzón IA'. Ve a la sección 'Gestión de Atletas' de este cliente para revisar el buzón, copiar las semanas y pegarlas en su planificador.");

      } else {
        alert("❌ Error: La IA no pudo generar el Mesociclo. Revisa tu conexión o la API Key.");
      }

    } catch (err: any) {
      console.error("Error en Autopilot:", err);
      alert("Error en Autopilot: " + err.message);
    } finally {
      setAutopilotLoading(false);
    }
  };

  const mainLifts = [
      { id: 'squat', label: 'Sentadilla' }, 
      { id: 'bench', label: 'Press de Banca' }, 
      { id: 'deadlift', label: 'Peso Muerto' }, 
      { id: 'dips', label: 'Fondos en Paralela' }, 
      { id: 'military', label: 'Press Militar' }
  ];

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse uppercase tracking-widest text-xs md:text-sm">Cargando Ficha del Atleta...</div>;
  if (!order) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-black text-xl">Orden no encontrada.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500 selection:text-black">
      
      {/* ─── NAVBAR SUPERIOR ─── */}
      <div className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
              <Link href="/admin/orders" className="bg-zinc-900 border border-zinc-800 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all font-bold shadow-md shrink-0">
                  ←
              </Link>
              <div>
                  <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none">
                      Perfil del <span className="text-emerald-500">Atleta</span>
                  </h1>
                  <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-widest mt-1">ID: {order.order_id.slice(0,12)}...</p>
              </div>
          </div>
          
          <span className={`text-[9px] md:text-[10px] font-black uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-lg tracking-widest shadow-inner ${
              order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              order.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse'
          }`}>
              {order.status === 'paid' ? 'PAGO APROBADO' : order.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE VERIFICACIÓN'}
          </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        
        {/* ─── PESTAÑAS DE NAVEGACIÓN PRINCIPAL ─── */}
        <div className="flex bg-[#0a0a0c] p-2 rounded-[1.5rem] border border-zinc-800 mb-10 shadow-xl overflow-x-auto custom-scrollbar">
            <button 
                onClick={() => setActiveTab('finanzas')}
                className={`flex-1 py-4 md:py-5 px-6 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'finanzas' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
            >
                💰 Módulo Administrativo
            </button>
            <button 
                onClick={() => setActiveTab('coaching')}
                className={`flex-1 py-4 md:py-5 px-6 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'coaching' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-zinc-500 hover:text-blue-400 hover:bg-blue-900/10'}`}
            >
                <span className="text-base">🏋️‍♂️</span> Centro de Coaching & IA
            </button>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: FINANZAS Y ADMINISTRACIÓN                             */}
        {/* ============================================================== */}
        {activeTab === 'finanzas' && (
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500">
                
                {/* COLUMNA IZQUIERDA: DATOS Y REFERIDOS */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    
                    {/* DATOS CLIENTE */}
                    <div className="bg-[#0a0a0c] border border-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                        <h3 className="text-emerald-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                            <span>👤 Datos Personales</span>
                            {order.onboarding_data?.phone && (
                                <a 
                                    href={`https://wa.me/${order.onboarding_data.phone.replace(/\D/g, '')}?text=Estimado%20${order.customer_name.split(' ')[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/20 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                                >
                                    Escribir WhatsApp
                                </a>
                            )}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                            <div className="bg-black/40 p-4 md:p-5 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Nombre Completo</p>
                                <p className="text-lg md:text-xl font-black text-white capitalize truncate">{order.customer_name}</p>
                            </div>
                            <div className="bg-black/40 p-4 md:p-5 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Email de Acceso</p>
                                <p className="text-xs md:text-sm font-mono text-zinc-300 truncate">{order.customer_email}</p>
                            </div>
                            <div className="bg-black/40 p-4 md:p-5 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Instagram</p>
                                <p className="text-xs md:text-sm font-bold text-white truncate">{order.customer_instagram || '-'}</p>
                            </div>
                            <div className="bg-black/40 p-4 md:p-5 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-2">Contraseña de Plataforma</p>
                                <p className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg inline-block border border-zinc-800">
                                    {order.password || 'No asignada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BII-AFFILIATES */}
                    <div className="bg-gradient-to-br from-emerald-950/20 to-[#0a0a0c] border border-emerald-900/30 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                        <h3 className="text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2 border-b border-emerald-900/50 pb-4">
                            🤝 BII-Affiliates (Programa de Referidos)
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                            <div className="bg-black/60 p-5 md:p-6 rounded-2xl border border-zinc-800 shadow-inner">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest">Código Propio</p>
                                    {!isEditingCode && (
                                        <button onClick={() => setIsEditingCode(true)} className="text-[9px] md:text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase underline">
                                            Editar
                                        </button>
                                    )}
                                </div>
                                
                                {isEditingCode ? (
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={newReferralCode} 
                                                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                                                placeholder="Ej: MARCOS20"
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white font-mono text-xs md:text-sm p-3 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                                            />
                                            <button onClick={autoGenerateCode} className="text-xl md:text-2xl hover:scale-110 transition-transform" title="Generar Automático">🎲</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={saveReferralCode} disabled={savingCode} className="flex-1 bg-emerald-500 text-black text-[9px] font-black uppercase py-2.5 rounded-lg hover:bg-emerald-400 transition-colors">
                                                {savingCode ? '...' : 'Guardar'}
                                            </button>
                                            <button onClick={() => setIsEditingCode(false)} className="flex-1 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase py-2.5 rounded-lg hover:text-white transition-colors">
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className={`text-lg md:text-xl font-mono font-black ${order.referral_code ? 'text-white drop-shadow-md' : 'text-zinc-600'}`}>
                                            {order.referral_code || 'SIN ASIGNAR'}
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            <div className="bg-black/60 p-5 md:p-6 rounded-2xl border border-zinc-800 shadow-inner">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Vino Referido Por</p>
                                <p className="text-sm md:text-base font-mono font-bold text-orange-400">{order.referred_by || 'ORGÁNICO (Nadie)'}</p>
                            </div>
                            
                            <div className="bg-emerald-500/10 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-inner flex flex-col justify-center">
                                <p className="text-[9px] md:text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-1">Billetera Virtual</p>
                                <p className="text-3xl md:text-4xl font-black italic text-emerald-400 tracking-tighter drop-shadow-md">${Number(order.wallet_balance || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: ACCIONES Y COMPROBANTE */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    
                    {/* ACCIONES FINANCIERAS */}
                    <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
                        <h3 className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 border-b border-zinc-800/80 pb-4 relative z-10">Control de Caja</h3>
                        
                        <div className="mb-8 relative z-10">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Plan Seleccionado</p>
                            <p className="text-sm md:text-base font-black text-white mb-5 uppercase tracking-tight">{order.plans?.name || 'Plan Personalizado'}</p>
                            
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Monto a Cobrar</p>
                            <p className="text-4xl md:text-5xl font-black italic text-emerald-400 tracking-tighter drop-shadow-md">
                                ${Number(order.amount_ars).toLocaleString()} <span className="text-sm md:text-base text-zinc-500 not-italic font-bold ml-1">ARS</span>
                            </p>
                            {order.referred_by && (
                               <p className="text-[9px] text-orange-400 font-bold uppercase mt-3 bg-orange-500/10 px-3 py-1.5 rounded-md inline-block border border-orange-500/20">
                                  Precio con descuento afiliado aplicado
                               </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 md:gap-4 mb-8 relative z-10">
                            <button 
                                onClick={() => updateStatus('paid')}
                                disabled={updating || order.status === 'paid'}
                                className={`py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg w-full ${
                                    order.status === 'paid' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed shadow-none' 
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                }`}
                            >
                                {order.status === 'paid' ? '✓ Pago Aprobado' : '✅ Aprobar Pago'}
                            </button>
                            
                            <button 
                                onClick={() => updateStatus('rejected')}
                                disabled={updating || order.status === 'rejected'}
                                className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95"
                            >
                                🚫 Rechazar
                            </button>
                        </div>

                        {/* BOTÓN WHATSAPP APROBACIÓN */}
                        {order.status === 'paid' && order.onboarding_data?.phone && (
                            <div className="border-t border-zinc-800/80 pt-6 mb-8 relative z-10">
                                <a 
                                    href={getWhatsAppApprovalLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] animate-pulse active:scale-95 hover:animate-none"
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.124.553 4.195 1.603 6.012L.002 24l6.108-1.601c1.745.952 3.738 1.454 5.92 1.454 6.645 0 12.028-5.383 12.028-12.029C24.059 5.383 18.677 0 12.031 0zm0 20.31c-1.801 0-3.56-.484-5.11-1.401l-.367-.217-3.793.995.998-3.7-.238-.378c-.99-1.583-1.514-3.418-1.514-5.313 0-5.46 4.444-9.905 9.904-9.905 5.46 0 9.906 4.445 9.906 9.905s-4.445 9.905-9.906 9.905zm5.438-7.44c-.298-.15-1.765-.87-2.038-.97-.273-.1-.473-.15-.67.15-.199.298-.771.97-.946 1.17-.174.199-.348.225-.646.075-2.025-.97-3.488-2.613-4.048-3.585-.175-.298-.019-.46.13-.609.135-.135.298-.348.448-.523.15-.175.199-.298.298-.498.1-.199.05-.373-.025-.523-.075-.15-.67-1.611-.918-2.206-.241-.58-.487-.502-.67-.51-.174-.008-.373-.008-.572-.008-.199 0-.523.075-.796.374-.273.298-1.045 1.02-1.045 2.488s1.07 2.886 1.22 3.086c.15.199 2.1 3.208 5.093 4.49 1.831.785 2.493.856 3.468.72 1.05-.148 2.378-.97 2.713-1.91.336-.94.336-1.745.236-1.91-.099-.165-.373-.264-.67-.413z"/></svg>
                                    Avisar Aprobación (WhatsApp)
                                </a>
                            </div>
                        )}

                        <div className="border-t border-zinc-800/80 pt-6 relative z-10">
                            <button 
                                onClick={deleteOrder}
                                disabled={updating}
                                className="w-full bg-red-950/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/40 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                            >
                                🗑️ Eliminar Orden Definitivamente
                            </button>
                        </div>
                    </div>

                    {/* COMPROBANTE ADJUNTO */}
                    <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl flex flex-col">
                        <h3 className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 text-center border-b border-zinc-800/80 pb-4">
                            Comprobante Adjunto
                        </h3>
                        
                        <div className="bg-black/60 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden relative min-h-[250px] md:min-h-[400px] shadow-inner group">
                            {order.receipt_url ? (
                                <>
                                    <img 
                                        src={getReceiptUrl(order.receipt_url)!}
                                        alt="Comprobante de pago" 
                                        className="object-contain w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity p-2"
                                    />
                                    <a 
                                        href={getReceiptUrl(order.receipt_url)!} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all shadow-lg"
                                    >
                                        🔍 Abrir en grande
                                    </a>
                                </>
                            ) : (
                                <div className="text-center p-6 opacity-40 flex flex-col items-center">
                                    <span className="text-5xl md:text-6xl mb-4 drop-shadow-md">📄</span>
                                    <p className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest">Sin comprobante</p>
                                    <p className="text-[9px] text-zinc-600 mt-2 font-bold">El cliente aún no cargó el archivo.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: COACHING Y AUDITORÍA IA                               */}
        {/* ============================================================== */}
        {activeTab === 'coaching' && (
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in duration-500">
                
                {/* COLUMNA IZQUIERDA: LA FÁBRICA (SOLO FICHA Y GENERAR) */}
                <div className="space-y-6 md:space-y-8">
                    
                    {/* 📋 FICHA ESTRUCTURAL */}
                    <div className="bg-[#0a0a0c] border border-blue-900/30 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                        <h3 className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3 border-b border-blue-900/50 pb-4 relative z-10">
                            <span className="text-xl md:text-2xl bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">📋</span> 
                            Ficha Estructural
                        </h3>
                        
                        {order.is_onboarded ? (
                            <div className="space-y-6 md:space-y-8 relative z-10">
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
                                    <div>
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Edad</p>
                                        <p className="font-black text-white md:text-lg">{order.age || '-'} a</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Peso</p>
                                        <p className="font-black text-white md:text-lg">{order.body_weight || '-'} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Altura</p>
                                        <p className="font-black text-white md:text-lg">{order.height || '-'} cm</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Sesiones</p>
                                        <p className="font-black text-white md:text-lg">{order.training_days || '-'}/sem</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/80">
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Objetivo</p>
                                        <p className="font-black text-white capitalize text-sm">{order.goal || '-'}</p>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/80">
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Nivel</p>
                                        <p className="font-black text-white capitalize text-sm">{order.experience || '-'}</p>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/80">
                                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">Equipamiento</p>
                                        <p className="font-black text-white capitalize text-sm">{order.equipment?.replace('_', ' ') || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[9px] md:text-[10px] text-red-400 font-black tracking-widest uppercase mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Lesiones Previas</p>
                                    <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-2xl shadow-inner">
                                        <p className="text-xs md:text-sm text-red-100 font-medium leading-relaxed">
                                            {order.medical_history || 'Ninguna molestia declarada en el alta.'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[9px] md:text-[10px] text-emerald-500 font-black tracking-widest uppercase mb-3">RMs Base (Kilogramos)</p>
                                    <div className="grid grid-cols-5 gap-2 md:gap-3 text-center bg-black/60 p-4 md:p-5 rounded-2xl border border-zinc-800 shadow-inner">
                                        <div><p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-black tracking-widest">SQ</p><p className="font-mono font-black text-white mt-1 text-sm md:text-base">{order.rm_squat || '0'}</p></div>
                                        <div><p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-black tracking-widest">BP</p><p className="font-mono font-black text-white mt-1 text-sm md:text-base">{order.rm_bench || '0'}</p></div>
                                        <div><p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-black tracking-widest">DL</p><p className="font-mono font-black text-white mt-1 text-sm md:text-base">{order.rm_deadlift || '0'}</p></div>
                                        <div><p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-black tracking-widest">OHP</p><p className="font-mono font-black text-white mt-1 text-sm md:text-base">{order.rm_military || '0'}</p></div>
                                        <div><p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-black tracking-widest">DIP</p><p className="font-mono font-black text-white mt-1 text-sm md:text-base">{order.rm_dips || '0'}</p></div>
                                    </div>
                                </div>
                                
                                {/* 🔥 BOTÓN MÁGICO DEL AUTOPILOT DE RUTINAS (PURA GENERACIÓN) 🔥 */}
                                <div className="pt-6 border-t border-blue-900/50">
                                    <button 
                                        onClick={handleGenerateAutopilot}
                                        disabled={autopilotLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {autopilotLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                GENERANDO EN BASE DE DATOS...
                                            </span>
                                        ) : (
                                            <>
                                                <span className="text-xl">🪄</span> GENERAR MESOCICLO CON IA
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[9px] text-zinc-500 text-center mt-3 uppercase tracking-widest font-bold">
                                        La IA creará la rutina y la enviará al Buzón IA en la Gestión de Atletas. Entra a esa sección para revisarla, distribuirla y publicarla.
                                    </p>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center py-16 bg-black/30 rounded-3xl border border-dashed border-zinc-800 mt-4">
                                <span className="text-4xl md:text-5xl mb-4 block drop-shadow-md">⏳</span>
                                <p className="text-zinc-400 text-xs md:text-sm font-black uppercase tracking-widest">Auditoría Pendiente</p>
                                <p className="text-zinc-600 text-[10px] mt-2 font-bold max-w-xs mx-auto">El atleta no completó su Ficha Clínica en el Dashboard.</p>
                            </div>
                        )}
                    </div>

                    {/* 🔥 VISOR DE LO QUE LLEGÓ AL BUZÓN IA (SÓLO LECTURA) 🔥 */}
                    <div className="bg-[#0a0a0c] border border-blue-900/30 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl">
                        <h3 className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-blue-900/50 pb-4">
                            <span>📥</span> Estado del Buzón IA
                        </h3>
                        <p className="text-[10px] text-zinc-400 mb-4 font-medium">
                            Aquí puedes verificar lo que la IA acaba de enviar a la Gestión de Atletas.
                        </p>
                        <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-4 h-64 overflow-y-auto custom-scrollbar shadow-inner">
                            {order?.ai_draft_text ? (
                                <pre className="text-[10px] md:text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                                    {order.ai_draft_text}
                                </pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                    <span className="text-3xl mb-2">🗄️</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aún no has generado nada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: ESTACIÓN DE AUDITORÍA IA (VIDEOS) */}
                <div className="bg-[#0a0a0c] border border-blue-900/30 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                    <h3 className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-blue-900/50 pb-4 relative z-10">
                        <span className="text-xl md:text-2xl bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">📹</span> 
                        Copiloto IA: Auditoría Visual
                    </h3>

                    <div className="space-y-12 md:space-y-16 relative z-10 h-auto md:max-h-[1600px] overflow-y-auto custom-scrollbar pr-2 md:pr-4 pb-10">
                        {mainLifts.map(lift => (
                            <div key={lift.id} className="bg-black/40 border border-zinc-800/80 rounded-[2rem] p-5 md:p-8 shadow-inner">
                                <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4">
                                    <h4 className="text-base md:text-xl font-black italic text-white uppercase tracking-tight">{lift.label}</h4>
                                    {order[`video_${lift.id}`] ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-sm">
                                            Video Listo
                                        </span>
                                    ) : (
                                        <span className="bg-zinc-900 text-zinc-500 px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-zinc-800">
                                            Esperando Atleta
                                        </span>
                                    )}
                                </div>

                                {order[`video_${lift.id}`] && (
                                    <div className="bg-black border border-zinc-700 rounded-2xl overflow-hidden aspect-video shadow-md mb-6">
                                        <video 
                                            src={order[`video_${lift.id}`]} 
                                            controls 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}

                                {/* ✅ COPILOTO IA WORKSTATION - SIEMPRE VISIBLE ✅ */}
                                <div className="flex flex-col gap-3 bg-blue-950/10 p-5 rounded-2xl border border-blue-900/20 mb-6 shadow-inner focus-within:border-blue-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                            <span className="text-sm">✍️</span> 1. Apuntes Crudos (Para la IA)
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium mb-1">
                                        Escribí palabras sueltas. Ej: "bajar más lento, codos abiertos". La IA redactará el texto plano, sin negritas ni formatos raros.
                                    </p>
                                    <textarea 
                                        value={draftNotes[lift.id] || ""}
                                        onChange={(e) => setDraftNotes({...draftNotes, [lift.id]: e.target.value})}
                                        placeholder="Tus notas rápidas..."
                                        className="w-full bg-black/60 border border-zinc-700/80 rounded-xl p-3 text-xs md:text-sm text-zinc-200 outline-none resize-none h-20 focus:border-blue-500 transition-colors shadow-inner"
                                    />
                                    <button 
                                        onClick={() => handleGenerateFeedback(lift.id, lift.label)}
                                        disabled={aiLoading[lift.id]}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 mt-2"
                                    >
                                        {aiLoading[lift.id] ? 'PROCESANDO CON IA...' : '✨ 2. GENERAR DIAGNÓSTICO PROFESIONAL'}
                                    </button>
                                </div>

                                {/* TEXTAREA DE FEEDBACK FINAL */}
                                <div className="mt-2 bg-black/40 p-5 rounded-2xl border border-zinc-800/80">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                                        <span className="text-sm">📨</span> 3. Devolución Final (Revisar y Enviar)
                                    </label>
                                    <textarea 
                                        value={order[`feedback_${lift.id}`] || ""}
                                        onChange={(e) => setOrder({...order, [`feedback_${lift.id}`]: e.target.value})}
                                        placeholder="El análisis detallado y profesional aparecerá aquí para que lo revise antes de guardarlo..."
                                        className="w-full bg-emerald-950/10 border border-emerald-500/30 rounded-xl p-4 text-xs md:text-sm text-emerald-100 outline-none focus:border-emerald-500 transition-colors resize-none h-32 md:h-40 custom-scrollbar shadow-inner"
                                    />
                                    <button 
                                        onClick={() => handleSaveFeedback(lift.id)}
                                        disabled={updating}
                                        className="mt-4 bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white px-6 py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all w-full active:scale-95 border border-zinc-700 hover:border-emerald-400"
                                    >
                                        GUARDAR Y ENVIAR AL ATLETA 🚀
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.8); }
      `}} />
    </div>
  );
}