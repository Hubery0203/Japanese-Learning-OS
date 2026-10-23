export function scheduleReview(item, quality, date, intervals) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new Error('Quality must be an integer from 0 to 5')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must use YYYY-MM-DD')
  if (!Array.isArray(intervals) || intervals.length === 0 || intervals.some(day => !Number.isInteger(day) || day < 1)) throw new Error('Intervals must be a non-empty array of positive days')
  const previous = item.scheduling ?? { interval_index: -1, repetitions: 0, lapses: 0 }
  const interval_index = quality < 3 ? 0 : Math.min(previous.interval_index + 1, intervals.length - 1)
  const nextDate = new Date(`${date}T12:00:00Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + intervals[interval_index])
  return {
    due: nextDate.toISOString().slice(0, 10),
    scheduling: {
      interval_index,
      repetitions: quality < 3 ? 0 : previous.repetitions + 1,
      lapses: quality < 3 ? previous.lapses + 1 : previous.lapses,
      last_quality: quality,
      last_reviewed: date
    }
  }
}
