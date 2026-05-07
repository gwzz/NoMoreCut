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
        surface: "#f6f5f2",
        ink: "#171717",
        muted: "#737373",
        line: "#dedbd4",
        gain: "#0f8f5f",
        loss: "#c94747",
        brass: "#a68145"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
