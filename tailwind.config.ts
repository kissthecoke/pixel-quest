import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'sans-serif'],
        pixel: ['"Press Start 2P"', '"IBM Plex Sans KR"', 'monospace'],
        term: ['VT323', '"IBM Plex Sans KR"', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
