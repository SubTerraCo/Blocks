import { matrixBlock } from "./format-matrix.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const m = (cols, rows) => matrixBlock("Feature", cols, rows);
const wrap = (body) => "```text\n" + body + "\n```";

const appearance = m(["DT", "WB", "AD", "SH"], [
  ["Dark theme", "✅", "✅", "✅", "—"],
  ["Light theme", "✅", "✅", "✅", "—"],
  ["System theme", "✅", "✅", "✅", "—"],
  ["Theme engine (shared root)", "—", "—", "—", "✅"],
]);
const dtBg = m(["DT", "CX"], [
  ["NSIS upgrade / uninstall", "✅ B-0001", "—"],
  ["Win build packaging", "—", "✅ B-0002"],
]);
const corePages = m(["DT", "WB", "AD"], [
  ["00 App shell", "✅", "✅", "🔄"],
  ["01 Kanban", "✅", "✅", "🔄"],
  ["02 Timeline", "✅", "✅", "🔄"],
  ["03 Blocks quick-add", "✅", "✅", "🔄"],
  ["04 Task Edit (unified)", "✅", "✅", "🔄"],
  ["05 AI / Search", "✅", "✅", "📋"],
  ["06 Settings", "🐛", "🐛", "🔄"],
  ["07 Profile + stats", "✅", "✅", "📋"],
]);
const phase2 = m(["DT", "WB", "AD", "SH", "SB"], [
  ["P2P Sync", "✅", "✅", "📋", "—", "✅"],
  ["AI Task Scheduler", "✅", "✅", "📋", "—", "✅"],
  ["Active time tracking", "✅", "✅", "📋", "—", "✅"],
  ["Notifications", "✅", "✅", "📋", "—", "✅"],
  ["Recurring tasks", "✅", "✅", "📋", "—", "✅"],
  ["Theme toggle", "🐛", "🐛", "✅", "🐛", "—"],
  ["Keyboard shortcuts", "✅", "✅", "📋", "✅", "—"],
  ["Timeline drag-reschedule", "✅", "✅", "📋", "—", "✅"],
  ["Kanban drag-drop", "✅", "✅", "🔄", "—", "—"],
  ["Blocks placement picker", "✅", "✅", "🔄", "—", "—"],
  ["Bulk actions", "✅", "✅", "📋", "—", "—"],
  ["Task templates", "✅", "✅", "📋", "—", "—"],
  ["Subtask progress", "✅", "✅", "📋", "—", "—"],
  ["Tag filter / search", "✅", "✅", "📋", "—", "—"],
  ["Data export JSON/CSV", "✅", "✅", "📋", "—", "—"],
  ["Unified Task Edit", "✅", "✅", "🔄", "—", "—"],
  ["Android mobile app", "—", "—", "🔄", "—", "—"],
  ["Full Settings page", "🐛", "🐛", "🔄", "—", "—"],
  ["Profile + stats", "✅", "✅", "📋", "—", "—"],
]);
const timelineV03 = m(["DT", "WB", "SH", "SB"], [
  ["Doing-only visibility rule", "✅", "✅", "✅", "✅"],
  ["Remove from timeline (X)", "✅", "✅", "✅", "✅"],
  ["Midnight timeline clear", "✅", "✅", "✅", "✅"],
  ["Grouped routines UI", "✅", "—", "—", "✅"],
]);
const mcpMat = m(["MC", "DT", "WB"], [
  ["list_timeline_tasks", "✅", "✅", "✅"],
  ["add / remove timeline", "✅", "✅", "✅"],
  ["clear_timeline", "✅", "✅", "✅"],
  ["spawn_routine", "✅", "✅", "—"],
]);

const doc = `# Blocks Feature Registry

> **Format:** \`PP.PR.AA.SSS.FFF\` (stable) · \`PP.PR.AA.SSS.FFF-III\` (incident)  
> **Lookup:** Ctrl+F \`DT.UI.06.001.020\` · \`B-0003\` · \`🐛\` · \`#matrix\`  
> **Incidents:** [INCIDENTS.md](./INCIDENTS.md) · **New work:** [ROADMAP.md](./ROADMAP.md)  
> **Spec detail:** [ROADMAP.md](./ROADMAP.md) (core specs + N-#### roadmap)

---

## Matrix format {#matrix-format}

Aligned **\`|\`** columns — Feature width **32**, platform cells **10**.  
Regenerate matrices: \`node scripts/generate-registry.mjs\`

---

## Key — Platform (\`PP\`)

| Code | Platform | Notes |
|:----:|----------|-------|
| **DT** | Desktop | Electron · Windows primary |
| **WB** | Web / PWA | Next.js |
| **AD** | Android | React Native / Expo |
| **AP** | macOS | Electron · planned |
| **IO** | iOS | planned |
| **SH** | Shared UI | \`packages/ui\` |
| **SB** | Shared backend | \`packages/core\` |
| **MC** | MCP server | \`@blocks/mcp-server\` |
| **CX** | CI / build / docs | Workflows · scripts |

---

## Key — Prefix (\`PR\`)

| Code | Layer |
|:----:|-------|
| **UI** | User-facing screens |
| **BG** | Background (main, tray, installer) |
| **EN** | Engines & storage |

---

## Key — Area (\`AA\`)

| Code | Area | Spec |
|:----:|------|------|
| **00** | App shell | Top bar · nav · routing · shortcuts |
| **01** | Kanban | §1 |
| **02** | Timeline | §2 |
| **03** | Blocks | §3 Quick Add |
| **04** | Task Edit | §4 Unified edit |
| **05** | AI / Search | §5 |
| **06** | Settings | §6 |
| **07** | Profile | §7 |
| **08** | Shared systems | Theme · tokens |
| **09** | Infra | Build · CI |

---

## Health legend

| Symbol | Meaning |
|:------:|---------|
| ✅ | OK |
| 🐛 | Broken |
| 🔄 | In progress / partial |
| 📋 | Not built |
| 🧪 | Needs test |
| — | N/A |

---

## Index of matrices {#matrix}

| Matrix | Anchor |
|--------|--------|
| Core pages (00–07) | [#matrix-core-pages](#matrix-core-pages) |
| Phase 2 (19 features) | [#matrix-phase2](#matrix-phase2) |
| Timeline v0.0.3 | [#matrix-timeline-v03](#matrix-timeline-v03) |
| Settings › Appearance | [#matrix-settings-appearance](#matrix-settings-appearance) |
| MCP tools | [#matrix-mcp](#matrix-mcp) |
| Desktop background / build | [#matrix-dt-bg](#matrix-dt-bg) |

---

## Cross-platform matrix — Core pages {#matrix-core-pages}

${wrap(corePages)}

---

## Cross-platform matrix — Phase 2 features (19) {#matrix-phase2}

Migrated from spec § Phase 2 Required Features.

${wrap(phase2)}

---

## Cross-platform matrix — Timeline v0.0.3 {#matrix-timeline-v03}

${wrap(timelineV03)}

---

## Cross-platform matrix — Settings › Appearance {#matrix-settings-appearance}

${wrap(appearance)}

---

## Cross-platform matrix — MCP tools {#matrix-mcp}

${wrap(mcpMat)}

---

## Cross-platform matrix — Desktop background / build {#matrix-dt-bg}

${wrap(dtBg)}

---

## AA · 00 App shell {#aa-00}

> **Codes:** \`*.UI.00.*\` · Spec § Navigation Layout

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.00.001.010 | Top bar (menu · title · profile) | ✅ | \`navigation.spec.ts\` |
| DT.UI.00.002.010 | Bottom navigation bar | ✅ | \`navigation.spec.ts\` |
| DT.UI.00.003.010 | Page routing | ✅ | \`navigation.spec.ts\` |
| DT.UI.00.004.010 | Keyboard shortcuts | ✅ | \`keyboard.spec.ts\` |
| SH.UI.00.004.010 | useKeyboardShortcuts hook | ✅ | \`keyboard.spec.ts\` |

---

## AA · 01 Kanban {#aa-01}

> **Codes:** \`*.UI.01.*\` · Spec §1 Kanban Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.01.010.010 | Column drag-and-drop | ✅ | \`kanban.spec.ts\` |
| DT.UI.01.011.010 | Six status columns | ✅ | \`kanban.spec.ts\` |
| DT.UI.01.012.010 | Task card display | ✅ | \`task-card.spec.ts\` |
| DT.UI.01.013.010 | Per-column quick add | ✅ | \`kanban.spec.ts\` |
| DT.UI.01.040.010 | Bulk actions | ✅ | \`bulk-actions.spec.ts\` |
| WB.UI.01.010.010 | Kanban drag-drop (web) | ✅ | \`kanban.spec.ts\` |

---

## AA · 02 Timeline {#aa-02}

> **Codes:** \`*.UI.02.*\` · Spec §2 Timeline Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.02.010.010 | 24-hour time display | ✅ | \`timeline.spec.ts\` |
| DT.UI.02.020.010 | Drag-to-reschedule | ✅ | \`timeline-drag.spec.ts\` |
| DT.UI.02.030.010 | Doing-only visibility rule | ✅ | \`timeline-status.spec.ts\` |
| DT.UI.02.031.010 | Remove from timeline (X) | ✅ | \`timeline-status.spec.ts\` |
| DT.UI.02.032.010 | Midnight timeline clear | ✅ | \`timeline-reset.spec.ts\` |
| DT.UI.02.033.010 | Grouped routines (RoutineGroups) | ✅ | \`blocks-functionality.spec.ts\` |
| DT.UI.02.034.010 | Active task / timer display | ✅ | \`timer.spec.ts\` |
| DT.UI.02.035.010 | Schedule doing tasks button | ✅ | \`timeline.spec.ts\` |
| SB.EN.02.030.010 | Timeline service (core) | ✅ | \`timeline-status.spec.ts\` |
| SB.EN.02.032.010 | clearTimelineForNewDay | ✅ | \`timeline-reset.spec.ts\` |
| SB.EN.02.033.010 | Routine engine | ✅ | integration |

---

## AA · 03 Blocks (Quick Add) {#aa-03}

> **Codes:** \`*.UI.03.*\` · Spec §3 Blocks Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.03.010.010 | Quick block grid | ✅ | \`blocks.spec.ts\` |
| DT.UI.03.020.010 | Tap-to-create + placement picker | ✅ | \`blocks.spec.ts\` |
| DT.UI.03.030.010 | Edit / reorder blocks | ✅ | \`blocks.spec.ts\` |
| DT.UI.03.040.010 | Stats bar (duration totals) | ✅ | \`blocks.spec.ts\` |

---

## AA · 04 Task Edit (Unified) {#aa-04}

> **Codes:** \`*.UI.04.*\` · Spec §4 Task Edit Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.04.001.010 | Unified create/edit page | ✅ | \`task-edit.spec.ts\` |
| DT.UI.04.010.010 | Required fields (name, duration) | ✅ | \`task-crud.spec.ts\` |
| DT.UI.04.020.010 | Subtasks (SubtaskEditor) | ✅ | \`subtasks.spec.ts\` |
| DT.UI.04.030.010 | Recurrence selector | ✅ | \`recurring.spec.ts\` |
| DT.UI.04.040.010 | Tags (TagInput) | ✅ | \`search.spec.ts\` |
| DT.UI.04.050.010 | Task templates | ✅ | \`templates.spec.ts\` |
| DT.UI.04.090.010 | Delete task | ✅ | \`task-crud.spec.ts\` |
| SB.EN.04.030.010 | Recurring task engine | ✅ | \`recurring.spec.ts\` |

---

## AA · 05 AI / Search {#aa-05}

> **Codes:** \`*.UI.05.*\` · Spec §5 AI/Search Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.05.010.010 | AI chat interface | ✅ | \`ai-chat.spec.ts\` |
| DT.UI.05.020.010 | Task search / tag filter | ✅ | \`search.spec.ts\` |
| DT.UI.05.030.010 | Apply AI scheduling suggestions | ✅ | \`ai-chat.spec.ts\` |
| SB.EN.05.010.010 | Gemini AI service (core) | ✅ | integration |

---

## AA · 06 Settings {#aa-06}

> **Codes:** \`*.UI.06.*\` · Spec §6 Settings · Matrix [#matrix-settings-appearance](#matrix-settings-appearance)

### DT.UI.06.001 · Appearance {#dt-ui-06-001}

| Code | Feature | Health | Last incident | Playwright |
|------|---------|:------:|---------------|------------|
| DT.UI.06.001.010 | Dark theme | ✅ | — | \`theme.spec.ts\` |
| DT.UI.06.001.020 | Light theme | ✅ | B-0003 · -001 | \`theme.spec.ts\` |
| DT.UI.06.001.030 | System theme | ✅ | B-0003 · -001 | \`theme.spec.ts\` |

### DT.UI.06.002 · Work schedule {#dt-ui-06-002}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.06.002.010 | Work start / end time | ✅ | \`settings.spec.ts\` |
| DT.UI.06.002.020 | Work days selector | ✅ | \`settings.spec.ts\` |

### DT.UI.06.003 · Notifications {#dt-ui-06-003}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.06.003.010 | Enable notifications | ✅ | \`notifications.spec.ts\` |
| DT.UI.06.003.020 | Task reminders | ✅ | \`notifications.spec.ts\` |
| DT.UI.06.003.030 | Timer alerts | ✅ | \`notifications.spec.ts\` |
| DT.UI.06.003.040 | Daily summary | ✅ | \`notifications.spec.ts\` |

### DT.UI.06.004 · AI assistant {#dt-ui-06-004}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.06.004.010 | AI enable toggle | ✅ | \`settings.spec.ts\` |
| DT.UI.06.004.020 | Provider & API key | ✅ | \`settings.spec.ts\` |

### DT.UI.06.005 · Data {#dt-ui-06-005}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.06.005.010 | Export JSON | ✅ | \`export.spec.ts\` |
| DT.UI.06.005.020 | Export CSV | ✅ | \`export.spec.ts\` |
| DT.UI.06.005.030 | Sync status display | ✅ | \`sync.spec.ts\` |

### DT.UI.06.006 · About {#dt-ui-06-006}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.06.006.010 | Version display | ✅ | \`settings.spec.ts\` |
| DT.UI.06.006.020 | Check for updates | ✅ | manual |

### WB.UI.06 · Settings (web) {#wb-ui-06}

| Code | Feature | Health | Last incident | Playwright |
|------|---------|:------:|---------------|------------|
| WB.UI.06.001.010 | Dark theme | ✅ | — | \`theme.spec.ts\` |
| WB.UI.06.001.020 | Light theme | ✅ | B-0003 · -001 | \`theme.spec.ts\` |
| WB.UI.06.001.030 | System theme | ✅ | B-0003 · -001 | \`theme.spec.ts\` |

---

## AA · 07 Profile {#aa-07}

> **Codes:** \`*.UI.07.*\` · Spec §7 Profile Page

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| DT.UI.07.010.010 | User identity display | ✅ | \`profile.spec.ts\` |
| DT.UI.07.020.010 | Stats dashboard | ✅ | \`profile.spec.ts\` |
| DT.UI.07.030.010 | Productivity analytics | ✅ | \`profile.spec.ts\` |

---

## SH · Shared UI {#sh}

### SH.UI.08 · Shared systems {#sh-ui-08}

| Code | Feature | Health | Last incident | Playwright |
|------|---------|:------:|---------------|------------|
| SH.UI.08.001.000 | Theme provider & tokens | ✅ | B-0003 · -001 | \`theme.spec.ts\` |
| SH.UI.08.001.010 | CSS variables / globals | ✅ | B-0003 · -001 | integration |

---

## SB · Shared backend {#sb}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| SB.EN.08.010.010 | Dexie storage (v3 routines) | ✅ | \`storage.spec.ts\` |
| SB.EN.08.020.010 | Task engine | ✅ | integration |
| SB.EN.08.040.010 | P2P sync (Yjs/WebRTC) | ✅ | \`sync.spec.ts\` |
| SB.EN.08.050.010 | Notification engine | ✅ | \`notifications.spec.ts\` |

---

## MC · MCP server {#mc}

| Code | Feature | Health | Playwright |
|------|---------|:------:|------------|
| MC.EN.01.110.010 | list_timeline_tasks | ✅ | manual / MCP |
| MC.EN.01.120.010 | add_to_timeline | ✅ | manual / MCP |
| MC.EN.01.120.020 | remove_from_timeline | ✅ | manual / MCP |
| MC.EN.01.120.030 | clear_timeline | ✅ | manual / MCP |
| MC.EN.01.130.010 | spawn_routine | ✅ | manual / MCP |
| MC.EN.02.100.010 | File-backed MCP store | ✅ | manual |

---

## DT · Desktop background {#dt-bg}

| Code | Feature | Health | Last incident | Playwright |
|------|---------|:------:|---------------|------------|
| DT.BG.01.010.010 | Main process lifecycle | ✅ | — | manual |
| DT.BG.01.020.010 | System tray | ✅ | — | manual |
| DT.BG.01.030.010 | NSIS force-close upgrade | ✅ | B-0001 · -001 | installer QA |
| DT.BG.01.030.020 | NSIS force-close uninstall | ✅ | B-0001 · -001 | installer QA |
| DT.BG.01.040.010 | Auto-updater | ✅ | — | manual |
| DT.BG.01.050.010 | Global shortcut Ctrl+Shift+B | ✅ | — | manual |
| DT.BG.01.060.010 | Midnight timeline IPC timer | ✅ | — | \`timeline-reset.spec.ts\` |

---

## CX · CI / build {#cx}

| Code | Feature | Health | Last incident | Playwright |
|------|---------|:------:|---------------|------------|
| CX.EN.09.010.010 | pnpm build:win packaging | ✅ | B-0002 · -001 | CI |
| CX.EN.09.020.010 | Branding check script | ✅ | — | CI |
| CX.EN.09.030.010 | Playwright E2E gate | ✅ | — | CI |

---

## Adding a row

1. Stable code = \`PP.PR.AA.SSS.FFF\` (no \`-III\` in table).
2. On break: \`-III\` suffix + **B-####** in Last incident; update section matrix.
3. Regenerate: \`node scripts/generate-registry.mjs\`
4. Playwright tags: \`@core\` + \`@B-####\` or \`@N-####\`.
`;

fs.writeFileSync(path.join(root, "FEATURE_REGISTRY.md"), doc);
console.log("Wrote FEATURE_REGISTRY.md");
