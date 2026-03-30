'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export default function PushNotificationManager() {
  const supabase = createClient();
  const [permissionStatus, setPermissionStatus] = useState<string>('granted'); // Por defecto lo ocultamos hasta chequear
  const [isLoading, setIsLoading] = useState(false);

  // 1. Chequeamos permisos al inicio
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // 🔥 2. EL RADAR FORZADO: Obliga a Windows/Android a mostrar el cartel en Primer Plano
  useEffect(() => {
    const setupForegroundListener = async () => {
      try {
        const msg = await messaging();
        if (msg) {
          onMessage(msg, (payload) => {
            console.log("🎯 Misil interceptado en primer plano:", payload);
            
            // Si tenemos permiso, FORZAMOS la notificación nativa del sistema
            if (Notification.permission === 'granted') {
              const notificationTitle = payload.notification?.title || '🔥 Nueva Alerta del Coach';
              const notificationOptions = {
                body: payload.notification?.body || 'Revisá tu panel.',
                icon: '/favicon.ico', // Podés poner el logo de tu gym acá si tenés uno en la carpeta public
                requireInteraction: true // Hace que el cartel no desaparezca rápido
              };
              
// ¡BAM! Disparo manual a través del Service Worker (100% compatible con Celulares)
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification(notificationTitle, notificationOptions);
});
            }
          });
        }
      } catch (error) {
        console.error("Error activando el radar de primer plano:", error);
      }
    };

    setupForegroundListener();
  }, []);

  // 3. Función para pedir permiso y generar el Token
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const msg = await messaging();
        if (msg) {
          
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;

          const token = await getToken(msg, {
            vapidKey: "BPwtS1diqXoAEnybZJFrynAXFmpgux7tCzKojAxC4KRG1dItTJdErVlUWdWwNoqfHQ_eSVa3xwp-guKpArCJgjs",
            serviceWorkerRegistration: registration
          });

          if (token) {
            console.log("¡Token capturado, Fiera! 🦅", token);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from('athlete_gamification')
                .upsert({ 
                  user_id: user.id, 
                  fcm_token: token 
                }, { onConflict: 'user_id' });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al pedir permisos de notificación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya nos dio permiso o si nos bloqueó definitivamente, no mostramos nada. Modo Ninja.
  if (permissionStatus === 'granted' || permissionStatus === 'denied') {
    return null;
  }

  // Si todavía no nos dio permiso, le mostramos la carnada
  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <h4 className="font-black text-blue-900 text-sm uppercase tracking-wide">Alertas Tácticas del Coach</h4>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">Activa las notificaciones para recibir correcciones urgentes en tiempo real.</p>
        </div>
      </div>
      <button 
        onClick={handleRequestPermission}
        disabled={isLoading}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
      >
        {isLoading ? 'Conectando...' : 'Permitir Alertas'}
      </button>
    </div>
  );
}