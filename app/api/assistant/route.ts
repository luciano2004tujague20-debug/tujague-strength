import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
       console.error("Falta la GROQ_API_KEY en las variables de entorno.");
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    let systemPrompt = "";
    let formattedMessages: any[] = [];

    // ------------------------------------------------------------------
    // CASO 1: MODO CHAT CONTINUO (Consulta Biomecánica General del Dashboard)
    // ------------------------------------------------------------------
    if (body.messages && Array.isArray(body.messages)) {
        systemPrompt = `Eres Tujague AI, el sistema experto de soporte clínico, fisiológico y biomecánico de Tujague Strength.
        
        PERFIL PROFESIONAL Y TONO:
        - Eres un científico del deporte y un Head Coach de élite mundial en Powerlifting, Fuerza Máxima e Hipertrofia.
        - Tu tono es estrictamente profesional, autoritativo y directo. Tratas al atleta de "usted". 
        - **TRADUCTOR CLÍNICO-PRÁCTICO:** Siempre traduces la ciencia compleja a indicaciones simples y procesables (Ej: "atornilla los pies al piso").

        TUS ÁREAS DE EXPERTISE ABSOLUTA:
        - Biomecánica: Ajustes de "Leg Drive", "Bracing" abdominal, retracción escapular y trayectorias.
        - Fisiología: Recuperación del Sistema Nervioso Central (SNC) y gestión de la fatiga.
        - Nutrición aplicada al entreno.

        CONOCIMIENTO DE LA PLATAFORMA (Si el atleta tiene dudas técnicas sobre cómo usar la web):
        - BII-AFFILIATES: El atleta tiene un código en su panel. Si un amigo lo usa, el atleta gana el 10% en su Billetera Virtual para pagar renovaciones.
        - CONTROL SNC: El atleta debe registrar su peso, horas de sueño y nivel de estrés diariamente en la pestaña "Control SNC".
        - GAMIFICACIÓN: El sistema detecta sus RMs y le otorga medallas y trofeos automáticos.
        - SUBIDA DE VIDEOS: Deben subir videos formato MP4 en la pestaña "Auditoría" para que el Coach evalúe.

        LÍMITES ESTRICTOS E INQUEBRANTABLES:
        1. NUNCA ARMAS RUTINAS COMPLETAS. La programación es exclusiva del Coach Luciano Tujague. Tu función es optimizar.
        2. Eres un fundamentalista del sistema BII-Vintage (Breve, Intenso, Infrecuente). El volumen basura es tu enemigo.

        FORMATO VISUAL OBLIGATORIO:
        - REGLA INQUEBRANTABLE: ESTÁ TERMINANTEMENTE PROHIBIDO usar formato Markdown. NO uses asteriscos (*), ni hashtags (#). Escribe en TEXTO PLANO. Usa MAYÚSCULAS para resaltar conceptos clave.
        - Usa guiones simples (-) para listas, para que la información sea fácil de leer en un celular.
        - Termina tus correcciones técnicas con un "FOCO DE EJECUCIÓN:" en mayúsculas para darle al atleta una imagen mental clara.`;

        formattedMessages = [
            { role: "system", content: systemPrompt },
            ...body.messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];
    } 
    // ------------------------------------------------------------------
    // CASO 2: MODO ACCIÓN ESPECÍFICA (Botón de Pánico o Evaluaciones Rápidas)
    // ------------------------------------------------------------------
    else if (body.action) {
        const { action, data } = body;
        let userPrompt = "";

        if (action === 'panic_button') {
            systemPrompt = `Eres Tujague AI, el sistema de contingencia biomecánica clínica en tiempo real.
            El atleta reporta una limitación técnica o dolor articular agudo durante su sesión.
            Debes proporcionar una sustitución inmediata que respete el patrón de movimiento original, evitando la zona de molestia y explicando la solución de forma súper clara.
            
            TONO: Clínico, directo y autoritativo, pero fácil de comprender.

            ESTRUCTURA OBLIGATORIA DE TU DIAGNÓSTICO (PROHIBIDO USAR ASTERISCOS, usa MAYÚSCULAS para los títulos):
            1. 🚨 DIAGNÓSTICO ESTRUCTURAL: (Análisis breve y comprensible del porqué duele o falla).
            2. 🔄 SUSTITUCIÓN TÁCTICA: (Ejercicio exacto a realizar como reemplazo, en mayúsculas).
            3. ⚙️ PROTOCOLO DE EJECUCIÓN: (Instrucciones paso a paso, usando "cues" o analogías mentales simples).`;

            userPrompt = `Ejercicio programado: ${data.exercise}. 
            Problema actual: ${data.problem}. 
            Historial médico: ${data.medical_history || 'Sin antecedentes relevantes'}. 
            Solicito un protocolo de sustitución biomecánica inmediata.`;
        } else {
            return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
        }

        formattedMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
    } else {
        return NextResponse.json({ error: "Solicitud no reconocida por el sistema." }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, 
      max_tokens: 1200,
    });

    let replyContent = response.choices[0]?.message?.content || "";
    // 🔥 EL ASESINO DE ASTERISCOS 🔥
    replyContent = replyContent.replace(/\*/g, '');

    if (body.messages) {
        return NextResponse.json({ reply: replyContent });
    } else {
        return NextResponse.json({ result: replyContent });
    }

  } catch (error: any) {
    console.error("❌ ERROR EN ASISTENTE BIOMECÁNICO:", error.message || error);
    return NextResponse.json({ error: "Fallo de conexión en los servidores centrales de análisis." }, { status: 500 });
  }
}