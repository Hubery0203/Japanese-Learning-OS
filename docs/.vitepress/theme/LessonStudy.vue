<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { withBase } from 'vitepress'
import lessons from '../../../Data/lessons.json'
import queueSource from '../../../Data/srs_queue.json'
import { scheduleReview } from '../../../scripts/srs-core.mjs'

const props = defineProps<{ lessonId: string }>()
const exercises: Record<string, { prompt: string; expected: string; target: string }> = {
  lesson_001: { prompt: '朗读并数拍：がっこう', expected: 'が・っ・こ・う，共四拍。', target: 'mora_001' },
  lesson_002: { prompt: '把「帰る」变成ます形。', expected: '帰ります。', target: 'verbmasu_001' },
  lesson_003: { prompt: '用「たいです」说“我想吃寿司”。', expected: '寿司を食べたいです。', target: 'grammar_034' },
  lesson_004: { prompt: '说“这里不能拍照”。', expected: 'ここで写真を撮ってはいけません。', target: 'grammarcard_001' },
  lesson_005: { prompt: '说“明天不用早来”。', expected: '明日は早く来なくてもいいです。', target: 'grammarcard_002' },
  lesson_006: { prompt: '建议对方早点休息。', expected: '早く休んだほうがいいです。', target: 'grammarcard_003' },
  lesson_007: { prompt: '说“我变得能读汉字了”。', expected: '漢字が読めるようになりました。', target: 'grammarcard_004' },
  lesson_008: { prompt: '说“我决定每天写日记”。', expected: '毎日日記を書くことにしました。', target: 'grammarcard_005' },
  lesson_009: { prompt: '说“为了进大学，我每天学习”。', expected: '大学に入るために、毎日勉強しています。', target: 'grammarcard_006' },
  lesson_010: { prompt: '说“吃完早餐后去学校”。', expected: '朝ごはんを食べてから、学校へ行きます。', target: 'grammarcard_007' },
  lesson_011: { prompt: '说“周末看看书、散散步之类”。', expected: '週末は本を読んだり、散歩したりします。', target: 'grammarcard_008' },
  lesson_012: { prompt: '说“下午可能会下雨”。', expected: '午後から雨が降るかもしれません。', target: 'grammarcard_009' },
  lesson_013: { prompt: '说“我认为日语发音很重要”。', expected: '日本語の発音は大切だと思います。', target: 'grammarcard_010' },
  lesson_014: { prompt: '说“一边听音乐一边背单词”。', expected: '音楽を聞きながら、単語を覚えます。', target: 'grammarcard_011' },
  lesson_015: { prompt: '说“这个蛋糕看起来很好吃”。', expected: 'このケーキはおいしそうです。', target: 'grammarcard_012' },
  lesson_016: { prompt: '问对方“你去过京都吗？”，并给出肯定回答。', expected: '京都へ行ったことがありますか。はい、あります。', target: 'grammarcard_013' },
  lesson_017: { prompt: '说“我想试着穿这件衣服”。', expected: 'この服を着てみたいです。', target: 'grammarcard_014' },
  lesson_018: { prompt: '说“为了旅行，先订好酒店”。', expected: '旅行のために、ホテルを予約しておきます。', target: 'grammarcard_015' },
  lesson_019: { prompt: '说“我不小心忘带钱包了”。', expected: '財布を忘れてしまいました。', target: 'grammarcard_016' },
  lesson_020: { prompt: '说“我已经决定下个月去大阪工作（外部安排）”。', expected: '来月から大阪で働くことになりました。', target: 'grammarcard_017' },
  lesson_021: { prompt: '说“明天必须早起”。', expected: '明日は早く起きなければなりません。', target: 'grammarcard_018' },
  lesson_022: { prompt: '说“我打算周末做饭”。', expected: '週末に料理をしようと思っています。', target: 'grammarcard_019' },
  lesson_023: { prompt: '解释“因为电车停运了，所以迟到了”。', expected: '電車が止まったんです。', target: 'grammarcard_020' },
  lesson_024: { prompt: '说“我不知道他来不来”。', expected: '彼が来るかどうか分かりません。', target: 'grammarcard_021' },
  lesson_025: { prompt: '说“妈妈购物期间，我把房间打扫了”（期间内完成）。', expected: '母が買い物に行っている間に、部屋を掃除しました。', target: 'grammarcard_022' },
  lesson_026: { prompt: '转述天气预报：“听说明天会下雨”。', expected: '天気予報によると、明日は雨が降るそうです。', target: 'grammarcard_023' },
  lesson_027: { prompt: '说“听说那家店的拉面很好吃”。', expected: 'あの店のラーメンはおいしいらしいです。', target: 'grammarcard_024' }
}

const lessonIndex = lessons.lessons.findIndex(item => item.id === props.lessonId)
const lesson = lessons.lessons[lessonIndex]
const exercise = computed(() => exercises[props.lessonId])
const lessonNumber = String(lessonIndex + 1).padStart(2, '0')
const progress = Math.round((lessonIndex + 1) / lessons.lessons.length * 100)
const nextLesson = lessons.lessons[lessonIndex + 1]
const nextLessonUrl = nextLesson ? withBase(`/${nextLesson.path.replace(/^docs\//, '').replace(/\.md$/, '')}`) : withBase('/06-lessons/')
const prerequisitesMet = computed(() => (lesson?.prerequisites ?? []).every(id => (stateNow().completed ?? []).includes(id)))
const response = ref('')
const phase = ref<'answer' | 'reveal' | 'complete'>('answer')
const quality = ref<number | null>(null)
const resultMessage = ref('')
const focusMode = ref(false)
const date = new Date().toISOString().slice(0, 10)

function stateNow() {
  try {
    const raw = localStorage.getItem('japanese-learning-os:v2')
    return raw ? JSON.parse(raw) : { completed: [], queue: structuredClone(queueSource.review_queue), events: [] }
  } catch {
    return { completed: [], queue: structuredClone(queueSource.review_queue), events: [] }
  }
}

function toggleFocus() {
  focusMode.value = !focusMode.value
  document.documentElement.classList.toggle('lesson-focus', focusMode.value)
}

function resetFocus() {
  document.documentElement.classList.remove('lesson-focus')
}

onBeforeUnmount(resetFocus)

function revealAnswer() {
  if (response.value.trim() && prerequisitesMet.value) phase.value = 'reveal'
}

function grade(score: number) {
  if (phase.value !== 'reveal' || !exercise.value) return
  const state = stateNow()
  state.events ??= []
  state.queue ??= structuredClone(queueSource.review_queue)
  state.completed ??= []
  const itemId = `srslesson_${props.lessonId.slice(-3)}`
  let item = state.queue.find((entry: { id: string }) => entry.id === itemId)
  if (!item) {
    item = { id: itemId, target: lesson?.title ?? props.lessonId, prompt: exercise.value.prompt, expected_pattern: exercise.value.expected, priority: score < 3 ? 5 : 3, due: 'next_session' }
    state.queue.push(item)
  }
  Object.assign(item, scheduleReview(item, score, date, queueSource.schedule_intervals_days))
  state.events.push({ type: 'lesson', date, id: props.lessonId, quality: score, correct: score >= 4, prompt: exercise.value.prompt, response: response.value.trim() })
  if (score >= 4 && !state.completed.includes(props.lessonId)) state.completed.push(props.lessonId)
  localStorage.setItem('japanese-learning-os:v2', JSON.stringify(state))
  quality.value = score
  resultMessage.value = score >= 4 ? '本课已完成，复习已安排。' : '练习已记录，之后会再次复习。'
  phase.value = 'complete'
}

function tryAgain() {
  response.value = ''
  quality.value = null
  resultMessage.value = ''
  phase.value = 'answer'
}
</script>

<template>
  <section v-if="exercise" class="lesson-study" :class="{ 'is-focus': focusMode }">
    <div v-if="focusMode" class="focus-exit-bar">
      <span><span class="focus-dot"></span> 专注学习 · {{ lesson?.level }} / {{ lessonNumber }}</span>
      <button type="button" @click="toggleFocus">退出专注</button>
    </div>

    <header class="lesson-study-header">
      <div>
        <p class="eyebrow">{{ lesson?.level }} · LESSON {{ lessonNumber }} / {{ lessons.lessons.length }}</p>
        <h2>完成本课练习</h2>
        <p class="study-subtitle">先独立回忆，再查看参考答案。大约需要 2 分钟。</p>
      </div>
      <button v-if="!focusMode" class="focus-button" type="button" @click="toggleFocus" aria-label="进入专注学习模式">
        <span aria-hidden="true">⛶</span> 专注学习
      </button>
    </header>

    <div class="lesson-progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" :aria-label="`课程进度 ${progress}%`">
      <span :style="{ width: `${progress}%` }"></span>
    </div>

    <div class="study-steps" aria-label="练习步骤">
      <span :class="{ active: phase === 'answer', done: phase !== 'answer' }"><b>1</b> 回忆</span>
      <i></i>
      <span :class="{ active: phase === 'reveal', done: phase === 'complete' }"><b>2</b> 对照</span>
      <i></i>
      <span :class="{ active: phase === 'complete' }"><b>3</b> 自评</span>
    </div>

    <div v-if="!prerequisitesMet" class="prerequisite-note">
      <span class="note-icon">順</span>
      <div><strong>先完成前置课程</strong><p>完成课程路径中的上一课后，这里会解锁。</p></div>
    </div>

    <template v-else>
      <div v-if="phase !== 'complete'" class="prompt-card">
        <span class="prompt-label">TRY IT</span>
        <p class="prompt-text">{{ exercise.prompt }}</p>
        <label class="answer-label" :for="`answer-${lessonNumber}`">用日语写下你的答案</label>
        <textarea :id="`answer-${lessonNumber}`" v-model="response" rows="3" :disabled="phase === 'reveal'" placeholder="不确定也先试着写……" @keydown.meta.enter.prevent="revealAnswer" @keydown.ctrl.enter.prevent="revealAnswer" />
        <div class="prompt-actions">
          <span class="keyboard-hint">⌘ / Ctrl + Enter 检查</span>
          <button v-if="phase === 'answer'" class="primary-button study-submit" :disabled="!response.trim()" @click="revealAnswer">检查答案 <span aria-hidden="true">→</span></button>
          <button v-else class="secondary-button" @click="tryAgain">重新作答</button>
        </div>
      </div>

      <div v-if="phase === 'reveal'" class="answer-reveal" aria-live="polite">
        <div class="answer-reveal-heading"><span>参考答案</span><span>与你的答案对照</span></div>
        <p lang="ja">{{ exercise.expected }}</p>
        <div class="self-grade">
          <div><strong>你答得怎么样？</strong><span>按提示多少和准确度自评</span></div>
          <div class="grade-row"><button v-for="score in [0, 1, 2, 3, 4, 5]" :key="score" :aria-label="`自评 ${score} 分`" @click="grade(score)">{{ score }}</button></div>
          <div class="grade-scale"><span>完全没想起</span><span>准确且无需提示</span></div>
        </div>
      </div>

      <div v-if="phase === 'complete'" class="completion-card" aria-live="polite">
        <span class="completion-mark" aria-hidden="true">{{ quality !== null && quality >= 4 ? '✓' : '復' }}</span>
        <div><p class="eyebrow">SESSION SAVED</p><h3>{{ resultMessage }}</h3><p>自评 {{ quality }}/5 · 已加入间隔复习</p></div>
        <div class="completion-actions">
          <button class="secondary-button" @click="tryAgain">再练一次</button>
          <a class="primary-button study-submit" :href="nextLessonUrl">{{ nextLesson ? '继续下一课' : '返回课程目录' }} <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </template>

    <footer class="lesson-study-footer">
      <span>学习记录保存在当前浏览器</span>
      <a :href="withBase('/06-lessons/')">全部课程</a>
    </footer>
  </section>
</template>
