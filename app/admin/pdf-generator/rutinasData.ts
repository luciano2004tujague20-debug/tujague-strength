// app/pdf/rutinasData.ts (o app/admin/pdf-generator/rutinasData.ts)

export const RUTINAS_INFO: any = {
  definicion: {
    titulo: "DEFINICIÓN ESTRICTA - 4 SEMANAS",
    subtitulo: "Mesociclo 4 Semanas (CUT) - Compacto semanal"
  },
  fuerza: {
    titulo: "FUERZA - 4 semanas 4 días",
    subtitulo: "Mesociclo 4 Semanas (FUERZA) - Compacto semanal"
  },
  hipertrofia: {
    titulo: "HIPERTROFIA - 4 semanas - 4 días",
    subtitulo: "Mesociclo 4 Semanas (HIPERTROFIA) - Compacto semanal"
  }
};

export const RUTINAS_DATA: any = {
  
  // ==========================================
  // 1. RUTINA DE DEFINICIÓN (Intacta)
  // ==========================================
  definicion: [
    {
      semana: 1, foco: "Carga base - RIR objetivo cumplido", tempos: "Top sets: RIR 1 | Backoffs: RIR 2-3",
      dias: [
        { titulo: "Día 1 - Upper (Fuerza Press)", ejercicios: [{ nombre: "Press Banca", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3-4m" }, { nombre: "Dominadas Lastradas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Inclinado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo con Barra", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2-3m" }, { nombre: "Elevaciones Laterales", trabajo: "2x10-12@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 2 - Lower (Fuerza Squat)", ejercicios: [{ nombre: "Sentadilla Libre", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "4m" }, { nombre: "Peso Muerto Rumano", trabajo: "3x5-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Prensa de Piernas", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos de Pie", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] },
        { titulo: "Día 3 - Upper (Fuerza Pull)", ejercicios: [{ nombre: "Press Militar", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Dominadas Supinas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Banca Cerrado", trabajo: "2x5-6@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo Pecho Apoyado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl de Bíceps", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 4 - Lower (Fuerza Deadlift)", ejercicios: [{ nombre: "Peso Muerto", trabajo: "1x3-4@RIR1 + 2x3-4@RIR2", tmp: "2-1-X-1", desc: "4m" }, { nombre: "Sentadilla Frontal", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Hip Thrust", trabajo: "2x6-8@RIR2", tmp: "2-1-X-2", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos Sentado", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] }
      ]
    },
    {
      semana: 2, foco: "+2.5% peso en Top Sets", tempos: "Top sets: RIR 1 | Backoffs: RIR 2-3",
      dias: [
        { titulo: "Día 1 - Upper (Fuerza Press)", ejercicios: [{ nombre: "Press Banca", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3-4m" }, { nombre: "Dominadas Lastradas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Inclinado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo con Barra", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2-3m" }, { nombre: "Elevaciones Laterales", trabajo: "2x10-12@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 2 - Lower (Fuerza Squat)", ejercicios: [{ nombre: "Sentadilla Libre", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "4m" }, { nombre: "Peso Muerto Rumano", trabajo: "3x5-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Prensa de Piernas", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos de Pie", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] },
        { titulo: "Día 3 - Upper (Fuerza Pull)", ejercicios: [{ nombre: "Press Militar", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Dominadas Supinas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Banca Cerrado", trabajo: "2x5-6@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo Pecho Apoyado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl de Bíceps", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 4 - Lower (Fuerza Deadlift)", ejercicios: [{ nombre: "Peso Muerto", trabajo: "1x3-4@RIR1 + 2x3-4@RIR2", tmp: "2-1-X-1", desc: "4m" }, { nombre: "Sentadilla Frontal", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Hip Thrust", trabajo: "2x6-8@RIR2", tmp: "2-1-X-2", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos Sentado", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] }
      ]
    },
    {
      semana: 3, foco: "Intentar igualar o superar cargas semana 2", tempos: "Top sets: RIR 1 | Backoffs: RIR 2-3",
      dias: [
        { titulo: "Día 1 - Upper (Fuerza Press)", ejercicios: [{ nombre: "Press Banca", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3-4m" }, { nombre: "Dominadas Lastradas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Inclinado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo con Barra", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2-3m" }, { nombre: "Elevaciones Laterales", trabajo: "2x10-12@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 2 - Lower (Fuerza Squat)", ejercicios: [{ nombre: "Sentadilla Libre", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "4m" }, { nombre: "Peso Muerto Rumano", trabajo: "3x5-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Prensa de Piernas", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos de Pie", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] },
        { titulo: "Día 3 - Upper (Fuerza Pull)", ejercicios: [{ nombre: "Press Militar", trabajo: "1x3-5@RIR1 + 2x3-5@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Dominadas Supinas", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Banca Cerrado", trabajo: "2x5-6@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo Pecho Apoyado", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl de Bíceps", trabajo: "2x6-8@RIR2", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 4 - Lower (Fuerza Deadlift)", ejercicios: [{ nombre: "Peso Muerto", trabajo: "1x3-4@RIR1 + 2x3-4@RIR2", tmp: "2-1-X-1", desc: "4m" }, { nombre: "Sentadilla Frontal", trabajo: "3x4-6@RIR2", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Hip Thrust", trabajo: "2x6-8@RIR2", tmp: "2-1-X-2", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR2", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos Sentado", trabajo: "2x10-12@RIR2", tmp: "3-1-2-1", desc: "90s" }] }
      ]
    },
    {
      semana: 4, foco: "Mantener pesos o -5% si hay fatiga (Deload)", tempos: "Top sets: RIR 1-2 | Backoffs: RIR 3",
      dias: [
        { titulo: "Día 1 - Upper (Fuerza Press)", ejercicios: [{ nombre: "Press Banca", trabajo: "1x3-5@RIR2 + 2x3-5@RIR3", tmp: "3-1-X-1", desc: "3-4m" }, { nombre: "Dominadas Lastradas", trabajo: "3x4-6@RIR3", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Inclinado", trabajo: "2x6-8@RIR3", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo con Barra", trabajo: "2x6-8@RIR3", tmp: "3-1-X-1", desc: "2-3m" }, { nombre: "Elevaciones Laterales", trabajo: "2x10-12@RIR3", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 2 - Lower (Fuerza Squat)", ejercicios: [{ nombre: "Sentadilla Libre", trabajo: "1x3-5@RIR2 + 2x3-5@RIR3", tmp: "3-1-X-1", desc: "4m" }, { nombre: "Peso Muerto Rumano", trabajo: "3x5-6@RIR3", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Prensa de Piernas", trabajo: "2x6-8@RIR3", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR3", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos de Pie", trabajo: "2x10-12@RIR3", tmp: "3-1-2-1", desc: "90s" }] },
        { titulo: "Día 3 - Upper (Fuerza Pull)", ejercicios: [{ nombre: "Press Militar", trabajo: "1x3-5@RIR2 + 2x3-5@RIR3", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Dominadas Supinas", trabajo: "3x4-6@RIR3", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Press Banca Cerrado", trabajo: "2x5-6@RIR3", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Remo Pecho Apoyado", trabajo: "2x6-8@RIR3", tmp: "3-1-X-1", desc: "2m" }, { nombre: "Curl de Bíceps", trabajo: "2x6-8@RIR3", tmp: "3-1-X-1", desc: "90s" }] },
        { titulo: "Día 4 - Lower (Fuerza Deadlift)", ejercicios: [{ nombre: "Peso Muerto", trabajo: "1x3-4@RIR2 + 2x3-4@RIR3", tmp: "2-1-X-1", desc: "4m" }, { nombre: "Sentadilla Frontal", trabajo: "3x4-6@RIR3", tmp: "3-1-X-1", desc: "3m" }, { nombre: "Hip Thrust", trabajo: "2x6-8@RIR3", tmp: "2-1-X-2", desc: "2m" }, { nombre: "Curl Femoral", trabajo: "2x8-10@RIR3", tmp: "3-1-X-1", desc: "90s" }, { nombre: "Gemelos Sentado", trabajo: "2x10-12@RIR3", tmp: "3-1-2-1", desc: "90s" }] }
      ]
    }
  ],

  // ==========================================
  // 2. RUTINA DE FUERZA (Fiel al PDF mesociclo-fuerza)
  // ==========================================
  fuerza: [
    {
      semana: 1, foco: "", tempos: "5-1-2-1 (SQ/BP/Fondos) | 4-0-2-1 (Militar) | DL: 2-1-X-1.",
      dias: [
        { titulo: "Día 1 - Inferior (Sentadilla) + Militar", ejercicios: [
            { nombre: "Sentadilla libre", trabajo: "1x5@RPE8 + 2x5@RPE7 (back-off -6 a-10%)", tmp: "5-1-2-1", desc: "4-6m" }, 
            { nombre: "Press militar", trabajo: "3x6@RPE7", tmp: "4-0-2-1", desc: "2-3m" }
        ]},
        { titulo: "Día 2 - Superior (Banca) + Fondos", ejercicios: [
            { nombre: "Press banca", trabajo: "1x5@RPE8 + 2x5@RPE7", tmp: "5-1-2-1", desc: "3-5m" }, 
            { nombre: "Fondos", trabajo: "3x6@RPE8 (lastre si aplica)", tmp: "4-1-2-1", desc: "2-3m" }
        ]},
        { titulo: "Día 3 - Inferior (DL) + SQ técnica", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x4@RPE8 + 2x4@RPE7 (back-off -6 a-10%)", tmp: "2-1-X-1", desc: "4-6m" }, 
            { nombre: "Sentadilla técnica", trabajo: "2x5@RPE6-7", tmp: "5-1-2-1", desc: "3-5m" }
        ]},
        { titulo: "Día 4 - Superior (Banca+Militar+Fondos)", ejercicios: [
            { nombre: "Press banca", trabajo: "3x4@RPE8", tmp: "5-1-2-1", desc: "3-5m" }, 
            { nombre: "Press militar", trabajo: "2x6@RPE7-8", tmp: "4-0-2-1", desc: "2-3m" }, 
            { nombre: "Fondos", trabajo: "2x8@RPE7-8", tmp: "4-1-2-1", desc: "2-3m" }
        ]}
      ]
    },
    {
      semana: 2, foco: "", tempos: "5-1-X-1 (SQ/BP) | 4-0-2-1 (Militar) | DL: 2-1-X-1. RP donde se indica.",
      dias: [
        { titulo: "Día 1 - Inferior (Sentadilla) + Militar", ejercicios: [
            { nombre: "Sentadilla libre", trabajo: "1x4@RPE8.5 + 2x4@RPE7.5", tmp: "5-1-X-1", desc: "4-6m" }, 
            { nombre: "Press militar", trabajo: "3x5@RPE7-8", tmp: "4-0-2-1", desc: "2-4m" }
        ]},
        { titulo: "Día 2 - Superior (Banca) + Fondos", ejercicios: [
            { nombre: "Press banca", trabajo: "1x4@RPE9 + 1x4@RPE8 + 1x4@RPE8(RP) +2", tmp: "5-1-X-1", desc: "3-5m" }, 
            { nombre: "Fondos", trabajo: "2x6@RPE9", tmp: "4-1-X-1", desc: "2-3m" }
        ]},
        { titulo: "Día 3 - Inferior (DL) + SQ técnica", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x3@RPE8.5 + 2x3@RPE7.5", tmp: "2-1-X-1", desc: "4-6m" }, 
            { nombre: "Sentadilla técnica", trabajo: "2x4@RPE6-7", tmp: "5-1-X-1", desc: "3-5m" }
        ]},
        { titulo: "Día 4 - Superior (Banca+Militar+Fondos)", ejercicios: [
            { nombre: "Press banca", trabajo: "4x3@RPE8-8.5", tmp: "5-1-X-1", desc: "3-5m" }, 
            { nombre: "Press militar", trabajo: "3x4@RPE8", tmp: "4-0-2-1", desc: "2-4m" }, 
            { nombre: "Fondos", trabajo: "1x6@RPE8 (RP 20s) +2-3", tmp: "4-1-X-1", desc: "2-3m" }
        ]}
      ]
    },
    {
      semana: 3, foco: "", tempos: "4-1-X-1 (SQ/BP/Fondos) | 4-0-X-1 (Militar) | DL: 2-1-X-1. Drop/Cluster.",
      dias: [
        { titulo: "Día 1 - Inferior (Sentadilla) + Militar", ejercicios: [
            { nombre: "Sentadilla libre", trabajo: "1x3@RPE9+ 2x3@RPE8", tmp: "4-1-X-1", desc: "4-6m" }, 
            { nombre: "Press militar", trabajo: "3x4@RPE8-9", tmp: "4-0-X-1", desc: "2-4m" }
        ]},
        { titulo: "Día 2 - Superior (Banca) + Fondos", ejercicios: [
            { nombre: "Press banca", trabajo: "1x3@RPE9+ 2x3@RPE8", tmp: "4-1-X-1", desc: "3-5m" }, 
            { nombre: "Fondos", trabajo: "1x6@RPE9+ Drop (-10-15% x6-8)", tmp: "4-1-X-1", desc: "2-3m" }
        ]},
        { titulo: "Día 3 - Inferior (DL) + SQ velocidad", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x2@RPE9 + 2x2@RPE8", tmp: "2-1-X-1", desc: "4-6m" }, 
            { nombre: "Sentadilla velocidad", trabajo: "3x2@RPE7", tmp: "4-1-X-1", desc: "3-5m" }
        ]},
        { titulo: "Día 4 - Superior (Cluster banca)", ejercicios: [
            { nombre: "Press banca (Cluster)", trabajo: "3 bloques (2+2) 20s intra", tmp: "4-1-X-1", desc: "3-4m" }, 
            { nombre: "Press militar", trabajo: "4x3@RPE8.5", tmp: "4-0-X-1", desc: "2-4m" }, 
            { nombre: "Fondos", trabajo: "3x5@RPE8-9", tmp: "4-1-X-1", desc: "2-3m" }
        ]}
      ]
    },
    {
      semana: 4, foco: "", tempos: "3-1-2-1. Sin técnicas. RPE 6-7.",
      dias: [
        { titulo: "Día 1 - Deload", ejercicios: [
            { nombre: "Sentadilla", trabajo: "3x3@RPE6-7", tmp: "3-1-2-1", desc: "3-5m" }, 
            { nombre: "Press militar", trabajo: "2x5@RPE6-7", tmp: "3-0-2-1", desc: "2-3m" }
        ]},
        { titulo: "Día 2 - Deload", ejercicios: [
            { nombre: "Press banca", trabajo: "3x3@RPE6-7", tmp: "3-1-2-1", desc: "3-5m" }, 
            { nombre: "Fondos", trabajo: "2x6@RPE6-7", tmp: "3-1-2-1", desc: "2-3m" }
        ]},
        { titulo: "Día 3 - Deload", ejercicios: [
            { nombre: "Peso muerto", trabajo: "3x2@RPE6-7", tmp: "2-1-X-1", desc: "4-6m" }, 
            { nombre: "Sentadilla", trabajo: "2x3@RPE6-7", tmp: "3-1-2-1", desc: "3-5m" }
        ]},
        { titulo: "Día 4 - Deload", ejercicios: [
            { nombre: "Press banca", trabajo: "2x3@RPE6-7", tmp: "3-1-2-1", desc: "3-5m" }, 
            { nombre: "Press militar", trabajo: "2x5@RPE6-7", tmp: "3-0-2-1", desc: "2-3m" }, 
            { nombre: "Fondos", trabajo: "2x6@RPE6-7", tmp: "3-1-2-1", desc: "2-3m" }
        ]}
      ]
    }
  ],

  // ==========================================
  // 3. RUTINA DE HIPERTROFIA (Fiel al PDF mesociclo-hipertrofia)
  // ==========================================
  hipertrofia: [
    {
      semana: 1, foco: "", tempos: "4-1-2-1 (general). DL: 2-1-X-1.",
      dias: [
        { titulo: "Día 1 - Inferior (Sentadilla)", ejercicios: [
            { nombre: "Sentadilla trasera", trabajo: "1x8@RPE8+ 2x8@RPE7", tmp: "4-1-2-1", desc: "3-4m" }, 
            { nombre: "RDL", trabajo: "3x8@RPE8", tmp: "4-1-2-1", desc: "2-3m" }, 
            { nombre: "Búlgaro", trabajo: "2x10/leg@RPE8", tmp: "4-1-2-1", desc: "90-120s" }, 
            { nombre: "Curl femoral", trabajo: "2x12@RPE8-9", tmp: "4-1-2-1", desc: "60-90s" }, 
            { nombre: "Gemelos", trabajo: "3x12@RPE8", tmp: "3-1-2-2", desc: "60-90s" }, 
            { nombre: "Core", trabajo: "2x10-15@RPE8", tmp: "ctrl", desc: "60-90s" }
        ]},
        { titulo: "Día 2 - Superior (Banca)", ejercicios: [
            { nombre: "Press banca", trabajo: "1x8@RPE8+ 2x8@RPE7", tmp: "4-1-2-1", desc: "3-4m" }, 
            { nombre: "Fondos", trabajo: "3x8@RPE8", tmp: "4-1-2-1", desc: "2-3m" }, 
            { nombre: "Remo barra", trabajo: "4x8@RPE8", tmp: "3-1-2-1", desc: "2-3m" }, 
            { nombre: "Dominadas/Jalón", trabajo: "3x8-10@RPE8", tmp: "3-1-2-1", desc: "2m" }, 
            { nombre: "Laterales", trabajo: "3x12@RPE8-9", tmp: "3-1-2-1", desc: "60-90s" }, 
            { nombre: "Curl biceps", trabajo: "2x12@RPE8-9", tmp: "3-1-2-1", desc: "60-90s" }
        ]},
        { titulo: "Día 3 - Inferior (DL)", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x6@RPE8+ 2x6@RPE7", tmp: "2-1-X-1", desc: "3.5-5m" }, 
            { nombre: "Sentadilla frontal", trabajo: "3x10@RPE8", tmp: "4-1-2-1", desc: "2-3m" }, 
            { nombre: "Hip thrust", trabajo: "3x10@RPE8", tmp: "3-1-2-2", desc: "2m" }, 
            { nombre: "Ext. cuádriceps", trabajo: "2x12-15@RPE8-9", tmp: "3-1-2-1", desc: "60-90s" }, 
            { nombre: "Plancha", trabajo: "2x45-75s", tmp: "iso", desc: "60-90s" }
        ]},
        { titulo: "Día 4 - Superior (Militar)", ejercicios: [
            { nombre: "Press militar", trabajo: "1x8@RPE8 + 2x8@RPE7", tmp: "4-0-2-1", desc: "2.5-4m" }, 
            { nombre: "Press inclinado", trabajo: "3x10@RPE8", tmp: "4-1-2-1", desc: "2-3m" }, 
            { nombre: "Remo pecho apoy", trabajo: "3x10@RPE8", tmp: "3-1-2-1", desc: "2m" }, 
            { nombre: "Posterior deltoide", trabajo: "3x12-15@RPE8-9", tmp: "3-1-2-1", desc: "60-90s" }, 
            { nombre: "Fondos técnicos", trabajo: "2x10@RPE8", tmp: "4-1-2-1", desc: "2m" }
        ]}
      ]
    },
    {
      semana: 2, foco: "", tempos: "4-1-X-1. DL: 2-1-X-1. Max 1 técnica grande.",
      dias: [
        { titulo: "Día 1 - Inferior (Myo femoral)", ejercicios: [
            { nombre: "Sentadilla trasera", trabajo: "1x8@RPE8.5 + 2x8@RPE7.5", tmp: "4-1-X-1", desc: "3-4m" }, 
            { nombre: "RDL", trabajo: "3x8@RPE8.5", tmp: "4-1-X-1", desc: "2-3m" }, 
            { nombre: "Búlgaro", trabajo: "3x10/leg@RPE8", tmp: "4-1-X-1", desc: "90-120s" }, 
            { nombre: "Curl femoral", trabajo: "MYO: 1x12@RPE9 (+4 +4)", tmp: "4-1-X-1", desc: "15-20s" }, 
            { nombre: "Gemelos", trabajo: "3x12@RPE8-9", tmp: "3-1-2-2", desc: "60-90s" }, 
            { nombre: "Core", trabajo: "2x10-15", tmp: "ctrl", desc: "60-90s" }
        ]},
        { titulo: "Día 2 - Superior (RP laterales)", ejercicios: [
            { nombre: "Press banca", trabajo: "1x8@RPE9+ 1x8@RPE8", tmp: "4-1-X-1", desc: "3-4m" }, 
            { nombre: "Fondos", trabajo: "3x8@RPE8.5-9", tmp: "4-1-X-1", desc: "2-3m" }, 
            { nombre: "Remo barra", trabajo: "4x8@RPE8-9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Dominadas/Jalón", trabajo: "3x8-10@RPE8-9", tmp: "3-1-X-1", desc: "2m" }, 
            { nombre: "Laterales", trabajo: "RP: 1x12@RPE9 (+5-6)", tmp: "3-1-X-1", desc: "20s" }, 
            { nombre: "Curl biceps", trabajo: "2x12@RPE9", tmp: "3-1-X-1", desc: "60-90s" }
        ]},
        { titulo: "Día 3 - Inferior (Drop quad)", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x6@RPE8.5 + 2x6@RPE7.5", tmp: "2-1-X-1", desc: "4-5m" }, 
            { nombre: "Sentadilla frontal", trabajo: "3x10@RPE8.5", tmp: "4-1-X-1", desc: "2-3m" }, 
            { nombre: "Hip thrust", trabajo: "3x10@RPE8.5", tmp: "3-1-X-2", desc: "2m" }, 
            { nombre: "Ext. cuádriceps", trabajo: "DROP: 1x12@RPE9 (-15%)", tmp: "3-1-X-1", desc: "60-90s" }, 
            { nombre: "Plancha", trabajo: "2 series", tmp: "iso", desc: "60-90s" }
        ]},
        { titulo: "Día 4 - Superior (Myo posterior)", ejercicios: [
            { nombre: "Press militar", trabajo: "1x8@RPE8.5 + 2x8@RPE7.5", tmp: "4-0-X-1", desc: "2.5-4m" }, 
            { nombre: "Press inclinado", trabajo: "3x10@RPE8.5", tmp: "4-1-X-1", desc: "2-3m" }, 
            { nombre: "Remo pecho apoy", trabajo: "3x10@RPE8-9", tmp: "3-1-X-1", desc: "2m" }, 
            { nombre: "Posterior deltoide", trabajo: "MYO: 1x15@RPE9 (+5 +5)", tmp: "3-1-X-1", desc: "15-20s" }, 
            { nombre: "Fondos", trabajo: "2x10@RPE8-9", tmp: "4-1-X-1", desc: "2m" }
        ]}
      ]
    },
    {
      semana: 3, foco: "", tempos: "3-1-X-1. DL: 2-1-X-1. Semana pesada.",
      dias: [
        { titulo: "Día 1 - Inferior (RP búlgaro)", ejercicios: [
            { nombre: "Sentadilla trasera", trabajo: "1x6@RPE9+ 2x8@RPE8", tmp: "3-1-X-1", desc: "3.5-5m" }, 
            { nombre: "RDL", trabajo: "3x8@RPE9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Búlgaro", trabajo: "RP: 1x10@RPE9 (+4-5)", tmp: "3-1-X-1", desc: "20s" }, 
            { nombre: "Curl femoral", trabajo: "2x10-12@RPE9", tmp: "3-1-X-1", desc: "60-90s" }, 
            { nombre: "Gemelos", trabajo: "3x10-12@RPE9", tmp: "3-1-2-2", desc: "60-90s" }, 
            { nombre: "Core", trabajo: "2 series", tmp: "ctrl", desc: "60-90s" }
        ]},
        { titulo: "Día 2 - Superior (Cluster banca)", ejercicios: [
            { nombre: "Press banca", trabajo: "CLUSTER (3+3) x3 bloques", tmp: "3-1-X-1", desc: "3-4m" }, 
            { nombre: "Fondos", trabajo: "3x8@RPE9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Remo barra", trabajo: "4x8@RPE9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Dominadas/Jalón", trabajo: "3x8-10@RPE9", tmp: "3-1-X-1", desc: "2m" }, 
            { nombre: "Laterales", trabajo: "DROP: 1x12@RPE9 (-20%)", tmp: "3-1-X-1", desc: "60-90s" }, 
            { nombre: "Curl biceps", trabajo: "2x10-12@RPE9-9.5", tmp: "3-1-X-1", desc: "60-90s" }
        ]},
        { titulo: "Día 3 - Inferior (Myo quad)", ejercicios: [
            { nombre: "Peso muerto", trabajo: "1x5@RPE9+ 2x6@RPE8", tmp: "2-1-X-1", desc: "4-6m" }, 
            { nombre: "Sentadilla frontal", trabajo: "3x8-10@RPE9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Hip thrust", trabajo: "3x8-10@RPE9", tmp: "3-1-X-2", desc: "2m" }, 
            { nombre: "Ext. cuádriceps", trabajo: "MYO: 1x15@RPE9 (+5 +5)", tmp: "3-1-X-1", desc: "15-20s" }, 
            { nombre: "Core", trabajo: "2 series", tmp: "ctrl", desc: "60-90s" }
        ]},
        { titulo: "Día 4 - Superior (RP fondos)", ejercicios: [
            { nombre: "Press militar", trabajo: "1x6@RPE9+ 2x8@RPE8", tmp: "3-0-X-1", desc: "3-4m" }, 
            { nombre: "Press inclinado", trabajo: "3x8-10@RPE9", tmp: "3-1-X-1", desc: "2-3m" }, 
            { nombre: "Remo pecho apoy", trabajo: "3x10@RPE9", tmp: "3-1-X-1", desc: "2m" }, 
            { nombre: "Posterior deltoide", trabajo: "3x12-15@RPE9", tmp: "3-1-X-1", desc: "60-90s" }, 
            { nombre: "Fondos", trabajo: "RP: 1x8@RPE9 (+3-4)", tmp: "3-1-X-1", desc: "20-25s" }
        ]}
      ]
    },
    {
      semana: 4, foco: "", tempos: "3-1-2-1. Sin técnicas. Bajar volumen -50% y RPE 6-7.",
      dias: [
        { titulo: "Día 1 - Deload (Inferior)", ejercicios: [
            { nombre: "Sentadilla trasera", trabajo: "2x8@RPE6-7", tmp: "3-1-2-1", desc: "2.5-4m" }, 
            { nombre: "RDL", trabajo: "2x8@RPE6-7", tmp: "3-1-2-1", desc: "2-3m" }, 
            { nombre: "Gemelos", trabajo: "2x12@RPE7", tmp: "3-1-2-2", desc: "60-90s" }, 
            { nombre: "Core", trabajo: "1-2 series", tmp: "ctrl", desc: "60-90s" }
        ]},
        { titulo: "Día 2 - Deload (Superior)", ejercicios: [
            { nombre: "Press banca", trabajo: "2x8@RPE6-7", tmp: "3-1-2-1", desc: "2.5-4m" }, 
            { nombre: "Fondos", trabajo: "2x8@RPE6-7", tmp: "3-1-2-1", desc: "2m" }, 
            { nombre: "Remo", trabajo: "2x10@RPE6-7", tmp: "3-1-2-1", desc: "2m" }, 
            { nombre: "Laterales", trabajo: "2x12@RPE7", tmp: "3-1-2-1", desc: "60-90s" }
        ]},
        { titulo: "Día 3 - Deload (Inferior)", ejercicios: [
            { nombre: "Peso muerto", trabajo: "2x6@RPE6-7", tmp: "2-1-X-1", desc: "3.5-5m" }, 
            { nombre: "Sentadilla frontal", trabajo: "2x10@RPE6-7", tmp: "3-1-2-1", desc: "2-3m" }, 
            { nombre: "Hip thrust", trabajo: "2x10@RPE6-7", tmp: "3-1-2-2", desc: "2m" }
        ]},
        { titulo: "Día 4 - Deload (Superior)", ejercicios: [
            { nombre: "Press militar", trabajo: "2x8@RPE6-7", tmp: "3-0-2-1", desc: "2.5-4m" }, 
            { nombre: "Press inclinado", trabajo: "2x10@RPE6-7", tmp: "3-1-2-1", desc: "2-3m" }, 
            { nombre: "Posterior deltoide", trabajo: "2x12-15@RPE7", tmp: "3-1-2-1", desc: "60-90s" }
        ]}
      ]
    }
  ]
};