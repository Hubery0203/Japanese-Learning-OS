import { access, readFile } from 'node:fs/promises'

const graphPath = new URL('../Data/knowledge_graph.json', import.meta.url)
const catalogPath = new URL('../Data/lessons.json', import.meta.url)
const graph = JSON.parse(await readFile(graphPath, 'utf8'))
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
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
