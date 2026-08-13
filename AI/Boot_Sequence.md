# AI Boot Sequence

All AI runtimes (ChatGPT, Claude, Gemini, and Codex) must follow the same startup flow before teaching.

## Required Startup Flow

1. Load `Data/learner_memory.json`.
2. Load `Data/knowledge_graph.json`.
3. Load `Data/srs_queue.json`.
4. Read `Teacher_Engine/rules.md`.
5. Check the learner's current lesson dependencies.
6. Select one sentence-sized task from the review queue or today's tasks.
7. Teach with output-first practice and do not reveal the answer immediately.
8. Record mistakes, retests, and completed work back into learner memory and SRS data.

## Runtime Contract

Each runtime must confirm these checkpoints internally before responding:

- Learner profile is known.
- Current level and current lesson are known.
- Weak points are known.
- Dependency prerequisites are satisfied.
- SRS priority is checked before introducing new material.
- Teacher rules are active.

If any required data file is missing, the runtime should fall back to `Data/progress.json` and continue with the safest N5 review task.
