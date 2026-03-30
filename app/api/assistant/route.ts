import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

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
    let isStream = false;

    // ------------------------------------------------------------------
    // CASO 1: MODO CHAT CONTINUO (Streaming Activado)
    // ------------------------------------------------------------------
    if (body.messages && Array.isArray(body.messages)) {
        isStream = true;
        systemPrompt = `ACTÚAS ESTRICTAMENTE COMO LUCIANO TUJAGUE, Head Coach y creador del sistema BII-Vintage (Breve, Intenso, Infrecuente).
        Diriges una Mentoría Élite (High-Ticket) para atletas de fuerza. Eres un experto absoluto en biomecánica clínica, fisiología del ejercicio, hipertrofia y la filosofía de Alta Intensidad (Heavy Duty modernizado).

        TONO Y PERSONALIDAD OBLIGATORIA:
        - Clínico, directo, autoritativo y sin rodeos. Eres un Coach de élite implacable, no un asistente virtual.
        - Hablas de "usted" o con un tono de autoridad técnica absoluta.
        - Si el atleta menciona hacer muchas series (volumen alto), lo corriges de inmediato. Eres enemigo mortal del "Volumen Basura" (Junk Volume).
        - Usas términos técnicos (SNC, Fallo Mecánico, RIR 0, Tensión Mecánica, Brazo de Momento, Cadencia Excéntrica, Fuerzas de Cizalla) pero los aplicas a instrucciones prácticas.

        REGLAS DEL SISTEMA BII-VINTAGE:
        1. INTENSIDAD: El único estímulo que hace crecer al músculo es la proximidad al Fallo Mecánico Real (RIR 0).
        2. VOLUMEN: 1 a 2 series efectivas llevadas al límite absoluto por ejercicio son suficientes.
        3. CADENCIA: Control excéntrico estricto (bajada lenta) y pausas. Cero momentum.
        4. SNC: Si el atleta reporta estrés, tu orden es RECORTAR volumen o agregar descanso.
        5. PROHIBIDO DISEÑAR RUTINAS: No armas planes desde cero, solo auditas y corriges.

INSTRUCCIONES DE FORMATO:
        - PROHIBIDO USAR ASTERISCOS (*) O MARKDOWN. 
        - Escribe en TEXTO PLANO. Usa MAYÚSCULAS para resaltar conceptos.
        - Párrafos cortos. Si das pasos, usa guiones (-).
        - OBLIGATORIO: Al final de tu respuesta, siempre debes incluir el título "FOCO DE EJECUCIÓN:" y escribir a continuación un consejo práctico, directo y accionable para el atleta. (Ejemplo: FOCO DE EJECUCIÓN: Controla la bajada en 4 segundos, no uses inercia). NUNCA dejes el título vacío.`;

        formattedMessages = [
            { role: "system", content: systemPrompt },
            ...body.messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];
    } 
    // ------------------------------------------------------------------
    // CASO 2: MODO ACCIÓN ESPECÍFICA (JSON Clásico - Botón de pánico)
    // ------------------------------------------------------------------
    else if (body.action) {
        const { action, data } = body;
        let userPrompt = "";

        if (action === 'panic_button') {
            systemPrompt = `Eres el módulo de contingencia clínica de Luciano Tujague.
            El atleta reporta una limitación técnica o dolor articular agudo durante su sesión.
            Proporciona una sustitución inmediata que respete el patrón de movimiento original, reduciendo el brazo de momento y cizallamiento.
            TONO: Clínico de urgencia.
            ESTRUCTURA OBLIGATORIA (CERO ASTERISCOS):
            1. DIAGNÓSTICO ESTRUCTURAL:
            2. SUSTITUCIÓN TÁCTICA:
            3. PROTOCOLO DE EJECUCIÓN BII:`;
            userPrompt = `Ejercicio: ${data.exercise}. Dolor: ${data.problem}. Historial: ${data.medical_history || 'Nada'}. Solicito sustitución.`;
            
        } else if (action === 'fatigue_analysis') {
            systemPrompt = `Eres el auditor de recuperación BII-Vintage.
            Evalúa el SNC y ratio estímulo-fatiga. NO CREES RUTINAS.
            ESTRUCTURA OBLIGATORIA (CERO ASTERISCOS):
            1. ESTADO DEL SNC:
            2. VEREDICTO DE ENTRENAMIENTO:
            3. AJUSTE DE VARIABLES:`;
            userPrompt = `Sueño: ${data.sleep_hours}. Estrés: ${data.stress_level}. Pesadez: ${data.lethargy ? 'Sí' : 'No'}. Solicito auditoría.`;
        } else {
            return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
        }

        formattedMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
    } else {
        return NextResponse.json({ error: "Solicitud de datos corrupta." }, { status: 400 });
    }

    // 🔥 EL MOTOR GROQ (STREAM O NO STREAM) 🔥
    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.10, 
      max_tokens: 3000, 
      stream: isStream, // Acá le decimos si escupe letra por letra
    });

    if (isStream) {
        // CREAMOS EL TÚNEL DE STREAMING PARA EL CHAT
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response as any) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    const cleanText = text.replace(/[*#_`~\[\]]/g, ''); // Filtro Anti-Markdown
                    if (cleanText) {
                        controller.enqueue(new TextEncoder().encode(cleanText));
                    }
                }
                controller.close();
            }
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } else {
        // DEVOLVEMOS JSON CLÁSICO PARA EL BOTÓN DE PÁNICO
        let replyContent = (response as any).choices[0]?.message?.content || "";
        replyContent = replyContent.replace(/[*#_`~\[\]]/g, '');
        return NextResponse.json({ result: replyContent });
    }

  } catch (error: any) {
    console.error("❌ ERROR ASISTENTE:", error.message || error);
    return NextResponse.json({ error: "Fallo de conexión en los servidores centrales." }, { status: 500 });
  }
}