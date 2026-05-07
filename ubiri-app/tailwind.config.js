/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        green: {
          950: '#052e16',
        }
      },
      animation: {
        'spin-slow': 'spin-slow 8s linear infinite',
        'ripple': 'ripple 6s cubic-bezier(0.2, 0, 0.2, 1) infinite',
        'float': 'float 10s linear infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'pulse-green': 'pulse-green 3s infinite',
        'fade-up': 'fadeUp 0.5s ease both',
        'word-reveal': 'word-reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'slideUp': 'slideUp 1s ease-out 1s forwards',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        ripple: {
          '0%': { width: '100px', height: '100px', opacity: '0', transform: 'scale(0.8)' },
          '10%': { opacity: '0.5' },
          '100%': { width: '800px', height: '800px', opacity: '0', transform: 'scale(1.5)' },
        },
        float: {
          from: { transform: 'translateY(0) translateX(0) scale(1)' },
          to: { transform: 'translateY(-100vh) translateX(100px) scale(1.2)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
          '50%': { transform: 'scale(1.03)', boxShadow: '0 35px 60px -12px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.05)' },
        },
        'pulse-green': {
          '0%, 100%': { textShadow: '0 0 0px rgba(22,163,74,0)' },
          '50%': { textShadow: '0 0 20px rgba(22,163,74,0.4)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'word-reveal': {
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
