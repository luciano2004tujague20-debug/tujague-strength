"use client";
import React from "react";

const definicionData = [
  {
    semana: 1,
    foco: "Adaptación al Déficit",
    tempos: "4-1-X-1 (SQ/BP) | 3-0-X-1 (Militar) | DL: 2-1-X-1",
    dias: [
      {
        titulo: "Día 1 - Inferior (Sentadilla)",
        ejercicios: [
          { nombre: "Sentadilla libre", trabajo: "1x4@RPE8 + 2x4@RPE7 (back-off)", tmp: "4-1-X-1", desc: "4-5m" },
          { nombre: "P. Muerto Rumano", trabajo: "3x6@RPE8", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Curl femoral", trabajo: "2x10@RPE8", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 2 - Superior (Banca)",
        ejercicios: [
          { nombre: "Press banca", trabajo: "1x4@RPE8 + 2x4@RPE7 (back-off)", tmp: "4-1-X-1", desc: "4m" },
          { nombre: "Fondos lastrados", trabajo: "3x6@RPE8", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Remo barra", trabajo: "3x6-8@RPE8", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Laterales", trabajo: "2x12@RPE8", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 3 - Inferior (Deadlift)",
        ejercicios: [
          { nombre: "Peso muerto", trabajo: "1x3@RPE8 + 2x3@RPE7 (back-off)", tmp: "2-1-X-1", desc: "5m" },
          { nombre: "Sentadilla frontal", trabajo: "3x6@RPE8", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Hip thrust", trabajo: "2x8@RPE8", tmp: "3-1-X-1", desc: "2m" },
        ]
      },
      {
        titulo: "Día 4 - Superior (Militar)",
        ejercicios: [
          { nombre: "Press militar", trabajo: "1x5@RPE8 + 2x5@RPE7 (back-off)", tmp: "3-0-X-1", desc: "3m" },
          { nombre: "Press inclinado", trabajo: "3x8@RPE8", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Remo pecho apoyado", trabajo: "3x8@RPE8", tmp: "3-1-X-1", desc: "2m" },
          { nombre: "Curl bíceps", trabajo: "2x10@RPE8", tmp: "3-1-X-1", desc: "90s" },
        ]
      }
    ]
  },
  {
    semana: 2,
    foco: "Mantener Intensidad",
    tempos: "4-1-X-1 (SQ/BP) | 3-0-X-1 (Militar) | DL: 2-1-X-1",
    dias: [
      {
        titulo: "Día 1 - Inferior (Sentadilla)",
        ejercicios: [
          { nombre: "Sentadilla libre", trabajo: "1x4@RPE8.5 + 2x4@RPE7.5", tmp: "4-1-X-1", desc: "4-5m" },
          { nombre: "P. Muerto Rumano", trabajo: "3x6@RPE8.5", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Curl femoral", trabajo: "2x10@RPE8.5", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 2 - Superior (Banca)",
        ejercicios: [
          { nombre: "Press banca", trabajo: "1x4@RPE8.5 + 2x4@RPE7.5", tmp: "4-1-X-1", desc: "4m" },
          { nombre: "Fondos lastrados", trabajo: "3x6@RPE8.5", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Remo barra", trabajo: "3x6-8@RPE8.5", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Laterales", trabajo: "2x12@RPE8.5", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 3 - Inferior (Deadlift)",
        ejercicios: [
          { nombre: "Peso muerto", trabajo: "1x3@RPE8.5 + 2x3@RPE7.5", tmp: "2-1-X-1", desc: "5m" },
          { nombre: "Sentadilla frontal", trabajo: "3x6@RPE8.5", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Hip thrust", trabajo: "2x8@RPE8.5", tmp: "3-1-X-1", desc: "2m" },
        ]
      },
      {
        titulo: "Día 4 - Superior (Militar)",
        ejercicios: [
          { nombre: "Press militar", trabajo: "1x5@RPE8.5 + 2x5@RPE7.5", tmp: "3-0-X-1", desc: "3m" },
          { nombre: "Press inclinado", trabajo: "3x8@RPE8.5", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Remo pecho apoyado", trabajo: "3x8@RPE8.5", tmp: "3-1-X-1", desc: "2m" },
          { nombre: "Curl bíceps", trabajo: "2x10@RPE8.5", tmp: "3-1-X-1", desc: "90s" },
        ]
      }
    ]
  },
  {
    semana: 3,
    foco: "Semana Pesada (Peak Intensidad)",
    tempos: "4-1-X-1 (SQ/BP) | 3-0-X-1 (Militar) | DL: 2-1-X-1",
    dias: [
      {
        titulo: "Día 1 - Inferior (Sentadilla)",
        ejercicios: [
          { nombre: "Sentadilla libre", trabajo: "1x3@RPE9 + 2x3@RPE8", tmp: "4-1-X-1", desc: "5m" },
          { nombre: "P. Muerto Rumano", trabajo: "3x5@RPE9", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Curl femoral", trabajo: "2x8@RPE9", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 2 - Superior (Banca)",
        ejercicios: [
          { nombre: "Press banca", trabajo: "1x3@RPE9 + 2x3@RPE8", tmp: "4-1-X-1", desc: "4m" },
          { nombre: "Fondos lastrados", trabajo: "3x5@RPE9", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Remo barra", trabajo: "3x6@RPE9", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Laterales", trabajo: "2x10@RPE9", tmp: "3-1-X-1", desc: "90s" },
        ]
      },
      {
        titulo: "Día 3 - Inferior (Deadlift)",
        ejercicios: [
          { nombre: "Peso muerto", trabajo: "1x2@RPE9 + 2x2@RPE8", tmp: "2-1-X-1", desc: "5m" },
          { nombre: "Sentadilla frontal", trabajo: "3x5@RPE9", tmp: "3-1-X-1", desc: "3m" },
          { nombre: "Hip thrust", trabajo: "2x6@RPE9", tmp: "3-1-X-1", desc: "2m" },
        ]
      },
      {
        titulo: "Día 4 - Superior (Militar)",
        ejercicios: [
          { nombre: "Press militar", trabajo: "1x4@RPE9 + 2x4@RPE8", tmp: "3-0-X-1", desc: "3m" },
          { nombre: "Press inclinado", trabajo: "3x6@RPE9", tmp: "3-1-X-1", desc: "2-3m" },
          { nombre: "Remo pecho apoyado", trabajo: "3x6@RPE9", tmp: "3-1-X-1", desc: "2m" },
          { nombre: "Curl bíceps", trabajo: "2x8@RPE9", tmp: "3-1-X-1", desc: "90s" },
        ]
      }
    ]
  },
  {
    semana: 4,
    foco: "Descarga (Deload)",
    tempos: "3-1-2-1. Sin técnicas.",
    dias: [
      {
        titulo: "Día 1 - Deload (Inferior)",
        ejercicios: [
          { nombre: "Sentadilla libre", trabajo: "2x4@RPE6-7", tmp: "3-1-2-1", desc: "4m" },
          { nombre: "P. Muerto Rumano", trabajo: "2x6@RPE6-7", tmp: "3-1-2-1", desc: "3m" },
        ]
      },
      {
        titulo: "Día 2 - Deload (Superior)",
        ejercicios: [
          { nombre: "Press banca", trabajo: "2x4@RPE6-7", tmp: "3-1-2-1", desc: "3m" },
          { nombre: "Remo barra", trabajo: "2x6@RPE6-7", tmp: "3-1-2-1", desc: "2m" },
        ]
      },
      {
        titulo: "Día 3 - Deload (Inferior)",
        ejercicios: [
          { nombre: "Peso muerto", trabajo: "2x3@RPE6-7", tmp: "2-1-X-1", desc: "4m" },
          { nombre: "Sentadilla frontal", trabajo: "2x5@RPE6-7", tmp: "3-1-2-1", desc: "3m" },
        ]
      },
      {
        titulo: "Día 4 - Deload (Superior)",
        ejercicios: [
          { nombre: "Press militar", trabajo: "2x5@RPE6-7", tmp: "3-0-2-1", desc: "3m" },
          { nombre: "Press inclinado", trabajo: "2x6@RPE6-7", tmp: "3-1-2-1", desc: "2m" },
        ]
      }
    ]
  }
];

const PageWrapper = ({ children, pageNum }: any) => {
  const today = new Date();
  const dateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  return (
    <div className="w-[794px] h-[1123px] mx-auto bg-white p-10 relative print:p-8 print:m-0 print:border-none print:shadow-none border border-gray-300 shadow-xl mb-10 overflow-hidden break-after-page z-10 text-black">
      
      {/* MARCA DE AGUA (LA LICENCIA EN DIAGONAL A LA IZQUIERDA) */}
      <div className="absolute top-[50%] left-[-35%] origin-center -rotate-[55deg] opacity-[0.25] pointer-events-none z-0 w-[150%]">
        <span className="text-[20px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">
          LICENCIA PERSONAL: Atleta (tu-email@gmail.com) - FECHA: {dateString} - PROHIBIDA SU REVENTA (TUJAGUE STRENGTH)
        </span>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Encabezado Superior */}
        <div className="pb-1 mb-2">
          <h1 className="text-[12px] font-black uppercase tracking-tight">
            TUJAGUE STRENGTH - EL MÉTODO BII-VINTAGE
          </h1>
        </div>

        {/* Cuerpo Dinámico */}
        <div className="flex-1">
          {children}
        </div>

        {/* Pie de Página Idéntico de 3 Renglones */}
        <div className="mt-auto pt-2 text-[10px] font-bold text-black space-y-1">
          <p className="uppercase">BII-VINTAGE: técnica estricta - tempos progresión - recuperación</p>
          <p>Página {pageNum}</p>
          <p>TUJAGUE STRENGTH. Documento de uso personal e intransferible. Prohibida su reproducción, distribución o reventa comercial.</p>
        </div>
      </div>
    </div>
  );
};

export default function PdfGenerator() {
  return (
    <div className="min-h-screen bg-[#d1d5db] text-black font-sans text-xs flex flex-col items-center py-10 print:py-0 print:bg-white">
      
      {/* Botón Flotante para Imprimir */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button
          onClick={() => window.print()}
          className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-400 transition-colors"
        >
          🖨️ Guardar PDF Completo
        </button>
      </div>

      {/* PÁGINA 1: PORTADA Y GUÍA RÁPIDA */}
      <PageWrapper pageNum={1}>
        <div className="flex justify-between items-start mb-6 text-[11px] font-bold mt-2">
          <div className="space-y-1 w-1/4">
            <p>ATLETA:</p>
            <p>OBJETIVO:</p>
            <p className="uppercase mt-1 text-black">DEFINICIÓN - 4 semanas - 4 días</p>
          </div>
          
          <div className="text-center w-2/4">
            <h2 className="font-black text-xl uppercase tracking-tight">TUJAGUE STRENGTH</h2>
            <h3 className="font-bold uppercase text-md mt-1">EL MÉTODO BII-VINTAGE</h3>
            <p className="mt-2 font-bold text-[10px]">Mesociclo 4 Semanas (DEFINICIÓN) - Compacto semanal (1 hoja/semana)</p>
          </div>

          <div className="space-y-1 w-1/4 text-right">
            <p>INICIO: ___/___/___</p>
            <p>PESO (kg): ____________</p>
            <p>SUEÑO (h): ____________</p>
            <p>NOTAS: ________________</p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-[12px] font-black uppercase mb-1 border-b border-black pb-1">Cómo usar este Mesociclo</h2>
          <p className="text-[11px] font-bold mt-1">Registra Plan/Real (kg), reps, RPE y RIR. Si el tempo o la técnica se rompen, ajusta carga.</p>
        </div>

        <div>
          <h2 className="text-[12px] font-black uppercase mb-2 border-b border-black pb-1">Guía rápida (RPE+RIR)</h2>
          <table className="w-full border-collapse border border-black text-left text-[11px] font-bold">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-24">RPE</td>
                <td className="border border-black p-2">RPE 7=3 RIR | RPE 8=2 RIR | RPE 9=1 RIR | RPE 9.5=casi al límite.</td>
              </tr>
              <tr>
                <td className="border border-black p-2">RIR</td>
                <td className="border border-black p-2">Autoregula: evitar el fallo técnico en déficit para no freír el SNC.</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Tempo</td>
                <td className="border border-black p-2">Bajada - pausa - subida - pausa (ej: 4-1-X-1).</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Técnicas</td>
                <td className="border border-black p-2">Max 1 técnica grande por sesión cuando corresponda (Drop/Cluster).</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Descansos</td>
                <td className="border border-black p-2">Básicos 3-5m | accesorios 60-90s | técnicas 15-25s.</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Checklist</td>
                <td className="border border-black p-2">Subo carga solo si cumple: tempo + técnica + RPE + reps.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageWrapper>

      {/* PÁGINA 2: PÁGINA PREMIUM */}
      <PageWrapper pageNum={2}>
        <div className="mb-4 text-[12px] font-bold mt-2">
          <p className="uppercase mb-2 text-black">DEFINICIÓN - 4 semanas - 4 días</p>
          <h2 className="text-[16px] font-black uppercase">Página Premium</h2>
        </div>

        <div className="space-y-4 text-[11px]">
          <div>
            <h3 className="font-bold text-[12px] mb-1">Checklist de progreso</h3>
            <p className="font-bold">Solo subo carga si: tempo ok + técnica OK + RPE objetivo + reps objetivo</p>
          </div>
          
          <div>
            <h3 className="font-bold text-[12px] mb-1">Semáforo de dolor (0-10)</h3>
            <p className="font-bold">0-3 OK | 4-6 ajustar rango/carga | 7-10 parar/cambiar</p>
          </div>

          <div>
            <h3 className="font-bold text-[12px] mb-1">Mini guía de descansos</h3>
            <p className="font-bold">Básicos: 3-5 min.</p>
            <p className="font-bold">Accesorios: 60-90 s</p>
            <p className="font-bold">Técnicas: 15-25 s</p>
          </div>

          <div>
            <h3 className="font-bold text-[12px] mb-1">Regla NO GRIND</h3>
            <p className="font-bold">Si una rep tarda demasiado o te deforma la postura -&gt; cortar serie.</p>
          </div>

          <div>
            <h3 className="font-bold text-[12px] mb-1">Día Malo (rápido)</h3>
            <p className="font-bold">Leve: -5% y cumplí reps/tempo.</p>
            <p className="font-bold">Moderado: -8 a -12% y solo top set + 1 back-off (sin técnicas).</p>
            <p className="font-bold">Alto/dolor: todo a RPE 6-7 o cortar el ejercicio problemático.</p>
          </div>

          <div>
            <h3 className="font-bold text-[12px] mb-1">Carga inicial + progresión</h3>
            <p className="font-bold">Cumplis tempo+técnica+RPE+reps -&gt; +1-2.5 kg sup / +2.5-5 kg inf.</p>
            <p className="font-bold">Si NO cumplís -&gt; repetir o bajar 2-5%.</p>
          </div>

          <div>
            <h3 className="font-bold text-[12px] mb-1">Recuperación</h3>
            <p className="font-bold">Sueño 7-9 h pasos 6k-10k proteína 2.2 g/kg.</p>
            <p className="font-bold">hidratación + sal.</p>
          </div>
        </div>

        {/* Plataforma Oficial + QR */}
        <div className="mt-8 pt-4">
          <h3 className="font-bold text-[12px] mb-1">Plataforma Oficial</h3>
          <p className="text-blue-800 font-bold mb-1">https://tujague-strength.vercel.app/</p>
          <p className="text-[11px] mb-4 font-bold">Escanea el QR o haz clic en el enlace para ir a tu Dashboard.</p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tujague-strength.vercel.app/" 
            alt="QR Code" 
            className="w-20 h-20"
          />
        </div>
      </PageWrapper>

      {/* PÁGINAS 3 A 6: LAS 4 SEMANAS */}
      {definicionData.map((semanaInfo, index) => (
        <PageWrapper key={semanaInfo.semana} pageNum={index + 3}>
          <div className="mb-4 text-[11px] font-bold mt-2">
            <h2 className="text-[14px] font-black mb-1">Semana {semanaInfo.semana}</h2>
            <p>Objetivo semanal:</p>
            <p>Foco: {semanaInfo.foco}</p>
            <p className="uppercase mt-1 text-black">DEFINICIÓN - 4 semanas - 4 días</p>
            <p className="mt-1">Tempos: {semanaInfo.tempos}</p>
          </div>

          {semanaInfo.dias.map((dia, diaIndex) => (
            <div key={diaIndex} className="mb-4">
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span>{dia.titulo} | Fecha _________</span>
                <span>Energia/10 | Dolor/10</span>
              </div>
              <table className="w-full border-collapse border border-black text-left text-[11px]">
                <thead>
                  <tr>
                    <th className="border border-black p-1 w-[22%]">Ejercicio</th>
                    <th className="border border-black p-1 w-[32%]">Trabajo</th>
                    <th className="border border-black p-1 w-[10%] text-center">Tmp</th>
                    <th className="border border-black p-1 w-[10%] text-center">Desc</th>
                    <th colSpan={3} className="border border-black p-1 w-[26%] text-center">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {dia.ejercicios.map((ej, ejIndex) => (
                    <React.Fragment key={ejIndex}>
                      <tr>
                        <td rowSpan={2} className="border border-black p-1 font-bold">{ej.nombre}</td>
                        <td rowSpan={2} className="border border-black p-1 font-bold">{ej.trabajo}</td>
                        <td rowSpan={2} className="border border-black p-1 text-center font-bold">{ej.tmp}</td>
                        <td rowSpan={2} className="border border-black p-1 text-center font-bold">{ej.desc}</td>
                        <td className="border border-black border-b-0 p-0.5 text-center text-[10px] w-[8%] font-semibold">Plan</td>
                        <td className="border border-black border-b-0 p-0.5 text-center text-[10px] w-[8%] font-semibold">Real</td>
                        <td className="border border-black border-b-0 p-0.5 text-center text-[10px] w-[10%] font-semibold">Reps</td>
                      </tr>
                      <tr>
                        <td className="border border-black border-t-0 p-0.5 text-center font-bold text-[10px]">RPE</td>
                        <td className="border border-black border-t-0 p-0.5 text-center font-bold text-[10px]">RIR</td>
                        <td className="border border-black border-t-0 p-0.5 text-center font-bold text-[10px]">Notas</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="mt-4 font-bold text-[11px]">
            <p>Notas de la semana</p>
            <p className="mt-2">¿Dolor articular o fatiga? Revisar 'Dia Malo' en la Página 2.</p>
          </div>
        </PageWrapper>
      ))}

      {/* PÁGINA 7: RESUMEN DEL BLOQUE */}
      <PageWrapper pageNum={7}>
        <div className="mt-2">
          <h2 className="text-[14px] font-black mb-4 uppercase">Resumen del bloque</h2>
          
          <div className="space-y-6 text-[12px] max-w-xl font-bold">
            <div className="flex items-end">
              <span className="w-64">e1RM estimado (opcional)</span>
              <div className="border-b border-black flex-1"></div>
            </div>
            <div className="flex items-end">
              <span className="w-64">Mejores cargas del bloque</span>
              <div className="border-b border-black flex-1"></div>
            </div>
            <div className="flex items-end">
              <span className="w-64">Mejoras técnicas</span>
              <div className="border-b border-black flex-1"></div>
            </div>
            <div className="flex items-end">
              <span className="w-64">Qué ajustar próximo meso</span>
              <div className="border-b border-black flex-1"></div>
            </div>
            <div className="flex flex-col mt-4">
              <span className="mb-4">Notas finales</span>
              <div className="border-b border-black mb-6"></div>
              <div className="border-b border-black mb-6"></div>
            </div>
          </div>

          <div className="mt-8 mb-8 font-bold text-[12px]">
            <h3 className="mb-1">Recursos TUJAGUE STRENGTH</h3>
            <p className="text-blue-800 underline">https://tujague-strength.vercel.app/</p>
          </div>

          <div className="space-y-4 text-[12px] max-w-xs font-bold mt-8">
            <p className="uppercase text-black mb-4">DEFINICIÓN - 4 semanas - 4 días</p>
            <div className="flex items-end"><span className="w-32">Sentadilla:</span><div className="border-b border-black flex-1"></div></div>
            <div className="flex items-end"><span className="w-32">Banca:</span><div className="border-b border-black flex-1"></div></div>
            <div className="flex items-end"><span className="w-32">Peso muerto:</span><div className="border-b border-black flex-1"></div></div>
            <div className="flex items-end"><span className="w-32">Militar:</span><div className="border-b border-black flex-1"></div></div>
          </div>
        </div>
      </PageWrapper>

    </div>
  );
}