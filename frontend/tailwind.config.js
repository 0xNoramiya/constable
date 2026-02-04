/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        constable: {
          dark: '#1a1a2e',
          darker: '#16213e',
          accent: '#e94560',
          'accent-light': '#ff6b6b',
          muted: '#a0a0a0',
          border: 'rgba(255,255,255,0.1)',
          card: 'rgba(255,255,255,0.05)',
          input: 'rgba(0,0,0,0.3)',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-constable': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'gradient-accent': 'linear-gradient(90deg, #e94560, #ff6b6b)',
      },
    },
  },
  plugins: [],
}
