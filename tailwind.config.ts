/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary cyan-green
        primary: '#aaf07f',
        // Backgrounds
        dark: {
          900: '#181818',
          800: '#191919',
        },
        // Text
        text: {
          primary: '#ffffff',
          secondary: '#bdbdbd',
        },
        // Status colors
        success: '#00ffe3',
        info: '#2196f3',
        warning: '#ff9800',
        error: '#f44336',
      },
      spacing: {
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
      },
      borderRadius: {
        DEFAULT: '16px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
