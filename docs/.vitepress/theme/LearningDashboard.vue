<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import catalog from '../../../Data/lessons.json'
import progressSource from '../../../Data/progress.json'
import queueSource from '../../../Data/srs_queue.json'
import vocabulary from '../../../Data/vocabulary.json'
import kanji from '../../../Data/kanji.json'
import { scheduleReview } from '../../../scripts/srs-core.mjs'

type Review = { id: string; target: string; prompt: string; expected_pattern: string; priority: number; due: string; scheduling?: { interval_index: number; repetitions: number; lapses: number; last_quality: number; last_reviewed: string } }
type StudyEvent = { type: 'lesson' | 'review' | 'assessment'; date: string; id: string; quality?: number; correct?: boolean | number; total?: number; prompt?: string; response?: string }
type State = { completed: string[]; queue: Review[]; events: StudyEvent[] }
const storageKey = 'japanese-learning-os:v2'
const defaults = (): State => ({ completed: [], queue: structuredClone(queueSource.review_queue) as Review[], events: [] })
const state = ref<State>(defaults())
const selected = ref<Review | null>(null)
const answer = ref('')
const feedback = ref('')
const importInput = ref<HTMLInputElement>()
const today = new Date().toISOString().slice(0, 10)
const lessons = catalog.lessons as Array<{id:string;title:string;path:string;prerequisites:string[];level:string}>
const n4Lessons = computed(() => lessons.filter(lesson => lesson.level === 'N4'))
const due = computed(() => state.value.queue.filter(item => item.due === 'next_session' || item.due <= today))
const completion = computed(() => Math.round(state.value.completed.length / lessons.length * 100))
const weekEvents = computed(() => state.value.events.filter(event => { const age = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${event.date}T00:00:00Z`)) / 86400000; return age >= 0 && age < 7 }))
const reviewsThisWeek = computed(() => weekEvents.value.filter(event => event.type === 'review'))
const accuracy = computed(() => reviewsThisWeek.value.length ? Math.round(reviewsThisWeek.value.filter(event => event.correct).length / reviewsThisWeek.value.length * 100) : null)
const completedLessons = computed(() => state.value.completed.length)
const n4Completed = computed(() => n4Lessons.value.filter(lesson => state.value.completed.includes(lesson.id)).length)
const latestAssessment = computed(() => [...state.value.events].reverse().find(event => event.type === 'assessment'))
onMounted(() => {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return
    const parsed = JSON.parse(saved) as Partial<State>
    const validIds = new Set(lessons.map(item => item.id))
    state.value = { completed: (parsed.completed ?? []).filter(id => validIds.has(id)), queue: Array.isArray(parsed.queue) ? parsed.queue : defaults().queue, events: Array.isArray(parsed.events) ? parsed.events : [] }
  } catch { state.value = defaults() }
})
function persist() { localStorage.setItem(storageKey, JSON.stringify(state.value)); }
function startReview() { selected.value = due.value[0] ?? null; answer.value = ''; feedback.value = '' }
function checkAnswer() { if (!selected.value || !answer.value.trim()) return; feedback.value = `参考答案：${selected.value.expected_pattern}` }
function grade(quality: number) {
  if (!selected.value) return
  const item = selected.value
  const result = scheduleReview(item, quality, today, queueSource.schedule_intervals_days)
  Object.assign(item, result)
  state.value.events.push({ type: 'review', date: today, id: item.id, quality, correct: quality >= 3, prompt: item.prompt, response: answer.value.trim() })
  persist(); startReview()
}
function canComplete(lesson: typeof lessons[number]) { return lesson.prerequisites.every(id => state.value.completed.includes(id)) }
function exportData() {
  const blob = new Blob([JSON.stringify({ format: 'Japanese-Learning-OS-local-state', version: 2, exported_at: new Date().toISOString(), ...state.value }, null, 2)], { type: 'application/json' })
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `japanese-learning-state-${today}.json`; link.click(); URL.revokeObjectURL(link.href)
}
function importData(event: globalThis.Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result)); const valid = new Set(lessons.map(item => item.id))
      if (!Array.isArray(parsed.completed) || !Array.isArray(parsed.queue) || !Array.isArray(parsed.events)) throw new Error('格式错误')
      state.value = { completed: parsed.completed.filter((id: string) => valid.has(id)), queue: parsed.queue, events: parsed.events }; persist(); selected.value = null; feedback.value = '学习数据已导入。'
    } catch { feedback.value = '文件无效或格式不兼容，未导入。' }
  }
  reader.readAsText(file); (event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <section class="learning-dashboard">
    <div class="dashboard-heading"><div><p class="eyebrow">YOUR STUDY SPACE</p><h2>今日学习</h2></div><span class="progress-pill">{{ completion }}% 当前课程完成</span></div>
    <div class="metric-row"><span>课程总进度 {{ completedLessons }}/{{ lessons.length }}</span><span>N4 课程 {{ n4Completed }}/{{ n4Lessons.length }}</span><span>词汇条目 {{ vocabulary.items.length }}/{{ vocabulary.target_count }}</span><span>汉字条目 {{ kanji.items.length }}/{{ kanji.target_count }}</span><span>本周复习 {{ reviewsThisWeek.length }} 次</span><span>本周复习达标率 {{ accuracy === null ? '暂无数据' : `${accuracy}%` }}</span><span>历史汇总：{{ progressSource.completed_lessons }} 课（未计入当前课程）</span></div>
    <div class="dashboard-grid">
      <article class="dashboard-card">
        <div class="card-top"><span class="card-icon">復</span><span class="count">{{ due.length }}</span></div><h3>到期复习</h3><p>先回忆，再查看答案。自评 0–5 分会安排下一次复习。</p>
        <button class="primary-button" @click="startReview">{{ selected ? '换一题' : '开始复习' }}</button>
        <div v-if="selected" class="review-panel"><strong>{{ selected.target }}</strong><p>{{ selected.prompt }}</p><textarea v-model="answer" placeholder="先尝试输入日语答案" rows="3" /><button class="secondary-button" @click="checkAnswer">查看参考答案</button><p v-if="feedback" class="feedback">{{ feedback }}</p><div v-if="feedback" class="grade-row"><button v-for="score in [0,1,2,3,4,5]" :key="score" @click="grade(score)">{{ score }}</button></div></div>
        <p v-if="!due.length" class="local-note">当前没有到期复习。</p>
      </article>
      <article class="dashboard-card"><div class="card-top"><span class="card-icon">学</span><span class="count">{{ lessons.length - completedLessons }}</span></div><h3>课程路径</h3><ul class="lesson-list"><li v-for="lesson in lessons" :key="lesson.id"><a :href="`/${lesson.path.replace(/^docs\//, '').replace(/\.md$/, '')}`">{{ lesson.title }}</a><span v-if="state.completed.includes(lesson.id)" class="done-label">已完成</span><span v-else class="pending-label">{{ canComplete(lesson) ? '待学习' : '有先修课' }}</span></li></ul></article>
      <article class="dashboard-card"><span class="eyebrow">WEEKLY REPORT</span><h3>本周学习</h3><p>课程完成 {{ weekEvents.filter(e => e.type === 'lesson').length }} 次，复习 {{ reviewsThisWeek.length }} 次。</p><p>复习自评达标率：{{ accuracy === null ? '暂无记录' : `${accuracy}%` }}</p><p>待复习：{{ due.length }} 项</p><p v-if="latestAssessment">最近{{ latestAssessment.id.startsWith('n4_') ? 'N4' : 'N5' }}自测：{{ latestAssessment.correct }}/{{ latestAssessment.total }}</p><a :href="`/08-assessment/`">参加 N5 / N4 自测 →</a></article>
    </div>
    <div class="data-actions"><button class="secondary-button" @click="exportData">导出学习数据</button><button class="secondary-button" @click="importInput?.click()">导入学习数据</button><input ref="importInput" type="file" accept="application/json" hidden @change="importData" /></div>
    <p class="local-note">数据保存在当前浏览器。跨设备使用时请手动导出并导入 JSON 文件；尚未连接账号或云同步。</p>
    <p v-if="feedback && !selected" class="feedback">{{ feedback }}</p>
  </section>
</template>
