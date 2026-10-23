# Japanese Learning OS Roadmap

## Current direction

N5 has a local study loop, a candidate vocabulary/kanji inventory, and a practice assessment. N4 is the active learning milestone. The next development increment adds atomic N4 lessons and a level-specific practice test while keeping learner activity local-first.

## N4 implementation sequence

1. **Atomic grammar curriculum:** add independent lessons with stable IDs, prerequisites, practice prompts, model answers, and SRS feedback.
2. **Knowledge graph:** connect each grammar target to its lesson and prerequisite nodes; validate references and cycles.
3. **Practice and assessment:** add N4 self-test questions with explanations and route missed concepts into the review queue.
4. **Progress visibility:** expose N4 completion, lesson links, and both level assessments in the dashboard and site navigation.
5. **Listening and reading:** add short, original graded passages and audio practice after the grammar path is usable; track results in local study events.
6. **Inventory growth:** expand N4 vocabulary and kanji candidates with attribution and structured coverage metadata, without treating any public list as an official JLPT syllabus.

## Delivery rule

Each increment should keep the site buildable, preserve stable IDs, update data documentation, and distinguish study recommendations from official JLPT specifications. The JLPT does not publish a fixed list of vocabulary, kanji, or grammar items; the course sequence is a practical study plan, not an official specification ([JLPT FAQ](https://www.jlpt.jp/e/faq/)).

## Longer-term levels

- N5: foundation and consolidation
- N4: active milestone
- N3: after N4 completion evidence
- N2 and N1: later milestones
