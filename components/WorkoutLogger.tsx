"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link"; 

type SetLog = { weight: string; reps: string; rir: string; completed: boolean; type?: string };
type LogsState = Record<string, SetLog>; 

export default function WorkoutLogger() {
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [noProgram, setNoProgram] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    // 🚀 ESTADOS RELACIONALES 🚀
    const [fullProgram, setFullProgram] = useState<any>(null);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    
    // 🔥 ESTADOS INTERACTIVOS (UX) 🔥
    const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
    const [logs, setLogs] = useState<LogsState>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [showRpeHelp, setShowRpeHelp] = useState(false);

    // 🚀 HISTORIAL DEL ATLETA 🚀
    const [pastRecords, setPastRecords] = useState<Record<string, any[]>>({});

    // 🗣️ FEEDBACK DEL ATLETA 🗣️
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [sessionRpe, setSessionRpe] = useState<number | null>(null);
    const [athleteNotes, setAthleteNotes] = useState("");

    // 🤖 ESTADOS PARA EL OJO DE HALCÓN IA 🤖
    const [aiAudits, setAiAudits] = useState<Record<string, string>>({});
    const [isAuditing, setIsAuditing] = useState<string | null>(null);

    // 1. CARGA INICIAL
    useEffect(() => {
        fetchMyTrainingPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. BUSCAR EL HISTORIAL
    useEffect(() => {
        if (activeDayId && currentUser && fullProgram) {
            fetchHistoryForDay(activeDayId, currentUser.id);
            const currentDay = fullProgram.workouts?.find((w:any) => w.id === activeDayId);
            if (currentDay && currentDay.workout_exercises && currentDay.workout_exercises.length > 0) {
                setExpandedExercises({ [currentDay.workout_exercises[0].id]: true });
            } else {
                setExpandedExercises({});
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDayId, currentUser, fullProgram]);

    async function fetchMyTrainingPlan() {
        try {
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            const user = session?.user;
            if (authError || !user) throw new Error("No user");
            setCurrentUser(user);

            const { data: programData, error: progError } = await supabase
                .from('routines')
                .select('*, workouts (*, workout_exercises (*))')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (progError || !programData) {
                setNoProgram(true); setLoading(false); return;
            }

            if (programData.workouts) {
                programData.workouts.sort((a: any, b: any) => a.day_number - b.day_number);
                programData.workouts.forEach((w: any) => {
                    if (w.workout_exercises) w.workout_exercises.sort((a: any, b: any) => a.order_index - b.order_index);
                });
            }

            setFullProgram(programData);
            if (programData.workouts && programData.workouts.length > 0) setActiveDayId(programData.workouts[0].id);

        } catch (err) {
            setNoProgram(true);
        } finally {
            setLoading(false);
        }
    }

    async function fetchHistoryForDay(dayId: string, userId: string) {
        try {
            const currentDay = fullProgram?.workouts?.find((w:any) => w.id === dayId);
            if (!currentDay || !currentDay.workout_exercises) return;

            const exerciseIds = currentDay.workout_exercises.map((e:any) => e.id);
            if (exerciseIds.length > 0) {
                const { data: historyData } = await supabase
                    .from('logged_sets')
                    .select('*')
                    .eq('user_id', userId)
                    .in('workout_exercise_id', exerciseIds)
                    .order('logged_at', { ascending: false });

                if (historyData) {
                    const historyMap: Record<string, any[]> = {};
                    historyData.forEach((log: any) => { 
                        const exId = log.workout_exercise_id;
                        if (!historyMap[exId]) historyMap[exId] = [];
                        historyMap[exId].push(log);
                    });
                    setPastRecords(historyMap);
                }
            }
        } catch (error) {}
    }

    const toggleExercise = (exId: string) => setExpandedExercises(prev => ({ ...prev, [exId]: !prev[exId] }));

    const handleLogChange = (exId: string, setNumber: string | number, field: keyof SetLog, value: string | boolean, type?: string) => {
        const key = `${exId}_${setNumber}`; 
        setLogs(prev => {
            const currentLog = prev[key] || { weight: '', reps: '', rir: '', completed: false, type: type || 'Working' };
            return { ...prev, [key]: { ...currentLog, [field]: value } };
        });
    };

    const toggleSetComplete = (exId: string, setNumber: string | number, type?: string) => {
        const key = `${exId}_${setNumber}`;
        const currentLog = logs[key];
        if (!currentLog?.weight || !currentLog?.reps || !currentLog?.rir) {
            alert("⚠️ Anotá el peso, las reps y el RIR antes de marcar la serie.");
            return;
        }
        handleLogChange(exId, setNumber, 'completed', !currentLog.completed, type || currentLog?.type || 'Working');
    };

    // 🤖 FUNCIÓN DEL JUNK VOLUME KILLER 🤖
    const handleAuditExercise = async (exId: string, exName: string) => {
        const exLogs = Object.entries(logs).filter(([key, log]) => key.startsWith(`${exId}_`) && log.completed);
        
        if (exLogs.length === 0) {
            alert("⚠️ Primero tenés que completar y tildar (✓) al menos una serie para que la IA la evalúe.");
            return;
        }

        setIsAuditing(exId);
        try {
            let totalWeight = 0;
            let totalReps = 0;
            let totalRir = 0;

            exLogs.forEach(([_, log]) => {
                totalWeight = Math.max(totalWeight, Number(log.weight)); // Tomamos el peso máximo levantado
                totalReps += Number(log.reps);
                totalRir += Number(log.rir);
            });

            // Calculamos RPE estimado en base al RIR anotado
            const avgRpe = 10 - (totalRir / exLogs.length);

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'audit_volume',
                    data: {
                        exercise_name: exName,
                        total_sets: exLogs.length,
                        weight: totalWeight,
                        reps: totalReps,
                        avg_rpe: avgRpe.toFixed(1)
                    }
                })
            });

            const data = await res.json();
            if (data.result) {
                setAiAudits(prev => ({ ...prev, [exId]: data.result }));
            } else if (data.error) {
                alert("Error IA: " + data.error);
            }
        } catch (error) {
            alert("Error contactando a la IA.");
        } finally {
            setIsAuditing(null);
        }
    };

    const handlePreSaveSession = () => {
        const completedSets = Object.entries(logs).filter(([_, log]) => log.completed);
        if (completedSets.length === 0) return alert("⚠️ No marcaste ninguna serie como completada.");
        setSessionRpe(null); 
        setAthleteNotes("");
        setShowFeedbackModal(true); 
    };

    const handleConfirmSaveSession = async () => {
        if (sessionRpe === null) return alert("⚠️ Selecciona qué tan dura sentiste la sesión.");
        setShowFeedbackModal(false); 
        setIsSaving(true);
        setSaveMessage("");

        try {
            const completedSets = Object.entries(logs).filter(([_, log]) => log.completed);
            
            try {
                await supabase.from('workout_sessions').insert([{ 
                    user_id: currentUser.id, status: 'completed', session_rpe: sessionRpe, athlete_notes: athleteNotes 
                }]);
            } catch(e) {}

            const setsToInsert = completedSets.map(([key, log]) => {
                const [exId, _] = key.split('_'); 
                return {
                    user_id: currentUser.id,
                    workout_exercise_id: exId, 
                    weight_kg: parseFloat(log.weight),
                    reps_achieved: parseInt(log.reps),
                    rpe_achieved: parseFloat(log.rir) || null,
                };
            });

            if (setsToInsert.length > 0) {
                const { error: logsError } = await supabase.from('logged_sets').insert(setsToInsert);
                if (logsError) throw logsError;
            }

            setLogs({});
            setActiveDayId(null); 
            fetchMyTrainingPlan(); 
            setSaveMessage(`✅ ¡ENTRENAMIENTO SINCRONIZADO! GRACIAS POR EL FEEDBACK.`);
            setTimeout(() => setSaveMessage(""), 4000);

        } catch (error: any) {
            setSaveMessage("❌ " + error.message);
            setTimeout(() => setSaveMessage(""), 4000);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6"><div className="w-16 h-16 border-4 border-t-amber-500 border-gray-200 rounded-full animate-spin"></div></div>;
    if (noProgram || !fullProgram) return <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center"><span className="text-6xl mb-6 opacity-50">🚧</span><h2 className="text-2xl font-black italic uppercase text-black mb-2">Construyendo tu Bloque</h2><p className="text-gray-500 text-sm max-w-sm mb-8">El Coach está estructurando tu mesociclo.</p><Link href="/dashboard" className="bg-white border border-gray-200 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Volver al Panel</Link></div>;

    const currentDay = fullProgram?.workouts?.find((d:any) => d.id === activeDayId);
    const isRestDay = currentDay?.is_rest_day;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] pb-36 font-sans selection:bg-amber-500 selection:text-white">
            <div className="bg-white border-b border-gray-200 pt-6 pb-4 px-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-start justify-between w-full mb-6 gap-4">
                        <div className="flex flex-col items-start text-left">
                            <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest mb-2 bg-amber-50 px-3 py-1 rounded-md border border-amber-100 inline-block">
                                {fullProgram?.name || 'Protocolo BII'} • {fullProgram?.mesocycle || 'Fase Actual'}
                            </p>
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-black leading-none">
                                {currentDay ? currentDay.focus || currentDay.name : 'SELECCIONA UN DÍA'}
                            </h1>
                        </div>
                        <Link href="/dashboard" className="shrink-0 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-sm">
                            ← Volver
                        </Link>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start sm:justify-center">
                        {fullProgram?.workouts?.map((workout:any) => (
                            <button key={workout.id} onClick={() => setActiveDayId(workout.id)} className={`px-4 py-3 rounded-2xl border flex-shrink-0 flex flex-col items-center transition-all min-w-[70px] ${activeDayId === workout.id ? 'bg-black border-black shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <span className={`font-black text-[10px] sm:text-xs uppercase ${activeDayId === workout.id ? 'text-white' : 'text-gray-600'}`}>DÍA {workout.day_number}</span>
                                <span className={`text-[8px] uppercase tracking-widest font-bold mt-1 ${activeDayId === workout.id ? 'text-amber-400' : 'text-gray-400'}`}>
                                    {workout.is_rest_day ? '💤 Rest' : '⚡ Go'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-3 sm:px-4 mt-6 space-y-5">
                {isRestDay ? (
                   <div className="text-center py-24 border border-gray-200 rounded-[2rem] bg-white shadow-sm mt-4 animate-in fade-in">
                     <span className="text-5xl md:text-6xl mb-4 block opacity-50">💤</span>
                     <h3 className="text-amber-500 font-black uppercase tracking-widest text-base md:text-lg mb-3">Recuperación del SNC</h3>
                     <p className="text-gray-500 text-xs md:text-sm max-w-[250px] mx-auto leading-relaxed">Hoy el músculo crece. Nutrición al 100%, hidratación máxima y descanso profundo.</p>
                   </div>
                ) : !currentDay?.workout_exercises || currentDay.workout_exercises.length === 0 ? (
                    <div className="text-center py-24 border border-gray-200 rounded-[2rem] bg-white shadow-sm mt-4"><span className="text-5xl block opacity-50 mb-4">🚧</span><h3 className="text-amber-500 font-black uppercase tracking-widest text-base mb-3 mt-4">Día en Blanco</h3></div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-end px-2">
                            <button onClick={() => setShowRpeHelp(true)} className="flex items-center gap-1.5 text-gray-500 hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <span>🧠</span> ¿Qué es RPE/RIR?
                            </button>
                        </div>

                        {currentDay.workout_exercises.map((exercise:any, index:number) => {
                            const exerciseHistory = pastRecords[exercise.id] || [];
                            const targetSets = parseInt(exercise.sets_target) || 3;

                            return (
                            <div key={exercise.id} className="bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden shadow-sm transition-all mb-4">
                                <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => toggleExercise(exercise.id)}>
                                    <div className="flex gap-3 items-center flex-1">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-amber-500 font-black italic shadow-sm text-sm shrink-0">{index + 1}</div>
                                        <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-black pr-2">{exercise.exercise_name}</h2>
                                    </div>
                                    <span className={`text-gray-400 font-bold text-xl transition-transform ${expandedExercises[exercise.id] ? 'rotate-180' : ''}`}>{expandedExercises[exercise.id] ? '−' : '+'}</span>
                                </div>

                                {expandedExercises[exercise.id] && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                        <div className="p-4 border-b border-gray-100 bg-white">
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-center">
                                                    <span className="block text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">RPE / RIR</span>
                                                    <span className="text-[10px] md:text-xs text-black font-bold truncate px-1">{exercise.rpe_target || '-'}</span>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-center">
                                                    <span className="block text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Tempo</span>
                                                    <span className="text-[10px] md:text-xs text-amber-600 font-bold">{exercise.tempo || '-'}</span>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-center">
                                                    <span className="block text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Descanso</span>
                                                    <span className="text-[10px] md:text-xs text-blue-600 font-bold">{exercise.rest_time || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4 space-y-3">
                                            {Array.from({ length: targetSets }).map((_, i) => {
                                                const setNumber = i + 1;
                                                const logKey = `${exercise.id}_${setNumber}`; 
                                                const currentLog = logs[logKey] || { weight: '', reps: '', rir: '', completed: false, type: 'Working' };
                                                const pastSet = exerciseHistory.length > 0 ? exerciseHistory[0] : null; 

                                                return (
                                                    <div key={logKey} className={`flex flex-col p-3 sm:p-4 rounded-2xl border transition-colors ${currentLog.completed ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-white border-gray-200'}`}>
                                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs shrink-0 ${currentLog.completed ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>{setNumber}</span>
                                                                <div>
                                                                    <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border mb-1 inline-block text-amber-600 border-amber-200 bg-amber-50">Working Set</span>
                                                                    <div className="flex flex-wrap gap-2 text-[9px] font-bold text-gray-500">
                                                                        <span>Obj: {exercise.reps_target} reps</span>
                                                                        <span className="text-gray-300">•</span>
                                                                        <span className="text-amber-600">RPE {exercise.rpe_target}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0 mt-3 sm:mt-0 sm:ml-4 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                                                                <div className="flex items-center gap-2">
                                                                    <input type="number" placeholder="Kg" value={currentLog.weight} onChange={(e) => handleLogChange(exercise.id, setNumber, 'weight', e.target.value)} disabled={currentLog.completed} className={`w-16 h-12 sm:w-14 bg-white border rounded-xl text-center text-black font-mono font-black outline-none transition-all shadow-sm text-sm ${currentLog.completed ? 'border-transparent bg-transparent opacity-50' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'}`} />
                                                                    <span className="text-gray-300 font-black text-sm">x</span>
                                                                    <input type="number" placeholder="Reps" value={currentLog.reps} onChange={(e) => handleLogChange(exercise.id, setNumber, 'reps', e.target.value)} disabled={currentLog.completed} className={`w-16 h-12 sm:w-14 bg-white border rounded-xl text-center text-black font-mono font-black outline-none transition-all shadow-sm text-sm ${currentLog.completed ? 'border-transparent bg-transparent opacity-50' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'}`} />
                                                                    <input type="number" placeholder="RIR" value={currentLog.rir} onChange={(e) => handleLogChange(exercise.id, setNumber, 'rir', e.target.value)} disabled={currentLog.completed} className={`w-14 h-12 sm:w-12 bg-amber-50/50 border rounded-xl text-center text-amber-700 font-mono font-black outline-none transition-all shadow-sm text-sm ${currentLog.completed ? 'border-transparent bg-transparent opacity-50' : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'}`} />
                                                                </div>
                                                                <button onClick={() => toggleSetComplete(exercise.id, setNumber)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ml-2 border-2 shrink-0 ${currentLog.completed ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-300 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-500 active:scale-95'}`}>
                                                                    {currentLog.completed ? '✓' : 'O'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* 🔥 BOTÓN AUDITORÍA IA 🔥 */}
                                        <div className="p-4 border-t border-gray-100 bg-blue-50/30">
                                            <button 
                                                onClick={() => handleAuditExercise(exercise.id, exercise.exercise_name)}
                                                disabled={isAuditing === exercise.id}
                                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                {isAuditing === exercise.id ? '🤖 ANALIZANDO SUDOR...' : '👁️ AUDITAR VOLUMEN CON IA'}
                                            </button>
                                            
                                            {aiAudits[exercise.id] && (
                                                <div className="mt-3 p-4 bg-white border border-blue-100 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                                                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                                        VEREDICTO DEL COACH
                                                    </p>
                                                    <p className="text-xs text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{aiAudits[exercise.id]}</p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showRpeHelp && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRpeHelp(false)}>
                    <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-[2rem] w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-black font-black italic uppercase tracking-tighter text-xl">Torque Dictionary</h3>
                            <button onClick={() => setShowRpeHelp(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest block mb-2">RIR (Reps in Reserve)</span>
                                <p className="text-xs text-gray-600 leading-relaxed">Cuántas repeticiones más podrías haber hecho antes de fallar. Si te pido RIR 1, frená cuando sientas que solo podés hacer una más.</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest block mb-2">RPE (Perceived Exertion)</span>
                                <p className="text-xs text-gray-600 leading-relaxed space-y-1">
                                    <span className="block"><strong className="text-black">RPE 10</strong> = Fallo absoluto (RIR 0).</span>
                                    <span className="block"><strong className="text-black">RPE 9</strong> = Quedó 1 rep (RIR 1).</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowRpeHelp(false)} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">Entendido</button>
                    </div>
                </div>
            )}

            {currentDay?.workout_exercises?.length > 0 && !isRestDay && (
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 sm:p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/95 to-transparent z-40 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto">
                        <button onClick={handlePreSaveSession} disabled={isSaving} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-5 sm:py-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all shadow-md active:scale-95">
                            {isSaving ? "SINCRONIZANDO..." : "💾 FINALIZAR ENTRENAMIENTO"}
                        </button>
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
                    <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-60"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                                <div>
                                    <span className="text-amber-600 font-black uppercase text-[10px] tracking-widest block mb-1">Cerrando Sesión</span>
                                    <h3 className="text-black font-black italic uppercase tracking-tighter text-3xl">Gran Trabajo</h3>
                                </div>
                                <button onClick={() => setShowFeedbackModal(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold">✕</button>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-4 block text-center">¿Qué tan dura sentiste la sesión hoy? (sRPE)</label>
                                    <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-10">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <button key={i+1} onClick={() => setSessionRpe(i+1)} className={`h-14 rounded-xl font-black text-lg transition-all border-2 ${sessionRpe === i+1 ? 'bg-black border-black text-white scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-black'}`}>{i+1}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-3 block">¿Molestias para el Coach?</label>
                                    <textarea value={athleteNotes} onChange={(e) => setAthleteNotes(e.target.value)} placeholder="Ej: Me dolió un poco el hombro..." className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl text-sm font-medium outline-none h-32 resize-none focus:bg-white focus:border-amber-500" />
                                </div>
                            </div>
                            <button onClick={handleConfirmSaveSession} disabled={isSaving} className="w-full mt-10 bg-black text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] active:scale-95">
                                {isSaving ? "SINCRONIZANDO..." : "💾 SUBIR DATOS ÉLITE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}