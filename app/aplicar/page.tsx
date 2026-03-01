// app/aplicar/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AplicacionPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    instagram: "",
    goal: "",
    experienceLevel: "",
    knowsRir: null as boolean | null,
    trainingDays: 3,
    currentInjuries: "",
  });

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Guardar en Supabase
    const { error } = await supabase.from("applications").insert([
      {
        full_name: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        goal: formData.goal,
        experience_level: formData.experienceLevel,
        knows_rir: formData.knowsRir,
        training_days: formData.trainingDays,
        current_injuries: formData.currentInjuries,
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error guardando lead:", error);
      alert("Hubo un error al enviar tu solicitud. Intentá de nuevo.");
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-zinc-900/50 border border-emerald-500/30 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-emerald-500/30 shadow-inner">
            ✓
          </div>
          <h2 className="text-3xl font-black italic text-white mb-4 uppercase">Solicitud Recibida</h2>
          <p className="text-zinc-400 mb-8 font-medium">
            El Coach revisará tu perfil biomecánico y tus objetivos. Te contactaremos por WhatsApp en las próximas 24-48 horas hábiles.
          </p>
          <Link href="/">
            <button className="w-full bg-zinc-800 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-700 transition-colors">
              Volver al inicio
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* HEADER SIMPLE */}
      <header className="p-6 md:p-10 flex justify-between items-center border-b border-white/5">
        <Link href="/" className="text-xl font-black italic tracking-tighter hover:opacity-80 transition-opacity">
          TUJAGUE <span className="text-emerald-500">STRENGTH</span>
        </Link>
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          Paso {step} de 3
        </div>
      </header>

      {/* ÁREA DEL FORMULARIO */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <div className="w-full space-y-8">
          
          {/* BARRA DE PROGRESO */}
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-12">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* PASO 1: OBJETIVOS Y EXPERIENCIA */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 uppercase">
                  Perfil del <span className="text-emerald-500">Atleta</span>
                </h1>
                <p className="text-zinc-400 font-medium">Contame exactamente qué estás buscando y tu historial en los fierros.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                    1. Objetivo Principal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Fuerza Absoluta (Powerlifting)", "Hipertrofia Estética", "Recomposición Corporal", "Técnica y Readaptación"].map((opcion) => (
                      <button
                        key={opcion}
                        onClick={() => updateForm("goal", opcion)}
                        className={`p-4 rounded-2xl border text-sm font-bold text-left transition-all ${
                          formData.goal === opcion 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                    2. Nivel de Experiencia
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { title: "Principiante (< 1 año)", desc: "Necesito aprender la técnica de los básicos desde cero." },
                      { title: "Intermedio (1-3 años)", desc: "Tengo buena base, pero me estanqué en mis marcas." },
                      { title: "Avanzado (+3 años)", desc: "Busco afinar palancas, peaking o preparación competitiva." }
                    ].map((nivel) => (
                      <button
                        key={nivel.title}
                        onClick={() => updateForm("experienceLevel", nivel.title)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                          formData.experienceLevel === nivel.title 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        <span className="text-sm font-bold">{nivel.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{nivel.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep}
                disabled={!formData.goal || !formData.experienceLevel}
                className="w-full bg-emerald-500 text-black font-black text-xs uppercase tracking-widest py-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Siguiente Paso →
              </button>
            </div>
          )}

          {/* PASO 2: BIOMECÁNICA Y LOGÍSTICA */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 uppercase">
                  Logística y <span className="text-emerald-500">Fatiga</span>
                </h1>
                <p className="text-zinc-400 font-medium">El método BII requiere ajustar las cargas según tu capacidad de recuperación.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                    3. ¿Manejás conceptos como RIR (Repeticiones en Reserva) o RPE?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateForm("knowsRir", true)}
                      className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                        formData.knowsRir === true ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                      }`}
                    >
                      Sí, los uso.
                    </button>
                    <button
                      onClick={() => updateForm("knowsRir", false)}
                      className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                        formData.knowsRir === false ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                      }`}
                    >
                      No / No estoy seguro.
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                    4. Días disponibles para entrenar (Sugerido: 3 a 5)
                  </label>
                  <input 
                    type="range" 
                    min="2" max="6" 
                    value={formData.trainingDays}
                    onChange={(e) => updateForm("trainingDays", parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-center mt-2 font-black text-2xl text-white">
                    {formData.trainingDays} DÍAS
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                    5. ¿Tenés alguna lesión o molestia crónica? (Opcional)
                  </label>
                  <textarea 
                    value={formData.currentInjuries}
                    onChange={(e) => updateForm("currentInjuries", e.target.value)}
                    placeholder="Ej: Molestia en rodilla derecha al pasar los 90 grados, dolor lumbar crónico..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors h-24 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="w-1/3 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800">
                  ← Atrás
                </button>
                <button 
                  onClick={nextStep}
                  disabled={formData.knowsRir === null}
                  className="w-2/3 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest py-5 rounded-xl disabled:opacity-50 hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  Siguiente Paso →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: DATOS DE CONTACTO */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 uppercase">
                  Datos de <span className="text-emerald-500">Contacto</span>
                </h1>
                <p className="text-zinc-400 font-medium">¿A dónde te enviamos el resultado de la auditoría y tu acceso?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="Ej: Franco Colapinto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="tuemail@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">WhatsApp (Con código de país)</label>
                  <input 
                    type="tel" 
                    value={formData.whatsapp}
                    onChange={(e) => updateForm("whatsapp", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="+54 9 11 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Instagram (Opcional, para ver tus levantamientos)</label>
                  <input 
                    type="text" 
                    value={formData.instagram}
                    onChange={(e) => updateForm("instagram", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="@tu_usuario"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="w-1/3 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800">
                  ← Atrás
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.fullName || !formData.email || !formData.whatsapp}
                  className="w-2/3 flex justify-center items-center gap-2 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest py-5 rounded-xl disabled:opacity-50 hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}