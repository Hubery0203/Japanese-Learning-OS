# Japanese Learning OS Manifest

## Purpose

This repository is Hubery's Japanese learning system: a VitePress knowledge site plus structured learner state and AI-guided study conventions. The long-term learning goal is JLPT N1, progressing through N5, N4, N3, N2, and N1. The repository is not yet a standalone interactive application.

## Start here

1. Read this manifest.
2. Read `Teacher_Engine/rules.md` before conducting a lesson.
3. Read `Data/learner_memory.json` for learner preferences and current weaknesses.
4. Read `Data/progress.json` for current position and links to canonical state files.
5. Read `Data/srs_queue.json` for reviews due in the current session.
6. Read `Data/lessons.json` to find lesson files and their prerequisites.
7. Use `Data/knowledge_graph.json` to check knowledge-point prerequisites before introducing a target.
8. After a lesson, update the relevant canonical state file and add a dated learning record under `Reviews/`.

## Sources of truth

- Learning material: `docs/` (VitePress source). Do not duplicate it under version-named folders.
- Learner profile, preferences, weaknesses, and learning history: `Data/learner_memory.json`.
- Current course position and high-level completion: `Data/progress.json`.
- Scheduled review items: `Data/srs_queue.json`.
- Knowledge dependencies: `Data/knowledge_graph.json`.
- Lesson IDs and file mapping: `Data/lessons.json`.
- Teaching behavior: `Teacher_Engine/rules.md`.
- Human-readable session records: `Reviews/`.
- Website configuration: `.vitepress/`; build and deployment configuration: `package.json` and `.github/workflows/`.

Dashboard and analytics files are derived views. They must not become a second writable source of learner state. Git history tracks repository versions; release tags identify published versions. Never make version-named copies of the project inside the repository.

## Conventions

- Stable IDs use lowercase ASCII `category_NNN` (for example, `grammar_042`, `conversation_012`, `srs_node_001`). IDs are permanent; changing a label does not change its ID.
- JSON is UTF-8, two-space indented, and must parse strictly. Dates use ISO `YYYY-MM-DD`; timestamps, when needed, use ISO 8601 with timezone.
- Use explicit references between records. Do not rely on array position or display labels as identifiers.
- Course content belongs in `docs/`; learner-specific state belongs in `Data/` and dated records in `Reviews/`.
- Preserve existing learner data when changing schemas. Document migrations and increment the data `version` when the shape changes.
- AI teachers must follow the correction and teaching sequence in `Teacher_Engine/rules.md` and must not silently invent or overwrite learner-state facts.

## Current scope and boundaries

The current site is a static VitePress website. `Data/*.json` and Markdown records are repository data, not a live multi-user database. Do not describe login, cloud sync, automatic analytics, or interactive SRS as implemented until application code provides those capabilities.

## Change checklist

Before changing course or data structures, update the relevant schema and examples. Check that IDs and references remain valid, that the VitePress build still uses `docs/`, and that derived views point back to canonical data rather than duplicating it.
