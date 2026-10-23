# Data Model

The JSON files in `Data/` are the canonical machine-readable learner state. JSON Schema Draft 2020-12 definitions live in `SYSTEM/schemas/`. Existing files are version `2.1.0`; schemas in this directory describe the current repository shape and do not retroactively rewrite learner history.

## Ownership

| File | Owns | Does not own |
|---|---|---|
| `progress.json` | Current lesson, level, completion summaries, canonical file references | Detailed profile/preferences, review schedule |
| `learner_memory.json` | Learner profile, preferences, focus, weaknesses, session history | Course definitions, authoritative lesson completion counts |
| `srs_queue.json` | Review policy and pending review records | General learning history or course content |
| `knowledge_graph.json` | Stable knowledge nodes and prerequisite edges | Learner mastery state |
| `lessons.json` | Lesson IDs, content paths, level, knowledge-node links, lesson prerequisites | Lesson content or learner completion state |
| `vocabulary.json` | Stable word IDs, reading, Chinese meaning and JLPT label | Learner mastery |
| `kanji.json` | Stable character IDs, meaning and common readings | Learner mastery |
| `n5_assessment.json` | Self-test questions, answer keys, explanations and target IDs | Official JLPT exam content or official score |
| `n4_assessment.json` | N4 practice questions, answer keys, explanations and target IDs | Official JLPT exam content or official score |

## Compatibility and follow-up migration

The current `progress.json` mixes counts with free-text summaries (for example `grammar`, `vocabulary`, `kanji`) and feature flags. The existing `completed_lessons: 25` is preserved as a historical self-reported baseline and is labeled as such; it is not added to the new course completion count. New completions come from actual lesson events in browser state. Treat the remaining free-text fields as legacy summaries, not precise analytics.

The N5 vocabulary and kanji inventories are adapted open datasets with source and license details in `Data/ATTRIBUTION.md`. English glosses are retained when no Chinese gloss exists; the `meaning_en` and `meaning_zh` fields distinguish them.

The initial SRS items use `due: "next_session"`; their first grade converts them to an ISO date. Both the command-line scheduler and website call `scripts/srs-core.mjs` so interval behavior stays consistent.

Materials in the retired version folders were compared before removal. Generic templates and placeholder reports are superseded by current templates and live dashboard summaries. Learner-specific notes and the old N5 target list were carried into `Data/learner_memory.json`, `Reviews/Legacy_Notes.md`, and `docs/07-milestones/n5.md`. The prior final test contained only section names; its scope is retained as a blueprint, not misrepresented as a functioning exam.

Knowledge graph nodes currently use `depends_on`; each dependency is a directed prerequisite edge. All referenced IDs must exist, IDs must be unique, and prerequisite cycles are invalid. `type` and `depends_on` values must be validated against the schema.

## Schema files

- `schemas/progress.schema.json`
- `schemas/learner-memory.schema.json`
- `schemas/srs-queue.schema.json`
- `schemas/knowledge-graph.schema.json`
- `schemas/lessons.schema.json`
- `schemas/lexicon.schema.json` (used by vocabulary and kanji datasets)
- `schemas/assessment.schema.json` (practice assessment question structure)
