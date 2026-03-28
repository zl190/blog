# Session 9 Rationale Log — 2026-03-29

> Key reasoning chains preserved for audit. Not for execution agents.

## Decision evidence

1. **last30days false authorship** — Builder hallucinated "How I Built" framing for a post about a tool the user did not build. User caught the error on phone reading the live site. Root cause: three layers failed at the same point — no SpecGate (no spec = builder free to fabricate angle), no EvidenceGate (QC reviewed prose quality not factual accuracy), and session blog pressure created incentive to ship volume. Post unpublished immediately.

2. **Rewrite v1 → v2** — First rewrite was still product review framing (user: "pua last30days到底在说啥"). Second rewrite centered on PR #115 contribution arc: discovery → diagnosis → fix → feedback loop → 920-point delta. User had to PUA twice to get substance. Confirmed that without SpecGate forcing an explicit author relationship declaration, builder defaults to the easiest plausible frame.

3. **DataFlow anonymization reverted** — User clarified: "DataFlow不用匿名化, 不提research-institute就行". Rule is about people and org names, not tool names. DataFlow is a tool name; publishing it is safe. Anonymization rule tightened to research-institute/research-lab specifically. Memory updated to reflect the distinction.

4. **SpecGate enforcement** — Pre-commit hook extended to require `spec:` field with format "thesis | author relationship | target reader". All 18 published posts backfilled manually. This directly addresses the root cause of the last30days failure: a builder with no spec is free to fabricate angle. Physical enforcement at commit time means 100% coverage with zero trust in memory rules.

5. **EvidenceGate added to QC pipeline** — QC previously reviewed prose style and accuracy of claims, but did not verify whether the author had standing to make those claims. last30days passed QC with a fabricated authorship frame because QC started at the prose level. EvidenceGate moves author-relationship verification to first item in QC checklist, before prose review begins.

6. **Self-PUA converted to gate** — Self-PUA had 0% execution rate over 4 sessions as an aspirational rule. User: "要么变成实际的gate, 要么承认它是dead letter删掉". The framework audit confirmed this pattern: rules without enforcement hooks produce 0%. Converted to physical check with documented escalation mechanism. Same insight applied to SM rule in Anti-Greedy Guards: diagnosis card required before any edit.

7. **Mona Lisa trimmed 17 → 5** — User directly deleted 12 files, keeping: classic, sunglasses, vr-cyberpunk, selfie, caricature. Config had also drifted (was referencing 9 of 17 images). Synced config to the 5 curated files. Introduced REGISTRY.md as the authoritative control panel so pool and config cannot drift again.

8. **Retro blog** — User: "pua 你拷打一下这几个session的工作". Full framework audit produced key finding: 1 of 5 framework gates had actual enforcement (QCGate via pre-commit). The other 4 were memory rules with 0% execution. Published after running through the new pipeline: EvidenceGate first, then prose, then 真的吗 check.

## Discoveries

| Finding | Source |
|---------|--------|
| Imagen 4 model name: `imagen-4.0-generate-001` (not preview) | Session 9 API error → list models call |
| pre-commit hook = 100% execution; memory rules = 0% | Session 9 framework audit |
| QC without EvidenceGate passes polished lies | last30days incident |
| PIL pixel art sprites are functional but visually crude at 48x48 | Corgi sprite generation |
| Config can silently drift from actual file pool (was 9/17, should be 17/17) | Mona Lisa sync audit |

## Rejected

- **Mona Lisa variant matrix** — Trimmed to 5 images; matrix no longer needed. REGISTRY.md serves as the control panel.
- **Professional corgi sprite** — Cosmetic improvement, not a priority. Current PIL sprite is functional.
- **Imagen prompt as output style** — Premature. Will write when the next image generation task requires it.

## Constraint reasoning

- **SpecGate physical enforcement** — Memory rules failed 4 sessions. Pre-commit hook is the only enforcement mechanism that works at 100%.
- **EvidenceGate first in QC** — Prose quality is irrelevant if the authorship claim is fabricated. Checking evidence before prose prevents the QC agent from being anchored on well-written content.
- **DataFlow OK, research-institute/research-lab not** — Tool names are public. People names and employer names in a confidential context are not.
- **Thesis required per session** — Volume pressure without a quality standard directly produced the last30days incident. The policy change is a causal response, not a general aspiration.
