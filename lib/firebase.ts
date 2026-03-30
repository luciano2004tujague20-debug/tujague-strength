// Archivo: lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDIG8XJaTf_WNhw2842LOAEdCrJEhsVepQ", // <- LA LLAVE NUEVA
  authDomain: "tujague-strength.firebaseapp.com",
  projectId: "tujague-strength",
  storageBucket: "tujague-strength.firebasestorage.app",
  messagingSenderId: "108574096801",
  appId: "1:108574096801:web:ad1b0fca54b932ed40d7e0"
};

// Inicializamos Firebase solo si no está inicializado ya
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// El servicio de mensajería (Solo funciona en el cliente, no en el servidor SSR)
const messaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export { app, messaging };