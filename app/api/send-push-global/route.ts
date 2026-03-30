import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// 🔥 FUNCIÓN PURIFICADORA DE LLAVES
function formatPrivateKey(key: string | undefined) {
  if (!key) return '';
  let formattedKey = key.replace(/^"|"$/g, ''); 
  formattedKey = formattedKey.replace(/\\n/g, '\n'); 
  return formattedKey.trim(); 
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { tokens, title, body } = await request.json();

    // Verificamos que nos hayan mandado una lista de tokens válida
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ error: 'No hay radares detectados (0 tokens)' }, { status: 400 });
    }

    // Armamos la ojiva nuclear
    const payload = {
      tokens: tokens, // 👈 Acá le pasamos el ARRAY de 100 o 500 tokens juntos
      notification: {
        title: title || '🔥 AVISO GLOBAL DEL COACH',
        body: body || 'Revisá tu panel, Fiera.',
      },
    };

    // ¡FUEGO MASIVO!
    const response = await admin.messaging().sendEachForMulticast(payload);
    
    console.log(`✅ Disparo Masivo: ${response.successCount} impactos, ${response.failureCount} fallos`);
    
    return NextResponse.json({ 
        success: true, 
        impactos: response.successCount,
        fallos: response.failureCount 
    });
    
  } catch (error) {
    console.error('❌ Error en el bombardeo:', error);
    return NextResponse.json({ error: 'Falló el disparo global' }, { status: 500 });
  }
}