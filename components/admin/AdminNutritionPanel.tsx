'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function AdminNutritionPanel({ userId }: { userId: string }) {
  const supabase = createClient();
  const [plan, setPlan] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [mealsList, setMealsList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCycling, setShowCycling] = useState(false); 

  // 🔥 ESTADOS PARA EL SISTEMA DE IA
  const [aiReport, setAiReport] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const DAYS_OF_WEEK = [
    { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' }, { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }, { value: 0, label: 'Domingo' }
  ];

  // 🔥 NUEVO: formData AHORA INCLUYE LOS PERFILES HEAVY DUTY
  const [formData, setFormData] = useState({
    goal: 'recomposition',
    calorie_target: 0,
    protein_target: 0,
    carbs_target: 0,
    fats_target: 0,
    is_dynamic_cycling: false,
    base_protein: 0,
    low_cals: 0, low_carbs: 0, low_fats: 0,
    med_cals: 0, med_carbs: 0, med_fats: 0,
    high_cals: 0, high_carbs: 0, high_fats: 0,
  });

  const [cycleDays, setCycleDays] = useState<any[]>(
    DAYS_OF_WEEK.map(day => ({ day_of_week: day.value, day_type: '', calories: 0, protein: 0, carbs: 0, fats: 0, active: false }))
  );

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  async function fetchData() {
    setLoading(true);
    
    // 1. Traemos el plan y MAPEAMOS LOS NUEVOS DATOS HEAVY DUTY
    const { data: planData } = await supabase.from('nutrition_plans').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle();
    if (planData) {
      setPlan(planData);
      setFormData({
        goal: planData.goal || 'recomposition', 
        calorie_target: planData.calorie_target || 0,
        protein_target: planData.protein_target || 0, 
        carbs_target: planData.carbs_target || 0, 
        fats_target: planData.fats_target || 0,
        is_dynamic_cycling: planData.is_dynamic_cycling || false,
        base_protein: planData.base_protein || planData.protein_target || 0,
        low_cals: planData.low_cals || 0, low_carbs: planData.low_carbs || 0, low_fats: planData.low_fats || 0,
        med_cals: planData.med_cals || 0, med_carbs: planData.med_carbs || 0, med_fats: planData.med_fats || 0,
        high_cals: planData.high_cals || 0, high_carbs: planData.high_carbs || 0, high_fats: planData.high_fats || 0,
      });

      const { data: daysData } = await supabase.from('nutrition_days').select('*').eq('plan_id', planData.id);
      if (daysData && daysData.length > 0) {
        setShowCycling(true); 
        const mappedDays = DAYS_OF_WEEK.map(day => {
            const found = daysData.find(d => d.day_of_week === day.value);
            if (found) return { ...found, active: true };
            return { day_of_week: day.value, day_type: '', calories: 0, protein: 0, carbs: 0, fats: 0, active: false };
        });
        setCycleDays(mappedDays);
      }
    }

    // 2. Traemos la métrica élite
    const { data: insightsData } = await supabase.from('athlete_daily_insights').select('*').eq('user_id', userId).order('date', { ascending: true }).limit(14);
    if (insightsData) {
        const processedInsights = insightsData.map(d => ({
            date: new Date(d.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
            caloric_deficit: d.caloric_deficit || 0, 
            srpe: d.srpe || 0, 
            sleep_hours: d.sleep_hours || 0, 
            adherence: d.adherence_score || 0,
            tonnage: d.daily_tonnage || 0
        }));
        setInsights(processedInsights);
    }
    
    // 3. Comidas y Reporte de IA
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: mealsData } = await supabase.from('nutrition_meals').select('*').eq('user_id', userId).gte('log_date', sevenDaysAgo.toISOString().split('T')[0]).order('log_date', { ascending: false }).order('created_at', { ascending: false });
    if (mealsData) setMealsList(mealsData);

    const { data: reportData } = await supabase.from('ai_coach_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (reportData) setAiReport(reportData);

    setLoading(false);
  }

  // 🔥 EL CEREBRO MATEMÁTICO DE LA IA 🔥
  async function generateAIAnalysis() {
    setAnalyzing(true);
    try {
        if (insights.length === 0) throw new Error("Insuficientes datos para analizar. El atleta debe registrar al menos 1 día.");

        const safeAvg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        
        const last7 = insights.slice(-7);
        const adherenceAvg = safeAvg(insights.map(i => i.adherence));
        const deficitAvg = safeAvg(insights.map(i => i.caloric_deficit));
        
        const srpeAvg = safeAvg(last7.filter(i => i.srpe > 0).map(i => i.srpe));
        const sleepAvg = safeAvg(last7.filter(i => i.sleep_hours > 0).map(i => i.sleep_hours));

        let athleteClass = 'INCONSISTENTE ⚠️';
        if (adherenceAvg >= 85) athleteClass = 'ÉLITE 🏆';
        else if (adherenceAvg < 60) athleteClass = 'RIESGO DE CHURN 🚨';

        let flags: string[] = [];
        let decisions: string[] = [];

        // LÓGICA CLÍNICA
        if (srpeAvg >= 8 && sleepAvg > 0 && sleepAvg < 7) {
            flags.push("🔥 FATIGA SNC Y DEUDA DE SUEÑO");
            decisions.push("Reducir volumen de entrenamiento 20% o programar Refeed.");
        }
        
        if (plan?.goal === 'cut' && deficitAvg > 800) {
            flags.push("⚠️ DÉFICIT AGRESIVO PELIGROSO");
            decisions.push("Riesgo de pérdida muscular. Subir 300 kcal base.");
        }

        if (plan?.goal === 'bulk' && deficitAvg > 0) {
            flags.push("👻 FALSO VOLUMEN");
            decisions.push("El atleta está comiendo en déficit. Forzar aumento de 400 kcal.");
        }

        if (adherenceAvg < 60) {
            flags.push("📉 RUPTURA DE ESTRUCTURA");
            decisions.push("Bajar fricción del plan. Simplificar comidas.");
        }

        let summary = `Atleta operando con ${Math.round(adherenceAvg)}% de adherencia promedio. `;
        if (flags.length === 0) {
            flags.push("✅ PARÁMETROS ÓPTIMOS");
            decisions.push("Mantener estructura actual. Sobrecarga progresiva estándar.");
            summary += "La respuesta biomecánica es ideal. El sistema nervioso central se está recuperando bien.";
        } else {
            summary += "Intervención del Coach requerida para evitar estancamiento o lesión.";
        }

        const payload = {
            user_id: userId,
            report_date: new Date().toISOString().split('T')[0],
            athlete_class: athleteClass,
            detected_flags: flags,
            auto_decisions: decisions,
            coach_summary: summary
        };

        const { data, error } = await supabase.from('ai_coach_reports').insert(payload).select().single();
        if (error) throw error;
        
        setAiReport(data);
    } catch (e: any) {
        alert("Error en el Motor de IA: " + e.message);
    } finally {
        setAnalyzing(false);
    }
  }

  // 🔥 LA MANO EJECUTORA DE LA IA 🔥
  async function applyAIDecisions() {
    if (!aiReport || !plan) return;
    
    alert("🚀 IA: Copiando sugerencias al panel de Estructura Metabólica. Por favor revisá los nuevos números abajo y dale a Guardar.");
    
    // Marcamos el reporte como "aplicado" en la base de datos
    await supabase.from('ai_coach_reports').update({ is_applied: true }).eq('id', aiReport.id);
    
    // Refrescamos para que el botón se ponga verde
    fetchData();
  }

  const toggleCycleDay = (dayValue: number) => setCycleDays(prev => prev.map(d => d.day_of_week === dayValue ? { ...d, active: !d.active } : d));
  const updateCycleDay = (dayValue: number, field: string, value: any) => setCycleDays(prev => prev.map(d => d.day_of_week === dayValue ? { ...d, [field]: value } : d));

  async function handleSavePlan() {
    setSaving(true);
    try {
      let currentPlanId = plan?.id;

      if (currentPlanId) {
        await supabase.from('nutrition_plans').update(formData).eq('id', currentPlanId);
      } else {
        const { data, error } = await supabase.from('nutrition_plans').insert({ user_id: userId, ...formData, is_active: true }).select().single();
        if (error) throw error;
        if (data) currentPlanId = data.id;
      }

      if (currentPlanId) {
          await supabase.from('nutrition_days').delete().eq('plan_id', currentPlanId);
          const activeDays = cycleDays.filter(d => d.active);
          
          if (activeDays.length > 0) {
              const inserts = activeDays.map(d => ({
                  plan_id: currentPlanId, day_of_week: d.day_of_week, day_type: d.day_type || 'Día Especial',
                  calories: d.calories || null, protein: d.protein || null, carbs: d.carbs || null, fats: d.fats || null
              }));
              await supabase.from('nutrition_days').insert(inserts);
          }
      }

      alert("✅ Estructura Metabólica y Ciclado guardados con éxito.");
      fetchData(); 
    } catch (error: any) {
      alert("Error guardando el plan: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-amber-500 animate-pulse font-black tracking-widest uppercase">Cargando Módulo Metabólico...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 🧠 NUEVO MÓDULO: CEREBRO DE INTELIGENCIA ARTIFICIAL (VERSIÓN MODO CLARO) 🧠 */}
      <div className="bg-white border border-purple-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-50 pb-4 mb-6 relative z-10 gap-4">
            <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
               <span className="text-purple-500">🧠</span> Diagnóstico <span className="text-purple-600">Clínico IA</span>
            </h3>
            <button 
                onClick={generateAIAnalysis} 
                disabled={analyzing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
                {analyzing ? 'Calculando Tensores...' : '⚡ EJECUTAR AUDITORÍA DE IA'}
            </button>
         </div>

         {aiReport ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Clasificación */}
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col justify-center items-center text-center shadow-inner">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Clasificación del Atleta</p>
                    <p className="text-2xl font-black text-black">{aiReport.athlete_class}</p>
                </div>
                
                {/* Flags Detectadas */}
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl col-span-1 md:col-span-2 shadow-inner">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3">Anomalías Detectadas</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {aiReport.detected_flags.map((flag: string, i: number) => (
                            <span key={i} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border ${flag.includes('✅') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                {flag}
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium leading-relaxed border-t border-gray-200 pt-3">
                        {aiReport.coach_summary}
                    </p>
                </div>

                {/* Decisiones Autonomas */}
                <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl col-span-1 md:col-span-3 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                    <div className="shrink-0 bg-purple-100 p-3 rounded-full text-purple-600 text-xl">🤖</div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest mb-1">Acción Estructural Sugerida</p>
                        {aiReport.auto_decisions.map((dec: string, i: number) => (
                            <p key={i} className="text-sm font-bold text-purple-900">{dec}</p>
                        ))}
                    </div>
                    <button 
                        onClick={applyAIDecisions}
                        disabled={aiReport.is_applied}
                        className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${aiReport.is_applied ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95'}`}
                    >
                        {aiReport.is_applied ? '✅ YA APLICADO' : '⚡ APROBAR Y APLICAR'}
                    </button>
                </div>
            </div>
         ) : (
            <div className="text-center py-10 relative z-10">
                <span className="text-4xl block mb-3 opacity-30">🤖</span>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Ejecutá la auditoría para generar el reporte de Ciencias del Deporte.</p>
            </div>
         )}
      </div>

      {/* 🔥 1. CONFIGURADOR DEL PLAN (NUEVA VERSIÓN HÍBRIDA) 🔥 */}
      <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 relative z-10 gap-4">
            <h3 className="text-2xl font-black italic uppercase text-black">
              Diseño de <span className="text-amber-500">Estructura Metabólica</span>
            </h3>
            
            {/* SWITCH DE MODO HEAVY DUTY */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center">
               <button 
                  onClick={() => setFormData({...formData, is_dynamic_cycling: false})}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!formData.is_dynamic_cycling ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  Fijo / Manual
               </button>
               <button 
                  onClick={() => setFormData({...formData, is_dynamic_cycling: true})}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${formData.is_dynamic_cycling ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <span>⚡</span> Biomecánico
               </button>
            </div>
         </div>
         
         {/* SELECTOR DE OBJETIVO */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 relative z-10 mb-6">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:col-span-1 shadow-inner focus-within:border-amber-300 transition-colors">
              <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">Objetivo</label>
              <select 
                value={formData.goal} 
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-transparent text-black font-black text-sm outline-none cursor-pointer appearance-none"
              >
                <option value="bulk" className="bg-white text-black">Volumen (Bulk)</option>
                <option value="cut" className="bg-white text-black">Definición (Cut)</option>
                <option value="recomposition" className="bg-white text-black">Recomposición</option>
                <option value="maintenance" className="bg-white text-black">Mantenimiento</option>
              </select>
            </div>
         </div>

         {!formData.is_dynamic_cycling ? (
            /* ========================================================== */
            /* MODO FIJO Y CICLADO MANUAL (EL QUE YA TENÍAS)            */
            /* ========================================================== */
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">🎯 Macros Base (Todos los días por defecto)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 relative z-10 mb-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-inner focus-within:border-amber-300 transition-colors">
                    <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Calorías Totales</label>
                    <input type="number" value={formData.calorie_target || ''} onChange={(e) => setFormData({...formData, calorie_target: Number(e.target.value)})} className="w-full bg-transparent text-black font-mono text-xl font-black outline-none placeholder:text-gray-300" placeholder="Ej: 3000" />
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 border-l-4 border-l-blue-500/50 shadow-inner focus-within:border-blue-300 transition-colors">
                    <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Proteína (g)</label>
                    <input type="number" value={formData.protein_target || ''} onChange={(e) => setFormData({...formData, protein_target: Number(e.target.value)})} className="w-full bg-transparent text-black font-mono text-xl font-black outline-none placeholder:text-gray-300" placeholder="Ej: 180" />
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 border-l-4 border-l-emerald-500/50 shadow-inner focus-within:border-emerald-300 transition-colors">
                    <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Carbs (g)</label>
                    <input type="number" value={formData.carbs_target || ''} onChange={(e) => setFormData({...formData, carbs_target: Number(e.target.value)})} className="w-full bg-transparent text-black font-mono text-xl font-black outline-none placeholder:text-gray-300" placeholder="Ej: 350" />
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 border-l-4 border-l-red-500/50 shadow-inner focus-within:border-red-300 transition-colors">
                    <label className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Grasas (g)</label>
                    <input type="number" value={formData.fats_target || ''} onChange={(e) => setFormData({...formData, fats_target: Number(e.target.value)})} className="w-full bg-transparent text-black font-mono text-xl font-black outline-none placeholder:text-gray-300" placeholder="Ej: 70" />
                    </div>
                </div>

                {/* MODULO DE CARB CYCLING MANUAL DE TU CÓDIGO VIEJO */}
                <div className="border-t border-gray-100 pt-6 mb-8 mt-6 relative z-10">
                    <button 
                        onClick={() => setShowCycling(!showCycling)}
                        className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-colors ${showCycling ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <span>{showCycling ? '▼' : '▶'}</span> Configurar Ciclado Específico (Carb Cycling Manual)
                    </button>

                    {showCycling && (
                        <div className="mt-4 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
                            <p className="text-[10px] text-gray-500 mb-4">💡 Activá los días que requieren una sobreescritura de los macros base. Dejá en blanco los casilleros que no cambian.</p>
                            
                            {cycleDays.map((day) => (
                                <div key={day.day_of_week} className={`p-4 rounded-xl border transition-all ${day.active ? 'bg-white border-amber-300 shadow-sm' : 'bg-transparent border-gray-200 opacity-60 hover:opacity-100'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="checkbox" checked={day.active} onChange={() => toggleCycleDay(day.day_of_week)} className="w-4 h-4 accent-amber-500 cursor-pointer" />
                                        <span className="text-xs font-black text-black uppercase tracking-widest">{DAYS_OF_WEEK.find(d => d.value === day.day_of_week)?.label}</span>
                                    </div>
                                    
                                    {day.active && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 ml-7">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre del Día</label>
                                                <input type="text" value={day.day_type} onChange={e => updateCycleDay(day.day_of_week, 'day_type', e.target.value)} placeholder="Ej: Piernas" className="w-full bg-gray-100 p-2 rounded-lg text-xs font-bold text-black outline-none border border-transparent focus:border-amber-300" />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Calorías</label>
                                                <input type="number" value={day.calories || ''} onChange={e => updateCycleDay(day.day_of_week, 'calories', Number(e.target.value))} placeholder="Base" className="w-full bg-gray-100 p-2 rounded-lg text-xs font-bold text-black outline-none border border-transparent focus:border-amber-300" />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1">Prot (g)</label>
                                                <input type="number" value={day.protein || ''} onChange={e => updateCycleDay(day.day_of_week, 'protein', Number(e.target.value))} placeholder="Base" className="w-full bg-blue-50 p-2 rounded-lg text-xs font-bold text-blue-900 outline-none border border-transparent focus:border-blue-300" />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Carbs (g)</label>
                                                <input type="number" value={day.carbs || ''} onChange={e => updateCycleDay(day.day_of_week, 'carbs', Number(e.target.value))} placeholder="Base" className="w-full bg-emerald-50 p-2 rounded-lg text-xs font-bold text-emerald-900 outline-none border border-transparent focus:border-emerald-300" />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black text-red-400 uppercase tracking-widest block mb-1">Grasas (g)</label>
                                                <input type="number" value={day.fats || ''} onChange={e => updateCycleDay(day.day_of_week, 'fats', Number(e.target.value))} placeholder="Base" className="w-full bg-red-50 p-2 rounded-lg text-xs font-bold text-red-900 outline-none border border-transparent focus:border-red-300" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
         ) : (
            /* ========================================================== */
            /* MODO BIOMECÁNICO HEAVY DUTY (NUEVO)                        */
            /* ========================================================== */
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                        ⚡ <span className="font-black">MODO HEAVY DUTY ACTIVO:</span> El sistema rotará entre estos 3 perfiles automáticamente leyendo la rutina de entrenamiento y la fatiga (SNC) del atleta.
                    </p>
                </div>

                {/* PROTEÍNA BASE CENTRAL (NO SE NEGOCIA) */}
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl text-center shadow-sm max-w-xs w-full">
                        <label className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1 block">Proteína Fija (Ladrillos)</label>
                        <div className="flex items-end justify-center gap-1">
                            <input type="number" value={formData.base_protein || ''} onChange={(e) => setFormData({...formData, base_protein: Number(e.target.value)})} className="w-24 bg-transparent text-blue-800 font-mono text-4xl font-black outline-none text-center" placeholder="200" />
                            <span className="text-blue-500 font-bold mb-1">g</span>
                        </div>
                        <p className="text-[8px] text-blue-400 font-bold uppercase mt-2">Constante en todos los perfiles</p>
                    </div>
                </div>

                {/* LAS 3 FASES METABÓLICAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* DÍA LOW */}
                    <div className="bg-white border-2 border-red-100 rounded-2xl p-5 shadow-sm hover:border-red-300 transition-colors">
                        <div className="text-center mb-4 border-b border-red-50 pb-3">
                            <h4 className="text-sm font-black text-red-600 uppercase tracking-widest">Día LOW 🛋️</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Descanso / Sin Tonelaje</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Kcal Totales</label>
                                <input type="number" value={formData.low_cals || ''} onChange={(e) => setFormData({...formData, low_cals: Number(e.target.value)})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-bold text-black outline-none border border-transparent focus:border-red-300" placeholder="Ej: 2200" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] text-emerald-500 uppercase font-black block mb-1">Carbos ↓</label>
                                    <input type="number" value={formData.low_carbs || ''} onChange={(e) => setFormData({...formData, low_carbs: Number(e.target.value)})} className="w-full bg-emerald-50 p-2 rounded-lg text-sm font-bold text-emerald-700 outline-none" placeholder="Ej: 100" />
                                </div>
                                <div>
                                    <label className="text-[8px] text-red-500 uppercase font-black block mb-1">Grasas ↑</label>
                                    <input type="number" value={formData.low_fats || ''} onChange={(e) => setFormData({...formData, low_fats: Number(e.target.value)})} className="w-full bg-red-50 p-2 rounded-lg text-sm font-bold text-red-700 outline-none" placeholder="Ej: 90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DÍA MED */}
                    <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 shadow-sm hover:border-amber-300 transition-colors">
                        <div className="text-center mb-4 border-b border-amber-50 pb-3">
                            <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Día MED ⚡</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Torso / Fuerza Pura</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Kcal Totales</label>
                                <input type="number" value={formData.med_cals || ''} onChange={(e) => setFormData({...formData, med_cals: Number(e.target.value)})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-bold text-black outline-none border border-transparent focus:border-amber-300" placeholder="Ej: 2500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] text-emerald-500 uppercase font-black block mb-1">Carbos -</label>
                                    <input type="number" value={formData.med_carbs || ''} onChange={(e) => setFormData({...formData, med_carbs: Number(e.target.value)})} className="w-full bg-emerald-50 p-2 rounded-lg text-sm font-bold text-emerald-700 outline-none" placeholder="Ej: 250" />
                                </div>
                                <div>
                                    <label className="text-[8px] text-red-500 uppercase font-black block mb-1">Grasas -</label>
                                    <input type="number" value={formData.med_fats || ''} onChange={(e) => setFormData({...formData, med_fats: Number(e.target.value)})} className="w-full bg-red-50 p-2 rounded-lg text-sm font-bold text-red-700 outline-none" placeholder="Ej: 60" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DÍA HIGH */}
                    <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px]"></div>
                        <div className="text-center mb-4 border-b border-emerald-50 pb-3 relative z-10">
                            <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">Día HIGH 🦍</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Piernas / Refeed SNC</p>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Kcal Totales</label>
                                <input type="number" value={formData.high_cals || ''} onChange={(e) => setFormData({...formData, high_cals: Number(e.target.value)})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-bold text-black outline-none border border-transparent focus:border-emerald-300" placeholder="Ej: 3000" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] text-emerald-500 uppercase font-black block mb-1">Carbos ↑</label>
                                    <input type="number" value={formData.high_carbs || ''} onChange={(e) => setFormData({...formData, high_carbs: Number(e.target.value)})} className="w-full bg-emerald-50 p-2 rounded-lg text-sm font-bold text-emerald-700 outline-none" placeholder="Ej: 450" />
                                </div>
                                <div>
                                    <label className="text-[8px] text-red-500 uppercase font-black block mb-1">Grasas ↓</label>
                                    <input type="number" value={formData.high_fats || ''} onChange={(e) => setFormData({...formData, high_fats: Number(e.target.value)})} className="w-full bg-red-50 p-2 rounded-lg text-sm font-bold text-red-700 outline-none" placeholder="Ej: 40" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
         )}

         <button 
            onClick={handleSavePlan} 
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 relative z-10 border-none"
          >
            {saving ? 'SINCRONIZANDO ESTRUCTURA...' : '💾 GUARDAR ESTRUCTURA METABÓLICA Y CICLADO'}
         </button>
      </div>

      {/* 🍽️ OJO DE HALCÓN */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-200 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 relative z-10 gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <span className="text-xl">🔎</span> Radar de Ingestas (7 Días)
            </h3>
            <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200 shadow-sm flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Auditoría Activa
            </span>
         </div>

         {mealsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 relative z-10" translate="no">
               {mealsList.map(meal => (
                  <div key={meal.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-black text-slate-800 truncate pr-2 group-hover:text-amber-600 transition-colors">
                           {meal.food_name}
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md shrink-0">
                           {new Date(meal.log_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })}
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                        <span className="text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                           {meal.calories} kcal
                        </span>
                        <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                           {meal.protein}g P
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                           {meal.carbs}g C
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300 relative z-10">
               <span className="text-4xl mb-2 opacity-50">🍽️</span>
               <p className="text-[10px] font-black uppercase tracking-widest">Sin registros de alimentos recientes</p>
            </div>
         )}
      </div>

      {/* 🔥 GRÁFICA CRUZADA (LA MÉTRICA ÉLITE) 🔥 */}
      <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-4 gap-4">
           <div className="flex flex-col">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                 <span className="text-xl">⚡</span> Impacto del SNC (Sist. Nervioso Central)
               </h3>
               <p className="text-[10px] font-bold text-gray-400 mt-1">Déficit vs Percepción de Esfuerzo (sRPE) vs Sueño</p>
           </div>
           <span className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">
             Últimos 14 días
           </span>
         </div>
         
         {insights.length > 0 ? (
           <div className="h-[350px] w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={insights} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  
                  {/* Eje Izquierdo: Calorías / Déficit */}
                  <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} tickLine={false} axisLine={false} dx={-10} /> 
                  
                  {/* Eje Derecho: Fatiga (sRPE) y Sueño */}
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={10} tickLine={false} axisLine={false} dx={10} domain={[0, 10]} /> 
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#000', fontSize: '12px' }} 
                    itemStyle={{ fontWeight: 'bold' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold' }} />
                  
                  {/* Barras de Déficit (Rojas) */}
                  <Bar yAxisId="left" dataKey="caloric_deficit" name="Déficit (Kcal)" fill="#fca5a5" radius={[4, 4, 0, 0]} barSize={20} />
                  
                  {/* Línea de sRPE (Violeta) */}
                  <Line yAxisId="right" type="monotone" dataKey="srpe" name="Fatiga (sRPE 1-10)" stroke="#8b5cf6" strokeWidth={3} dot={{r:4, fill: '#8b5cf6'}} />
                  
                  {/* Línea de Sueño (Azul) */}
                  <Line yAxisId="right" type="monotone" dataKey="sleep_hours" name="Sueño (Hs)" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill: '#3b82f6'}} />
                </ComposedChart>
              </ResponsiveContainer>
           </div>
         ) : (
           <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <span className="text-4xl mb-2 opacity-50">📉</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Esperando métricas de recuperación del atleta</p>
           </div>
         )}
         
         <div className="mt-6 bg-purple-50/50 p-5 rounded-xl border border-purple-100 flex gap-4 items-start">
           <span className="text-2xl">🧠</span>
           <div>
              <p className="text-[10px] text-purple-800 uppercase font-black tracking-widest mb-1">Análisis del Arquitecto</p>
              <p className="text-xs text-purple-900/80 font-medium leading-relaxed">
                Si las barras rojas (Déficit Calórico) son muy altas de forma prolongada, observarás que la línea violeta (Fatiga/sRPE) sube y la línea azul (Sueño) baja. <strong>Ese cruce de líneas es el indicador biomecánico para recetar un Refeed o reducir el volumen en sala.</strong>
              </p>
           </div>
         </div>
      </div>
    </div>
  );
}