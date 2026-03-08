"use client";

export default function PdfMaker() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Botón para imprimir (No sale en el PDF) */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button 
          onClick={() => window.print()} 
          className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400"
        >
          🖨️ Guardar como PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-[#0a0a0c] print:bg-[#050505]">
        
        {/* --- PORTADA --- */}
        <div className="h-screen flex flex-col items-center justify-center p-12 text-center border-b border-zinc-800 print:h-[1050px]">
          {/* ACÁ VA TU FOTO: Cambiá el src por la ruta de tu foto, ej: "/foto-tujague.png" */}
          <div className="w-56 h-56 rounded-full border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] mb-8 overflow-hidden bg-zinc-900 flex items-center justify-center">
            <span className="text-zinc-600 text-sm">Tu Foto Acá</span>
            {/* <img src="/tu-foto-real.jpg" alt="Coach Tujague" className="w-full h-full object-cover" /> */}
          </div>
          
          <span className="text-emerald-500 font-black tracking-[0.3em] uppercase text-sm mb-4">Tujague Strength</span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6">
            Mesociclo de <br/><span className="text-emerald-500">Definición</span>
          </h1>
          <p className="text-xl text-zinc-400 font-medium max-w-md">
            Mantener Fuerza Máxima Mientras Pierdes Grasa. Filosofía BII.
          </p>
        </div>

        {/* --- PÁGINA 1: FILOSOFÍA --- */}
        <div className="p-12 print:h-[1050px] border-b border-zinc-800">
          <h2 className="text-3xl font-black text-emerald-500 uppercase mb-6">1. El Método Tujague</h2>
          <p className="mb-4 text-lg">La mayoría de los atletas comete el mismo error durante un cut: aumentar el volumen de entrenamiento mientras reducen las calorías. Ese error destruye fuerza y masa muscular.</p>
          <p className="mb-6 text-lg">Cuando el cuerpo entra en déficit calórico, ocurren tres cosas fisiológicas importantes:</p>
          <ul className="list-disc pl-6 mb-8 text-lg space-y-2 text-zinc-400">
            <li>Disminuye la capacidad de recuperación muscular.</li>
            <li>Disminuye la producción de glucógeno.</li>
            <li>Disminuye la capacidad del SNC para producir fuerza máxima.</li>
          </ul>
          
          <div className="bg-emerald-950/30 border-l-4 border-emerald-500 p-6 rounded-r-2xl my-8">
            <h3 className="text-emerald-400 font-black uppercase tracking-widest text-sm mb-2">La Regla de Oro</h3>
            <p className="text-2xl font-bold text-white italic">"La intensidad mantiene el músculo. Las calorías dictan el peso corporal."</p>
          </div>
          <p className="text-lg">El músculo no desaparece porque falten calorías. El músculo desaparece cuando el cuerpo deja de recibir señales de fuerza máxima.</p>
        </div>

        {/* --- PÁGINA 2: NUTRICIÓN --- */}
        <div className="p-12 print:h-[1050px] border-b border-zinc-800">
          <h2 className="text-3xl font-black text-emerald-500 uppercase mb-6">2. Protocolo Nutricional Básico</h2>
          <p className="mb-8 text-lg">El objetivo del cut no es perder peso rápido. Es perder grasa mientras mantienes rendimiento neural y muscular.</p>
          
          <h3 className="text-xl font-bold text-white mb-4">Déficit Calórico Óptimo</h3>
          <p className="mb-6 text-zinc-400">Para atletas intermedios y avanzados, se recomienda un déficit del 10% – 15% debajo del mantenimiento.</p>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h4 className="text-emerald-500 font-bold mb-4">Proteína para preservar masa muscular:</h4>
            <p className="text-2xl text-white font-black mb-2">2.2 – 2.6 g/kg</p>
            <p className="text-sm text-zinc-500">De peso corporal diario.</p>
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Carbohidratos Peri-Entrenamiento</h3>
          <ul className="space-y-4">
            <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
              <strong className="text-emerald-400 block mb-1">Pre-entrenamiento (60-90 min antes):</strong>
              40-80g carbohidratos + 30-40g proteína.
            </li>
            <li className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
              <strong className="text-emerald-400 block mb-1">Post-entrenamiento:</strong>
              60-100g carbohidratos + 30-40g proteína.
            </li>
          </ul>
        </div>

        {/* --- PÁGINA 3: RUTINA --- */}
        <div className="p-12 print:min-h-[1050px]">
          <h2 className="text-3xl font-black text-emerald-500 uppercase mb-6">3. El Mesociclo (4 Semanas)</h2>
          <p className="mb-6 text-lg">Frecuencia: 4 días por semana | Split: Upper / Lower</p>
          
          {/* Tabla Día 1 */}
          <div className="mb-8 overflow-hidden rounded-xl border border-zinc-800">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
              <h3 className="font-black text-white uppercase tracking-wider">Día 1 – Upper (Fuerza Press)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/50 text-emerald-500">
                <tr>
                  <th className="p-4">Ejercicio</th>
                  <th className="p-4">Series</th>
                  <th className="p-4">Reps</th>
                  <th className="p-4">RIR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr><td className="p-4">Bench Press</td><td className="p-4">1 Top + 2 Backoff</td><td className="p-4">3–5</td><td className="p-4">RIR 1</td></tr>
                <tr><td className="p-4">Weighted Pull Ups</td><td className="p-4">3</td><td className="p-4">4–6</td><td className="p-4">RIR 2</td></tr>
                <tr><td className="p-4">Incline DB Press</td><td className="p-4">2</td><td className="p-4">6–8</td><td className="p-4">RIR 2</td></tr>
                <tr><td className="p-4">Barbell Row</td><td className="p-4">2</td><td className="p-4">6–8</td><td className="p-4">RIR 2</td></tr>
              </tbody>
            </table>
          </div>

          {/* Tabla Día 2 */}
          <div className="mb-8 overflow-hidden rounded-xl border border-zinc-800">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
              <h3 className="font-black text-white uppercase tracking-wider">Día 2 – Lower (Fuerza Squat)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/50 text-emerald-500">
                <tr>
                  <th className="p-4">Ejercicio</th>
                  <th className="p-4">Series</th>
                  <th className="p-4">Reps</th>
                  <th className="p-4">RIR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr><td className="p-4">Back Squat</td><td className="p-4">1 Top + 2 Backoff</td><td className="p-4">3–5</td><td className="p-4">RIR 1</td></tr>
                <tr><td className="p-4">Romanian Deadlift</td><td className="p-4">3</td><td className="p-4">5–6</td><td className="p-4">RIR 2</td></tr>
                <tr><td className="p-4">Leg Press</td><td className="p-4">2</td><td className="p-4">6–8</td><td className="p-4">RIR 2</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-12 pt-8 border-t border-zinc-800">
             <p className="text-emerald-500 font-black italic text-2xl">TUJAGUE STRENGTH</p>
          </div>

        </div>

      </div>
    </div>
  );
}