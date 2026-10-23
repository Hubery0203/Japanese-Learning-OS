<script setup lang="ts">
import { computed, ref } from 'vue'
import n5Assessment from '../../../Data/n5_assessment.json'
import n4Assessment from '../../../Data/n4_assessment.json'
import queueSource from '../../../Data/srs_queue.json'
import { scheduleReview } from '../../../scripts/srs-core.mjs'

const props = defineProps<{ level?: 'N4' | 'N5' }>()
const assessment = computed(() => props.level === 'N4' ? n4Assessment : n5Assessment)
const assessmentEventId = computed(() => `${props.level === 'N4' ? 'n4' : 'n5'}_assessment_001`)
const answers = ref<Record<string, number>>({})
const submitted = ref(false)
const date = new Date().toISOString().slice(0, 10)
const result = computed(() => {
  const questions = assessment.value.questions
  const correct = questions.filter(q => answers.value[q.id] === q.answer)
  const byCategory = ['grammar','vocabulary','kanji','reading'].map(category => {
    const group = questions.filter(q => q.category === category)
    return { category, correct: group.filter(q => answers.value[q.id] === q.answer).length, total: group.length }
  })
  return { correct: correct.length, total: questions.length, byCategory }
})
function submit() {
  submitted.value = true
  const key = 'japanese-learning-os:v2'
  try {
    const state = JSON.parse(localStorage.getItem(key) ?? JSON.stringify({ completed: [], queue: queueSource.review_queue, events: [] }))
    state.events ??= []
    state.events.push({ type: 'assessment', date, id: assessmentEventId.value, correct: result.value.correct, total: result.value.total, byCategory: result.value.byCategory })
    state.queue ??= structuredClone(queueSource.review_queue)
    for (const [index, question] of assessment.value.questions.entries()) {
      if (answers.value[question.id] === question.answer) continue
      const itemId = `srs${props.level === 'N4' ? 'n4' : 'n5'}q_${String(index + 1).padStart(3, '0')}`
      const existingIndex = state.queue.findIndex((item: { id: string }) => item.id === itemId)
      const item = {
        id: itemId,
        target: question.target,
        prompt: question.prompt,
        expected_pattern: question.choices[question.answer],
        priority: 5,
        due: date
      }
      const scheduled = scheduleReview(item, 1, date, queueSource.schedule_intervals_days)
      Object.assign(item, scheduled)
      if (existingIndex >= 0) state.queue[existingIndex] = item
      else state.queue.push(item)
    }
    localStorage.setItem(key, JSON.stringify(state))
  } catch { /* Assessment remains usable even if browser storage is unavailable. */ }
}
function reset() { submitted.value = false; answers.value = {} }
</script>

<template>
  <div class="assessment">
    <form @submit.prevent="submit">
      <article v-for="(question, index) in assessment.questions" :key="question.id" class="question-card">
        <p><strong>{{ index + 1 }}. {{ question.prompt }}</strong></p>
        <label v-for="(choice, choiceIndex) in question.choices" :key="choiceIndex" class="choice-row" :class="{ correct: submitted && choiceIndex === question.answer, incorrect: submitted && answers[question.id] === choiceIndex && choiceIndex !== question.answer }">
          <input v-model.number="answers[question.id]" type="radio" :name="question.id" :value="choiceIndex" :disabled="submitted" /> {{ choice }}
        </label>
        <p v-if="submitted" class="explanation">{{ question.explanation }}</p>
      </article>
      <button v-if="!submitted" class="primary-button" type="submit" :disabled="Object.keys(answers).length !== assessment.questions.length">提交答案（{{ Object.keys(answers).length }}/{{ assessment.questions.length }}）</button>
    </form>
    <section v-if="submitted" class="result-card">
      <h2>{{ assessment.title }}：{{ result.correct }}/{{ result.total }}（{{ Math.round(result.correct / result.total * 100) }}%）</h2>
      <p>这是练习反馈，不是 JLPT 官方分数。</p>
      <ul><li v-for="row in result.byCategory" :key="row.category">{{ row.category }}：{{ row.correct }}/{{ row.total }}</li></ul>
      <button class="secondary-button" @click="reset">重新作答</button>
    </section>
  </div>
</template>
