import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color Tokens mapped to CSS variables
        border: "hsl(var(--outline-variant))",
        input: "hsl(var(--outline-variant))",
        ring: "hsl(var(--md-primary))",
        background: "hsl(var(--md-surface))",
        foreground: "hsl(var(--md-on-surface))",
        primary: {
          DEFAULT: "hsl(var(--md-primary))",
          foreground: "hsl(var(--md-on-primary))",
          container: "hsl(var(--md-primary-container))",
          onContainer: "hsl(var(--md-on-primary-container))",
        },
        secondary: {
          DEFAULT: "hsl(var(--md-secondary))",
          foreground: "hsl(var(--md-on-secondary))",
          container: "hsl(var(--md-secondary-container))",
          onContainer: "hsl(var(--md-on-secondary-container))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--md-tertiary))",
          foreground: "hsl(var(--md-on-tertiary))",
          container: "hsl(var(--md-tertiary-container))",
          onContainer: "hsl(var(--md-on-tertiary-container))",
        },
        surface: {
          DEFAULT: "hsl(var(--md-surface))",
          dim: "hsl(var(--md-surface-dim))",
          bright: "hsl(var(--md-surface-bright))",
          container: "hsl(var(--md-surface-container))",
          containerLow: "hsl(var(--md-surface-container-low))",
          containerHigh: "hsl(var(--md-surface-container-high))",
          containerHighest: "hsl(var(--md-surface-container-highest))",
        },
        onSurface: {
          DEFAULT: "hsl(var(--md-on-surface))",
          variant: "hsl(var(--md-on-surface-variant))",
        },
        outline: {
          DEFAULT: "hsl(var(--md-outline))",
          variant: "hsl(var(--md-outline-variant))",
        },
        error: {
          DEFAULT: "hsl(var(--md-error))",
          container: "hsl(var(--md-error-container))",
          onContainer: "hsl(var(--md-on-error-container))",
        },
        success: {
          DEFAULT: "hsl(var(--md-success))",
          container: "hsl(var(--md-success-container))",
          onContainer: "hsl(var(--md-on-success-container))",
        }
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
        full: "9999px",
      },
      boxShadow: {
        "md-1": "0 1px 3px 1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.12)",
        "md-2": "0 2px 6px 2px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.14)",
        "md-3": "0 4px 12px 3px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.15)",
        "md-4": "0 6px 16px 4px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.16)",
        "md-5": "0 8px 24px 6px rgba(0, 0, 0, 0.14), 0 4px 8px 0 rgba(0, 0, 0, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
