'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import { calculateAdherence, generateClinicalFeedback, generateSmartGuidance } from '@/lib/nutrition/engine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import SmartFoodSearch from './SmartFoodSearch';

export default function AthleteNutritionDashboard({ userId }: { userId: string }) {
  const supabase = createClient();
  
  const [activePlan, setActivePlan] = useState<any>(null);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]); 
  const [todayMeals, setTodayMeals] = useState<any[]>([]); 
  const [todayConfig, setTodayConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔥 NUEVOS ESTADOS PARA GAMIFICACIÓN
  const [gamification, setGamification] = useState<any>(null);
  const [showPassport, setShowPassport] = useState(false);

  // 🔥 ESTADOS PARA EL RECOVERY CHECK-IN MODAL
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    sleep_hours: '',
    srpe: ''
  });
  const [todayWorkoutLogId, setTodayWorkoutLogId] = useState<string | null>(null);

  const [actuals, setActuals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    weight: ''
  });

  const todayDate = useMemo(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (userId) fetchNutritionData();
  }, [userId]);

  async function fetchNutritionData() {
    setLoading(true);
    
    // 1. Buscamos el plan activo (Macros Base)
    const { data: planData } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (planData) {
        setActivePlan(planData);

        // 1.5 CARB CYCLING: Buscamos si el coach configuró un día específico para HOY
        const currentDayOfWeek = new Date().getDay(); 
        const { data: dayData } = await supabase
            .from('nutrition_days')
            .select('*')
            .eq('plan_id', planData.id)
            .eq('day_of_week', currentDayOfWeek)
            .maybeSingle();
            
        if (dayData) {
            setTodayConfig(dayData);
        }
    }

    // 2. Buscamos TODOS los logs (Historial) - TRAEMOS 90 DÍAS PARA LA RACHA
    const { data: logsData } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(90); 

    if (logsData && logsData.length > 0) {
      setHistoryLogs(logsData);
      
      const todayEntry = logsData.find(log => log.log_date === todayDate);
      if (todayEntry) {
        setTodayLog(todayEntry);
        setActuals({
          calories: todayEntry.calories_actual || 0,
          protein: todayEntry.protein_actual || 0,
          carbs: todayEntry.carbs_actual || 0,
          fats: todayEntry.fats_actual || 0,
          weight: todayEntry.weight_kg || ''
        });
      }
    }

    // 3. Descargamos el detalle exacto de lo que comió HOY
    const { data: mealsData } = await supabase
      .from('nutrition_meals')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', todayDate)
      .order('created_at', { ascending: false });
      
    if (mealsData) setTodayMeals(mealsData);

    // 🔥 4. BUSCAMOS RECOVERY LOG DE HOY 🔥
    const utcToday = new Date().toISOString().split('T')[0];
    const { data: workoutData } = await supabase
        .from('workout_sessions')
        .select('id, srpe, sleep_hours')
        .eq('user_id', userId)
        .eq('created_at', utcToday)
        .maybeSingle();

    if (workoutData) {
        setTodayWorkoutLogId(workoutData.id);
        setRecoveryData({
            sleep_hours: workoutData.sleep_hours?.toString() || '',
            srpe: workoutData.srpe?.toString() || ''
        });
    } else {
        // No cargó recovery hoy... ¡Abrimos el modal!
        setShowRecoveryModal(true);
    }

    // 🔥 5. BUSCAMOS LOS DATOS DE GAMIFICACIÓN (NUEVA INTEGRACIÓN) 🔥
    const { data: gamiData } = await supabase.from('athlete_gamification').select('*').eq('user_id', userId).maybeSingle();
    if (gamiData) {
        setGamification(gamiData);
    } else {
        const { data: newGami } = await supabase.from('athlete_gamification').insert({ user_id: userId }).select().single();
        if (newGami) setGamification(newGami);
    }

    setLoading(false);
  }

  // 🔥 EL MOTOR DINÁMICO HÍBRIDO (EL CEREBRO ACTUALIZADO) 🔥
  const currentTarget = useMemo(() => {
    if (!activePlan) return { calories: 0, protein: 0, carbs: 0, fats: 0, day_type: 'ESTÁNDAR', message: '' };
    
    // 1. MODO BIOMECÁNICO (HEAVY DUTY)
    if (activePlan.is_dynamic_cycling) {
        const baseProt = activePlan.base_protein || activePlan.protein_target;
        const sleep = Number(recoveryData.sleep_hours) || 8;
        const srpe = Number(recoveryData.srpe) || 0;
        
        let isTraining = todayWorkoutLogId !== null || srpe > 0;

        // Regla 1: Alerta SNC (Refeed de Emergencia)
        if (srpe >= 8 && sleep <= 6) {
            return {
                calories: activePlan.high_cals, protein: baseProt, carbs: activePlan.high_carbs, fats: activePlan.high_fats,
                day_type: '🦍 REFEED SNC (HIGH CARB)',
                message: '🔥 ALERTA SNC: Detectamos fatiga extrema y falta de sueño. El Copiloto inyectó un REFEED para bajar el cortisol y reparar tejidos.'
            };
        } 
        // Regla 2: Entrenamiento Intenso (Piernas / Full Body)
        else if (isTraining && srpe >= 7) {
             return {
                calories: activePlan.high_cals, protein: baseProt, carbs: activePlan.high_carbs, fats: activePlan.high_fats,
                day_type: '🦍 DÍA DE ALTO VOLUMEN (HIGH CARB)',
                message: '⚡ Tensión Mecánica Alta: El sistema asignó el perfil HIGH CARB para reponer glucógeno y maximizar síntesis proteica.'
            };
        } 
        // Regla 3: Entrenamiento Base (Torso / Brazos)
        else if (isTraining) {
            return {
                calories: activePlan.med_cals, protein: baseProt, carbs: activePlan.med_carbs, fats: activePlan.med_fats,
                day_type: '⚡ DÍA DE FUERZA (MED CARB)',
                message: '⚙️ Entrenamiento Base: Macros ajustados al perfil MED para mantener rendimiento sin desbordar calorías.'
            };
        } 
        // Regla 4: Descanso (El músculo crece acá)
        else {
            return {
                calories: activePlan.low_cals, protein: baseProt, carbs: activePlan.low_carbs, fats: activePlan.low_fats,
                day_type: '🛋️ DESCANSO ACTIVO (LOW CARB)',
                message: '🛡️ Modo Recuperación: Sin daño muscular hoy. Carbos al mínimo, grasas altas para optimizar el entorno hormonal.'
            };
        }
    } 
    
    // 2. MODO CLÁSICO / MANUAL (PRINCIPIANTES)
    else {
        if (todayConfig) {
            return {
                calories: todayConfig.calories || activePlan.calorie_target,
                protein: todayConfig.protein || activePlan.protein_target,
                carbs: todayConfig.carbs || activePlan.carbs_target,
                fats: todayConfig.fats || activePlan.fats_target,
                day_type: todayConfig.day_type || 'DÍA DE CICLADO',
                message: ''
            };
        }

        return { 
            calories: activePlan.calorie_target, 
            protein: activePlan.protein_target, 
            carbs: activePlan.carbs_target, 
            fats: activePlan.fats_target,
            day_type: 'ESTÁNDAR',
            message: ''
        };
    }
  }, [activePlan, todayConfig, recoveryData, todayWorkoutLogId]);

  // PROMEDIO DE 7 DÍAS (ROLLING AVERAGE)
  const weeklyActuals = useMemo(() => {
    if (historyLogs.length === 0) return actuals; 

    const last7Days = historyLogs.slice(0, 7).filter(log => log.calories_actual > 0);
    if (last7Days.length === 0) return actuals;

    const totals = last7Days.reduce((acc, log) => ({
      calories: acc.calories + log.calories_actual,
      protein: acc.protein + log.protein_actual,
      carbs: acc.carbs + log.carbs_actual,
      fats: acc.fats + log.fats_actual,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const todayCals = actuals.calories > 0 ? actuals : { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const totalDays = last7Days.length + (todayCals.calories > 0 && !last7Days.find(l => l.log_date === todayDate) ? 1 : 0);

    return {
      calories: Math.round((totals.calories + (todayCals.calories > 0 && !last7Days.find(l => l.log_date === todayDate) ? todayCals.calories : 0)) / totalDays),
      protein: Math.round((totals.protein + (todayCals.protein > 0 && !last7Days.find(l => l.log_date === todayDate) ? todayCals.protein : 0)) / totalDays),
      carbs: Math.round((totals.carbs + (todayCals.carbs > 0 && !last7Days.find(l => l.log_date === todayDate) ? todayCals.carbs : 0)) / totalDays),
      fats: Math.round((totals.fats + (todayCals.fats > 0 && !last7Days.find(l => l.log_date === todayDate) ? todayCals.fats : 0)) / totalDays),
    };
  }, [historyLogs, actuals, todayDate]);

  const adherence = useMemo(() => calculateAdherence(weeklyActuals, currentTarget), [weeklyActuals, currentTarget]);
  const dailyAdherence = useMemo(() => calculateAdherence(actuals, currentTarget), [actuals, currentTarget]);
  const feedback = useMemo(() => generateClinicalFeedback(weeklyActuals, currentTarget, activePlan?.goal), [weeklyActuals, currentTarget, activePlan]);
  const guidance = useMemo(() => generateSmartGuidance(actuals, currentTarget), [actuals, currentTarget]);

  // EL CEREBRO DE RETENCIÓN: RACHA + ESCUDOS METABÓLICOS
  const { streak, freezeDays } = useMemo(() => {
     if (historyLogs.length === 0) return { streak: 0, freezeDays: 0 };
     
     const chronologicalLogs = [...historyLogs].sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
     
     let currentStreak = 0;
     let availableFreezes = 0;

     for (let log of chronologicalLogs) {
        if (log.log_date === todayDate && log.calories_actual === 0) continue; 
        
        if (log.adherence_score >= 85) {
            currentStreak++;
            if (currentStreak > 0 && currentStreak % 7 === 0) {
                availableFreezes = Math.min(availableFreezes + 1, 3);
            }
        } else {
            if (availableFreezes > 0) {
                availableFreezes--; 
            } else {
                currentStreak = 0; 
                availableFreezes = 0;
            }
        }
     }
     return { streak: currentStreak, freezeDays: availableFreezes };
  }, [historyLogs, todayDate]);

  async function handleSaveDay() {
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        log_date: todayDate,
        weight_kg: Number(actuals.weight) || null,
        calories_actual: actuals.calories,
        protein_actual: actuals.protein,
        carbs_actual: actuals.carbs,
        fats_actual: actuals.fats,
        adherence_score: dailyAdherence,
        updated_at: new Date().toISOString()
      };

      if (todayLog?.id) {
        await supabase.from('nutrition_logs').update(payload).eq('id', todayLog.id);
      } else {
        const { data } = await supabase.from('nutrition_logs').insert(payload).select().single();
        if (data) setTodayLog(data);
      }

      // 🔥 NUEVO: ACTUALIZAMOS LA BASE DE DATOS DE GAMIFICACIÓN AL GUARDAR 🔥
      if (gamification) {
          let newTotalPerfect = gamification.total_perfect_days || 0;
          let newLongestStreak = Math.max(gamification.longest_streak || 0, streak);
          
          if (dailyAdherence >= 85) {
              newTotalPerfect += 1;
              newLongestStreak = Math.max(newLongestStreak, streak + 1); // Lo premiamos en tiempo real si el día es perfecto
          }

          let newTier = 'RECLUTA';
          if (newTotalPerfect >= 90) newTier = 'ÉLITE 💎';
          else if (newTotalPerfect >= 21) newTier = 'MÁQUINA 🥇';
          else if (newTotalPerfect >= 7) newTier = 'ATLETA 🥈';

          await supabase.from('athlete_gamification').update({
              current_tier: newTier,
              longest_streak: newLongestStreak,
              total_perfect_days: newTotalPerfect,
              last_checkin_date: todayDate
          }).eq('user_id', userId);
      }
      
      fetchNutritionData(); 
    } catch (error: any) {
      alert("❌ Error sincronizando datos: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // 🔥 NUEVA FUNCIÓN: BORRAR COMIDA Y RECALCULAR 🔥
  async function handleDeleteMeal(mealId: string, cal: number, pro: number, car: number, fat: number) {
    if (!mealId || mealId.startsWith('temp-')) {
        alert("Sincronizando... Esperá un segundo y volvé a intentar.");
        return;
    }

    setSaving(true);
    try {
        setTodayMeals(prev => prev.filter(m => m.id !== mealId));

        const newActuals = {
            ...actuals,
            calories: Math.max(0, actuals.calories - cal),
            protein: Math.max(0, actuals.protein - pro),
            carbs: Math.max(0, actuals.carbs - car),
            fats: Math.max(0, actuals.fats - fat)
        };
        setActuals(newActuals);

        await supabase.from('nutrition_meals').delete().eq('id', mealId);

        const newAdherence = calculateAdherence(newActuals, currentTarget);
        if (todayLog?.id) {
            await supabase.from('nutrition_logs').update({
                calories_actual: newActuals.calories,
                protein_actual: newActuals.protein,
                carbs_actual: newActuals.carbs,
                fats_actual: newActuals.fats,
                adherence_score: newAdherence,
                updated_at: new Date().toISOString()
            }).eq('id', todayLog.id);
        }
    } catch (error: any) {
        alert("Error al borrar el alimento: " + error.message);
    } finally {
        setSaving(false);
    }
  }

  // 🔥 FUNCIÓN PARA GUARDAR RECOVERY (Sueño/Fatiga) 🔥
  async function handleSaveRecovery() {
    setSaving(true);
    try {
        const utcToday = new Date().toISOString().split('T')[0];
        const payload = {
            user_id: userId,
            created_at: utcToday, 
            sleep_hours: Number(recoveryData.sleep_hours) || null,
            srpe: Number(recoveryData.srpe) || null
        };

        if (todayWorkoutLogId) {
            await supabase.from('workout_sessions').update(payload).eq('id', todayWorkoutLogId);
        } else {
            const { data } = await supabase.from('workout_sessions').insert(payload).select().single();
            if (data) setTodayWorkoutLogId(data.id);
        }

        setShowRecoveryModal(false); 
        fetchNutritionData(); 
    } catch (e: any) {
        alert("❌ Error guardando recuperación: " + e.message);
    } finally {
        setSaving(false);
    }
  }

  // Preparamos datos para el gráfico
  const chartData = [...historyLogs].slice(0, 14).reverse().map(log => ({
    date: log.log_date.slice(5),
    peso: log.weight_kg,
    adherencia: log.adherence_score
  }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-10 text-center animate-pulse">
      <span className="text-4xl mb-4">🧬</span>
      <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Cargando Ecosistema...</p>
    </div>
  );

  if (!activePlan) return (
    <div className="bg-white border border-gray-200 p-10 rounded-[2rem] text-center shadow-sm max-w-2xl mx-auto mt-10">
      <span className="text-5xl block mb-4 opacity-50">🛠️</span>
      <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Estructura en Desarrollo</h3>
      <p className="text-gray-500 font-medium text-sm">El Head Coach está diseñando tus parámetros clínicos. Este módulo se habilitará automáticamente.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* HEADER Y SISTEMA DE RETENCIÓN */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 text-center md:text-left w-full md:w-auto">
          <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> 
            Fase: {activePlan.goal} | ⚡ HOY: {currentTarget.day_type}
          </span>
          <h2 className="text-3xl md:text-4xl font-black italic text-black uppercase tracking-tighter">Copiloto <span className="text-amber-500">Metabólico</span></h2>
        </div>

        <div className="relative z-10 flex gap-4 w-full md:w-auto justify-center">
            
            {/* 🔥 BOTÓN INTERACTIVO DEL PASAPORTE DE DISCIPLINA (NUEVO) 🔥 */}
            <button 
                onClick={() => setShowPassport(true)}
                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center min-w-[100px] flex-1 md:flex-none hover:border-amber-300 hover:shadow-md transition-all relative group cursor-pointer active:scale-95"
            >
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Racha</p>
                <p className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1">🔥 {streak}</p>
                
                {freezeDays > 0 && (
                   <div className="absolute top-2 right-2 flex gap-0.5" title={`${freezeDays} Días de Pausa disponibles (Escudos)`}>
                     {Array.from({ length: freezeDays }).map((_, i) => (
                        <span key={i} className="text-[10px] drop-shadow-sm">🧊</span>
                     ))}
                   </div>
                )}
                
                <p className="text-[8px] text-gray-400 uppercase font-bold mt-1 group-hover:text-amber-500 transition-colors">Pasaporte ❯</p>
            </button>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center min-w-[100px] flex-1 md:flex-none">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Adherencia (7 Días)</p>
                <p className={`text-3xl font-black ${adherence >= 85 ? 'text-emerald-500' : adherence >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                    {adherence}%
                </p>
            </div>
        </div>
      </div>

      {/* 🔥 BANNER DE IA: MENSAJE BIOMECÁNICO DINÁMICO 🔥 */}
      {currentTarget.message && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
              <p className="text-xs md:text-sm font-black text-amber-800 leading-relaxed">
                  {currentTarget.message}
              </p>
          </div>
      )}

      {/* ALERTA DE SISTEMA */}
      {!currentTarget.message && (
        <div className={`p-5 md:p-6 rounded-2xl border transition-colors shadow-sm ${adherence >= 85 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : adherence >= 60 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="text-xs md:text-sm font-black uppercase tracking-widest flex items-start md:items-center gap-3 leading-snug">
            <span className="text-2xl mt-1 md:mt-0">{adherence >= 85 ? '✅' : adherence >= 60 ? '⚠️' : '🚨'}</span> 
            <span>{feedback}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-5 flex flex-col gap-6 self-start">
            
            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]"></div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 relative z-10">
                    <span className="text-base">🧭</span> Guía de Acción Directa
                </h3>
                
                <div className="relative z-10">
                    <h4 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 leading-none">
                        {guidance.action}
                    </h4>
                    
                    <div className="space-y-4">
                        {guidance.recommendations.map((rec: string, idx: number) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                <p className="text-xs md:text-sm text-gray-700 font-bold leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5 flex justify-between">
                   <span>Estado Estructural</span>
                   {activePlan.is_dynamic_cycling && <span className="text-amber-500">⚡ MODO BIOMECÁNICO</span>}
                </h3>
                <div className="space-y-5">
                    <MacroBar label="Kcal Consumidas" actual={actuals.calories} target={currentTarget.calories} color="bg-amber-500" />
                    <MacroBar label="Proteína (Ladrillos)" actual={actuals.protein} target={currentTarget.protein} color="bg-blue-500" suffix="g" />
                    <MacroBar label="Carbos (Combustible)" actual={actuals.carbs} target={currentTarget.carbs} color="bg-emerald-500" suffix="g" />
                    <MacroBar label="Grasas (Hormonal)" actual={actuals.fats} target={currentTarget.fats} color="bg-red-500" suffix="g" />
                </div>
            </div>

        </div>

        {/* PANEL DERECHO */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                   <span className="text-base">✍️</span> Panel de Carga Dinámica
                 </h3>
                 {/* 🔥 BOTÓN DE GUARDADO DOPAMINÉRGICO 🔥 */}
                 <button 
                    onClick={handleSaveDay} 
                    disabled={saving} 
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 w-full sm:w-auto ${
                        dailyAdherence >= 85 ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30' : 'bg-black hover:bg-zinc-800 text-white'
                    }`}
                 >
                    {saving ? 'Guardando...' : (dailyAdherence >= 85 ? '✅ DÍA PERFECTO. GUARDAR.' : 'FORZAR GUARDADO 💾')}
                 </button>
              </div>

              {/* BUSCADOR */}
              <div className="mb-6 relative">
                 <SmartFoodSearch onAddFood={async (food) => {
                    const newActuals = {
                       ...actuals,
                       calories: Number(actuals.calories || 0) + food.calories,
                       protein: Number(actuals.protein || 0) + food.protein,
                       carbs: Number(actuals.carbs || 0) + food.carbs,
                       fats: Number(actuals.fats || 0) + food.fats
                    };
                    
                    setActuals(newActuals);

                    const tempId = `temp-${Date.now()}`;
                    setTodayMeals(prev => [{
                        id: tempId, 
                        food_name: food.name, 
                        calories: food.calories, 
                        protein: food.protein, 
                        carbs: food.carbs, 
                        fats: food.fats
                    }, ...prev]);

                    setSaving(true);
                    try {
                        const newAdherence = calculateAdherence(newActuals, currentTarget);
                        const payload = {
                            user_id: userId,
                            log_date: todayDate,
                            weight_kg: Number(newActuals.weight) || null,
                            calories_actual: newActuals.calories,
                            protein_actual: newActuals.protein,
                            carbs_actual: newActuals.carbs,
                            fats_actual: newActuals.fats,
                            adherence_score: newAdherence,
                            updated_at: new Date().toISOString()
                        };

                        let currentLogId = todayLog?.id;
                        if (currentLogId) {
                            await supabase.from('nutrition_logs').update(payload).eq('id', currentLogId);
                        } else {
                            const { data } = await supabase.from('nutrition_logs').insert(payload).select().single();
                            if (data) {
                                setTodayLog(data);
                                currentLogId = data.id;
                            }
                        }

                        const { data: realMeal } = await supabase.from('nutrition_meals').insert({
                            user_id: userId,
                            log_date: todayDate,
                            food_name: food.name,
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fats: food.fats
                        }).select().single();

                        if (realMeal) {
                            setTodayMeals(prev => prev.map(m => m.id === tempId ? realMeal : m));
                        }

                    } catch(e) {
                        console.error("Error en autosave:", e);
                    } finally {
                        setSaving(false);
                    }
                 }} />

                 {/* LISTA VISUAL DE COMIDAS CON BOTÓN BORRAR */}
                 {todayMeals.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100" translate="no">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                           <span>🍽️</span> Registro de Ingestas (Hoy)
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                           {todayMeals.map((meal) => (
                              <div key={meal.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm group hover:border-red-200 transition-colors">
                                 <div className="flex flex-col truncate pr-2 flex-1">
                                     <span className="text-sm font-black text-slate-800 truncate">{meal.food_name}</span>
                                     <div className="flex gap-2 text-[10px] font-black uppercase mt-1">
                                        <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{meal.calories} kcal</span>
                                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{meal.protein}g P</span>
                                     </div>
                                 </div>
                                 
                                 <button 
                                    onClick={() => handleDeleteMeal(meal.id, meal.calories, meal.protein, meal.carbs, meal.fats)}
                                    disabled={saving}
                                    className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-40 group-hover:opacity-100 active:scale-90 disabled:opacity-20"
                                    title="Borrar alimento"
                                 >
                                    <span className="text-lg">🗑️</span>
                                 </button>
                              </div>
                           ))}
                        </div>
                    </div>
                 )}
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">O CARGA MANUAL</span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              
              {/* INPUTS MANUALES ÉLITE */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                 <div className="bg-white border border-gray-200 border-l-4 border-l-gray-400 p-3 rounded-xl focus-within:border-gray-600 transition-colors shadow-sm col-span-2 md:col-span-1 flex flex-col justify-center">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block leading-none">Peso (Kg)</label>
                   <input type="number" step="0.1" value={actuals.weight} onChange={e => setActuals({...actuals, weight: e.target.value})} onBlur={handleSaveDay} className="w-full bg-transparent text-xl font-black text-gray-800 outline-none leading-none placeholder:text-gray-200" placeholder="0.0" />
                 </div>
                 
                 <div className={`bg-white border border-gray-200 border-l-4 border-l-amber-400 p-3 rounded-xl focus-within:border-amber-500 transition-all shadow-sm col-span-2 md:col-span-1 flex flex-col justify-center ${actuals.calories > currentTarget.calories ? 'animate-pulse border-red-400 bg-red-50' : ''}`}>
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block leading-none">Calorías</label>
                   <input type="number" value={actuals.calories || ''} onChange={e => setActuals({...actuals, calories: Number(e.target.value)})} onBlur={handleSaveDay} className="w-full bg-transparent text-xl font-black text-amber-600 outline-none leading-none placeholder:text-gray-200" placeholder="0" />
                 </div>
                 
                 <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 p-3 rounded-xl focus-within:border-blue-600 transition-colors shadow-sm flex flex-col justify-center">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block leading-none">Prot (g)</label>
                   <input type="number" value={actuals.protein || ''} onChange={e => setActuals({...actuals, protein: Number(e.target.value)})} onBlur={handleSaveDay} className="w-full bg-transparent text-xl font-black text-blue-600 outline-none leading-none placeholder:text-gray-200" placeholder="0" />
                 </div>
                 
                 <div className="bg-white border border-gray-200 border-l-4 border-l-emerald-500 p-3 rounded-xl focus-within:border-emerald-600 transition-colors shadow-sm flex flex-col justify-center">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block leading-none">Carbs (g)</label>
                   <input type="number" value={actuals.carbs || ''} onChange={e => setActuals({...actuals, carbs: Number(e.target.value)})} onBlur={handleSaveDay} className="w-full bg-transparent text-xl font-black text-emerald-600 outline-none leading-none placeholder:text-gray-200" placeholder="0" />
                 </div>
                 
                 <div className="bg-white border border-gray-200 border-l-4 border-l-red-500 p-3 rounded-xl focus-within:border-red-600 transition-colors shadow-sm flex flex-col justify-center">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block leading-none">Grasas (g)</label>
                   <input type="number" value={actuals.fats || ''} onChange={e => setActuals({...actuals, fats: Number(e.target.value)})} onBlur={handleSaveDay} className="w-full bg-transparent text-xl font-black text-red-600 outline-none leading-none placeholder:text-gray-200" placeholder="0" />
                 </div>
              </div>
              <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mt-4 text-center md:text-right">💡 Tus datos se guardan automáticamente al dejar de escribir.</p>
            </div>

            {/* GRÁFICO DE EVOLUCIÓN */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm flex-1 min-h-[300px] flex flex-col">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                 <span className="flex items-center gap-2"><span className="text-base">📉</span> Evolución de Peso vs Adherencia</span>
                 <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-500">14 DÍAS</span>
               </h3>
               
               {chartData.length > 1 ? (
                 <div className="h-[250px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis yAxisId="left" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} /> 
                        <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={10} tickLine={false} axisLine={false} dx={10} domain={['auto', 'auto']} /> 
                        
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold' }} />
                        
                        <Line yAxisId="left" type="monotone" dataKey="adherencia" name="Adherencia (%)" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                        <Line yAxisId="right" type="monotone" dataKey="peso" name="Peso (KG)" stroke="#6366f1" strokeWidth={3} dot={{r:4}} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-70 min-h-[200px]">
                    <span className="text-4xl mb-2">📊</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Insuficientes días registrados para graficar</p>
                 </div>
               )}
            </div>

            {/* LISTA DE HISTORIAL */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                 <span className="text-base">📅</span> Bitácora Metabólica
               </h3>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[250px]">
                  {historyLogs.slice(0, 14).map((log) => (
                    <div key={log.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex justify-between items-center transition-colors hover:border-gray-200">
                       <div>
                          <p className="text-xs font-black text-black">{log.log_date === todayDate ? 'HOY' : new Date(log.log_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">Calorías: <span className="text-gray-800">{log.calories_actual}</span></p>
                       </div>
                       <div className="text-right">
                          <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md border ${log.adherence_score >= 85 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : log.adherence_score >= 60 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                             {log.adherence_score}%
                          </span>
                          {log.weight_kg && <p className="text-[10px] text-gray-500 font-black mt-2">{log.weight_kg} KG</p>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

        </div>
      </div>

      {/* 🔥 EL MODAL DEL PASAPORTE DE DISCIPLINA (GAMIFICACIÓN NUEVO) 🔥 */}
      {showPassport && gamification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px]"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-black italic uppercase text-black">Pasaporte de <span className="text-amber-500">Disciplina</span></h3>
                <button onClick={() => setShowPassport(false)} className="text-gray-400 hover:text-black text-2xl font-black cursor-pointer">×</button>
            </div>
            
            <div className="space-y-6 relative z-10">
                {/* 1. Rango Actual */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl text-center shadow-lg border border-gray-800">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Rango Actual</p>
                    <h2 className={`text-3xl font-black uppercase tracking-tighter ${
                        gamification.current_tier === 'RECLUTA' ? 'text-gray-300' :
                        gamification.current_tier === 'ATLETA 🥈' ? 'text-gray-300' :
                        gamification.current_tier === 'MÁQUINA 🥇' ? 'text-amber-400' :
                        'text-purple-400'
                    }`}>
                        {gamification.current_tier || 'RECLUTA'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold mt-2">Días Óptimos Históricos: <span className="text-white">{gamification.total_perfect_days || 0}</span></p>
                </div>

                {/* 2. Estadísticas de Racha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                        <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest mb-1">Racha Actual</p>
                        <p className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1">🔥 {streak}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Récord Histórico</p>
                        <p className="text-3xl font-black text-gray-800 flex items-center justify-center gap-1">🏆 {gamification.longest_streak || 0}</p>
                    </div>
                </div>

                {/* 3. Escudos */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Escudos Anti-Fallo</p>
                        <span className="text-xs font-black text-blue-800">{freezeDays}/3</span>
                    </div>
                    <div className="flex gap-2 h-12">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`flex-1 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${i < freezeDays ? 'bg-blue-100 border-blue-300 text-blue-500 shadow-inner' : 'bg-transparent border-dashed border-blue-200 opacity-30'}`}>
                                {i < freezeDays ? '🧊' : ''}
                            </div>
                        ))}
                    </div>
                    <p className="text-[8px] text-blue-500 font-bold mt-3 uppercase tracking-widest text-center">Ganá 1 escudo nuevo por cada 7 días de racha perfecta.</p>
                </div>
            </div>
            
            <button 
                onClick={() => setShowPassport(false)}
                className="w-full mt-8 bg-gray-100 hover:bg-gray-200 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
            >
                CERRAR PASAPORTE
            </button>
          </div>
        </div>
      )}

      {/* 🔥 RECOVERY CHECK-IN MODAL CORREGIDO (COLORES VIBRANTES) 🔥 */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg relative overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px]"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-black italic uppercase text-black">Auditoría <span className="text-purple-600">de Recuperación</span></h3>
                <button onClick={() => setShowRecoveryModal(false)} className="text-gray-400 hover:text-black text-2xl font-black">×</button>
            </div>
            
            <p className="text-xs text-gray-500 font-medium mb-8 relative z-10 leading-relaxed">
              Fiera, tu nutrición es solo la mitad de la ecuación. Para programar tu próximo pico de rendimiento, el Head Coach necesita tus métricas biomecánicas de las últimas 24 horas. Se honesto, es por tu progreso.
            </p>
            
            <div className="space-y-6 relative z-10">
                {/* 🌙 Input Sueño */}
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl border-l-4 border-l-purple-500 shadow-sm focus-within:border-purple-300 transition-colors">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">¿Cuántas horas dormiste anoche? 🌙</label>
                    <input 
                        type="number" 
                        step="0.5"
                        value={recoveryData.sleep_hours}
                        onChange={e => setRecoveryData({...recoveryData, sleep_hours: e.target.value})}
                        className="w-full bg-transparent text-4xl font-black text-purple-700 outline-none placeholder:text-purple-300/50" 
                        placeholder="0.0" 
                    />
                    <p className="text-[8px] text-purple-500 font-bold mt-2 uppercase tracking-widest">Apuntá a 7-9hs para optimización hormonal.</p>
                </div>
                
                {/* ⚡ Input sRPE (Fatiga Global) */}
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl border-l-4 border-l-orange-500 shadow-sm focus-within:border-orange-300 transition-colors">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Dificultad Global del Entrenamiento de HOY (sRPE 1-10) ⚡</label>
                    <input 
                        type="number" 
                        min="1"
                        max="10"
                        value={recoveryData.srpe}
                        onChange={e => setRecoveryData({...recoveryData, srpe: e.target.value})}
                        className="w-full bg-transparent text-4xl font-black text-orange-600 outline-none placeholder:text-orange-300/50" 
                        placeholder="0" 
                    />
                    <p className="text-[8px] text-orange-500 font-bold mt-2 uppercase tracking-widest">Escala sRPE de 1 (descanso) a 10 (esfuerzo máximo absoluto).</p>
                </div>
            </div>
            
            <button 
                onClick={handleSaveRecovery}
                disabled={saving}
                className="w-full mt-10 bg-black hover:bg-zinc-800 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 relative z-10"
            >
                {saving ? 'SINCRONIZANDO BIOMÉTRICAS...' : '💾 FINALIZAR REPORTE DIARIO'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function MacroBar({ label, actual, target, color, suffix = "" }: { label: string, actual: number, target: number, color: string, suffix?: string }) {
  const percent = Math.min(100, (actual / target) * 100) || 0;
  const isOver = actual > target;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
        <span className="text-[10px] font-black">
          <span className={isOver ? 'text-red-500' : 'text-black'}>{actual}</span> <span className="text-gray-400 font-bold">/ {target}{suffix}</span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
        <div className={`h-full ${isOver ? 'bg-red-500' : color} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}