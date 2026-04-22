/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-120%)', opacity: 0.5 },
          '50%': { transform: 'translateY(120%)', opacity: 1 },
        }
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
      }
    } 
  },
  plugins: [],
}
