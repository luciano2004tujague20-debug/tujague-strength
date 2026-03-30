import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// 🔥 FUNCIÓN PURIFICADORA DE LLAVES
// Arregla las comillas, los espacios y los saltos de línea que Next.js rompe
function formatPrivateKey(key: string | undefined) {
  if (!key) return '';
  let formattedKey = key.replace(/^"|"$/g, ''); // Saca comillas de las puntas
  formattedKey = formattedKey.replace(/\\n/g, '\n'); // Transforma los \n en verdaderos "Enter"
  return formattedKey.trim(); // Saca espacios vacíos
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY), // 🔥 Acá usamos el filtro
      }),
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { token, title, body } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Falta el Token' }, { status: 400 });
    }

    const payload = {
      token: token,
      notification: {
        title: title || '🔥 ALERTA TÁCTICA',
        body: body || 'Revisá tu hoja de ruta, Fiera.',
      },
    };

    const response = await admin.messaging().send(payload);
    console.log('✅ Disparo exitoso, ID:', response);
    return NextResponse.json({ success: true, messageId: response });
    
  } catch (error) {
    console.error('❌ Error al disparar la notificación:', error);
    return NextResponse.json({ error: 'Falló el disparo' }, { status: 500 });
  }
}