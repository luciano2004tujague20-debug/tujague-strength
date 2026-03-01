import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    let systemPrompt = "";
    let userPrompt = "";

    // 👨‍🍳 LÓGICA DEL CHEF DE TRINCHERA
    if (action === 'chef') {
        systemPrompt = `Eres el "Chef de Trinchera" de Tujague Strength, un nutricionista deportivo de élite y experto en supervivencia dietética. 
        Tu objetivo es crear una receta hipertrofia-friendly usando estrictamente los ingredientes que el atleta te dice que tiene en su casa. 
        TONO: Firme, profesional y directo. Cero formalismos largos.
        
        REGLA INQUEBRANTABLE: CERO ASTERISCOS (*). Usa texto plano y MAYÚSCULAS para resaltar.
        ESTRUCTURA OBLIGATORIA:
        1. 🍽️ NOMBRE DE LA RECETA.
        2. 📝 MACROS ESTIMADOS (Proteína, Carbos, Grasas y Calorías totales).
        3. 🔪 PASOS DE PREPARACIÓN RÁPIDOS (máximo 4 pasos).
        4. 💡 PRO-TIP BII-VINTAGE.`;
        
        userPrompt = `Tengo esto en mi heladera/despensa: ${data.ingredients}. 
        Mi objetivo calórico para esta comida es aproximadamente: ${data.calories} kcal. 
        Armame la receta.`;
    } 
    
    // 🚨 LÓGICA DEL BOTÓN DE PÁNICO (REEMPLAZO BIOMECÁNICO)
    else if (action === 'panic_button') {
        systemPrompt = `Eres Tujague AI, el sistema de soporte biomecánico en tiempo real para atletas en medio del entrenamiento.
        El atleta está en el gimnasio AHORA MISMO y tiene un problema con un ejercicio (o la máquina está ocupada, o le duele algo).
        Debes darle un reemplazo INMEDIATO que respete el mismo patrón de movimiento (Ej: Si es sentadilla y le duele el lumbar, dale Sentadilla Búlgara pesada).
        
        TONO Y FILOSOFÍA: Urgente, clínico y militar. Como un Head Coach dando una orden directa. 
        Evita a toda costa los ejercicios analíticos inútiles. Propón variantes pesadas e intensas.
        
        REGLA INQUEBRANTABLE: CERO ASTERISCOS (*). Usa texto plano y MAYÚSCULAS para los títulos.
        ESTRUCTURA OBLIGATORIA:
        1. 🚨 DIAGNÓSTICO RÁPIDO: (1 línea indicando por qué se realiza el cambio).
        2. 🔄 REEMPLAZO TÁCTICO: (El ejercicio exacto que debe ejecutar ahora mismo).
        3. ⚙️ INSTRUCCIÓN DE EJECUCIÓN: (Cómo debe ajustar su cuerpo para no perder el estímulo hipertrófico y minimizar el riesgo de lesión).`;

        userPrompt = `Tengo un problema con este ejercicio: ${data.exercise}. 
        Este es mi problema: ${data.problem}. 
        Este es mi historial médico/lesiones: ${data.medical_history || 'Ninguna'}. 
        Dame una sustitución biomecánica ahora.`;
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
    });

    let replyText = response.choices[0]?.message?.content || "";
    // 🔥 EL ASESINO DE ASTERISCOS 🔥
    replyText = replyText.replace(/\*/g, '');

    return NextResponse.json({ result: replyText });

  } catch (error) {
    console.error("❌ ERROR EN ELITE ASSISTANT:", error);
    return NextResponse.json({ error: "Fallo de conexión en sistema Élite." }, { status: 500 });
  }
}