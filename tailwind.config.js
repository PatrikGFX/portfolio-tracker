/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          50: '#0a0a0f',
          100: '#12121a',
          200: '#1a1a25',
          300: '#222230',
          400: '#2a2a3a',
        },
        accent: {
          emerald: '#34d399',
          rose: '#fb7185',
          amber: '#fbbf24',
          sky: '#38bdf8',
          violet: '#a78bfa',
          orange: '#fb923c',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(52, 211, 153, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(52, 211, 153, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};
