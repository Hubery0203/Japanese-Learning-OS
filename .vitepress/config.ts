import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '日本語学習 Database',
  description: 'A structured Japanese learning knowledge base for kana, verbs, grammar, kanji, and study resources.',
  cleanUrls: true,
  appearance: 'dark',
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  themeConfig: {
    logo: '日',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Gojuon', link: '/01-gojuon/hiragana-katakana' },
      { text: 'Verb Conjugation', link: '/02-vocabulary/verb-conjugation' },
      { text: 'Grammar', link: '/03-grammar/n5-n4-core' },
      { text: 'Kanji', link: '/04-kanji/phonetic-rules' },
      { text: 'Resources', link: '/05-resources/' }
    ],
    sidebar: [
      {
        text: 'Start Here',
        items: [{ text: 'Overview', link: '/' }]
      },
      {
        text: '01 Gojuon',
        collapsed: false,
        items: [{ text: 'Hiragana & Katakana', link: '/01-gojuon/hiragana-katakana' }]
      },
      {
        text: '02 Vocabulary',
        collapsed: false,
        items: [{ text: 'Verb Conjugation', link: '/02-vocabulary/verb-conjugation' }]
      },
      {
        text: '03 Grammar',
        collapsed: false,
        items: [{ text: 'N5/N4 Core Grammar', link: '/03-grammar/n5-n4-core' }]
      },
      {
        text: '04 Kanji',
        collapsed: false,
        items: [{ text: 'Phonetic Rules', link: '/04-kanji/phonetic-rules' }]
      },
      {
        text: '05 Resources',
        collapsed: false,
        items: [{ text: 'Learning Tools', link: '/05-resources/' }]
      }
    ],
    outline: { level: [2, 3], label: 'On this page' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/' }],
    footer: {
      message: 'Built with VitePress for systematic Japanese learning.',
      copyright: 'Content designed for learners from kana through JLPT N4.'
    }
  }
})
