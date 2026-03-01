"use client";

import { useState } from "react";
import Link from "next/link";

export default function TriageQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ limitante: "", dias: "", nivel: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState("");

  const questions = [
    {
      id: "limitante",
      title: "1. ¿Cuál es tu limitante principal en este momento?",
      options: [
        { label: "Estancamiento", desc: "No logro subir mis marcas ni mi masa muscular.", value: "estancamiento" },
        { label: "Dolor Articular", desc: "Me duelen las rodillas, lumbares u hombros al entrenar.", value: "lesiones" },
        { label: "Falta de Tiempo", desc: "Entreno sin estructura porque vivo ocupado.", value: "tiempo" }
      ]
    },
    {
      id: "dias",
      title: "2. Sé realista: ¿Cuántos días a la semana podés entrenar sin fallar?",
      options: [
        { label: "2 a 3 días", desc: "Baja frecuencia. Requiere alta intensidad.", value: "bajo" },
        { label: "4 días", desc: "Frecuencia estándar. Ideal para Upper/Lower.", value: "medio" },
        { label: "5 a 6 días", desc: "Alto volumen. Alto riesgo de fatiga del SNC.", value: "alto" }
      ]
    },
    {
      id: "nivel",
      title: "3. ¿Cuál es tu nivel real de tolerancia al esfuerzo (RPE)?",
      options: [
        { label: "Principiante", desc: "Me guardo repeticiones. No conozco mi fallo.", value: "novato" },
        { label: "Intermedio", desc: "Entreno duro, pero a veces pierdo la técnica.", value: "intermedio" },
        { label: "Avanzado", desc: "Llego al fallo muscular absoluto (RIR 0).", value: "elite" }
      ]
    }
  ];

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < questions.length) {
      setStep(step + 1);
    } 
    
    if (step === questions.length) {
        startAnalysis();
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisText("Cruzando datos biomecánicos...");
    
    setTimeout(() => setAnalysisText("Evaluando tolerancia del Sistema Nervioso Central..."), 800);
    setTimeout(() => setAnalysisText("Calculando requerimientos de recuperación..."), 1600);
    setTimeout(() => setAnalysisText("Generando dictamen clínico..."), 2400);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(4); // Pantalla de resultados
    }, 3200);
  };

  // Generador dinámico de diagnóstico basado en lo que respondió
  const getDiagnosticText = () => {
    let diag = "";
    
    // Análisis de Días
    if (answers.dias === "bajo") diag += "Al entrenar solo 2-3 días, tu perfil exige un protocolo BII (Breve, Intenso, Infrecuente) de altísima tensión mecánica. Una rutina genérica te dejará en subentrenamiento. ";
    if (answers.dias === "medio") diag += "Tu disponibilidad de 4 días es óptima, pero requiere una periodización exacta (Top Sets + Backoffs) para no quemar tu SNC a mitad de semana. ";
    if (answers.dias === "alto") diag += "¡ALERTA ROJA! Entrenar 5-6 días te pone en riesgo crítico de sobreentrenamiento y fatiga del SNC. Necesitas una gestión del volumen quirúrgica. ";

    // Análisis de Limitante
    if (answers.limitante === "lesiones") diag += "Además, al presentar molestias articulares, debemos eliminar los 'ejercicios basura' y transicionar inmediatamente a variantes de alta estabilidad externa y control excéntrico. ";
    if (answers.limitante === "estancamiento") diag += "Tu estancamiento actual es prueba de que has agotado tus adaptaciones de novato; necesitas programar fases de sobrecarga y descargas (Deloads) programadas. ";
    
    diag += "\n\nCONCLUSIÓN CLÍNICA: La única vía segura y eficiente para tu biología es el Coaching BII-Vintage. Necesitas que un Head Coach evalúe tus videos, controle tu fatiga y ajuste tus cargas semana a semana.";
    
    return diag;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0a0a0c] border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden font-sans">
      
      {/* Cabecera del Triage */}
      <div className="bg-zinc-950 border-b border-zinc-800 p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]"></div>
        <h2 className="text-emerald-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema de Triage Clínico
        </h2>
        <h3 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tight">Diagnóstico Estructural</h3>
        {step === 0 && (
          <p className="text-xs md:text-sm text-zinc-400 mt-4 max-w-xl mx-auto leading-relaxed">
            El 90% de los atletas fracasa por una mala gestión de la fatiga. Respondé esta auditoría de 3 pasos y nuestro algoritmo determinará la dosis exacta que tu cuerpo necesita para mutar sin romperse.
          </p>
        )}
      </div>

      <div className="p-6 md:p-10">
        
        {/* Pantalla 0: Inicio */}
        {step === 0 && (
          <div className="text-center py-4">
            <button 
                onClick={() => setStep(1)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
            >
              Iniciar Auditoría Gratuita ⚡
            </button>
          </div>
        )}

        {/* Pantallas 1, 2, 3: Preguntas */}
        {step > 0 && step <= questions.length && !isAnalyzing && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-8">
               {[1, 2, 3].map(num => (
                  <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>
               ))}
            </div>
            
            <h4 className="text-lg md:text-xl font-black text-white mb-6 leading-tight">
              {questions[step - 1].title}
            </h4>

            <div className="space-y-3">
              {questions[step - 1].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(questions[step - 1].id, opt.value)}
                  className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-emerald-500 p-5 rounded-2xl transition-all group hover:bg-zinc-900"
                >
                  <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-1 group-hover:text-emerald-400">{opt.label}</p>
                  <p className="text-zinc-300 text-xs md:text-sm font-medium">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pantalla de Carga Simulada (Alto Valor Percibido) */}
        {isAnalyzing && (
            <div className="text-center py-12 animate-in fade-in duration-300">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-sm mb-2">Procesando Perfil...</h4>
                <p className="text-zinc-500 text-xs font-mono">{analysisText}</p>
            </div>
        )}

        {/* Pantalla Final: Diagnóstico y CTA */}
        {step === 4 && (
            <div className="animate-in zoom-in-95 duration-500">
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 md:p-8 mb-8 relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 rounded-l-2xl"></div>
                    <h4 className="text-emerald-400 font-black italic uppercase text-lg md:text-xl mb-4 tracking-tight">🔬 Dictamen Estructural:</h4>
                    <p className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {getDiagnosticText()}
                    </p>
                </div>

                <div className="text-center bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-inner">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Tu siguiente paso fisiológico:</p>
                    
                    {/* 👇 AQUÍ PONE EL LINK A SU SECCIÓN DE PAGOS / PRECIOS 👇 */}
                    <Link href="#planes" className="inline-block w-full md:w-auto bg-white text-black hover:bg-zinc-200 font-black text-xs md:text-sm uppercase tracking-[0.2em] px-8 py-4 md:py-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        APLICAR AL COACHING BII 🚀
                    </Link>
                    
                    <p className="text-xs text-zinc-600 mt-4 italic">Plazas limitadas para asegurar control de calidad.</p>
                </div>
                
                <div className="mt-6 text-center">
                    <button onClick={() => setStep(0)} className="text-[9px] text-zinc-600 hover:text-white uppercase font-bold tracking-widest transition-colors underline">
                        Rehacer Auditoría
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}