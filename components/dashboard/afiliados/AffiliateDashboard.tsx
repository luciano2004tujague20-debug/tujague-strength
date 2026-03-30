'use client'

import { useState } from 'react'

interface AffiliateDashboardProps {
  userName: string;
  isAffiliate: boolean;
  referralCode: string;
  walletBalance: number;
  amountArs: number;
  discountPct: number; // 🔥 NUEVO: Recibe el descuento real
  commissionPct: number; // 🔥 NUEVO: Recibe la comisión real
}

export default function AffiliateDashboard({ userName, isAffiliate, referralCode, walletBalance, amountArs, discountPct, commissionPct }: AffiliateDashboardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode || "SOLICITAR-CODIGO")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const progreso = Math.floor(Math.min(100, (walletBalance / amountArs) * 100));

  if (!isAffiliate) {
    return (
      <div className="mt-12 animate-in fade-in duration-500 max-w-2xl mx-auto text-center py-16 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
        <span className="text-6xl block mb-6">🤝</span>
        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-black mb-4">
          Convertite en <span className="text-emerald-600">Socio Estratégico</span>
        </h3>
        <p className="text-gray-500 mb-8 font-medium leading-relaxed max-w-md mx-auto">
          El programa de socios está reservado exclusivamente para atletas de la Mentoría Élite. 
          Renová tu acceso para recomendar el sistema y financiar tus meses de entrenamiento.
        </p>
        <a href="https://wa.me/5491123021760?text=Hola%20Coach,%20quiero%20renovar%20mi%20Mentoria%20Elite%20y%20activar%20mi%20panel%20de%20socios" target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 inline-block">
          SOLICITAR ACCESO ÉLITE
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 w-full animate-in fade-in duration-500 pb-10">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black italic text-gray-900 uppercase tracking-tighter">
          Socio <span className="text-emerald-600">Estratégico</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium uppercase tracking-widest">El sistema financia tu esfuerzo, {userName}. Traé referidos y tu mentoría te sale $0.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:border-emerald-200 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🤝</span>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Tu Código Privado</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
              {/* 🔥 ACÁ SE IMPRIME EL NÚMERO REAL 🔥 */}
              Si un prospecto usa tu código, recibe un <strong className="text-emerald-600 font-black">{discountPct}% de bonificación</strong>, y el sistema inyecta el <strong className="text-emerald-600 font-black">{commissionPct}% del valor</strong> directo en tu Billetera Virtual.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex-1 px-4 py-4 flex items-center justify-center font-mono text-xl text-gray-900 font-black tracking-[0.2em]">
                {referralCode || "SOLICITAR-CODIGO"}
              </div>
              <button onClick={copyToClipboard} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 font-black text-xs uppercase tracking-widest transition-colors border-l border-gray-200">
                {copied ? '¡COPIADO!' : 'COPIAR'}
              </button>
            </div>
            
            {/* 🔥 EL MENSAJE DE WHATSAPP AHORA MANDA EL % REAL 🔥 */}
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`¡Fiera! Estoy entrenando con la app de Tujague Strength. Sumate usando mi código VIP: *${referralCode || ""}* para un ${discountPct}% de descuento en tu inscripción. Entrá acá: https://tujaguestrength.com`)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-md active:scale-95 gap-2 items-center"
            >
              Bombardear Contactos
            </a>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-center hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Caja Fuerte Virtual</p>
              <h3 className="text-5xl md:text-6xl font-black italic text-gray-900 tracking-tighter">${walletBalance.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200 text-2xl shadow-sm">🏆</div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progreso Mes Financiado</p>
              <span className="text-emerald-600 font-black text-sm">{progreso}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
              <div className="h-full bg-emerald-500 rounded-full shadow-sm transition-all duration-1000" style={{ width: `${progreso}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}