"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// Definimos qué datos necesita recibir esta pestaña para funcionar
interface TabEvolucionProps {
  rms: {
    squat: string;
    bench: string;
    deadlift: string;
    dips: string;
    military: string;
  };
}

export default function TabEvolucion({ rms }: TabEvolucionProps) {
  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-black italic text-black uppercase tracking-tighter">
              CALIBRACIÓN <span className="text-amber-500">1RM</span>
          </h3>
      </div>

      <div className="bg-white border border-gray-100 p-8 sm:p-10 rounded-[2.5rem] shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-10 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-4 border-b border-gray-100 gap-4">
              <div>
                  <h4 className="font-black italic text-black text-xl tracking-tight">Perfil de Fuerza</h4>
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Absoluta (1RM)</span>
              </div>
              <span className="text-[10px] md:text-xs font-black uppercase text-amber-500 tracking-widest bg-amber-50 px-4 py-1.5 rounded-lg border border-amber-100">MOTOR AUTO ACTIVO</span>
          </div>
          
          <div className="h-[250px] mb-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: 'Sentadilla', peso: Number(rms.squat) || 0 },
                  { name: 'Banca', peso: Number(rms.bench) || 0 },
                  { name: 'P. Muerto', peso: Number(rms.deadlift) || 0 },
                  { name: 'Fondos', peso: Number(rms.dips) || 0 },
                  { name: 'Militar', peso: Number(rms.military) || 0 }
                ]} 
                margin={{ top: 25, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                <YAxis domain={[0, 'auto']} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val > 0 ? `${val}kg` : ""} />
                <Tooltip cursor={{ fill: '#f3f4f6', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} isAnimationActive={false} />
                <Bar dataKey="peso" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={false}>
                   <LabelList dataKey="peso" position="top" content={({ x, y, width, value }: any) => {
                       if (!value) return null;
                       return <text x={Number(x) + Number(width) / 2} y={Number(y) - 10} fill="#111827" textAnchor="middle" fontSize="10" fontWeight="900" className="uppercase tracking-widest">{value}kg</text>;
                   }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
            {Object.entries({ squat: "Sentadilla", bench: "Press Banca", deadlift: "Peso Muerto", dips: "Fondos", military: "Militar" }).map(([key, label]) => (
              <div key={key} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-center flex flex-col items-center shadow-sm hover:border-amber-200 transition-colors">
                  <span className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 block leading-none">{label}</span>
                  <div className="flex flex-col items-center justify-center mt-auto">
                      <span className="text-5xl font-black italic text-black leading-none tracking-tighter">
                          {rms[key as keyof typeof rms] || "0"}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider mt-1">KG</span>
                  </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-5 sm:p-6 rounded-3xl border border-amber-100 flex items-start sm:items-center gap-4">
              <span className="text-3xl shrink-0">🤖</span>
              <p className="text-[11px] sm:text-xs text-amber-900 font-medium leading-relaxed text-left">
                 <strong className="font-bold text-amber-700 uppercase tracking-wide">Tus marcas se actualizan solas.</strong> El algoritmo de fuerza (Fórmula de Brzycki) lee tu Agenda de entrenamiento y recalcula tu 1RM estimado automáticamente cada vez que entrenás. No necesitas confirmar nada.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}