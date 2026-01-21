/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        gridFlow: {
          '0%': { transform: 'rotateX(60deg) translateY(-100px) scale(1.5) translateY(0)' },
          '100%': { transform: 'rotateX(60deg) translateY(-100px) scale(1.5) translateY(40px)' }, // Moves grid downward
        }
      },
    },
  },
  plugins: [],
}