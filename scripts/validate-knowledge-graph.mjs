import { access, readFile } from 'node:fs/promises'

const graphPath = new URL('../Data/knowledge_graph.json', import.meta.url)
const catalogPath = new URL('../Data/lessons.json', import.meta.url)
const queuePath = new URL('../Data/srs_queue.json', import.meta.url)
const assessmentPaths = [
  ['N5', new URL('../Data/n5_assessment.json', import.meta.url)],
  ['N4', new URL('../Data/n4_assessment.json', import.meta.url)]
]
const vocabularyPath = new URL('../Data/vocabulary.json', import.meta.url)
const kanjiPath = new URL('../Data/kanji.json', import.meta.url)
const graph = JSON.parse(await readFile(graphPath, 'utf8'))
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const queue = JSON.parse(await readFile(queuePath, 'utf8'))
const assessments = await Promise.all(assessmentPaths.map(async ([level, path]) => [level, JSON.parse(await readFile(path, 'utf8'))]))
const vocabulary = JSON.parse(await readFile(vocabularyPath, 'utf8'))
const kanji = JSON.parse(await readFile(kanjiPath, 'utf8'))
const errors = []
const nodes = new Map()

for (const node of graph.nodes ?? []) {
  if (!/^[a-z][a-z0-9]*_[0-9]{3}$/.test(node.id ?? '')) {
    errors.push(`Invalid node ID: ${node.id}`)
  }
  if (nodes.has(node.id)) errors.push(`Duplicate node ID: ${node.id}`)
  else nodes.set(node.id, node)
}

for (const node of nodes.values()) {
  for (const dependency of node.depends_on ?? []) {
    if (!nodes.has(dependency)) errors.push(`${node.id} references missing prerequisite ${dependency}`)
  }
}

const lessonIds = new Set()
for (const lesson of catalog.lessons ?? []) {
  if (!/^lesson_[0-9]{3}$/.test(lesson.id ?? '')) errors.push(`Invalid lesson ID: ${lesson.id}`)
  if (lessonIds.has(lesson.id)) errors.push(`Duplicate lesson ID: ${lesson.id}`)
  lessonIds.add(lesson.id)
  const graphNode = nodes.get(lesson.id)
  if (!graphNode || graphNode.type !== 'lesson') errors.push(`${lesson.id} is missing as a lesson node in the knowledge graph`)
  for (const nodeId of lesson.knowledge_nodes ?? []) {
    if (!nodes.has(nodeId)) errors.push(`${lesson.id} references missing knowledge node ${nodeId}`)
  }
  for (const prerequisite of lesson.prerequisites ?? []) {
    if (!lessonIds.has(prerequisite) && !(catalog.lessons ?? []).some(item => item.id === prerequisite)) {
      errors.push(`${lesson.id} references missing prerequisite lesson ${prerequisite}`)
    }
  }
  try {
    await access(new URL(`../${lesson.path}`, import.meta.url))
  } catch {
    errors.push(`${lesson.id} points to missing file ${lesson.path}`)
  }
}

const reviewIds = new Set()
for (const item of queue.review_queue ?? []) {
  if (!/^[a-z][a-z0-9]*_[0-9]{3}$/.test(item.id ?? '')) errors.push(`Invalid SRS item ID: ${item.id}`)
  if (reviewIds.has(item.id)) errors.push(`Duplicate SRS item ID: ${item.id}`)
  reviewIds.add(item.id)
  if (item.due !== 'next_session' && !/^\d{4}-\d{2}-\d{2}$/.test(item.due ?? '')) errors.push(`${item.id} has invalid due date ${item.due}`)
  if (item.scheduling && (item.scheduling.interval_index < 0 || item.scheduling.interval_index >= queue.schedule_intervals_days.length)) {
    errors.push(`${item.id} has an interval index outside the configured schedule`)
  }
  if (typeof item.target !== 'string' || !item.target) errors.push(`${item.id} has no target`)
  if (typeof item.prompt !== 'string' || !item.prompt) errors.push(`${item.id} has no prompt`)
}

for (const [name, list, key] of [['vocabulary', vocabulary.items, 'word'], ['kanji', kanji.items, 'character']]) {
  const ids = new Set()
  const values = new Set()
  for (const item of list ?? []) {
    if (!/^[a-z]+_[0-9]{3}$/.test(item.id ?? '')) errors.push(`Invalid ${name} ID: ${item.id}`)
    if (ids.has(item.id)) errors.push(`Duplicate ${name} ID: ${item.id}`)
    if (values.has(item[key])) errors.push(`Duplicate ${name} value: ${item[key]}`)
    ids.add(item.id); values.add(item[key])
  }
}

const targetSets = {
  grammar: new Set([...nodes.keys()].filter(id => id.startsWith('grammar_') || id.startsWith('grammarcard_') || id.startsWith('verb') || lessonIds.has(id))),
  vocabulary: new Set((vocabulary.items ?? []).map(item => item.id)),
  kanji: new Set((kanji.items ?? []).map(item => item.id)),
  reading: new Set([...nodes.keys()]),
  lesson: new Set(lessonIds)
}
for (const [level, assessment] of assessments) {
  const questionIds = new Set()
  for (const question of assessment.questions ?? []) {
    if (!/^q_[0-9]{3}$/.test(question.id ?? '')) errors.push(`Invalid ${level} assessment question ID: ${question.id}`)
    if (questionIds.has(question.id)) errors.push(`Duplicate ${level} assessment question ID: ${question.id}`)
    questionIds.add(question.id)
    if (!targetSets[question.category]?.has(question.target)) errors.push(`${level} ${question.id} has invalid ${question.category} target ${question.target}`)
    if (!Array.isArray(question.choices) || question.choices.length < 2 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.choices.length) errors.push(`${level} ${question.id} has an invalid answer key`)
    if (!question.prompt || !question.explanation) errors.push(`${level} ${question.id} is missing its prompt or explanation`)
  }
}

const visiting = new Set()
const visited = new Set()
function visit(id, chain = []) {
  if (visiting.has(id)) {
    errors.push(`Dependency cycle: ${[...chain, id].join(' -> ')}`)
    return
  }
  if (visited.has(id)) return
  visiting.add(id)
  for (const dependency of nodes.get(id)?.depends_on ?? []) {
    if (nodes.has(dependency)) visit(dependency, [...chain, id])
  }
  visiting.delete(id)
  visited.add(id)
}
for (const id of nodes.keys()) visit(id)

if (errors.length) {
  console.error(`Knowledge graph validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Knowledge graph valid: ${nodes.size} unique nodes, all prerequisites resolve, no cycles.`)
}
