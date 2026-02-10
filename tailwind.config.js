/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        yellow: "#FFFF92",
        blue: "#5867B6",
        purple: "#5867B6",
        main: "#0A0C13",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      backgroundImage: {
        'grain': 'url("/assets/grain.png")',
        'radial-dark': 'radial-gradient(circle at center, transparent 0%, rgba(10, 12, 19, 0.8) 100%)',
      },
      fontFamily: {
        ptsans: ["var(--font-ptsans)", "sans-serif"],
        raleway: ["var(--font-raleway)", "sans-serif"],
      },
      boxShadow: {
        'blue-lg': '0 10px 30px rgba(88, 103, 182, 0.3)',
        'yellow-lg': '0 10px 30px rgba(255, 255, 146, 0.3)',
        'glow-yellow': '0 0 40px rgba(255, 255, 146, 0.4)',
        'glow-blue': '0 0 40px rgba(88, 103, 182, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
    screens: {
      xs: "480px",
      sm: "768px",
      md: "1024px",
      lg: "1280px",
      xl: "1536px",
    },
  },
  plugins: [],
}
