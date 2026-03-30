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

  // 🔥 ESTADOS PARA EL SISTEMA VIP DE AFILIADOS 🔥
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [discountPct, setDiscountPct] = useState(15);
  const [commissionPct, setCommissionPct] = useState(20);
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    // 1. Buscamos primero por order_id
    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .limit(1)
      .maybeSingle(); 

    // 2. SALVAVIDAS: Si no lo encuentra por order_id, lo busca por el ID principal
    if (!data) {
        const fallback = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .limit(1)
          .maybeSingle();
        data = fallback.data;
    }

    if (data) {
        setOrder(data);
        setNewReferralCode(data.referral_code || ""); 
        setDiscountPct(data.affiliate_discount || 15);
        setCommissionPct(data.affiliate_commission || 20);
    } else {
        console.error("El sistema no pudo encontrar al atleta con este ID:", orderId);
    }
    
    setLoading(false);
  }

  // --- FUNCIÓN: CAMBIAR ESTADO Y PAGAR COMISIONES DINÁMICAS ---
  async function updateStatus(newStatus: string) {
    if (!confirm(`¿Confirmás cambiar el estado a ${newStatus.toUpperCase()}?`)) return;
    
    setUpdating(true);
    
    try {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("order_id", orderId);

        if (error) throw error;

        // INYECCIÓN DE CRÉDITOS
        if (newStatus === 'paid' && order.referred_by) {
            const montoPagado = Number(order.amount_ars) || 0;
            
            const { data: ambassador, error: embError } = await supabase
                .from("orders")
                .select("id, wallet_balance, affiliate_commission")
                .eq("referral_code", order.referred_by)
                .single();

            if (ambassador && !embError) {
                const comisionPersonalizada = ambassador.affiliate_commission || 20;
                const COMISION_DINAMICA = Math.round(montoPagado * (comisionPersonalizada / 100)); 
                
                const currentBalance = Number(ambassador.wallet_balance || 0);
                const newBalance = currentBalance + COMISION_DINAMICA;

                await supabase
                    .from("orders")
                    .update({ wallet_balance: newBalance })
                    .eq("id", ambassador.id);
                
                alert(`✅ Pago aprobado. Se inyectaron $${COMISION_DINAMICA} (Comisión del ${comisionPersonalizada}%) a la billetera de ${order.referred_by}.`);
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

  async function deleteOrder() {
    const confirmDelete = confirm("⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTA ORDEN?\n\nEsta acción es irreversible.");
    if (!confirmDelete) return;

    setUpdating(true);
    const { error } = await supabase.from("orders").delete().eq("order_id", orderId);

    if (error) {
        alert("❌ Error al eliminar: " + error.message);
        setUpdating(false);
    } else {
        alert("🗑️ Orden eliminada correctamente.");
        router.push("/admin/orders"); 
    }
  }

  // --- FUNCIÓN: GUARDAR CÓDIGO Y PORCENTAJES VIP ---
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
              .update({ 
                  referral_code: cleanCode,
                  affiliate_discount: discountPct,
                  affiliate_commission: commissionPct
              })
              .eq("order_id", orderId);

          if (error) throw error;

          setOrder({ 
              ...order, 
              referral_code: cleanCode, 
              affiliate_discount: discountPct, 
              affiliate_commission: commissionPct 
          });
          setIsEditingCode(false);
          alert("✅ Código y porcentajes asignados con éxito.");
      } catch (err: any) {
          alert("Error al guardar: " + err.message);
      } finally {
          setSavingCode(false);
      }
  }

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
     const planName = order?.plans?.name || 'la Mentoría Élite';
     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tujague.com';
     const message = `¡Fiera! ¿Cómo estás?\n\nSoy el Coach Luciano Tujague.\n\nTe confirmo que el sistema ya verificó tu transferencia para *${planName}*.\n\nTu "Bóveda de Atleta" ya está 100% desbloqueada. Entrá, completá la Ficha Clínica y avisame cuando lo tengas así me pongo a auditar tus palancas y armar la estructura.\n\nLink de ingreso directo: ${siteUrl}/login\n\n¡Vamos a mutar!`;
     return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-amber-500 font-black animate-pulse uppercase tracking-widest text-xs md:text-sm">Cargando Ficha Financiera...</div>;
  if (!order) return <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center font-black text-xl">Orden no encontrada. Vuelve atrás y recarga la página.</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans pb-20 selection:bg-amber-500 selection:text-black relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="sticky top-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-2xl border-b border-zinc-800/80 px-4 md:px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
              <Link href="/admin/orders" className="bg-[#050505] border border-zinc-800 hover:bg-amber-500 hover:text-black hover:border-amber-500 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all font-bold shadow-md shrink-0">←</Link>
              <div>
                  <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-md">
                      Módulo <span className="text-amber-500">Financiero</span>
                  </h1>
                  <p className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-widest mt-1">ID: {order.order_id.slice(0,12)}...</p>
              </div>
          </div>
          
          <span className={`text-[9px] md:text-[10px] font-black uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-lg tracking-widest shadow-inner border ${order.status === 'paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : order.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse'}`}>
              {order.status === 'paid' ? 'PAGO APROBADO' : order.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE VERIFICACIÓN'}
          </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 relative z-10">
        
        {/* GRILLA PRINCIPAL - SIN PESTAÑAS */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
                
                {/* DATOS PERSONALES */}
                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <h3 className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                        <span>👤 Datos Personales</span>
                        {order.onboarding_data?.phone && (
                            <a href={`https://wa.me/${order.onboarding_data.phone.replace(/\D/g, '')}?text=Estimado%20${order.customer_name.split(' ')[0]}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/20 px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">Escribir WhatsApp</a>
                        )}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                        <div className="bg-[#050505] p-4 md:p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Nombre Completo</p>
                            <p className="text-lg md:text-xl font-black text-white capitalize truncate">{order.customer_name}</p>
                        </div>
                        <div className="bg-[#050505] p-4 md:p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Email de Acceso</p>
                            <p className="text-xs md:text-sm font-mono text-zinc-300 truncate">{order.customer_email}</p>
                        </div>
                        <div className="bg-[#050505] p-4 md:p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1">Instagram</p>
                            <p className="text-xs md:text-sm font-bold text-white truncate">{order.customer_instagram || '-'}</p>
                        </div>
                        <div className="bg-[#050505] p-4 md:p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
                            <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-2">Contraseña de Plataforma</p>
                            <p className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg inline-block border border-zinc-800">{order.password || 'No asignada'}</p>
                        </div>
                    </div>
                </div>

                {/* 🔥 GESTIÓN DE AFILIADOS VIP 🔥 */}
                <div className="bg-gradient-to-br from-amber-950/20 to-[#0a0a0c] border border-amber-900/30 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <h3 className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2 border-b border-amber-900/50 pb-4">
                        🤝 BII-Affiliates (Programa de Referidos)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                        {/* PANEL EDICIÓN DE CÓDIGO Y DESCUENTOS */}
                        <div className="bg-[#050505] p-5 md:p-6 rounded-2xl border border-zinc-800 shadow-inner md:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest">Socio Estratégico</p>
                                {!isEditingCode && (
                                    <button onClick={() => setIsEditingCode(true)} className="text-[9px] md:text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase underline">
                                        Modificar Condiciones
                                    </button>
                                )}
                            </div>
                            
                            {isEditingCode ? (
                                <div className="mt-2 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[8px] text-zinc-500 uppercase font-bold">Código Privado del Atleta</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={newReferralCode} 
                                                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                                                placeholder="Ej: MARCOS20"
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white font-mono text-xs md:text-sm p-3 rounded-xl outline-none focus:border-amber-500 transition-colors"
                                            />
                                            <button onClick={autoGenerateCode} className="text-xl hover:scale-110 transition-transform" title="Generar Automático">🎲</button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[8px] text-zinc-500 uppercase font-bold">Descuento al Comprador (%)</label>
                                            <input 
                                                type="number" 
                                                value={discountPct} 
                                                onChange={(e) => setDiscountPct(Number(e.target.value))}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs md:text-sm p-3 rounded-xl outline-none focus:border-amber-500 mt-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[8px] text-zinc-500 uppercase font-bold">Comisión para el Atleta (%)</label>
                                            <input 
                                                type="number" 
                                                value={commissionPct} 
                                                onChange={(e) => setCommissionPct(Number(e.target.value))}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs md:text-sm p-3 rounded-xl outline-none focus:border-amber-500 mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button onClick={saveReferralCode} disabled={savingCode} className="flex-1 bg-amber-500 text-black text-[9px] font-black uppercase py-3 rounded-lg hover:bg-amber-400 transition-colors">
                                            {savingCode ? 'Guardando...' : 'Guardar Configuración'}
                                        </button>
                                        <button onClick={() => setIsEditingCode(false)} className="flex-1 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase py-3 rounded-lg hover:text-white transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className={`text-xl md:text-2xl font-mono font-black ${order.referral_code ? 'text-white drop-shadow-md' : 'text-zinc-600'}`}>
                                        {order.referral_code || 'SIN ASIGNAR'}
                                    </p>
                                    
                                    {order.referral_code && (
                                        <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-800/50">
                                            <div>
                                                <p className="text-[8px] text-zinc-500 uppercase font-bold">Da Descuento</p>
                                                <p className="text-emerald-400 font-black text-sm">{discountPct}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-zinc-500 uppercase font-bold">Gana Comisión</p>
                                                <p className="text-amber-400 font-black text-sm">{commissionPct}%</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#050505] p-4 md:p-5 rounded-2xl border border-zinc-800 shadow-inner">
                                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Vino Referido Por</p>
                                <p className="text-sm font-mono font-bold text-orange-400">{order.referred_by || 'ORGÁNICO'}</p>
                            </div>
                            <div className="bg-amber-500/10 p-4 md:p-5 rounded-2xl border border-amber-500/30 shadow-inner flex-1 flex flex-col justify-center">
                                <p className="text-[9px] md:text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">Caja Fuerte</p>
                                <p className="text-3xl font-black italic text-amber-400 tracking-tighter drop-shadow-md">${Number(order.wallet_balance || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: ACCIONES FINANCIERAS */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
                    <h3 className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 border-b border-zinc-800/80 pb-4 relative z-10">Control de Caja</h3>
                    
                    <div className="mb-8 relative z-10">
                        <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Plan Seleccionado</p>
                        <p className="text-sm md:text-base font-black text-white mb-5 uppercase tracking-tight">{order.plans?.name || 'Plan Personalizado'}</p>
                        
                        <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Monto a Cobrar</p>
                        <p className="text-4xl md:text-5xl font-black italic text-amber-400 tracking-tighter drop-shadow-md">
                            ${Number(order.amount_ars).toLocaleString()} <span className="text-sm md:text-base text-zinc-500 not-italic font-bold ml-1">ARS</span>
                        </p>
                        {order.referred_by && (
                           <p className="text-[9px] text-orange-400 font-bold uppercase mt-3 bg-orange-500/10 px-3 py-1.5 rounded-md inline-block border border-orange-500/20">
                              Precio con descuento aplicado
                           </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 md:gap-4 mb-8 relative z-10">
                        <button onClick={() => updateStatus('paid')} disabled={updating || order.status === 'paid'} className={`py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg w-full ${order.status === 'paid' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]'}`}>
                            {order.status === 'paid' ? '✓ Pago Aprobado' : '✅ Aprobar Pago'}
                        </button>
                        <button onClick={() => updateStatus('rejected')} disabled={updating || order.status === 'rejected'} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95">
                            🚫 Rechazar
                        </button>
                    </div>

                    {order.status === 'paid' && (
                        <div className="border-t border-zinc-800/80 pt-6 mb-8 relative z-10">
                            <a href={getWhatsAppApprovalLink()} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95">
                                Avisar Aprobación (WhatsApp)
                            </a>
                        </div>
                    )}

                    <div className="border-t border-zinc-800/80 pt-6 relative z-10">
                        <button onClick={deleteOrder} disabled={updating} className="w-full bg-[#050505] hover:bg-red-600 hover:text-white text-zinc-500 border border-zinc-800 hover:border-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2">
                            🗑️ Eliminar Orden Definitivamente
                        </button>
                    </div>
                </div>

                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl flex flex-col">
                    <h3 className="text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 text-center border-b border-zinc-800/80 pb-4">
                        Comprobante Adjunto
                    </h3>
                    <div className="bg-[#050505] rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden relative min-h-[250px] md:min-h-[400px] shadow-inner group">
                        {order.receipt_url ? (
                            <>
                                <img src={getReceiptUrl(order.receipt_url)!} alt="Comprobante" className="object-contain w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity p-2" />
                                <a href={getReceiptUrl(order.receipt_url)!} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 bg-[#0a0a0c]/90 backdrop-blur-md border border-zinc-700 text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-amber-500 hover:text-black transition-all shadow-lg">🔍 Abrir en grande</a>
                            </>
                        ) : (
                            <div className="text-center p-6 opacity-40 flex flex-col items-center"><span className="text-5xl md:text-6xl mb-4 drop-shadow-md">📄</span><p className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest">Sin comprobante</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}