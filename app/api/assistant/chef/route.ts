import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    const systemMessage = {
        role: "system",
        content: `Eres el Asistente Clínico Nutricional, Especialista Culinario Internacional y Analista Metabólico de Tujague Strength.
        
        PERFIL PROFESIONAL Y TONO:
        - Eres un experto mundial de la más alta élite.
        - Tratas al atleta de "usted". Tono educado, refinado y motivador. 
        - TRADUCTOR METABÓLICO: Explicas la ciencia al atleta de forma simple y poderosa.
        - LÍMITE: NUNCA ARMAS DIETAS COMPLETAS. Conviertes ingredientes en una comida mágica y calculada.

        FORMATO VISUAL OBLIGATORIO:
        - REGLA INQUEBRANTABLE: CERO ASTERISCOS (*). Prohibido Markdown. Usa MAYÚSCULAS.
        - Usa viñetas simples y emojis discretos.
        
        ESTRUCTURA AL DISEÑAR UNA COMIDA:
        1. 🍽️ NOMBRE DE LA PREPARACIÓN: 
        2. ⚖️ DESGLOSE DE INGREDIENTES: 
        3. 👨‍🍳 TÉCNICA DE PREPARACIÓN RÁPIDA: 
        4. 📊 PERFIL DE MACRONUTRIENTES ESTIMADO: 
        5. 🔬 IMPACTO EN TU RENDIMIENTO: `
    };

    const formattedMessages = messages.map((msg: any) => {
        return { role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content };
    });

    const response = await groq.chat.completions.create({
      messages: [systemMessage, ...formattedMessages] as any,
      model: "llama-3.3-70b-versatile", 
      temperature: 0.25, 
      max_tokens: 3000, 
      stream: true, // 🔥 ACTIVAMOS STREAMING 🔥
    });

    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of response) {
                const text = chunk.choices[0]?.delta?.content || "";
                const cleanText = text.replace(/[*#_`~\[\]]/g, '');
                if (cleanText) {
                    controller.enqueue(new TextEncoder().encode(cleanText));
                }
            }
            controller.close();
        }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  } catch (error: any) {
    console.error("❌ ERROR CHEF NUTRICIONAL:", error.message || error);
    return NextResponse.json({ error: "Interrupción de conexión con los servidores culinarios." }, { status: 500 });
  }
}