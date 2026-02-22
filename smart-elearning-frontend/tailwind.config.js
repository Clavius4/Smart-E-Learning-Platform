/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
     safelist: [
    'hover:bg-primary-700', // 👈 Add this
    'bg-primary-600',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
  ],
    theme: {
      extend: {
        backgroundImage: {
          'radial-orange': 'radial-gradient(ellipse at center, rgba(255,69,0,0.8) 0%, rgba(255,69,0,0.2) 50%, rgba(255,165,0,0.6) 100%)'
        },
        colors: {
          primary: {
            500: '#2563eb', 
            600: '#1d4ed8',
            700: '#1e40af'
             
          },
          secondary: {
            400: '#fbbf24', 
            500: '#f59e0b' 
          }
        }
      },
    },
    plugins: [],
  }