// @type {import('tailwindcss').Config}
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ORBITAUDIO FOCUS - BRAND COLOR SYSTEM
      colors: {
        // Deep Space - Main backgrounds
        space: {
          950: '#050608', // Darkest - deeper than 900
          900: '#0a0b0f', // Darkest - main app background
          800: '#12141a', // Panels, cards
          700: '#1a1d26', // Elevated surfaces
          600: '#242833', // Borders, dividers
          500: '#2e3341', // Hover states on borders
        },

        // Nebula Purple - Primary accent
        nebula: {
          600: '#7c3aed', // Pressed states
          500: '#8b5cf6', // Primary actions, highlights
          400: '#a78bfa', // Hover states
          300: '#c4b5fd', // Active states
          200: '#ddd6fe', // Light backgrounds
          glow: 'rgba(139, 92, 246, 0.25)', // Glow effects
        },

        // Aurora Teal - Secondary accent (wellness, therapeutic)
        aurora: {
          600: '#0d9488', // Pressed states
          500: '#14b8a6', // Secondary actions
          400: '#2dd4bf', // Hover states
          300: '#5eead4', // Active states
          200: '#99f6e4', // Light backgrounds
          glow: 'rgba(20, 184, 166, 0.25)', // Glow effects
        },

        // Cosmic Amber - Warm accent (energy, alertness)
        amber: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          300: '#fcd34d',
          glow: 'rgba(245, 158, 11, 0.25)',
        },

        // Text colors
        text: {
          primary: '#f8fafc',   // Primary text - almost white
          secondary: '#94a3b8', // Secondary text - muted
          tertiary: '#64748b',  // Tertiary text - very muted
          inverse: '#0a0b0f',   // Text on light backgrounds
        },

        // Brainwave state colors
        brainwave: {
          delta: '#6366f1',   // Deep sleep - Indigo
          theta: '#8b5cf6',   // Meditation - Purple
          alpha: '#14b8a6',   // Relaxation - Teal
          beta: '#f59e0b',    // Focus - Amber
          gamma: '#ef4444',   // Peak performance - Red
        },

        // Noise type colors
        noise: {
          white: '#e2e8f0',   // Bright, even
          pink: '#f9a8d4',    // Soft pink
          brown: '#a16207',   // Warm brown
        },
      },

      // TYPOGRAPHY
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1.25' }],        // 48px
        '6xl': ['3.75rem', { lineHeight: '1.2' }],      // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1' }],       // 72px
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        'ultra-wide': '0.2em',
      },

      // SPACING & LAYOUT
      borderRadius: {
        'sm': '0.25rem',    // 4px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        'full': '9999px',
      },

      // ANIMATIONS
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pan-left-right': 'panLeftRight 4s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)' },
        },
        panLeftRight: {
          '0%, 100%': { transform: 'translateX(-50%)' },
          '50%': { transform: 'translateX(50%)' },
        },
      },

      // TRANSITIONS
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        'slower': '700ms',
      },

      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // SHADOWS
      boxShadow: {
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.2)',
        'glow-md': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.3)',
        'glow-teal-sm': '0 0 10px rgba(20, 184, 166, 0.2)',
        'glow-teal-md': '0 0 20px rgba(20, 184, 166, 0.25)',
        'glow-amber-sm': '0 0 10px rgba(245, 158, 11, 0.2)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },

      // BACKDROP BLUR
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
