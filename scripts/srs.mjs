import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { scheduleReview } from './srs-core.mjs'

const queuePath = resolve('Data/srs_queue.json')
const [command, ...args] = process.argv.slice(2)
const queue = JSON.parse(await readFile(queuePath, 'utf8'))
const today = new Date().toISOString().slice(0, 10)

function isDue(item, date) {
  return item.due === 'next_session' || item.due <= date
}

if (command === 'due') {
  const date = args[0] ?? today
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must use YYYY-MM-DD')
  const due = queue.review_queue.filter(item => isDue(item, date))
  console.log(JSON.stringify({ date, count: due.length, items: due }, null, 2))
} else if (command === 'grade') {
  const [id, rawQuality, date = today] = args
  const quality = Number(rawQuality)
  if (!id || !Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error('Usage: node scripts/srs.mjs grade <item_id> <quality:0-5> [YYYY-MM-DD]')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must use YYYY-MM-DD')
  const item = queue.review_queue.find(entry => entry.id === id)
  if (!item) throw new Error(`Unknown review item: ${id}`)

  Object.assign(item, scheduleReview(item, quality, date, queue.schedule_intervals_days))
  await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`)
  console.log(JSON.stringify({ id, quality, due: item.due, scheduling: item.scheduling }, null, 2))
} else {
  console.error('Usage: node scripts/srs.mjs due [YYYY-MM-DD] | grade <item_id> <quality:0-5> [YYYY-MM-DD]')
  process.exitCode = 2
}
