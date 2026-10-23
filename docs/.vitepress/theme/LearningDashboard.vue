<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import catalog from '../../../Data/lessons.json'
import queueSource from '../../../Data/srs_queue.json'

type Review = { id: string; target: string; prompt: string; expected_pattern: string; priority: number; due: string; scheduling?: { interval_index: number; repetitions: number; lapses: number; last_quality: number; last_reviewed: string } }
type State = { completed: string[]; queue: Review[]; sessions: number }
const storageKey = 'japanese-learning-os:v1'
const state = ref<State>({ completed: [], queue: structuredClone(queueSource.review_queue) as Review[], sessions: 0 })
const selected = ref<Review | null>(null)
const answer = ref('')
const feedback = ref('')
const today = new Date().toISOString().slice(0, 10)
const due = computed(() => state.value.queue.filter(item => item.due === 'next_session' || item.due <= today))
const completion = computed(() => Math.round(state.value.completed.length / catalog.lessons.length * 100))
onMounted(() => {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) state.value = JSON.parse(saved)
  } catch { /* Start with repository defaults if local data is unreadable. */ }
})
function persist() { localStorage.setItem(storageKey, JSON.stringify(state.value)) }
function startReview() { selected.value = due.value[0] ?? null; answer.value = ''; feedback.value = '' }
function checkAnswer() {
  if (!selected.value || !answer.value.trim()) return
  feedback.value = `参考答案：${selected.value.expected_pattern}。请对本次回忆评分（0–5），再选择下方评分。`
}
function grade(quality: number) {
  if (!selected.value) return
  const item = selected.value
  const old = item.scheduling ?? { interval_index: -1, repetitions: 0, lapses: 0, last_quality: quality, last_reviewed: today }
  const intervals: number[] = queueSource.schedule_intervals_days
  const index = quality < 3 ? 0 : Math.min(old.interval_index + 1, intervals.length - 1)
  const next = new Date(`${today}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + intervals[index])
  item.due = next.toISOString().slice(0, 10)
  item.scheduling = { interval_index: index, repetitions: quality < 3 ? 0 : old.repetitions + 1, lapses: quality < 3 ? old.lapses + 1 : old.lapses, last_quality: quality, last_reviewed: today }
  persist(); startReview()
}
function markComplete(id: string) { if (!state.value.completed.includes(id)) state.value.completed.push(id); state.value.sessions++; persist() }
</script>

<template>
  <section class="learning-dashboard">
    <div class="dashboard-heading"><div><p class="eyebrow">YOUR STUDY SPACE</p><h2>今日学习</h2></div><span class="progress-pill">{{ completion }}% 课程完成</span></div>
    <div class="dashboard-grid">
      <article class="dashboard-card review-card">
        <div class="card-top"><span class="card-icon">復</span><span class="count">{{ due.length }}</span></div>
        <h3>到期复习</h3><p>先回忆，再查看参考答案。自评分数会安排下一次复习。</p>
        <button class="primary-button" @click="startReview">{{ selected ? '重新开始' : '开始复习' }}</button>
        <div v-if="selected" class="review-panel">
          <strong>{{ selected.target }}</strong><p>{{ selected.prompt }}</p>
          <textarea v-model="answer" placeholder="输入你的日语答案" rows="3" />
          <button class="secondary-button" @click="checkAnswer">查看参考答案</button>
          <p v-if="feedback" class="feedback">{{ feedback }}</p>
          <div v-if="feedback" class="grade-row"><button v-for="score in [1, 3, 4, 5]" :key="score" @click="grade(score)">{{ score }}</button></div>
        </div>
      </article>
      <article class="dashboard-card">
        <div class="card-top"><span class="card-icon">学</span><span class="count">{{ catalog.lessons.length - state.completed.length }}</span></div>
        <h3>课程</h3><p>按前置知识循序学习，完成后在这里记录。</p>
        <ul class="lesson-list"><li v-for="lesson in catalog.lessons" :key="lesson.id"><a :href="`/${lesson.path.replace(/^docs\//, '').replace(/\.md$/, '')}`">{{ lesson.title }}</a><button v-if="!state.completed.includes(lesson.id)" class="done-button" @click="markComplete(lesson.id)">完成</button><span v-else class="done-label">已完成</span></li></ul>
      </article>
    </div>
    <p class="local-note">学习进度仅保存在此浏览器。当前不会同步回 GitHub 仓库。</p>
  </section>
</template>
