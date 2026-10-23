import DefaultTheme from 'vitepress/theme'
import './style.css'
import LearningDashboard from './LearningDashboard.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('LearningDashboard', LearningDashboard)
  }
}
