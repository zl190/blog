---
title: "From YAML to SQLite: What, Why, and When"
date: 2026-04-11
tags: [sqlite, yaml, migration, knowledge-management]
description: "A migration guide for when flat files stop scaling in your LLM-agent-maintained knowledge system."
spec: "Flat files break at scale (search, atomicity, schema) — here's the migration pattern | practitioner sharing experience | developers building LLM-agent knowledge systems"
qc: passed
---

# From YAML to SQLite: What, Why, and When

226 tests passed. Production crashed anyway.

I had a task queue backed by YAML files — part of a knowledge system where LLM agents ingest sources, track work, and maintain a fact store. I added two fields to the Task model: `due_date` and `labels`. Every test went green. I deployed. Then I hit a task created before the migration, and `task.labels.length` threw because the field didn't exist on the old object. YAML had loaded the file, handed me a dict missing two keys, and said nothing.

The fix was a `_backfill()` method calling `setdefault()` on every read. Schema-on-read patching. It works until you add a third field, then a fourth, and the backfill function becomes its own maintenance liability.

That crash was the trigger to migrate from YAML to SQLite. Here's what that migration looks like, why I needed it, and when you would too.

## What: schema-on-read to schema-on-write

The migration replaces flat-file storage (YAML, JSON, plain markdown) with SQLite for operational data. Not for everything — my [Obsidian](https://obsidian.md) vault stays markdown. The migration targets data that agents write to frequently: task state, fact storage, search indexes.

The schema moves from implicit to explicit. YAML lets anything through. SQLite declares constraints once:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1
        CHECK (priority >= 0 AND priority <= 3),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','in_progress','completed','blocked')),
    due_date TEXT,
    labels TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
```

Write `priority: "high"` to this table and you get an error at write time. Not a crash in production three days later.

The migration itself follows a pattern I've now used three times — lazy, idempotent, preserving:

```python
def _maybe_migrate_yaml(self) -> None:
    """One-time migration: import from YAML if DB is empty."""
    if not self._yaml_path.exists():
        return
    with self._connect() as conn:
        count = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
        if count > 0:
            return  # already migrated
        data = yaml.safe_load(self._yaml_path.read_text()) or {}
        for t in data.get("tasks", []):
            # columns omitted for brevity
            conn.execute("INSERT INTO tasks (...) VALUES (?,...)", (...))
```

**Lazy**: runs on first init, not as a separate migration step. **Idempotent**: if the DB already has data, it's a no-op. **Preserving**: the YAML file stays in place. No deletion. If the migration is wrong, the source data is still there.

## Why: three walls

Three problems, in the order I hit them.

**Search.** My system has Chinese-language sources. Full-text search over CJK text requires bigram tokenization — you can't grep for it. I built a search layer on [SQLite FTS5](https://www.sqlite.org/fts5.html) with a custom bigram tokenizer. Search went from "agent reads the entire index file" to an indexed lookup. Even for English-only systems, once you're past a few hundred entries, scanning a flat index file on every query stops being free.

**Atomicity.** A typical ingest operation updates 10–15 records: the new entry, cross-references, the index. If the agent crashes mid-write — context limit, API timeout — you get a partially updated system. Some references point to things that don't exist yet. [SQLite WAL mode](https://www.sqlite.org/wal.html) wraps multi-record updates in transactions. All changes commit, or none do. I started wrapping multi-file updates after hitting partial writes twice in the same week.

**Schema enforcement.** That's the production crash I opened with. YAML has no schema. It loaded a file, handed me a dict missing two keys, and said nothing. SQLite's `CHECK` constraints catch bad data at write time. The error message tells you exactly what's wrong. This is the difference between schema-on-read (patch every consumer) and schema-on-write (validate once at the boundary).

## When: three triggers

Not every system needs this migration. Flat files have real advantages — human-readable diffs, git versioning, no tooling dependencies. Vannevar Bush's 1945 [Memex](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/) concept was about the associative trails between documents, not the storage engine underneath. The storage is an implementation detail. Upgrade it when you need to.

I'd migrate when you hit one of three triggers:

1. **You need search beyond grep.** Especially multilingual. CJK, Arabic, any language where word boundaries aren't spaces. Even monolingual, [qmd](https://github.com/tobi/qmd) exists because grep stops scaling.
2. **You have multi-record writes that need to be atomic.** Multiple agents writing concurrently, or a single agent updating many entries per operation. One crash shouldn't leave your data half-updated.
3. **You've been bitten by schemaless data.** Once. The first production crash from a missing field is the signal. You won't need a second.

If none of these apply, flat files are the right call.

My system today: Obsidian for the human-readable layer, SQLite + FTS5 for search and fact storage, SQLite + WAL for operational state. Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) gist describes the broader pattern this migration fits into — a three-layer architecture of raw sources, structured knowledge, and schema conventions. I started at flat files and turned the dial when search broke.

---

**Sources:**
1. Bush, V. (1945). "As We May Think." *The Atlantic*.
2. SQLite. "Write-Ahead Logging." sqlite.org/wal.html
3. SQLite. "FTS5 Full-text Search." sqlite.org/fts5.html
4. Lutke, T. qmd — Markdown search engine. github.com/tobi/qmd
5. Obsidian. obsidian.md
6. Karpathy, A. (2026). "LLM Wiki." GitHub Gist.
