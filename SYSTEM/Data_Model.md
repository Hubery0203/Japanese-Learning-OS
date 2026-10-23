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

## Compatibility and follow-up migration

The current `progress.json` mixes counts with free-text summaries (for example `grammar`, `vocabulary`, `kanji`) and feature flags. This is retained in this cleanup to avoid losing data. A later migration should replace those summaries with typed records and derive completion counts from lesson events or explicit lesson IDs. Until then, treat these fields as legacy summary fields, not precise analytics.

The current SRS file uses `due: "next_session"`; future queue records should use an ISO date for calendar scheduling, while retaining an explicit session-relative mode only if the scheduler supports it.

Knowledge graph nodes currently use `depends_on`; each dependency is a directed prerequisite edge. All referenced IDs must exist, IDs must be unique, and prerequisite cycles are invalid. `type` and `depends_on` values must be validated against the schema.

## Schema files

- `schemas/progress.schema.json`
- `schemas/learner-memory.schema.json`
- `schemas/srs-queue.schema.json`
- `schemas/knowledge-graph.schema.json`
- `schemas/lessons.schema.json`
