import DefaultTheme from 'vitepress/theme'
import './style.css'
import LearningDashboard from './LearningDashboard.vue'
import N5Assessment from './N5Assessment.vue'
import LessonStudy from './LessonStudy.vue'
import LexiconBrowser from './LexiconBrowser.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('LearningDashboard', LearningDashboard)
    app.component('N5Assessment', N5Assessment)
    app.component('LessonStudy', LessonStudy)
    app.component('LexiconBrowser', LexiconBrowser)
  }
}
