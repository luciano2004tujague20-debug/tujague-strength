'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CoachRedButton() {
  const supabase = createClient();
  const [isFiring, setIsFiring] = useState(false);
  const [status, setStatus] = useState('');

  const fireNotification = async () => {
    setIsFiring(true);
    setStatus('Buscando coordenadas (Token)...');

    try {
      // 1. Buscamos tu usuario actual y su token en Supabase
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus('❌ Error: No estás logueado');
        return;
      }

      const { data, error } = await supabase
        .from('athlete_gamification')
        .select('fcm_token')
        .eq('user_id', user.id)
        .single();

      if (error || !data?.fcm_token) {
        setStatus('❌ Error: No se encontró el Token en Supabase');
        return;
      }

      setStatus('🚀 Apuntando misil... (Enviando a Google)');

      // 2. Mandamos la orden a nuestra API (la Base de Lanzamiento)
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.fcm_token,
          title: '🔥 ALERTA DE COACH (PRUEBA)',
          body: '¡Postura firme, Fiera! La intensidad no se negocia.',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('✅ ¡BOOM! Impacto confirmado.');
      } else {
        setStatus(`❌ Falló el disparo: ${result.error}`);
      }

    } catch (err) {
      console.error(err);
      setStatus('❌ Error crítico de conexión.');
    } finally {
      setIsFiring(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-6 shadow-sm">
      <h3 className="font-black text-red-900 text-lg uppercase tracking-wide mb-2">Panel de Control: Artillería</h3>
      <p className="text-sm text-red-700 font-medium mb-4">Envía una alerta táctica de prueba a tu propio dispositivo.</p>
      
      <button 
        onClick={fireNotification}
        disabled={isFiring}
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
      >
        {isFiring ? 'Disparando...' : '🚀 DISPARAR ALERTA'}
      </button>

      {status && (
        <p className="mt-4 text-xs font-bold text-gray-700 uppercase tracking-wider animate-in fade-in">
          Estado: <span className="text-red-600">{status}</span>
        </p>
      )}
    </div>
  );
}