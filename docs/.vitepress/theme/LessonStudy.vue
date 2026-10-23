<script setup lang="ts">
import { computed, ref } from 'vue'
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
const exercise = computed(() => exercises[props.lessonId])
const lesson = lessons.lessons.find(item => item.id === props.lessonId)
const prerequisitesMet = computed(() => (lesson?.prerequisites ?? []).every(id => (stateNow().completed ?? []).includes(id)))
const response = ref('')
const revealed = ref(false)
const result = ref('')
const date = new Date().toISOString().slice(0, 10)
function stateNow() {
  const raw = localStorage.getItem('japanese-learning-os:v2')
  return raw ? JSON.parse(raw) : { completed: [], queue: structuredClone(queueSource.review_queue), events: [] }
}
function submit() { if (response.value.trim()) revealed.value = true }
function grade(quality: number) {
  if (!revealed.value || !exercise.value) return
  const state = stateNow()
  state.events ??= []; state.queue ??= []; state.completed ??= []
  const row = lessons.lessons.find(lesson => lesson.id === props.lessonId)
  const id = `srslesson_${props.lessonId.slice(-3)}`
  let item = state.queue.find((entry: {id:string}) => entry.id === id)
  if (!item) { item = { id, target: row?.title ?? props.lessonId, prompt: exercise.value.prompt, expected_pattern: exercise.value.expected, priority: quality < 3 ? 5 : 3, due: 'next_session' }; state.queue.push(item) }
  Object.assign(item, scheduleReview(item, quality, date, queueSource.schedule_intervals_days))
  state.events.push({ type: 'lesson', date, id: props.lessonId, quality, correct: quality >= 4, prompt: exercise.value.prompt, response: response.value.trim() })
  if (quality >= 4 && !state.completed.includes(props.lessonId)) state.completed.push(props.lessonId)
  localStorage.setItem('japanese-learning-os:v2', JSON.stringify(state))
  result.value = quality >= 4 ? '已记录为完成，并安排后续复习。' : '已记录本次练习，并加入复习计划。'
  revealed.value = false; response.value = ''
}
</script>

<template>
  <section v-if="exercise" class="lesson-study">
    <p class="eyebrow">TRY IT YOURSELF</p><h2>本课练习</h2>
    <p v-if="!prerequisitesMet" class="local-note">请先完成前置课程，再开始本课练习。</p>
    <template v-else><p>{{ exercise.prompt }}</p>
    <textarea v-model="response" rows="3" placeholder="先独立作答，再检查参考答案" />
    <button class="primary-button" :disabled="!response.trim()" @click="submit">检查答案</button></template>
    <div v-if="revealed" class="feedback"><strong>参考答案：</strong>{{ exercise.expected }}<p>按独立完成程度自评：0 完全没想起，5 无提示且准确。</p><div class="grade-row"><button v-for="score in [0,1,2,3,4,5]" :key="score" @click="grade(score)">{{ score }}</button></div></div>
    <p v-if="result" class="done-label">{{ result }}</p>
  </section>
</template>
