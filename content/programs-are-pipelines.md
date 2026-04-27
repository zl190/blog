---
title: "Programs Are Pipelines: Why 'I Just Move Data Around' Is the Whole Job"
date: 2026-04-26
created: 2026-04-26
tags: [software-engineering, data-structures, programming, systems-thinking]
topics:
  - Engineering
qc: passed
spec: "Software is shape-transformation pipelines; the senior-vs-junior gap is choosing shapes so dominant queries become O(1); the cynical 'I just move data around' joke is the deepest engineering truth | practitioner re-deriving Linus/Pike/Brooks/Knuth from a debugging session | engineers who suspect they're stuck on the wrong abstraction"
---

# Programs Are Pipelines: Why "I Just Move Data Around" Is the Whole Job

I caught myself thinking this last week, mid-debug, with the resigned tone of someone who had been staring at a stack trace too long: *all I do is move data from one place to another, and then back again.*

It started as a complaint. A self-deprecating shrug at the gap between what I thought programming was — *cathedral construction*, *algorithmic insight* — and what it actually felt like in my hands: load JSON, parse it, regroup it, write CSV, repeat.

The complaint turned out to be the trade. The cynical "I'm a CRUD monkey" joke is the deepest engineering truth I know, and learning to do it *well* — to choose the right shapes, in the right order, so the dominant query becomes a single dictionary lookup — is the entire job. This post is what I wish someone had said to me in plainer terms a year earlier.

## The thesis in one sentence

**All software is a pipeline of shape transformations on data, and the only thing that separates a senior engineer from a junior one is which shape they reach for given the dominant access pattern.**

Everything else — the framework choice, the language, the cleverness of the algorithm, the linter config — is downstream of that. The shape choice gates correctness, performance, readability, and how much the next developer will curse you in 2027.

I did not invent this. The trade has been saying it for fifty years; we just keep forgetting because the rhetoric of programming is about logic and the reality of programming is about layout.

## Five people already said this and we ignored them

Before I get to the running example, let me name the canon. The discipline did not lack for warnings.

**Fred Brooks**, *The Mythical Man-Month* (1975), in the chapter literally titled "Representation Is the Essence of Programming":

> "Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won't usually need your flowcharts; they'll be obvious."

Brooks wrote that fifty years ago, on hardware that fits on a smartwatch now. The point survived every paradigm shift between then and now because the point is not about programming languages. It is about how human attention works. Tables are state. Flowcharts are change. State dominates.

**Linus Torvalds**, in a 2006 mailing list reply that became one of the most-cited quotes in the discipline:

> "Bad programmers worry about the code. Good programmers worry about data structures and their relationships."

Linus is not subtle and he did not need to be. He maintains a kernel. Kernels are the limit case where shape choice — page tables, scheduler runqueues, the inode cache — is the whole game and the "code" is mostly just the verbs that walk those structures.

**Rob Pike**, *Notes on Programming in C*, Rule 5:

> "Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident. Data structures, not algorithms, are central to programming."

Pike's "algorithms will almost always be self-evident" is the load-bearing claim. It says: the algorithm you're agonizing over is mostly a *symptom* that your shape is wrong. Right shape, obvious code. Wrong shape, clever code. Cleverness is a smell.

**Donald Knuth**, *Structured Programming with go to Statements* (1974), which is where the most-misquoted sentence in computing actually comes from:

> "Premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%."

Note the second clause. People always quote the first half and use it as a license to write bad code. Knuth meant: most of your code does not matter, but *some* of it absolutely does, and your job is knowing which 3% — which means measuring, not guessing.

**Kent Beck**, popularizing a phrase whose origin is contested but whose discipline is not:

> "Make it work. Make it right. Make it fast — in that order."

That ordering is a corollary of Knuth. You do not know what is slow until it works. You do not know what is wrong until it is in front of you. Optimize last, when the bottleneck is measured rather than imagined.

These five quotes describe one practice from five angles. I find that students who are stuck on a problem are usually stuck because they have skipped one of these layers — most often the first one.

## The running example, in miniature

The problem on my screen, stripped of jargon: given a corpus of timestamped snapshots of an operational system, identify which entity inside the system grew the most across the observation window. Standard "first-appearance vs last-appearance, then rank" pattern. Nothing exotic.

He had reached for a flat dictionary keyed by `(entity_id, snapshot_timestamp) -> set_of_records`. It worked for the first lookup he wrote. Then he needed to ask "for this entity, give me all snapshots." That query, on his shape, was an O(n) scan over the entire corpus. Every. Single. Time.

We walked through the four shapes he could have picked:

| Shape | Mental model | Cost of "all snapshots for one entity" |
|---|---|---|
| Flat tuple key `{(entity, ts): records}` | Redis / KV store | O(n) scan |
| Nested dict `{entity: {ts: records}}` | JSON document, group-by native | O(1) lookup, then iterate |
| Dataclass `{entity: Record(snapshots=...)}` | ORM row, type-checked | O(1) + field access |
| DataFrame indexed by `(entity, ts)` | Spreadsheet / SQL table | O(1) via multi-index |

All four hold the *same* logical data. The cost of his dominant query — "everything for one entity" — differed by orders of magnitude depending on the shape. The flat dict was wrong not because it was incorrect but because it forced an O(n) scan into a position where O(1) was sitting right there.

We changed two lines (`defaultdict(lambda: defaultdict(set))` instead of a flat dict) and his analysis went from a sluggish forty seconds to under a second. Same data. Same logic. Different shape. *That* is the trade.

The decision rule that fell out of the session: *which query I run most often decides which data structure I reach for.* What query do I run most often? That picks the shape. Not "which one is cleaner." Not "which one I learned in CS101." Whichever shape makes the dominant query O(1).

## Code as a pipeline of shape transforms

Once you see programs this way, you see it everywhere. Almost every nontrivial program is a chain of shape transforms, each one chosen to make the *next* operation cheap.

A typical data analysis pipeline:

```python
# Stage 1: raw bytes on disk
raw_bytes = open(path, "rb").read()

# Stage 2: parsed records (list of dicts)
records = json.loads(raw_bytes)

# Stage 3: indexed by entity (nested dict, group-by native)
by_entity = defaultdict(list)
for r in records:
    by_entity[r["entity_id"]].append(r)

# Stage 4: per-entity aggregate (the answer)
growth = {
    e: len(snaps[-1]["items"]) - len(snaps[0]["items"])
    for e, snaps in by_entity.items()
}

# Stage 5: ranked output (sorted list of tuples)
ranked = sorted(growth.items(), key=lambda kv: -kv[1])
```

Five stages. Five shapes. Each transform chosen because the *next* operation needs that shape to be cheap. Stage 3 exists because stage 4 needs group-by-entity to be O(1). Stage 4 exists because stage 5 needs a flat list to sort. Strip out any single transform and the next stage either gets quadratic or becomes unreadable.

The verbs (`json.loads`, `append`, `sorted`) are the cheap part. The nouns — the *shape at each stage* — are where engineering judgment lives. Junior engineers see the verbs as the program. Senior engineers see the nouns as the program and the verbs as glue.

This is also why functional programming people are so insistent about thinking in `map`, `filter`, `reduce`, `groupBy`. Those operations *are* shape transforms named explicitly. The functional crowd just refused to pretend the shape transforms weren't the real work.

## How the cynical joke becomes the engineering truth

Now we can collapse the joke and the truth into one statement.

"I just move data from east to west and back" — *yes, that is exactly what software does.* There is no escape from this fact and no need to feel bad about it. Compilation is a shape transform (text → AST → IR → machine code). Web servers are shape transforms (HTTP request → handler args → DB query → row tuple → JSON response). Machine learning is shape transforms (raw signal → tensor → embedding → logits → label). All of it. East to west. Back again.

The CRUD-monkey joke is correct. The non-joke is which shapes you choose along the way, and whether each transform makes the next one O(1) or accidentally O(n²).

So when a junior engineer says "I'm just doing CRUD, this is mindless," they are factually right about the verb and dead wrong about the noun. The mindless CRUD that ships is mostly bad shape choices: a flat tuple where a nested dict belonged, a dataclass where a tuple belonged, a DataFrame where a dict belonged, an ORM where a single SQL query belonged. Every one of those produces a working system that is silently 100× too slow, or 100× harder to extend, than the same system with the right shape.

## Engineering as the bottleneck loop

There is one more move that turns the cynical observation into a concrete daily practice: the **bottleneck loop**.

Steps, in order, ruthlessly enforced:

1. **Make it work end-to-end with the dumbest possible shape.** Lists of dicts. Nested loops. O(n²) is fine. Read a 50-row sample. Don't optimize. Don't even *look* at performance. The goal is to find out whether the pipeline runs at all.
2. **Run it on real data and measure where it hurts.** Profile, time, log. Be specific. "Slow" is not a measurement; "stage 3 takes 38 seconds on the full corpus" is.
3. **Pick the smallest possible move that makes the bottleneck cheap.** Almost always one of two weapons:
   - **Cache** the result of an expensive computation, keyed on its inputs.
   - **Transform the shape** so the dominant query is O(1) instead of O(n).
4. **Re-measure.** The bottleneck has moved. Repeat from 2.

That loop *is* engineering. Not the parts where you write the for-loops. The parts where you decide what to leave alone and what to reshape.

This is why Knuth's "premature optimization" matters. Step 1 cannot be optimized — there is nothing to optimize *against* yet, no measurement, no shape that has earned its existence by surviving real input. Every shape decision made before step 2 is fiction. Most of the bad code I have written or read came from someone optimizing in step 1, before there was any evidence that the thing they were optimizing mattered.

It is also why "Make it work, make it right, make it fast" is the right ordering and the only ordering. *Right* requires *working* (you can't fix what doesn't run). *Fast* requires *right* (you can't optimize what's wrong without locking in the wrongness). The order is not a preference. It is a precedence relation in the dependency graph of engineering effort.

## The mother-pattern: codify what can be codified

I wrote a different post earlier this month called [The Semantic Layer Is the Type System for Data](https://blog.ylab3.com/semantic-layer-is-type-system-for-data). Surface topic: why end-to-end "AI does my data analysis" products are still aspirational despite LLMs being fluent at SQL. The argument: LLMs solve syntax; semantics — what counts as a "user," what "active" means, which growth metric matters — has to be written down explicitly by humans, and that written-down place is the semantic layer.

I keep noticing the same mother-pattern underneath every engineering domain I touch: **make explicit what can be made explicit; build the codifiable substrate before you run inference on top.**

In data analytics: the codifiable substrate is the semantic layer. Skip it, and the LLM guesses, and the dashboard is silently wrong.

In software engineering: the codifiable substrate is *the shape of your data at each stage of the pipeline*. Skip it, and the program guesses, and the system is silently slow or silently broken or silently unmaintainable.

In learning: the codifiable substrate is drilled procedural fluency — Type-A pattern saturation. Skip it, and you ask a learner to "be creative" before they have anything to recombine.

Same shape every time. Engineering progress, in any domain I have watched, is the unglamorous work of taking a previously-tacit decision and freezing it into structure. Type systems did this for code. Semantic layers are doing it for analytics. Mastery dashboards do it for learning. *Choosing your data shape consciously* does it for the daily work of programming itself.

The boundary between "tacit and re-discovered every time" and "explicit and reusable" is where engineering value lives. Move the boundary, and you have done your job.

## What I'd write down for my past self now

If I had been clearer about all this six months earlier, here is what I would have stuck on the wall the first time the "I just move data around" joke hit:

You're right. That is the job. The job is also exactly as hard as the seniors make it look — which is to say, very. The hard part is not the moving. The hard part is, at every step of the move, picking a shape that makes the *next* step cheap, and being honest about what the dominant query actually is rather than what you wish it were.

Do that consistently, and in five years the code looks "boring" — flat, obvious, no clever tricks — and people ask why your services keep working when theirs don't. The answer is not magic. It is that you decided, every time you defined a variable, what shape it would be, and you decided based on what queries the next stage would run.

That is the trade. The Linus quote, the Pike quote, the Brooks quote, the Knuth quote, the Beck quote — they are five people pointing at the same single practice from five angles. The practice is: shape first, code second, optimize last, and never lie to yourself about which query is dominant.

## The takeaway in one sentence

Software is shape transformations from end to end, the senior-vs-junior gap is which shapes you pick given which queries dominate, and the "I just move data around" complaint is not cynicism — it is, accurately read, the entire definition of the work, and learning to do it well is the only career arc that compounds.

If this lens is useful, I'm writing more of these as I work through the AI-meets-systems-engineering frontier from a graduate-school vantage point. **Subscribe** for the next issue — it'll likely be on the third sibling of this mother-pattern: where the codifiable substrate runs out and the genuinely tacit work begins.

---

*Further reading:* [Brooks, *The Mythical Man-Month*](https://en.wikipedia.org/wiki/The_Mythical_Man-Month) is still the single best book on what software engineering actually is. [Pike's Notes on Programming in C](https://users.ece.utexas.edu/~adnan/pike.html) is a four-page PDF and you should read it tonight. [Knuth's *Structured Programming with go to Statements* (PDF)](https://pic.plover.com/knuth-GOTO.pdf) is where the "premature optimization" line actually comes from — read the surrounding paragraph, not the bumper sticker. [Hettinger's "Transforming Code into Beautiful, Idiomatic Python"](https://www.youtube.com/watch?v=OSGv2VnC0go) is the most practical demonstration of "shape choice = O(1) lookup" I know in any language. And the sibling post — [The Semantic Layer Is the Type System for Data](https://blog.ylab3.com/semantic-layer-is-type-system-for-data) — works the same mother-pattern from the analytics side. (Karl Hughes' [*The Bulk of Software Engineering Is Just Plumbing*](https://www.karllhughes.com/posts/plumbing) is the canonical earlier statement of the same sentiment, if you want the receipts.)
