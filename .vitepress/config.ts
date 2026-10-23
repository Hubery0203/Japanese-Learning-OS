import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/Japanese-Learning-OS/',
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
      { text: 'Lessons', link: '/06-lessons/' },
      { text: 'N4 Milestone', link: '/07-milestones/n4' },
      { text: 'Assessments', link: '/08-assessment/' },
      { text: 'Lexicon', link: '/09-lexicon/' },
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
        text: '06 Lessons',
        collapsed: false,
        items: [
          { text: 'Lesson Index', link: '/06-lessons/' },
          { text: 'L001 Mora and Special Sounds', link: '/06-lessons/L001-mora-and-long-vowels' },
          { text: 'L002 Verb Groups and ます', link: '/06-lessons/L002-verb-groups-and-masu' },
          { text: 'L003 たいです', link: '/06-lessons/L003-desire-tai-desu' }
        ]
      },
      {
        text: '07 Milestones',
        collapsed: true,
        items: [{ text: 'N5 Milestone', link: '/07-milestones/n5' }, { text: 'N4 Milestone', link: '/07-milestones/n4' }, { text: 'N5 Final Assessment Plan', link: '/06-lessons/n5-final-assessment' }]
      },
      { text: '08 Assessment', collapsed: true, items: [{ text: 'N5 Practice Test', link: '/08-assessment/' }, { text: 'N4 Practice Test', link: '/08-assessment/n4' }] },
      { text: '09 Lexicon', collapsed: true, items: [{ text: 'Vocabulary & Kanji', link: '/09-lexicon/' }] },
      {
        text: '05 Resources',
        collapsed: false,
        items: [{ text: 'Learning Tools', link: '/05-resources/' }]
      }
    ],
    outline: { level: [2, 3], label: 'On this page' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Hubery0203/Japanese-Learning-OS' }],
    footer: {
      message: 'Built with VitePress for systematic Japanese learning.',
      copyright: 'Content designed for learners from kana through JLPT N4.'
    }
  }
})
