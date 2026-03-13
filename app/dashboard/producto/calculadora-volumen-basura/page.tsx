"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

type ExerciseInput = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  rir: number;
  frequency: number;
};

export default function JunkVolumeKiller() {
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: '1', name: 'Press de Banca', muscle: 'Pecho', sets: 4, reps: 10, rir: 2, frequency: 2 }
  ]);
  const [showOptimized, setShowOptimized] = useState(false);
  
  // 🔥 ESTADOS PARA LA IA DE LA CALCULADORA
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', muscle: 'Pecho', sets: 3, reps: 10, rir: 2, frequency: 1 }]);
    setShowOptimized(false);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setShowOptimized(false);
  };

  const updateExercise = (id: string, field: keyof ExerciseInput, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    setShowOptimized(false);
  };

  // 🔥 MOTOR MATEMÁTICO BII-VINTAGE (NIVEL ÉLITE MUNDIAL) 🔥
  const analysis = useMemo(() => {
    let rawTotalSets = 0;
    let rawEffectiveSets = 0;
    let totalSNCFatigue = 0;
    
    // 1. Base de datos Biomecánica (MRV = Límite Biológico de Series por Semana)
    const BIOMECHANICS: Record<string, { mrv: number, cnsCost: number }> = {
      'Pecho': { mrv: 12, cnsCost: 1.2 },
      'Espalda': { mrv: 14, cnsCost: 1.5 },
      'Piernas': { mrv: 10, cnsCost: 2.5 }, // Piernas fríe el SNC rapidísimo
      'Hombros': { mrv: 12, cnsCost: 1.1 },
      'Bíceps': { mrv: 16, cnsCost: 0.5 },  // Brazos recuperan rápido
      'Tríceps': { mrv: 14, cnsCost: 0.6 }
    };

    const muscleGroups: Record<string, { total: number, effective: number, junk: number, isOvertraining: boolean, mrvLimit: number }> = {};

    exercises.forEach(ex => {
      const weeklyVolume = ex.sets * ex.frequency;
      rawTotalSets += weeklyVolume;

      // 2. Penalización Exponencial por Falta de Intensidad (Curva de Tensión)
      let intensityFactor = 0;
      if (ex.rir === 0) intensityFactor = 1.0;     // 100% estímulo
      else if (ex.rir === 1) intensityFactor = 0.85; 
      else if (ex.rir === 2) intensityFactor = 0.60; 
      else if (ex.rir === 3) intensityFactor = 0.30; 
      else intensityFactor = 0.0; // RIR > 3 es cardio, 0 hipertrofia

      const effective = weeklyVolume * intensityFactor;
      rawEffectiveSets += effective;

      // 3. Costo al Sistema Nervioso Central (SNC)
      const cnsMultiplier = BIOMECHANICS[ex.muscle]?.cnsCost || 1.0;
      totalSNCFatigue += (weeklyVolume * cnsMultiplier * (ex.rir === 0 ? 1.2 : 1.0)); // Entrenar al fallo suma más fatiga sistémica

      if (!muscleGroups[ex.muscle]) {
        muscleGroups[ex.muscle] = { total: 0, effective: 0, junk: 0, isOvertraining: false, mrvLimit: BIOMECHANICS[ex.muscle]?.mrv || 12 };
      }
      muscleGroups[ex.muscle].total += weeklyVolume;
      muscleGroups[ex.muscle].effective += effective;
    });

    let finalEffectiveSets = 0;
    let overtrainingFatigue = 0;

    Object.keys(muscleGroups).forEach(muscle => {
      let group = muscleGroups[muscle];
      
      // Filtro MRV Quirúrgico por músculo
      if (group.effective > group.mrvLimit) {
        const excess = group.effective - group.mrvLimit;
        group.junk += excess + (group.total - group.effective);
        group.effective = group.mrvLimit;
        group.isOvertraining = true;
        overtrainingFatigue += excess;
      } else {
        group.junk = group.total - group.effective;
      }
      finalEffectiveSets += group.effective;
    });

    const junkSets = rawTotalSets - finalEffectiveSets;
    const efficiencyScore = rawTotalSets > 0 ? Math.round((finalEffectiveSets / rawTotalSets) * 100) : 0;
    
    // Clasificación del SNC
    let systemicFatigueLevel = "BAJA";
    if (totalSNCFatigue > 80) systemicFatigueLevel = "COLAPSO INMINENTE";
    else if (totalSNCFatigue > 60) systemicFatigueLevel = "ALTA (PELIGRO)";
    else if (totalSNCFatigue > 40) systemicFatigueLevel = "ÓPTIMA";

    let diagnosis = { title: "", desc: "", color: "", action: "" };

    // 🔥 DIAGNÓSTICO MEJORADO Y MÁS AGRESIVO
    if (efficiencyScore >= 85 && overtrainingFatigue === 0 && totalSNCFatigue <= 70) {
      diagnosis = { title: "Rango Élite", desc: "Volumen biomecánico perfecto. Estás operando en la zona de máximo rendimiento sin freír tu SNC.", color: "text-emerald-500", action: "No toques nada. Concéntrate en añadir kilos a la barra." };
    } else if (overtrainingFatigue > 0 || totalSNCFatigue > 80) {
      let worstMuscle = Object.keys(muscleGroups).length > 0 ? Object.keys(muscleGroups).reduce((a, b) => muscleGroups[a].junk > muscleGroups[b].junk ? a : b) : 'cuerpo';
      diagnosis = { title: "Colapso del SNC Detectado", desc: `ALERTA CLÍNICA: Tu ${worstMuscle} está recibiendo daño puro sin estímulo hipertrófico. El estrés neural es altísimo.`, color: "text-red-600", action: "Riesgo de lesión. Usa la guillotina de IA ahora mismo para salvar tu SNC." };
    } else if (efficiencyScore >= 60) {
      diagnosis = { title: "Falta de Intensidad Real", desc: "Mucho movimiento logístico, poca tensión mecánica. Estás dejando demasiadas repeticiones en reserva.", color: "text-yellow-500", action: "Estás perdiendo el tiempo. Eliminá el volumen basura y acercate al fallo absoluto (RIR 0)." };
    } else {
      diagnosis = { title: "Rutina Basura (Nivel Cardio)", desc: "El algoritmo indica que no estás entrenando fuerza, estás haciendo zumba con pesas. El crecimiento es matemáticamente imposible.", color: "text-red-500", action: "URGENTE: Activá el Optimizador BII y reestructura tu planificación." };
    }

    return { rawTotalSets, effectiveSets: Math.round(finalEffectiveSets * 10)/10, junkSets: Math.round(junkSets * 10)/10, efficiencyScore, diagnosis, muscleGroups, overtrainingFatigue, systemicFatigueLevel, totalSNCFatigue };
  }, [exercises]);

  // 🔥 CONTROLADOR DE IA CON CONTEXTO BIOMECÁNICO PROFUNDO 🔥
  const handleAskAI = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiQuestion.trim()) return;
      setIsAiThinking(true);
      setAiResponse("");

      const routineContext = exercises.map(ex => `${ex.name} (${ex.sets} sets x ${ex.frequency} días, RIR ${ex.rir})`).join(", ");
      const biomechanicData = `DATOS CLÍNICOS: Eficiencia Neural: ${analysis.efficiencyScore}%. Fatiga del SNC: ${analysis.systemicFatigueLevel}. Músculos con exceso de volumen: ${Object.keys(analysis.muscleGroups).filter(m => analysis.muscleGroups[m].isOvertraining).join(', ') || 'Ninguno'}.`;

      try {
          const res = await fetch("/api/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  messages: [{
                      role: "user", 
                      content: `ACTÚA COMO EL HEAD COACH DE TUJAGUE STRENGTH (Metodología BII-Vintage). Eres directo, clínico, no usas emojis infantiles y hablas con autoridad biomecánica.
                      Acabo de usar tu software Junk Volume Killer. 
                      Mi rutina original: ${routineContext}.
                      ${biomechanicData}
                      Me guillotinaste la rutina dejándola a RIR 0 y volumen mínimo. 
                      RESPONDE ESTA DUDA DEL ATLETA DE FORMA CORTA Y AGRESIVA: "${aiQuestion}"`
                  }] 
              })
          });
          const data = await res.json();
          if (data.reply) {
              setAiResponse(data.reply);
          } else {
              setAiResponse("El sistema está procesando demasiada información. Reinicia e intenta de nuevo.");
          }
      } catch (error) {
          setAiResponse("Fallo de conexión en los servidores centrales.");
      } finally {
          setIsAiThinking(false);
          setAiQuestion("");
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
        
        {/* ENCABEZADO */}
        <div className="bg-[#0a0a0c] border border-amber-900/40 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(245,158,11,0.1)] relative overflow-hidden transform-gpu">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_60%)] pointer-events-none transform-gpu -translate-y-1/4 translate-x-1/4"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <Link href="/dashboard" className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-amber-500 transition-colors mb-4 inline-block">← Volver a la Bóveda</Link>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-md">
                Junk Volume <span className="text-amber-500">Killer</span>
              </h1>
              <p className="text-zinc-400 mt-3 max-w-xl font-medium text-sm md:text-base">
                Diagnosticá tu rutina matemáticamente. El software detecta volumen inútil y sobreentrenamiento del SNC.
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-5 rounded-2xl text-center shadow-inner shrink-0">
              <span className="text-3xl block mb-1">🧠</span>
              <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Algoritmo MRV Activo</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* PANEL DE INPUTS */}
          <div className="lg:col-span-7 bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative z-10">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800/50 pb-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <span className="text-amber-500">1.</span> Tu Rutina Actual
              </h3>
              <button onClick={addExercise} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                + Ejercicio
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {exercises.map((ex, index) => (
                <div key={ex.id} className="bg-[#050505] border border-zinc-800 p-5 rounded-2xl relative group">
                  <button onClick={() => removeExercise(ex.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 text-xl font-bold transition-colors">×</button>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">Movimiento {index + 1}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Nombre</label>
                      <input type="text" value={ex.name} onChange={(e) => updateExercise(ex.id, 'name', e.target.value)} placeholder="Ej: Sentadilla" className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Músculo</label>
                      <select value={ex.muscle} onChange={(e) => updateExercise(ex.id, 'muscle', e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500 cursor-pointer">
                        <option value="Pecho">Pecho</option>
                        <option value="Espalda">Espalda</option>
                        <option value="Piernas">Piernas</option>
                        <option value="Hombros">Hombros</option>
                        <option value="Bíceps">Bíceps</option>
                        <option value="Tríceps">Tríceps</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Sets x Día</label>
                      <input type="number" min="1" value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-center text-white outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Reps</label>
                      <input type="number" min="1" value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-center text-white outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1">RIR (Fallo)</label>
                      <input type="number" min="0" max="10" value={ex.rir} onChange={(e) => updateExercise(ex.id, 'rir', Number(e.target.value))} className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-center text-amber-400 font-bold outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Días x Sem</label>
                      <input type="number" min="1" value={ex.frequency} onChange={(e) => updateExercise(ex.id, 'frequency', Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-center text-white outline-none focus:border-amber-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DE DIAGNÓSTICO */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl text-center">
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Puntaje de Eficiencia Biológica</h3>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#18181b" strokeWidth="12" fill="none" />
                  <circle cx="80" cy="80" r="70" stroke={analysis.efficiencyScore >= 80 ? '#10b981' : analysis.efficiencyScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * analysis.efficiencyScore) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black italic tracking-tighter text-white">{analysis.efficiencyScore}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">/ 100</span>
                </div>
              </div>
              <h4 className={`text-xl font-black uppercase italic tracking-tight mb-2 ${analysis.diagnosis.color}`}>{analysis.diagnosis.title}</h4>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">{analysis.diagnosis.desc}</p>
            </div>

            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-white">Auditoría Semanal</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="space-y-4">
                
                {/* NUEVO INDICADOR DE SNC */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Estrés SNC (Neural)</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${analysis.systemicFatigueLevel.includes('COLAPSO') ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>{analysis.systemicFatigueLevel}</span>
                    </div>
                    <div className="w-full bg-black rounded-full h-2 border border-zinc-800 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${analysis.totalSNCFatigue > 80 ? 'bg-red-500' : analysis.totalSNCFatigue > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, analysis.totalSNCFatigue)}%` }}></div>
                    </div>
                </div>

                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Series Totales Realizadas</span>
                  <span className="text-lg font-black text-white">{analysis.rawTotalSets}</span>
                </div>
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Series Efectivas (Hipertrofia)</span>
                  <span className="text-lg font-black text-emerald-400">{analysis.effectiveSets}</span>
                </div>
                <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/20 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-red-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">⚠️ Volumen Basura</span>
                  <span className="text-lg font-black text-red-400">{analysis.junkSets}</span>
                </div>
              </div>
              <div className="mt-6 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl border-l-2 border-l-amber-500">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Veredicto del Algoritmo:</p>
                <p className="text-sm font-medium text-zinc-300">{analysis.diagnosis.action}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ANÁLISIS ESTRUCTURAL POR MÚSCULO (CON ALARMA DE MRV) */}
        {Object.keys(analysis.muscleGroups).length > 0 && (
          <div className="bg-[#0a0a0c] border border-zinc-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8">Límites Biológicos <span className="text-zinc-500">por Músculo</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(analysis.muscleGroups).map(([muscle, data]) => {
                const isHighJunk = data.junk > data.effective;
                return (
                  <div key={muscle} className={`p-5 rounded-2xl border ${data.isOvertraining ? 'bg-red-950/20 border-red-500/50' : isHighJunk ? 'bg-amber-950/10 border-amber-500/30' : 'bg-[#050505] border-zinc-800'}`}>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex justify-between items-center">
                      {muscle}
                      {data.isOvertraining ? (
                        <span className="text-red-500 text-[9px] bg-red-500/10 px-2 py-1 rounded border border-red-500/20">SOBREENTRENADO</span>
                      ) : isHighJunk ? (
                        <span className="text-amber-500 text-[9px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">BAJA INTENSIDAD</span>
                      ) : (
                        <span className="text-emerald-500 text-[9px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">ÓPTIMO</span>
                      )}
                    </h4>
                    <div className="space-y-2 text-[11px] font-bold tracking-widest uppercase">
                      <div className="flex justify-between text-zinc-400"><span>Total:</span> <span>{data.total} Sets</span></div>
                      <div className="flex justify-between text-emerald-400"><span>Efectivo:</span> <span>{Math.round(data.effective * 10)/10} Sets</span></div>
                      <div className="flex justify-between text-red-400"><span>Basura/Fatiga:</span> <span>{Math.round(data.junk * 10)/10} Sets</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 🔥 BOTÓN MÁGICO DE OPTIMIZACIÓN 🔥 */}
            <div className="mt-10 text-center border-t border-zinc-800 pt-10">
                <button 
                  onClick={() => setShowOptimized(!showOptimized)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all active:scale-95"
                >
                  {showOptimized ? "OCULTAR RUTINA CORTADA" : "⚔️ GENERAR VERSIÓN OPTIMIZADA BII"}
                </button>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-4">La IA cortará el volumen basura y ajustará tu RIR automáticamente.</p>
            </div>
          </div>
        )}

        {/* 🤖 RESULTADO DEL OPTIMIZADOR (VERSIÓN PRO) */}
        {showOptimized && (
           <div className="bg-gradient-to-br from-amber-950/30 to-[#0a0a0c] border border-amber-500/50 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(245,158,11,0.15)] animate-in slide-in-from-top-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_60%)] pointer-events-none transform-gpu"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-amber-500/20 pb-6 relative z-10">
                 <div>
                     <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                     <span className="text-4xl drop-shadow-md">🔪</span> Estructura <span className="text-amber-500">Guillotinada</span>
                     </h3>
                     <p className="text-zinc-400 font-medium text-sm mt-2 max-w-lg">El algoritmo eliminó el volumen inútil y ajustó la tensión mecánica al máximo nivel recuperable (MRV). Harás menos, pero mutarás más.</p>
                 </div>
                 <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-xl shadow-inner text-center w-full md:w-auto shrink-0">
                     <p className="text-amber-500 font-black text-2xl leading-none">-{analysis.junkSets}</p>
                     <p className="text-[9px] uppercase tracking-widest text-amber-400/80 font-bold mt-1">Series Eliminadas</p>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10 relative z-10">
                {exercises.map((ex) => {
                  const optimalSets = Math.max(1, Math.min(2, ex.sets)); // Nunca dejamos más de 2 sets por ejercicio
                  return (
                  <div key={ex.id + 'opt'} className="bg-black/80 border border-zinc-800 p-6 rounded-[1.5rem] flex flex-col justify-between hover:border-amber-500/50 transition-colors shadow-lg group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 group-hover:w-2 transition-all"></div>
                    
                    <div className="flex justify-between items-start mb-4 pl-3">
                      <div>
                        <p className="text-white font-black uppercase tracking-tight text-lg mb-1">{ex.name || 'Ejercicio'}</p>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{ex.muscle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-black text-2xl">{optimalSets} <span className="text-sm text-zinc-500 font-bold">SETS</span></p>
                        <p className="text-white font-black text-lg">{ex.reps} <span className="text-[10px] text-zinc-500 font-bold">REPS</span></p>
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 mt-auto ml-3 flex justify-between items-center">
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Intensidad Máxima
                        </p>
                        <span className="bg-red-500 text-black text-[9px] font-black px-2 py-1 rounded">RIR 0 (FALLO)</span>
                    </div>
                  </div>
                )})}
             </div>

             {/* NUEVO: MÓDULO DE CONSULTA IA INTEGRADO */}
             <div className="bg-[#050505] border border-blue-900/40 rounded-3xl p-6 md:p-8 relative z-10 shadow-inner mt-8">
                 <h4 className="text-blue-500 font-black uppercase tracking-widest text-[10px] md:text-xs mb-4 flex items-center gap-2">
                     <span className="text-base">🤖</span> Consultorio Biomecánico
                 </h4>
                 <p className="text-zinc-400 text-sm font-medium mb-6">¿No entendés por qué la IA te recortó tantas series? Preguntale cómo ejecutar esta nueva estructura para no perder fuerza.</p>
                 
                 {aiResponse && (
                     <div className="mb-6 p-5 bg-gradient-to-br from-blue-950/40 to-black border border-blue-500/30 rounded-2xl text-blue-50 text-sm leading-relaxed font-medium animate-in fade-in whitespace-pre-wrap shadow-lg">
                         <span className="block text-[9px] text-blue-400 font-black uppercase tracking-widest mb-2">Respuesta del Sistema:</span>
                         {aiResponse}
                     </div>
                 )}

                 <form onSubmit={handleAskAI} className="flex gap-3">
                     <input 
                         type="text" 
                         value={aiQuestion}
                         onChange={(e) => setAiQuestion(e.target.value)}
                         placeholder="Ej: ¿Por qué me quitaste series de piernas?"
                         className="flex-1 bg-black border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 transition-colors shadow-inner placeholder:text-zinc-700"
                         disabled={isAiThinking}
                     />
                     <button 
                         type="submit" 
                         disabled={isAiThinking || !aiQuestion.trim()}
                         className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                     >
                         {isAiThinking ? '...' : 'Preguntar'}
                     </button>
                 </form>
             </div>
           </div>
        )}

        {/* 🎁 MATERIAL BONUS DESBLOQUEADO */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden mt-10">
           <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 relative z-10">Material de <span className="text-emerald-500">Rescate (Bonus)</span></h3>
           <p className="text-zinc-400 font-medium text-sm md:text-base mb-10 relative z-10">Accedé a tus 3 Bonus prometidos para dominar la intensidad y dejar de perder el tiempo.</p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* BONUS 1 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors group flex flex-col items-center text-center">
                 <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">📘</span>
                 <h4 className="text-white font-black uppercase text-sm tracking-widest mb-2">Bonus 1</h4>
                 <p className="text-zinc-400 text-xs font-medium mb-6">Guía: 5 Errores que generan Volumen Basura</p>
                 <a 
                    href="https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/Bonus1_ErroresVolumen.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-auto w-full block bg-zinc-900 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"
                 >
                    Leer Documento
                 </a>
              </div>

              {/* BONUS 2 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors group flex flex-col items-center text-center">
                 <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">✅</span>
                 <h4 className="text-white font-black uppercase text-sm tracking-widest mb-2">Bonus 2</h4>
                 <p className="text-zinc-400 text-xs font-medium mb-6">Checklist: Cómo saber si llegaste al Fallo Real (RIR 0)</p>
                 <a 
                    href="https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/Bonus2_ChecklistFallo.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-auto w-full block bg-zinc-900 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"
                 >
                    Ver Checklist
                 </a>
              </div>

              {/* BONUS 3 */}
              <div className="bg-black border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors group flex flex-col items-center text-center">
                 <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">🦍</span>
                 <h4 className="text-white font-black uppercase text-sm tracking-widest mb-2">Bonus 3</h4>
                 <p className="text-zinc-400 text-xs font-medium mb-6">Rutina BII Base (3 Días) Libre de Volumen Basura</p>
                 <a 
                    href="https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/Bonus3_RutinaRescate.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-auto w-full block bg-zinc-900 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"
                 >
                    Descargar PDF
                 </a>
              </div>
           </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
      `}} />
    </div>
  );
}