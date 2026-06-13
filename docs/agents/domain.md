# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout: Multi-context

This is a personal knowledge base that contains multiple subsystems. Each context has its own `CONTEXT.md` with context-scoped `docs/adr/`.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it maps context names to their `CONTEXT.md` locations. Read each one relevant to the topic you're working on.
- **`docs/adr/`** at the repo root — system-wide architectural decisions.
- **`src/<context>/docs/adr/`** — context-specific decisions that only apply to that subsystem.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md               ← index: maps context names → locations
├── docs/adr/                     ← system-wide decisions
└── src/
    ├── <context-a>/
    │   ├── CONTEXT.md
    │   └── docs/adr/             ← context-A decisions
    └── <context-b>/
        ├── CONTEXT.md
        └── docs/adr/             ← context-B decisions
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (some decision) — but worth reopening because…_
