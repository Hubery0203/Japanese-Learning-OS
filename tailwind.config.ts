import type { Config } from 'tailwindcss'

export default {
  content: ['./docs/**/*.md', './docs/.vitepress/**/*.{ts,js,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
