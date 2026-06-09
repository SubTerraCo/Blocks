# Blocks Roadmap (New Features)

> **Format:** `N-####` until shipped · then assign `PP.PR.AA.SSS.FFF` in [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)  
> **Workflow:** `/NF` skill or **new feature** in chat

**Matrix columns:** Feature **32** · cells **10** · aligned `|`

---

## Quick reference

| ID     | Title                              | Target codes                    | Status      | Version |
| ------ | ---------------------------------- | ------------------------------- | :---------: | :-----: |
| [N-0001](#n-0001-timeline-week-strip) | Timeline week strip (7-day header) | DT.UI.02.010.* · WB.UI.02.010.* | 📋 Proposed |    —    |

**Status:** 📋 Proposed · 🔄 In progress · 🧪 QA · ✅ Shipped · ❌ Dropped

---

## Proposed

### N-0001 · Timeline week strip {#n-0001-timeline-week-strip}

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | 📋 Proposed                  |
| **Target version** | 0.0.4                        |
| **Platforms**  | DT · WB (first) · AD (later) |

**Description:** Horizontal 7-day date strip above the timeline for quick day navigation.

**Platform matrix (on ship)**

```text
|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|       Day cell selection       | 📋 N-0001 | 📋 N-0001 |    —     |
|         Jump to today          | 📋 N-0001 | 📋 N-0001 |    —     |
|     Week strip container       | 📋 N-0001 | 📋 N-0001 |    —     |
```

**Proposed registry codes (on ship)**

| Code             | Feature                    |
| ---------------- | -------------------------- |
| DT.UI.02.010.010 | Week strip container       |
| DT.UI.02.010.020 | Day cell selection         |
| DT.UI.02.010.030 | Jump to today              |
| WB.UI.02.010.010 | Week strip container (web) |
| WB.UI.02.010.020 | Day cell selection (web)   |

**Acceptance criteria**
- [ ] Tap day → timeline scrolls to that date
- [ ] Today highlighted in magenta
- [ ] Persists selected day in session storage
- [ ] Playwright: `@N-0001` passes headed on DT + WB

**Playwright (to create on approve)**
- `tests/e2e/timeline-week-strip.spec.ts`

**Spec update:** BLOCKS_CORE_FUNCTIONALITY v0.0.4 § Timeline

---

## New feature template

Use `/NF` skill. Include **Platform matrix** + proposed codes before implementation.

On ship: FEATURE_REGISTRY rows ✅ · move to Shipped · CHANGELOG **Added**.
