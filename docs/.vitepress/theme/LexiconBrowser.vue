<script setup lang="ts">
import { computed, ref } from 'vue'
import vocabulary from '../../../Data/vocabulary.json'
import kanji from '../../../Data/kanji.json'

const kind = ref<'vocabulary' | 'kanji'>('vocabulary')
const search = ref('')
const page = ref(1)
const pageSize = 40
const rows = computed(() => {
  const list = kind.value === 'vocabulary' ? vocabulary.items : kanji.items
  const query = search.value.trim().toLocaleLowerCase()
  if (!query) return list
  return list.filter(item => JSON.stringify(item).toLocaleLowerCase().includes(query))
})
const visible = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
function setKind(value: 'vocabulary' | 'kanji') { kind.value = value; page.value = 1 }
</script>

<template>
  <section class="lexicon-browser">
    <div class="lexicon-controls"><button :aria-pressed="kind==='vocabulary'" @click="setKind('vocabulary')">词汇（{{ vocabulary.items.length }}）</button><button :aria-pressed="kind==='kanji'" @click="setKind('kanji')">汉字（{{ kanji.items.length }}）</button><input v-model="search" @input="page=1" placeholder="搜索日文、读音或释义" /></div>
    <p class="local-note">{{ rows.length }} 条结果 · N5 学习候选表，不是官方考试清单。</p>
    <div v-if="kind==='vocabulary'" class="lexicon-list"><article v-for="item in visible" :key="item.id"><strong>{{ item.word }}</strong><span>{{ item.reading }}</span><span>{{ item.meaning_zh || item.meaning_en }}</span><small v-if="item.part_of_speech">{{ item.part_of_speech }}</small></article></div>
    <div v-else class="kanji-grid"><article v-for="item in visible" :key="item.id"><strong>{{ item.character }}</strong><span>{{ item.meaning }}</span><small>音：{{ item.on_reading || '—' }} · 训：{{ item.kun_reading || '—' }}</small></article></div>
    <div class="pagination"><button :disabled="page<=1" @click="page--">上一页</button><span>{{ page }} / {{ pageCount }}</span><button :disabled="page>=pageCount" @click="page++">下一页</button></div>
  </section>
</template>
