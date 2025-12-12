/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tervis: {
          blue: {
            DEFAULT: '#0066CC',
            light: '#33CCFF',
          },
          green: {
            DEFAULT: '#00A859',
            light: '#A2FF6C',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #0066CC 0%, #33CCFF 100%)',
        'gradient-green': 'linear-gradient(135deg, #00A859 0%, #A2FF6C 100%)',
        'gradient-tervis': 'linear-gradient(135deg, #0066CC 0%, #00A859 50%, #A2FF6C 100%)',
      },
    },
  },
  plugins: [],
};
