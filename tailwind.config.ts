import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#071523",
        ink: "#f8fafc",
        muted: "#94a3b8",
        line: "rgba(255,255,255,0.1)",
        gain: "#34d399",
        loss: "#fb7185",
        brass: "#fbbf24"
      },
      boxShadow: {
        soft: "0 28px 100px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
