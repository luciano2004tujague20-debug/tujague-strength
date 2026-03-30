// Archivo: public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 1. Las credenciales de tu servidor
const firebaseConfig = {
  apiKey: "AIzaSyDIG8XJaTf_WNhw2842LOAEdCrJEhsVepQ", // <- LA LLAVE NUEVA
  authDomain: "tujague-strength.firebaseapp.com",
  projectId: "tujague-strength",
  storageBucket: "tujague-strength.firebasestorage.app",
  messagingSenderId: "108574096801",
  appId: "1:108574096801:web:ad1b0fca54b932ed40d7e0"
};

// 2. Iniciamos la conexión en segundo plano
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. El interceptor: Qué pasa cuando llega un mensaje y la app está cerrada
messaging.onBackgroundMessage(function(payload) {
  console.log('[Tujague Strength] ⚡ Mensaje recibido en segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Esto buscará un icono en tu carpeta public
    badge: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});