/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7351E8",
        background: "rgb(var(--background) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        foreground: {
          DEFAULT: "rgb(var(--foreground) / <alpha-value>)",
          secondary: "rgb(var(--foreground-secondary) / <alpha-value>)",
        },
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        divider: "rgb(var(--divider) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
