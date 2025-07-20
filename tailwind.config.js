/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF914D',
          'orange-hover': '#e66d25',
        },
        neutral: {
          black: '#000000',
          white: '#FFFFFF',
          gray: '#E4E4E4',
          'gray-medium': '#888888',
        },
        status: {
          success: '#28a745',
          error: '#dc3545',
          info: '#007bff',
        }
      },
      fontFamily: {
        'title': ['Montserrat', 'Poppins', 'sans-serif'],
        'body': ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
      },
      spacing: {
        'component': '16px',
        'section': '24px',
      },
      borderRadius: {
        'default': '6px',
      },
      maxWidth: {
        'container': '1280px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    },
  },
  plugins: [],
};