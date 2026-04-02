import type { Config } from "tailwindcss";

const config: Config = {
  // 1. ESTA ES LA LÍNEA MÁGICA: Bloquea el modo oscuro automático del celular.
  darkMode: "class", 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2. INVERTIMOS LOS COLORES BASE A MODO CLARO
        background: "#ffffff", // Blanco puro para el fondo general
        foreground: "#09090b", // Texto oscuro para que se lea sobre el blanco
        primary: {
          DEFAULT: "#10b981", // Emerald 500 (¡Tu verde principal se mantiene intacto!)
          foreground: "#ffffff", // El texto dentro de tus botones verdes será blanco
        },
        muted: {
          DEFAULT: "#f4f4f5", // Un gris muy clarito para zonas secundarias
          foreground: "#71717a", // Texto gris medio
        },
        card: {
          DEFAULT: "#ffffff", // Fondo de las tarjetas en blanco
          foreground: "#09090b", // Texto de las tarjetas oscuro
        },
        border: "#e4e4e7", // Líneas divisorias en gris clarito y sutil
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;