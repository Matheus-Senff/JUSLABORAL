/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#212529',
          600: '#2c3034',
          500: '#343a40',
          400: '#495057',
        },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        "blue-accent": {
          DEFAULT: "hsl(var(--blue-accent))",
          light: "hsl(var(--blue-accent-light))",
          dark: "hsl(var(--blue-accent-dark))",
        },
        royal: {
          DEFAULT: "hsl(var(--royal))",
          light: "hsl(var(--royal-light))",
          dark: "hsl(var(--royal-dark))",
        },
        silver: {
          DEFAULT: "hsl(var(--silver))",
          light: "hsl(var(--silver-light))",
          dark: "hsl(var(--silver-dark))",
        },
        slate_text: "hsl(var(--slate-text))",
        danger: "hsl(var(--danger))",
        "neon-green": {
          DEFAULT: "hsl(var(--neon-green))",
          light: "hsl(var(--neon-green-light))",
          intense: "hsl(var(--neon-green-intense))",
        },
        draft: {
          bg: "hsl(var(--draft-bg))",
          surface: "hsl(var(--draft-surface))",
          "surface-hover": "hsl(var(--draft-surface-hover))",
          border: "hsl(var(--draft-border))",
          text: "hsl(var(--draft-text))",
          "text-muted": "hsl(var(--draft-text-muted))",
          action: "hsl(var(--draft-action))",
          "action-foreground": "hsl(var(--draft-action-foreground))",
          ice: "hsl(var(--draft-ice))",
        },
        paper: {
          DEFAULT: "hsl(var(--paper))",
          foreground: "hsl(var(--paper-foreground))",
        },
        step: {
          active: "hsl(var(--step-active))",
          complete: "hsl(var(--step-complete))",
          pending: "hsl(var(--step-pending))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        calculo: {
          bg: "hsl(var(--calculo-bg))",
          card: "hsl(var(--calculo-card))",
          border: "hsl(var(--calculo-border))",
          "border-focus": "hsl(var(--calculo-border-focus))",
          "border-hover": "hsl(var(--calculo-border-hover))",
          required: "hsl(var(--calculo-required))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
