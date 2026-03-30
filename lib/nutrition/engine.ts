export interface MacroTarget {
  calories: number; protein: number; carbs: number; fats: number;
}

export function calculateAdherence(actual: MacroTarget, target: MacroTarget): number {
  if (!target || target.calories === 0) return 0;
  
  const calDiff = Math.abs(actual.calories - target.calories) / target.calories;
  const proDiff = Math.abs(actual.protein - target.protein) / target.protein;
  
  let score = 100;
  if (calDiff > 0.1) score -= (calDiff * 100 * 0.5); 
  if (proDiff > 0.1) score -= (proDiff * 100 * 0.3);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// 🧠 NUEVO: SISTEMA DE GUÍA DIARIA (Sports Science)
export function generateSmartGuidance(actual: MacroTarget, target: MacroTarget) {
  if (!target || target.calories === 0) return { action: "Esperando Plan", recommendations: [] };

  const remaining = {
    calories: Math.max(0, target.calories - actual.calories),
    protein: Math.max(0, target.protein - actual.protein),
    carbs: Math.max(0, target.carbs - actual.carbs),
    fats: Math.max(0, target.fats - actual.fats),
  };

  let recommendations = [];

  if (remaining.calories === 0 && actual.calories >= target.calories) {
     return { 
       action: "🎯 OBJETIVO DIARIO COMPLETADO", 
       recommendations: ["Has alcanzado la meta calórica. Modo recuperación y síntesis activado."] 
     };
  }

  // Prioridades Biomecánicas
  if (remaining.protein > 20) {
     recommendations.push(`🥩 Faltan ${remaining.protein}g de Proteína: Priorizá fuentes magras (Pollo, Atún, Claras, Whey) para evitar catabolismo.`);
  } else if (remaining.protein > 0) {
     recommendations.push(`🥩 Proteína casi lista (Faltan ${remaining.protein}g): Un snack ligero como yogur griego o un scoop de whey es suficiente.`);
  }

  if (remaining.carbs > 30) {
     recommendations.push(`🍚 Faltan ${remaining.carbs}g de Carbos: Priorizá almidones (Arroz, Papa, Avena) para cargar glucógeno intramuscular.`);
  }

  if (remaining.fats > 15) {
     recommendations.push(`🥑 Faltan ${remaining.fats}g de Grasas: Agregá palta, frutos secos o aceite de oliva para optimizar el entorno hormonal.`);
  }

  return {
    remaining,
    action: `🔥 TE FALTAN ${remaining.calories} KCAL HOY`,
    recommendations
  };
}

export function generateClinicalFeedback(actual: MacroTarget, target: MacroTarget, goal: string): string {
  if (!target || !target.calories) return "Aguardando parámetros del Head Coach.";
  
  const calPercent = actual.calories / target.calories;
  const proPercent = actual.protein / target.protein;

  // Alertas Críticas (Peligro)
  if (calPercent > 0 && calPercent < 0.5) return "🚨 DÉFICIT PELIGROSO: Riesgo inminente de pérdida muscular y caída del rendimiento. Ingerir alimentos densos YA.";
  if (proPercent < 0.7 && actual.protein > 0) return "⚠️ ALERTA ESTRUCTURAL: Consumo proteico muy deficiente. Tu cuerpo no tiene ladrillos para reparar el daño del entreno.";
  
  // Reglas por Fase
  if (goal === 'cut' && calPercent > 1.1) return "❌ RUPTURA DE DÉFICIT: Excediste el límite calórico. La oxidación de grasas se ha bloqueado hoy.";
  if (goal === 'bulk' && calPercent < 0.9) return "⚠️ ALERTA VOLUMEN: Estás en déficit. Es biológicamente imposible hipertrofiar sin superávit. Comé más.";
  
  // 🔥 NUEVO: Reglas para Recomposición 🔥
  if (goal === 'recomposition') {
     if (calPercent > 1.1) return "⚠️ EXCESO CALÓRICO: En recomposición buscamos mantenimiento o déficit muy leve. Cuidado con el superávit.";
     if (calPercent < 0.8 && calPercent > 0) return "⚠️ DÉFICIT EXCESIVO: Sin energía suficiente, no podrás construir masa muscular mientras oxidás grasa.";
  }
  
  // Ejecución Perfecta
  if (calPercent >= 0.9 && calPercent <= 1.1 && proPercent >= 0.9) {
    return "✅ EJECUCIÓN CLÍNICA: Parámetros óptimos. Estás en la zona verde de progreso. Mantené el rumbo.";
  }

  return "Análisis en curso. Sigue completando tus ingestas para recibir directivas.";
}