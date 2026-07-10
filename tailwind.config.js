/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        happy: { DEFAULT: "#f59e0b", light: "#fef3c7" },
        peace: { DEFAULT: "#14b8a6", light: "#ccfbf1" },
        sad: { DEFAULT: "#64748b", light: "#f1f5f9" },
        protection: { DEFAULT: "#6366f1", light: "#e0e7ff" },
        anxiety: { DEFAULT: "#f43f5e", light: "#ffe4e6" },
        laziness: { DEFAULT: "#78716c", light: "#f5f5f4" },
        anger: { DEFAULT: "#ef4444", light: "#fee2e2" },
        loneliness: { DEFAULT: "#8b5cf6", light: "#ede9fe" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      animation: {
        typewriter: "typewriter 2s steps(40) 1s forwards",
      },
    },
  },
  plugins: [],
};
