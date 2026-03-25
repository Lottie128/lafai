export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080508',
        surface: '#100c0f',
        card: '#18121a',
        accent: '#c4727a',
        'accent-dark': '#9d4f57',
        gold: '#c9a96e',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
