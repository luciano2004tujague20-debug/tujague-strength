"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MegafonoGlobal() {
    const supabase = createClient();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        const { data } = await supabase.from('notifications').select('*').eq('is_global', true).order('created_at', { ascending: false }).limit(20);
        if (data) setHistory(data);
    }

    // 📝 ARMA 1: EL PIZARRÓN (Guarda en la base de datos para que lo vean en la App)
    const handleSendPizarron = async () => {
        if (!title || !message) return alert("Faltan datos del mensaje.");
        if (!window.confirm("¿Publicar este aviso en el Pizarrón Global de la App?")) return;
        
        setSending(true);
        const { error } = await supabase.from('notifications').insert([{ title, message, is_global: true, user_id: null }]);
        
        if (error) {
            alert("❌ Error: " + error.message);
        } else {
            alert("📢 ¡AVISO PUBLICADO EN EL PIZARRÓN!");
            setTitle(""); setMessage(""); fetchHistory();
        }
        setSending(false);
    };

    // 🚨 ARMA 2: LA ALARMA GLOBAL (Dispara el PUSH a todos los celulares)
    const handleSendAlarmaGlobal = async () => {
        if (!title || !message) return alert("Faltan datos del mensaje.");
        if (!window.confirm("⚠️ PELIGRO: Esto hará vibrar las pantallas de TODOS tus atletas al mismo tiempo. ¿ESTÁS SEGURO Fiera?")) return;
        
        setSending(true);
        try {
            // 1. RECOLECCIÓN: Buscamos TODOS los tokens
            const { data: athletesData, error } = await supabase
                .from('athlete_gamification')
                .select('fcm_token')
                .not('fcm_token', 'is', null);

            if (error) throw error;

            // 2. FILTRADO: Limpiamos repetidos y nulos
            const tokensList = athletesData
                .map(a => a.fcm_token)
                .filter((token, index, self) => token && self.indexOf(token) === index);

            if (tokensList.length === 0) {
                alert("❌ Abortado: Ningún atleta tiene notificaciones activas aún.");
                setSending(false); return;
            }

            // 3. BOMBARDEO: API Masiva
            const res = await fetch('/api/send-push-global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokens: tokensList,
                    title: title,
                    body: message,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                alert(`🌍 ¡ALARMA GLOBAL DISPARADA! \nImpactó en ${result.impactos} celulares. (${result.fallos} fallaron)`);
                setTitle(""); setMessage("");
            } else {
                alert("❌ Falló el bombardeo: " + result.error);
            }
        } catch (err:any) {
            alert("❌ Error Crítico: " + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Retirar alerta del sistema?")) return;
        await supabase.from('notifications').delete().eq('id', id);
        fetchHistory();
    };

    return (
        <div className="bg-transparent min-h-screen text-white font-sans p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md">Centro de <span className="text-red-500">Comunicaciones</span></h1>
                    <p className="text-zinc-400 font-medium mt-2">Transmisión Global. Impacta a todos los usuarios activos del sistema.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-3 bg-[#0a0a0c] border border-red-900/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2  flex items-center gap-2"><span className="text-lg">📢</span> Título del Comunicado</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Actualización del Sistema BII..." className="w-full bg-[#050505] border border-zinc-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-red-500 transition-colors shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2  flex items-center gap-2"><span className="text-lg">📝</span> Cuerpo del Mensaje</label>
                                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Desarrolle la información aquí..." className="w-full bg-[#050505] border border-zinc-800 p-4 rounded-xl text-sm text-zinc-300 outline-none h-40 resize-none focus:border-red-500 transition-colors custom-scrollbar shadow-inner" />
                            </div>
                            
                            <div className="flex flex-col gap-4 pt-2">
                                <button type="button" onClick={handleSendPizarron} disabled={sending} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 disabled:opacity-50 border border-zinc-700">
                                    {sending ? 'PROCESANDO...' : '📝 PUBLICAR EN PIZARRÓN (APP)'}
                                </button>
                                
                                <button type="button" onClick={handleSendAlarmaGlobal} disabled={sending} className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 active:scale-95">
                                    {sending ? 'TRANSMITIENDO SEÑAL...' : '🚨 DISPARAR ALARMA A TODOS (PUSH)'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* HISTORIAL */}
                    <div className="lg:col-span-2 bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl h-full max-h-[600px] flex flex-col">
                        <h3 className="font-black italic text-xl uppercase tracking-tighter text-white mb-6 border-b border-zinc-800 pb-4">Últimas <span className="text-red-500">Transmisiones</span></h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            {history.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic text-center mt-10">No hay transmisiones globales recientes.</p>
                            ) : (
                                history.map(notif => (
                                    <div key={notif.id} className="bg-[#050505] border border-zinc-800 p-4 rounded-2xl group hover:border-red-500/50 transition-colors relative">
                                        <button onClick={() => handleDelete(notif.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        <p className="text-[8px] text-red-500 font-black uppercase tracking-widest mb-1.5">{new Date(notif.created_at).toLocaleDateString('es-AR')}</p>
                                        <h4 className="text-sm font-bold text-white mb-1 pr-6">{notif.title}</h4>
                                        <p className="text-[10px] md:text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">{notif.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}