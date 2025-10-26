import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "blanco-100": "var(--blanco-100)",
        "grisprimario-10": "var(--grisprimario-10)",
        "grisprimario-100": "var(--grisprimario-100)",
        "grissecundario-100": "var(--grissecundario-100)",
        "naranja-100": "var(--naranja-100)",
        "naranja-50": "var(--naranja-50)",
        "verdeprimario-100": "var(--verdeprimario-100)",
        "verdeprimario-60": "var(--verdeprimario-60)",
        "verdesecundario-100": "var(--verdesecundario-100)",
        "negro-100": "var(--negro-100)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        "barlow-bold-64pt": "var(--barlow-bold-64pt-font-family)",
        "barlow-bold-italic-96pt": "var(--barlow-bold-italic-96pt-font-family)",
        "barlow-medium-20pt": "var(--barlow-medium-20pt-font-family)",
        "raleway-bold-16pt": "var(--raleway-bold-16pt-font-family)",
        "raleway-bold-20pt": "var(--raleway-bold-20pt-font-family)",
        "raleway-bold-14pt": "var(--raleway-bold-14pt-font-family)",
        "raleway-medium-14pt": "var(--raleway-medium-14pt-font-family)",
        "raleway-medium-16pt": "var(--raleway-medium-16pt-font-family)",
        "raleway-regular-20pt": "var(--raleway-regular-20pt-font-family)",
        "raleway-semibold-italic-20pt": "var(--raleway-semibold-italic-20pt-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      fontSize: {
        'hero-sm': ['2.5rem', { lineHeight: '1.2' }],
        'hero-md': ['3.5rem', { lineHeight: '1.1' }],
        'hero-lg': ['4rem', { lineHeight: '1' }],
        'hero-xl': ['5rem', { lineHeight: '0.9' }],
        'hero-2xl': ['6rem', { lineHeight: '0.8' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { 
      center: true, 
      padding: "2rem", 
      screens: { "2xl": "1400px" } 
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  darkMode: ["class"],
};

export default config;
