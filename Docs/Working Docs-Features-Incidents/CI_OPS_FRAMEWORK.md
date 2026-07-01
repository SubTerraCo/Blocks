# CI Ops Framework (Portable Template)

Copy this structure into **any** Cursor project for PM + QA pipeline.

---

## 1. ID system

```
PP.PR.AA.SSS.FFF-III     Feature address + incident suffix
B-####                   Incident group (lookback, Playwright, changelog)
N-####                   New feature (until shipped → registry code)
vYY.MM.DD                Release version (date-based, replaces semver)
vYY.MM.DDbX              Implementation batch within a release day
```

| Segment | Meaning | Example |
|---------|---------|---------|
| **PP.PR.AA.SSS.FFF** | Feature address | `DT.UI.02.010.020` |
| **III** | Incident on feature | `-001` first · `-002` regression |
| **B-####** | Bug group | `B-0017` |
| **N-####** | New feature | `N-0026` |
| **vYY.MM.DD** | Release cut (Sprint ship target) | `v26.06.12` |
| **bX** | Batch within that release day | `b1` … `b9` · `b10` · `b11` (no leading zero) |

### Blocks platform codes (this repo)

| PP | Platform |
|----|----------|
| DT | Desktop |
| WB | Web / PWA |
| AD | Android |
| AP | macOS |
| IO | iOS |
| SH | Shared UI |
| SB | Shared backend |
| MC | MCP |
| CX | CI / build |

---

## 2. Versioning (date + batch)

**Display format (docs, ROADMAP, CHANGELOG, About):** `vYY.MM.DD` and `vYY.MM.DDbX`

| Layer | Format | Example | Notes |
|-------|--------|---------|-------|
| **Release** | `vYY.MM.DD` | `v26.06.12` | Sprint ship target; replaces `0.0.x` |
| **Batch** | `vYY.MM.DDbX` | `v26.06.12b1` · `v26.06.12b9` · `v26.06.12b10` | One design+build session (`/NF` · `/NB` · `/RD` input batch) |
| **Sprint** | `Sprint N` | `Sprint 5` | PM planning horizon (orthogonal to release date) |
| **npm / tooling** | `YY.M.D-bX` | `26.6.12-b2` | Semver prerelease = batch; electron-builder + `package.json` |
| **About / tray** | `vYY.MM.DDbX` | `v26.06.12b2` | `blocksVersion` in desktop `package.json` (stamped at `prebuild:win`) |

**Batch rules**

- `X` = integer **1–99**, written **without leading zero** (`b1` … `b9`, then `b10`, `b11`, …).
- **Each calendar day resets the batch counter to `b1`.** A new build day = new release `vYY.MM.DD` + first batch `vYY.MM.DDb1`.
- Within the same calendar day, increment batch for each new `/NF` · `/NB` · `/RD` implementation session (`b1` → `b2` → `b3` …).
- One user prompt batch (all items in that `/NF` · `/NB` · `/RD` session) = **one batch ID**.
- Log every batch in ROADMAP **Batch log** with N-#### / B-#### IDs included.
- **Playwright:** no batch tag — QA runs `--grep` listing all `@N-####` / `@B-####` in the batch.
- Increment batch only after PM confirms prior batch QA or starts a new session.

**Daily release sync (mandatory)**

Before any `/BUILD`, `/NF`, or `/NB` session:

1. Run `pnpm release:rollover` (or `node scripts/daily-release-rollover.mjs --stamp`).
2. Script sets ROADMAP **`Release: vYY.MM.DD`** to **today's local date**.
3. If the calendar day changed since the last session, the **next batch is always `b1`** for that day.
4. Package versions (`package.json`, `apps/desktop/package.json`) are stamped to match the active QA batch.

| Trigger | Action |
|---------|--------|
| First session on a new calendar day | `pnpm release:rollover` → new `vYY.MM.DD` · assign **`b1`** in batch log before coding |
| Second+ session same day | Increment batch (`b2`, `b3`, …) in ROADMAP batch log before coding |
| 23:00 nightly push | `pnpm release:nightly-push` or GitHub **Daily Dev Push** → commit + push `origin/dev` |

**Branch policy:** Active implementation targets **`dev`**. Nightly automation pushes the sealed day's batch to `origin/dev` at 23:00 local (see [§12 Nightly dev push](#12-nightly-dev-push)).

### 2.3 Daily release branch

**Core rule:** Each calendar day starts on a **release branch** named after that day's version tag.

| Layer | Format | Example |
|-------|--------|---------|
| **Release branch** | `vYY.MM.DD` | `v26.06.19` |
| **Integration branch** | `dev` | Nightly merges release branch → `dev` |
| **Legacy / archive** | `v0.0.x` | Prior semver lines; merge into `dev` when retiring |

**Start-of-day checklist**

```bash
git checkout dev && git pull origin dev
git checkout -b v26.06.19          # today's vYY.MM.DD
pnpm release:rollover              # sync ROADMAP + package versions
# Add v26.06.19b1 to batch log before first /NF · /NB session
git push -u origin v26.06.19
```

**End-of-day:** Nightly workflow merges the active release branch (`DAILY_PUSH_SOURCE_BRANCH`, default = today's `vYY.MM.DD`) into `dev` · runs `build:release` · pushes.

**Agent rule:** At session start, confirm the current branch matches today's `vYY.MM.DD`. If not, branch from `dev` before coding.

**Legacy semver:** retired for forward work. Version History may note `(was 0.0.x)` once for migrated entries.

### 2.1 Release date + duplicate batch guard (`/BUILD`)

**Reminder — release date vs today**

Date-based releases use **`vYY.MM.DD` = the calendar day of the build/ship cut**, not a future placeholder. Before `/BUILD` or `pnpm build:release`:

1. Read ROADMAP header **`Release: vYY.MM.DD`**.
2. Compare to **today's local date**.
3. If they differ → **STOP** and update ROADMAP (and batch log if needed) to today's date, **or** confirm an intentional exception.

| Situation | Action |
|-----------|--------|
| Today is 2026-06-09, ROADMAP says `v26.06.12` | Bump release to `v26.06.09` (or wait until 06-12) — do not silently build |
| New calendar day, same sprint | New release row `vYY.MM.DD` · reset batch to `b1` unless PM says otherwise |
| Intentional backdated QA replay | Pass `--allow-date-drift` or `ALLOW_RELEASE_DATE_DRIFT=1` |

**Reminder — never build the same batch twice**

Each **`vYY.MM.DDbX`** gets **one** QA installer per implementation session. Before build:

1. Confirm ROADMAP batch log has the correct **🧪 QA** row for **new** work.
2. Run pre-flight (included in `pnpm build:release`):

```bash
pnpm build:release:context --validate
# or: node scripts/validate-build-release.mjs
```

3. Script checks **`build-log.json`** + existing `Blocks-Setup-*-bX.exe` for that batch.
4. If already built → **STOP** — increment batch (`b4`, `b5`, …) in ROADMAP for new fixes/features.

| Override | When |
|----------|------|
| `--force-rebuild` / `FORCE_BATCH_REBUILD=1` | Same batch hotfix rebuild (rare; logs `rebuildCount`) |
| `--allow-date-drift` / `ALLOW_RELEASE_DATE_DRIFT=1` | Replay build on non-matching release date |

**Build log:** `docs/Working Docs-Features-Incidents/build-log.json` — appended automatically on successful `pnpm build:release`.

**Agent rule:** If PM starts a new `/NF` · `/NB` session after a batch was already built for QA, assign the **next batch ID** in ROADMAP before implementation — do not reuse the shipped/QA-built batch row.

### 2.2 Daily release rollover

**Core rule:** Release date and batch numbering always follow the **calendar build day**, not a future placeholder sprint date.

| Rule | Behavior |
|------|----------|
| **Release date** | `vYY.MM.DD` = today's local date on every build day |
| **Batch reset** | New calendar day → batch counter resets to **`b1`** |
| **Same-day sessions** | `b1` → `b2` → `b3` … one batch per `/NF` · `/NB` design+build session |
| **Version stamp** | `pnpm release:rollover` syncs ROADMAP + `package.json` + desktop `blocksVersion` |
| **Pre-flight** | `/BUILD` date-drift guard (§2.1) should pass without `--allow-date-drift` on build day |

**Agent checklist — start of session**

```bash
pnpm release:rollover                    # sync today's vYY.MM.DD + stamp versions
pnpm release:next-batch                  # print next batch slot (b1 on new day)
# Add 🧪 QA row to ROADMAP batch log with returned batch id before coding
```

**Example — 2026-06-19**

| Time | Release | Batch | Action |
|------|---------|-------|--------|
| Morning — first session | `v26.06.19` | `v26.06.19b1` | Rollover + new batch log row |
| Afternoon — second session | `v26.06.19` | `v26.06.19b2` | Increment batch in log |
| 23:00 — nightly push | `v26.06.19` | latest QA batch | Commit + push `origin/dev` |

---

## 3. Sprint policy (default)

| Rule | Behavior |
|------|----------|
| **New bugs (`/NB`)** | Current **Sprint** + release `vYY.MM.DD` from ROADMAP header. INCIDENTS **Opened** = that release. |
| **New features (`/NF`)** | Same — **Target release** = current sprint release. Add to Active sprint tracks. |
| **Next sprint (`/RD`)** | Plan **next Sprint N+1** + proposed next release date. PM confirms before ROADMAP update. |
| **On hold** | Explicit PM call only (e.g. ⏸ Google). |

**Current sprint** = ROADMAP header, e.g. `Sprint 5 · v26.06.12` and `### Active sprint 5`.

---

## 4. Design phase (before implementation)

All `/NF`, `/NB`, and `/RD` inputs go through **two design rounds** before code. `/RD` stops after design + ROADMAP edits (no build).

```
USER          /NF · /NB · /RD  (one or more items)
       ↓
ROUND 1       Read inputs · map codes · best-judgement UX/ops per item
              **Conflict audit per item** (CI_OPS §4.1 Round 1 table)
              AskQuestion per item (recommended choice first)
              Always include "Open discussion / Other" for custom direction
       ↓
USER          Click through Round 1 AskQuestion set
       ↓
ROUND 2       Cross-component review — integration, affected pages, APIs
              **Cross-feature conflict report** (CI_OPS §4.1 Round 2 table)
              AskQuestion for knock-on changes to related features
       ↓
USER          Review Round 2 AskQuestion set
       ↓
GATE          If clarifications remain → AskQuestion again
              PM refinement → delta audit (CI_OPS §4.1)
              Else → assign batch vYY.MM.DDbX · document · implement
       ↓
BUILD         Implement (/NF · /NB only)
              **Global rule:** conflict audit before each logical change (§4.1)
              STOP + AskQuestion if new ambiguity or conflict appears mid-build
       ↓
TEST          Playwright component · integration · e2e · build tests
       ↓
BUILD         `/BUILD` or `pnpm build:release` — compile · batch tests · desktop installer
       ↓
HANDOFF       "Batch v26.06.12bN ready for QA" + headed grep commands · artifact path
```

### Design checklist (per item)

Cover at **component · section · integration · e2e** levels:

| Level | Questions |
|-------|-----------|
| **Component** | Controls, layout, defaults, copy, states |
| **Section** | Page placement, nav, settings, visibility rules |
| **Integration** | Task model, stores, APIs, sync, calendar/OAuth |
| **E2e** | User flows, edge cases, regression on related N/B IDs |

### AskQuestion rules

- **Round 1:** one item at a time (or batched when tightly related).
- **Round 2:** cross-feature impacts only.
- Every question set includes **Open discussion / Other**.
- Put **recommended option first**.
- Do **not** skip Round 1/2 to start coding.
- **Conflict audit required** in both rounds — see [§4.1 Logic & design conflict audit](#41-logic--design-conflict-audit).

### 4.1 Logic & design conflict audit

PM and agent often revise UX mid-batch. **Before coding** and **during both design rounds**, run a conflict audit so new choices do not silently contradict shipped logic, open incidents, or earlier batch decisions.

**When to run**

| Trigger | Audit type |
|---------|------------|
| **Round 1** (each `/NF` · `/NB` item) | Per-item conflict scan |
| **Round 2** (after PM answers) | Cross-feature + batch-wide logic conflicts |
| **PM refinement** (chat follow-up) | Delta audit — what changed vs last locked design |
| **Mid-build** (any new code path) | Pre-merge conflict check — **mandatory global rule** |
| **Any ad-hoc change** to stores, scheduling, timeline, task model | Full scheduling/event/calendar conflict pass |

**Sources of truth (read in order)**

1. **ROADMAP.md** — Active sprint, N-#### descriptions, acceptance criteria, **Related** links
2. **INCIDENTS.md** — Open/fixed B-####, **Expected** vs prior **Fix**, affects matrices
3. **FEATURE_REGISTRY.md** — Shipped ✅ behavior and registry codes
4. **Batch log** — Prior decisions in same `vYY.MM.DDbX` session
5. **Code invariants** — grep/read before contradicting:
   - `SINGLE_FOCUS_TASK_SCHEDULING` · `buildTimelineInsertPushBackUpdates` (N-0021)
   - Schedule Doing lock-current vs reschedule-all (N-0025)
   - Event model `isEvent` · all-day strip · passive overlap (N-0026 · N-0029)
   - Timeline snap / live follow (N-0007 · N-0024)
   - Calendar view mode + continuous scroll (N-0027 · N-0030 · N-0031)

**Round 1 — per-item conflict report**

For each new or changed item, agent outputs a short table **before** AskQuestion:

```text
| Check                         | Result |
|-------------------------------|--------|
| Related N-#### / B-####       | …      |
| Conflicts with shipped logic? | None / list |
| Supersedes prior design?      | None / N-0027 § … |
| PM delta vs earlier round     | None / describe |
| Recommended resolution        | …      |
```

If **Conflicts ≠ None** → list resolution in AskQuestion options (recommended = least disruptive to shipped ✅ features unless PM already reversed).

**Round 2 — cross-feature conflict report**

After Round 1 answers, agent checks **integration collisions**:

```text
| Area              | Existing rule              | Proposed change     | Conflict? | Resolution |
|-------------------|----------------------------|---------------------|-----------|------------|
| Scheduling        | N-0021 push-back on insert | B-0022 passive drag | Yes       | Split paths |
| Task editor       | blockSize × blockCount     | B-0019 hide for event | Yes     | Event uses clock times |
| Calendar chrome   | N-0027 per-week headers    | N-0030 global strip | Yes       | N-0030 supersedes |
```

AskQuestion only for rows where **Conflict? = Yes** and resolution is not already locked by PM.

**Global rule — before any new code**

Agent **must not** implement until:

1. Conflict audit for the change is written (even if "None").
2. PM-locked batch design includes the item (or PM explicitly waives design for hotfix P0).
3. Superseded ROADMAP/INCIDENT text is updated in the same PR/session (avoid doc drift).

On **mid-build discovery** of a conflict → **STOP**, present conflict table + AskQuestion; do not guess.

**PM refinement protocol**

When PM changes mind after a locked round:

1. Agent quotes **previous** vs **new** decision in one line.
2. Run **delta audit** against sources of truth above.
3. Update INCIDENTS / ROADMAP / batch log **Logic note** field.
4. Confirm no regression on listed **Related** N/B IDs.

**Example (v26.06.12b3)**

| Item | Conflict | Resolution |
|------|----------|------------|
| B-0019 hide block fields | Event duration was blockSize×blockCount | Duration from clock times (B-0020) |
| B-0020 clock picker | Prior draft said scroll columns | PM: GCal **clock face**, not scroll lists |
| N-0030 weekday strip | N-0027 dual-month per-week headers | N-0030 supersedes; remove per-week headers |
| B-0022 passive overlap | N-0021 always push-back | Drag path only; Quick Blocks keep push-back |

Log batch-level conflict resolutions in ROADMAP batch session notes or INCIDENT **Logic note** lines.

---

## 5. File layout

```
docs/Working Docs-Features-Incidents/
  FEATURE_REGISTRY.md
  INCIDENTS.md
  ROADMAP.md              # Active sprint · Batch log · N-#### · Next sprint
  CHANGELOG.md
  CI_OPS_FRAMEWORK.md
  scripts/format-matrix.mjs
  scripts/generate-registry.mjs
  scripts/polish-docs.mjs
.cursor/skills/
  report-bug/             # /NB
  new-feature/            # /NF
  roadmap-plan/           # /RD
  build-release/          # /BUILD
scripts/
  read-ci-context.mjs     # ROADMAP release · batch · grep (--validate)
  validate-build-release.mjs  # date drift + duplicate batch guard
  daily-release-rollover.mjs  # sync vYY.MM.DD + batch b1 reset + version stamp
  daily-dev-push.mjs      # nightly commit + push origin/dev
  build-log.json          # recorded batch builds (one per vYY.MM.DDbX)
  build-release.mjs       # pre-flight · compile · test · desktop · QA handoff
  playwright-feature-tags.mjs
  run-feature-tests.mjs
  run-build-tests.mjs
.github/workflows/
  daily-dev-push.yml      # cron 23:00 local (UTC offset in workflow) → origin/dev
```

---

## 6. Pipeline summary

| Skill | Trigger | Sprint | Design | Builds? |
|-------|---------|--------|--------|---------|
| `report-bug` | `/NB` | Current | Round 1 + 2 | Yes |
| `new-feature` | `/NF` | Current | Round 1 + 2 | Yes |
| `roadmap-plan` | `/RD` | Next plan | Round 1 + 2 | No |
| `build-release` | `/BUILD` | Current batch | No | Yes (package + QA handoff) |

After design gate: **Document** → **Build** → **Test** → **`/BUILD`** → **QA handoff**.

---

## 7. Registry doc pattern (Option A + D + matrix)

**Key tables** at top (PP, PR, AA, health legend).

**Per section:** feature table + cross-platform matrix — aligned pipes, Feature **32**, cells **10**.

**Incident card** in `INCIDENTS.md`, links back to matrix.

---

## 8. Playwright tagging

### 8.0 Test → build → release gate (mandatory)

Every batch follows the same automated gate. **Do not skip steps or reorder them.**

1. **Start the dev server first.** Always initiate the web dev server **before** running any Playwright suite (e2e, a11y, visual, perf, integration-that-needs-DOM). The Playwright `webServer` block auto-starts it, but the agent must confirm it is up (or start `pnpm dev:web`) so specs never race a cold server.

```bash
pnpm dev:web            # http://localhost:3004 — leave running for the suite
# then, in a second shell:
pnpm test               # or scoped: PLAYWRIGHT_GREP="@N-####|@core" pnpm test
```

2. **Debug until green.** Run the batch suites (`PLAYWRIGHT_GREP` = batch `@N-####`/`@B-####` + `@core`). Fix failures and re-run until the suite passes. Run heavy multi-file suites at `--workers=2` to avoid dev-server cold-compile timeouts.

3. **Build test.** Once the suite passes, always run the compile gate:

```bash
pnpm test:build         # @blocks/core · @blocks/ui · web · desktop
```

4. **Release.** After the build test is green, always package the release:

```bash
pnpm build:release      # pre-flight · install · compile · batch tests · Windows installer
```

5. **Notify PM.** When `build:release` finishes, tell PM the **latest release is available to install** with the installer path (`apps/desktop/release/Blocks-Setup-<npmVersion>.exe`) and the batch id.

| Step | Command | Gate |
|------|---------|------|
| Dev server | `pnpm dev:web` | Up on :3004 before any Playwright run |
| Test | `pnpm test` (scoped grep) | Debug until green |
| Build test | `pnpm test:build` | All 4 packages compile |
| Release | `pnpm build:release` | Installer produced |
| Notify | — | PM told installer path + batch id |

**Agent rule:** Never report a batch "done" until this full gate — **dev server → tests green → `test:build` → `build:release` → PM notified with installer path** — has run. Only skip `build:release` when PM explicitly asks for a docs-only or read-only turn.

```typescript
test.describe('DT.UI.06.001 · Appearance @core', () => {
  test('DT.UI.06.001.020 Light theme @B-0003', async ({ page }) => { … });
});
```

```bash
# Batch QA — grep all IDs in the batch (no @batch tag)
pnpm exec playwright test tests/e2e --headed --workers=1 \
  --grep "@N-0024|@N-0025|@B-0017" \
  --config=tests/playwright.config.ts --project=chromium

pnpm test:features
pnpm test:features:headed
pnpm test:features:roadmap:headed
pnpm exec playwright test --grep @core --config=tests/playwright.config.ts --project=chromium
```

### Release build (return-to-test)

After checking out a release branch or finishing a batch:

```bash
pnpm build:release:context --validate   # release · batch · date/batch pre-flight
pnpm build:release                      # pre-flight · install · compile · batch tests · build:win
pnpm build:release --skip-install       # faster re-run (pre-flight still runs)
```

Pre-flight fails when:

- ROADMAP **Release** date ≠ today (unless `--allow-date-drift`)
- Batch already in **build-log.json** or installer exists (unless `--force-rebuild`)

GitHub: **Actions → Build Release** (manual) — Ubuntu tests + Windows installer artifact.

Headed QA after install:

```bash
pnpm test:features:roadmap:headed
```

---

## 9. Cursor skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `report-bug` | `/NB` | B-#### · design rounds · batch · fix · `@B-####` |
| `new-feature` | `/NF` | N-#### · design rounds · batch · implement · `@N-####` |
| `roadmap-plan` | `/RD` | Next sprint · design rounds · ROADMAP only |
| `build-release` | `/BUILD` | Compile · batch tests · desktop installer · QA handoff |

---

## 10. Bootstrap checklist (new project)

- [ ] Define **PP** codes + date versioning in ROADMAP header
- [ ] Copy INCIDENTS + ROADMAP (Active sprint + Batch log)
- [ ] Copy all four skills (`report-bug`, `new-feature`, `roadmap-plan`, `build-release`)
- [ ] `@core` on existing tests
- [ ] README: `/NB` · `/NF` · `/RD` · `/BUILD` · `vYY.MM.DDbX`

---

## 11. Changelog convention

```markdown
### Fixed (v26.06.12b2)
- **B-0003**: DT/WB light & system themes; SH theme engine

### Added (v26.06.12b1)
- **N-0001**: Timeline week strip — DT.UI.02.010.*, WB.UI.02.010.*
```

---

## 12. Nightly dev push (23:00 MST)

Automated end-of-day pipeline: merge designated branch → seal batch → **`pnpm build:release`** → push to **`origin/dev`**.

### Locked PM decisions (2026-06-19)

| Decision | Choice |
|----------|--------|
| **Timezone** | **23:00 MST** → cron `0 6 * * *` UTC (MST = UTC−7). During **MDT** (summer), use `0 5 * * *` for 23:00 local. |
| **Source branch** | Merge **PM-designated branch** → `dev` before build (`DAILY_PUSH_SOURCE_BRANCH`, default `v0.0.5`) |
| **Empty days** | **Skip** — no merge changes and no uncommitted work → no commit, no push |
| **Pre-push gate** | **`pnpm build:release`** full pipeline (compile · batch tests · Windows installer) |
| **Branch protection** | **None** — `GITHUB_TOKEN` pushes directly to `dev` |
| **Batch log** | **Auto-increment** at 23:00 — append next `vYY.MM.DDbX` row + stamp versions before build |

### Is this possible?

| Approach | Works unattended? | Notes |
|----------|-------------------|-------|
| **GitHub Actions cron** (implemented) | ✅ Yes | Runs on GitHub even when your PC is off |
| **Cursor `/loop` or hooks** | ❌ No | Requires an open Cursor session |
| **Windows Task Scheduler** | ⚠️ Partial | PC must be on; duplicates GitHub workflow |

This repo uses **GitHub Actions** on **`windows-latest`** (required for `build:release` desktop installer).

### Schedule

```yaml
# .github/workflows/daily-dev-push.yml
schedule:
  - cron: "0 6 * * *"   # 23:00 MST (UTC-7)
```

| Local 23:00 | Cron (UTC) |
|-------------|------------|
| **MST (UTC−7)** | `0 6 * * *` ← **active** |
| MDT / summer (UTC−6) | `0 5 * * *` |
| UTC | `0 23 * * *` |

### Pipeline steps

1. Check out `dev` · `git pull`
2. `git merge origin/<source_branch>` (default `v0.0.5`; override via workflow input or repo variable `DAILY_PUSH_SOURCE_BRANCH`)
3. **Skip** if no merge delta and no uncommitted changes
4. `prepareNightlyBatch()` — sync `Release:` to today · auto-increment batch · append batch log row · stamp versions
5. `pnpm build:release` — pre-flight · install · compile · batch tests · `build:win`
6. `git commit` · `git push origin dev`

### Manual run

```bash
# Local (Windows — full build:release)
DAILY_PUSH_SOURCE_BRANCH=v0.0.5 pnpm release:nightly-push

# Dry-run (no git writes, no build)
node scripts/daily-dev-push.mjs --dry-run

# GitHub: Actions → Daily Dev Push → Run workflow
#   source_branch: v0.0.5 (or PM-designated branch)
```

### Configure source branch

| Method | Value |
|--------|-------|
| Workflow dispatch input | `source_branch` (default `v0.0.5`) |
| Repo variable | `DAILY_PUSH_SOURCE_BRANCH` (used when input omitted on schedule) |
| Local env | `DAILY_PUSH_SOURCE_BRANCH=v0.0.5` |

### Prerequisites

- `dev` branch exists on `origin`
- GitHub Actions enabled
- Source branch pushed to `origin` before 23:00
- Windows runner minutes available (`windows-latest` for installer)

### Agent rule

When PM designates the active implementation branch, set repo variable **`DAILY_PUSH_SOURCE_BRANCH`** (or pass `source_branch` on manual dispatch) so the nightly merge targets the correct branch.

---

*Blocks instance v7 · 2026-06-30 — Sprint 5 · daily release rollover · §8.0 test→build→release gate · §12 nightly dev push (PM-locked)*
