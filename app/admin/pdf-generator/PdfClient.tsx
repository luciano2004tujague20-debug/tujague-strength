"use client";
import React from "react";
import { RUTINAS_DATA, RUTINAS_INFO } from "./rutinasData";

const PageWrapper = ({ children, pageNum, userEmail }: any) => {
  const today = new Date();
  const dateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  return (
    <div className="pdf-page bg-white py-8 pr-8 pl-16 relative border border-gray-300 shadow-xl mb-10 z-10 text-black mx-auto overflow-hidden w-[794px] h-[1123px]">
      <div className="absolute bottom-[40px] left-[15px] origin-bottom-left -rotate-90 opacity-[0.20] pointer-events-none z-0 w-[1000px]">
        <span className="text-[14px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap block text-left">
          LICENCIA PERSONAL: Atleta ({userEmail}) - FECHA: {dateString} - PROHIBIDA SU REVENTA (TUJAGUE STRENGTH)
        </span>
      </div>
      <div className="relative z-10 h-full flex flex-col bg-transparent">
        <div className="pb-1 mb-2">
          <h1 className="text-[12px] font-black uppercase tracking-tight">TUJAGUE STRENGTH - EL MÉTODO BII-VINTAGE</h1>
        </div>
        <div className="flex-1 bg-transparent">{children}</div>
        <div className="mt-auto pt-2 text-[10px] font-bold text-black flex flex-col gap-[2px] text-left bg-transparent">
          <p className="uppercase">BII-VINTAGE: técnica estricta - tempos progresión - recuperación</p>
          <p>Página {pageNum}</p>
          <p>TUJAGUE STRENGTH. Documento de uso personal e intransferible. Prohibida su reproducción, distribución o reventa comercial.</p>
        </div>
      </div>
    </div>
  );
};

export function PdfClient({ userEmail, plan }: { userEmail: string; plan: string }) {
  const rutinaElegida = RUTINAS_DATA[plan] || RUTINAS_DATA["definicion"];
  const infoElegida = RUTINAS_INFO[plan] || RUTINAS_INFO["definicion"];

  // 🔥 LÓGICA INTELIGENTE DE AGRUPACIÓN 🔥
  // Si es Fuerza (menos ejercicios), agrupa hasta 4 días por página. Si es Hiper/Def, 2 días.
  const diasPorPagina = plan.includes("fuerza") ? 4 : 2;
  const paginasSemanas: any[] = [];

  rutinaElegida.forEach((semanaInfo: any) => {
    const chunks = [];
    for (let i = 0; i < semanaInfo.dias.length; i += diasPorPagina) {
      chunks.push(semanaInfo.dias.slice(i, i + diasPorPagina));
    }
    chunks.forEach((chunk, chunkIndex) => {
      paginasSemanas.push({
        semana: semanaInfo.semana,
        foco: semanaInfo.foco,
        tempos: semanaInfo.tempos,
        dias: chunk,
        parteTxt: chunks.length > 1 ? `(Parte ${chunkIndex + 1})` : ""
      });
    });
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html, main, #__next { background-color: white !important; color: black !important; height: auto !important; position: static !important; margin: 0 !important; padding: 0 !important; }
          aside, nav { display: none !important; }
          @page { size: A4 portrait; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-container { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important;}
          .pdf-page { width: 210mm !important; height: 297mm !important; max-height: 297mm !important; box-sizing: border-box !important; padding: 10mm 10mm 10mm 20mm !important; margin: 0 !important; page-break-after: always !important; border: none !important; box-shadow: none !important; position: relative !important; overflow: hidden !important; background-color: white !important; }
          .pdf-page:last-child { page-break-after: auto !important; }
          .print-hidden { display: none !important; }
        }
      `}} />

      <div className="print-container min-h-screen bg-[#d1d5db] text-black font-sans text-xs flex flex-col items-center py-10">
        <div className="print-hidden fixed top-4 right-4 z-50">
          <button onClick={() => window.print()} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-400 transition-colors cursor-pointer">
            🖨️ Guardar PDF Completo
          </button>
        </div>

        {/* PÁGINA 1 */}
        <PageWrapper pageNum={1} userEmail={userEmail}>
          <div className="flex justify-between items-start mb-6 text-[11px] font-bold mt-2">
            <div className="space-y-1 w-1/4"><p>ATLETA:</p><p>OBJETIVO:</p><p className="uppercase mt-1 text-black">{infoElegida.titulo}</p></div>
            <div className="text-center w-2/4"><h2 className="font-black text-xl uppercase tracking-tight">TUJAGUE STRENGTH</h2><h3 className="font-bold uppercase text-md mt-1">EL MÉTODO BII-VINTAGE</h3><p className="mt-2 font-bold text-[10px]">{infoElegida.subtitulo}</p></div>
            <div className="space-y-1 w-1/4 text-right"><p>INICIO: ___/___/___</p><p>PESO (kg): ____________</p><p>SUEÑO (h): ____________</p><p>NOTAS: ________________</p></div>
          </div>
          <div className="mb-4"><h2 className="text-[12px] font-black uppercase mb-1 border-b border-black pb-1">La Regla de Oro</h2><p className="text-[11px] font-bold mt-1">"La intensidad mantiene el músculo. Las calorías dictan el peso corporal". Registra Plan/Real, RIR y Notas.</p></div>
          <div>
            <h2 className="text-[12px] font-black uppercase mb-2 border-b border-black pb-1">Guía rápida (Nutrición y Fatiga)</h2>
            <table className="w-full border-collapse border border-black text-left text-[11px] font-bold">
              <tbody>
                <tr><td className="border border-black p-2 w-24 bg-gray-100">RIR</td><td className="border border-black p-2">TOP SETS: RIR 1 | BACKOFFS Y ACCESORIOS: RIR 2-3. Fallar es innecesario.</td></tr>
                <tr><td className="border border-black p-2 bg-gray-100">Déficit / Carga</td><td className="border border-black p-2">Sigue los lineamientos nutricionales de tu programa específico.</td></tr>
                <tr><td className="border border-black p-2 bg-gray-100">Proteína</td><td className="border border-black p-2">2.2 - 2.6 g/kg de peso corporal para preservar la masa muscular.</td></tr>
                <tr><td className="border border-black p-2 bg-gray-100">Peri-Entreno</td><td className="border border-black p-2">Pre: 40-80g CH + 30-40g Pro. Post: 60-100g CH + 30-40g Pro.</td></tr>
                <tr><td className="border border-black p-2 bg-gray-100">Descansos</td><td className="border border-black p-2">Básicos 3-4m | accesorios 90s-2m. No apresures la recuperación.</td></tr>
                <tr><td className="border border-black p-2 bg-gray-100">SNC / Sueño</td><td className="border border-black p-2">Dormir 7.5 - 9 horas. Evitar cardio excesivo. Agua: 35-45 ml/kg de peso.</td></tr>
              </tbody>
            </table>
          </div>
        </PageWrapper>

        {/* PÁGINA 2 */}
        <PageWrapper pageNum={2} userEmail={userEmail}>
          <div className="mb-4 text-[12px] font-bold mt-2"><p className="uppercase mb-2 text-black">{infoElegida.titulo}</p><h2 className="text-[16px] font-black uppercase">Página Premium (Biomecánica)</h2></div>
          <div className="space-y-4 text-[11px]">
            <div><h3 className="font-bold text-[12px] mb-1">Tip 1 – Bracing Abdominal</h3><p className="font-bold text-gray-700">Antes de cada rep pesada: Inhala hacia el abdomen, expande 360°, y contrae como si fueras a recibir un golpe.</p></div>
            <div><h3 className="font-bold text-[12px] mb-1">Tip 2 – Leg Drive en Bench Press</h3><p className="font-bold text-gray-700">No relajes las piernas. Pies firmes, empuja el piso hacia adelante y mantén glúteos en el banco.</p></div>
            <div><h3 className="font-bold text-[12px] mb-1">Tip 3 – “Slack Pull” en Deadlift</h3><p className="font-bold text-gray-700">Antes de despegar la barra: Tensa los dorsales y tira ligeramente para eliminar la holgura del hierro.</p></div>
            <div><h3 className="font-bold text-[12px] mb-1">Regla NO GRIND</h3><p className="font-bold text-gray-700">Si la repetición es extremadamente lenta y tu técnica se deforma: Corta la serie ahí mismo.</p></div>
            <div><h3 className="font-bold text-[12px] mb-1">Día Malo (Ajuste rápido)</h3><p className="font-bold text-gray-700">Si el déficit te pasa factura: Reducí 5% de la barra y concéntrate en mantener el RIR.</p></div>
          </div>
          <div className="mt-8 pt-4"><h3 className="font-bold text-[12px] mb-1">Plataforma Oficial</h3><p className="text-blue-800 font-bold mb-1">https://tujague-strength.vercel.app/</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tujague-strength.vercel.app/" alt="QR Code" className="w-20 h-20" /></div>
        </PageWrapper>

        {/* PÁGINAS DINÁMICAS DE RUTINA (Compactas y ordenadas) */}
        {paginasSemanas.map((paginaData, index) => (
          <PageWrapper key={index} pageNum={3 + index} userEmail={userEmail}>
            {/* Cabecera de la Semana */}
            <div className="mb-3 text-[11px] font-bold mt-1 leading-tight border-b-2 border-black/20 pb-2">
              <h2 className="text-[14px] font-black mb-0.5">Semana {paginaData.semana} {paginaData.parteTxt}</h2>
              <p>Objetivo semanal: {paginaData.foco}</p>
              <p className="uppercase mt-0.5 text-black">{infoElegida.titulo}</p>
              <p className="mt-0.5 text-gray-600">Intensidad: {paginaData.tempos}</p>
            </div>

            {/* Render de los Días más juntos y con separador premium */}
            <div className="flex flex-col gap-4">
              {paginaData.dias.map((dia: any, diaIndex: number) => (
                <div key={diaIndex} className="w-full">
                  
                  {/* Etiqueta oscura del Día (Mejora visual increíble) */}
                  <div className="bg-zinc-800 text-white flex justify-between px-2 py-1.5 rounded-t-sm border border-black border-b-0">
                    <span className="uppercase font-black text-[10px] tracking-wide">{dia.titulo} | Fecha: ___/___/___</span>
                    <span className="font-bold text-[9px]">Energía/10: _____ | Dolor/10: _____</span>
                  </div>

                  <table className="w-full border-collapse border border-black text-left text-[10px]">
                    <thead>
                      <tr>
                        <th className="border border-black p-1 w-[22%] bg-gray-200 leading-none">Ejercicio</th>
                        <th className="border border-black p-1 w-[24%] bg-gray-200 leading-none">Trabajo</th>
                        <th className="border border-black p-1 w-[10%] text-center bg-gray-200 leading-none">Tmp/Desc</th>
                        <th className="border border-black p-1 w-[44%] text-center bg-gray-200 leading-none">Registro de Series</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dia.ejercicios.map((ej: any, ejIndex: number) => {
                        const bgRow = ejIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
                        const isLast = ejIndex === dia.ejercicios.length - 1;
                        const bottomBorder = isLast ? "border-b border-black" : "border-b-[2px] border-black";
                        
                        return (
                          <React.Fragment key={ejIndex}>
                            <tr className={bgRow}>
                              <td rowSpan={2} className={`border border-black p-1.5 font-bold text-[10.5px] leading-tight ${bottomBorder}`}>{ej.nombre}</td>
                              <td rowSpan={2} className={`border border-black p-1.5 font-bold text-[10.5px] leading-tight ${bottomBorder}`}>{ej.trabajo}</td>
                              <td rowSpan={2} className={`border border-black p-1.5 text-center font-bold text-[9.5px] leading-tight ${bottomBorder}`}>
                                {ej.tmp}<br/><span className="text-[7.5px] text-gray-600">{ej.desc}</span>
                              </td>
                              <td className="border border-black border-b-0 p-1.5 align-top bg-gray-100">
                                {/* Grilla perfecta para 7 series */}
                                <div className="grid grid-cols-4 gap-y-[6px] gap-x-1 text-[8px] font-bold text-gray-800 leading-none">
                                  <span>S1: ___kg x ___</span>
                                  <span>S2: ___kg x ___</span>
                                  <span>S3: ___kg x ___</span>
                                  <span>S4: ___kg x ___</span>
                                  <span>S5: ___kg x ___</span>
                                  <span>S6: ___kg x ___</span>
                                  <span>S7: ___kg x ___</span>
                                </div>
                              </td>
                            </tr>
                            <tr className={bgRow}>
                              <td className={`border border-black border-t-0 px-1.5 pb-1.5 pt-0 align-top bg-gray-100 ${bottomBorder}`}>
                                <div className="flex justify-between text-[8px] font-bold text-gray-600 pr-2 leading-none">
                                  <span>RPE/RIR: _______</span>
                                  <span>Notas: ________________________</span>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </PageWrapper>
        ))}

        {/* PÁGINA FINAL */}
        <PageWrapper pageNum={3 + paginasSemanas.length} userEmail={userEmail}>
          <div className="mt-2">
            <h2 className="text-[14px] font-black mb-4 uppercase">Resumen del bloque</h2>
            <table className="w-full border-collapse border border-black text-left text-[11px] mb-6">
              <thead><tr><th className="border border-black p-2 bg-gray-200">Ejercicio Principal</th><th className="border border-black p-2 bg-gray-200 text-center">1RM Inicial</th><th className="border border-black p-2 bg-gray-200 text-center">1RM Final</th><th className="border border-black p-2 bg-gray-200 text-center">Progreso (+/-)</th></tr></thead>
              <tbody>
                <tr><td className="border border-black p-2 font-bold h-10">Press Banca</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                <tr><td className="border border-black p-2 font-bold h-10">Sentadilla Libre</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                <tr><td className="border border-black p-2 font-bold h-10">Press Militar</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                <tr><td className="border border-black p-2 font-bold h-10">Peso Muerto</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
              </tbody>
            </table>
            <div className="flex flex-col mt-6"><span className="mb-2 font-bold text-[12px] uppercase">Notas finales y ajustes para el próximo meso:</span><div className="border border-gray-400 h-32 bg-gray-50 rounded-sm"></div></div>
            <div className="mt-12 mb-8 font-bold text-[12px]"><h3 className="mb-1">Recursos TUJAGUE STRENGTH</h3><p className="text-blue-800 underline">https://tujague-strength.vercel.app/</p></div>
          </div>
        </PageWrapper>
      </div>
    </>
  );
}