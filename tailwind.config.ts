import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  // --- Dark mode ---
  // We always apply the "dark" class on <html> in app/layout.tsx.
  // This is an always-dark app — no light mode toggle.
    darkMode: 'class',

  // --- Content paths ---
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // --- Colors (CSS variable tokens) ---
      //
      // All color values are defined as CSS variables in app/globals.css.
      // This allows shadcn/ui components to consume them automatically.
      //
      // Base palette from the Figma design:
      //   Background  — pure near-black  #050505
      //   Cards       — dark grey        #111111
      //   Borders     — metallic grey    #222222
      //   Buttons     — metallic dark    #1a1a1a
      //   Text        — dim white        #e8e8e8
      //   Muted text  — mid grey         #6b6b6b
      //   Chart line  — muted violet     hsl(263 65% 62%)
      //
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // Primary — used for high-emphasis text and bright buttons if needed
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Secondary — metallic dark background for Deposit / Send / Ping buttons
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',

        // --- Chart ---
        // The single balance line visible in the right panel (muted violet).
        chart: {
          '1': 'hsl(var(--chart-1))',
        },

        // --- Countdown ---
        // The dark box that holds 256 · 7 · 32 · 22 in the balance card.
        countdown: {
          bg:     'hsl(var(--countdown-bg))',
          border: 'hsl(var(--countdown-border))',
          text:   'hsl(var(--countdown-text))',
          label:  'hsl(var(--countdown-label))',
        },

        // --- Sidebar ---
        sidebar: {
          bg:            'hsl(var(--sidebar-bg))',
          border:        'hsl(var(--sidebar-border))',
          'item-active': 'hsl(var(--sidebar-item-active))',
          'item-hover':  'hsl(var(--sidebar-item-hover))',
          label:         'hsl(var(--sidebar-label))',
        },

        // --- Price change indicator ---
        // Red for -2.39%, green for positive change in the Top assets card.
        'price-down': 'hsl(var(--price-down))',
        'price-up':   'hsl(var(--price-up))',
      },

      // --- Border radius ---
      // --radius drives the pill shape of buttons and card corners.
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // --- Typography ---
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Mono font for the countdown numbers so digit widths are consistent
        // and the timer doesn't shift layout as seconds tick.
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      // --- Font sizes ---
      fontSize: {
        // The large balance value "$22.16" in the balance card
        'balance-lg': ['2.25rem', { lineHeight: '1', fontWeight: '700' }],
        // Countdown number units "256", "7", "32", "22"
        'countdown': ['1.75rem', { lineHeight: '1', fontWeight: '600' }],
      },

      // --- Animations ---
      // tailwindcss-animate provides accordion-down/up, fade-in/out, etc.
      // These are used by shadcn/ui Dialog, Toast, and Tooltip components.
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // Skeleton shimmer for LoadingSkeleton component
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Countdown tick — subtle scale pulse when a unit changes
        'tick': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.06)', opacity: '0.75' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 1.8s infinite linear',
        'tick':           'tick 0.15s ease-in-out',
      },
    },
  },

  plugins: [
    tailwindcssAnimate,
  ],
}

export default config