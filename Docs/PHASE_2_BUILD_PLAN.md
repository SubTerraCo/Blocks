# Blocks Phase 2 Build Plan

> **Reference:** [BLOCKS_CORE_FUNCTIONALITY.md](BLOCKS_CORE_FUNCTIONALITY.md)  
> **Target Version:** 0.1.0 (MVP Release)  
> **Primary Platform:** Win11 Desktop App

---

## Build Order Strategy

All features built in this order:
1. **Win11 Desktop** → Test → Commit
2. **Android App** → Test → Commit  
3. **PWA Web** → Test → Commit

---

## Phase 2 Sprints

### Sprint 1: Foundation (Week 1-2)

**Goal:** Establish unified architecture and fix foundational issues

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 1.1 Unified Task Edit Page | P0 | 8h | None |
| 1.2 Ensure Save button on all task forms | P0 | 4h | 1.1 |
| 1.3 Timeline Drag-to-Reschedule | P0 | 12h | None |
| 1.4 Blocks Placement Picker | P0 | 8h | 1.3 |
| 1.5 Full Settings Page Implementation | P1 | 12h | None |
| 1.6 Theme Toggle (Dark/Light/System) | P1 | 6h | 1.5 |

**Deliverables:**
- Task Edit page unified across all entry points
- Timeline supports drag-to-reschedule
- Blocks page shows placement picker on tap
- Settings page fully functional
- Theme toggle working

**Playwright Tests:**
- `task-edit-unified.spec.ts`
- `timeline-drag.spec.ts`
- `blocks-placement.spec.ts`
- `settings.spec.ts`
- `theme.spec.ts`

---

### Sprint 2: Time Tracking & Notifications (Week 3-4)

**Goal:** Implement active time tracking and notification system

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 2.1 Active Timer UI | P0 | 10h | None |
| 2.2 Timer Start/Stop/Pause | P0 | 8h | 2.1 |
| 2.3 Timer persistence (survives refresh) | P0 | 4h | 2.2 |
| 2.4 Overtime warnings | P1 | 4h | 2.2 |
| 2.5 Notification system setup | P0 | 8h | None |
| 2.6 Task reminders | P1 | 6h | 2.5 |
| 2.7 Timer alerts | P1 | 4h | 2.5 |
| 2.8 Daily summary notification | P2 | 6h | 2.5 |

**Deliverables:**
- Timer controls on active task (Timeline)
- Time tracked vs estimated visible
- Desktop notifications working
- Reminders fire at scheduled times

**Playwright Tests:**
- `timer.spec.ts`
- `notifications.spec.ts`

---

### Sprint 3: Profile & Statistics (Week 5)

**Goal:** Build analytics dashboard

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 3.1 Stats calculation logic | P0 | 8h | Sprint 2 |
| 3.2 Today's progress display | P0 | 4h | 3.1 |
| 3.3 Weekly progress chart | P1 | 6h | 3.1 |
| 3.4 All-time statistics | P1 | 4h | 3.1 |
| 3.5 Streak tracking | P1 | 4h | 3.1 |
| 3.6 Recent completed list | P2 | 3h | None |

**Deliverables:**
- Profile page shows accurate statistics
- Weekly progress visualization
- Streak tracking functional

**Playwright Tests:**
- `profile.spec.ts`
- `stats.spec.ts`

---

### Sprint 4: Recurring Tasks & Data Export (Week 6)

**Goal:** Implement recurring task system and data portability

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 4.1 Recurring task logic | P0 | 10h | None |
| 4.2 Daily recurrence | P0 | 4h | 4.1 |
| 4.3 Weekly recurrence | P0 | 4h | 4.1 |
| 4.4 Monthly recurrence | P1 | 4h | 4.1 |
| 4.5 Recurrence UI in Task Edit | P0 | 4h | 4.1 |
| 4.6 Data export (JSON) | P0 | 6h | None |
| 4.7 Data export (CSV) | P1 | 4h | 4.6 |
| 4.8 Export UI in Settings | P1 | 2h | 4.6 |

**Deliverables:**
- Recurring tasks auto-regenerate
- Export buttons in Settings work
- Export files are valid and complete

**Playwright Tests:**
- `recurring.spec.ts`
- `export.spec.ts`

---

### Sprint 5: AI Scheduler (Week 7-8)

**Goal:** Build intelligent task scheduling

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 5.1 AI scheduling prompt engineering | P0 | 8h | None |
| 5.2 Schedule suggestion generation | P0 | 12h | 5.1 |
| 5.3 "Apply Schedule" button | P0 | 6h | 5.2 |
| 5.4 Priority-based scheduling | P1 | 6h | 5.2 |
| 5.5 Conflict detection | P1 | 4h | 5.2 |
| 5.6 Work hours awareness | P1 | 4h | 5.2, Sprint 1 |

**Deliverables:**
- AI can suggest day schedules
- User can apply suggestions with one click
- Scheduling respects work hours

**Playwright Tests:**
- `ai-scheduler.spec.ts`

---

### Sprint 6: Advanced Features (Week 9)

**Goal:** Implement remaining productivity features

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 6.1 Advanced tag filtering | P1 | 6h | None |
| 6.2 Subtask progress bar | P1 | 4h | None |
| 6.3 Bulk selection UI | P1 | 8h | None |
| 6.4 Bulk move action | P1 | 4h | 6.3 |
| 6.5 Bulk delete action | P1 | 3h | 6.3 |
| 6.6 Task templates save | P2 | 6h | None |
| 6.7 Task templates apply | P2 | 4h | 6.6 |
| 6.8 Keyboard shortcuts (desktop) | P2 | 8h | None |

**Deliverables:**
- Multi-tag filtering in search
- Subtasks show completion progress
- Can select and move/delete multiple tasks
- Can save task as template
- Keyboard navigation works

**Playwright Tests:**
- `tags.spec.ts`
- `subtasks.spec.ts`
- `bulk-actions.spec.ts`
- `templates.spec.ts`
- `keyboard.spec.ts`

---

### Sprint 7: P2P Sync (Week 10-11)

**Goal:** Enable device-to-device sync

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 7.1 Yjs document setup | P0 | 8h | None |
| 7.2 WebRTC provider | P0 | 12h | 7.1 |
| 7.3 Sync status indicator | P0 | 4h | 7.2 |
| 7.4 Conflict resolution | P0 | 8h | 7.2 |
| 7.5 Offline queue | P1 | 6h | 7.2 |
| 7.6 Device pairing UI | P1 | 6h | 7.2 |

**Deliverables:**
- Devices on same network auto-sync
- Sync status visible in UI
- Works offline, syncs when reconnected

**Playwright Tests:**
- `sync.spec.ts`

---

### Sprint 8: Android App (Week 12-14)

**Goal:** Build and test Android app matching desktop

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 8.1 React Native project setup | P0 | 8h | None |
| 8.2 Port UI components | P0 | 20h | 8.1 |
| 8.3 Port Kanban page | P0 | 8h | 8.2 |
| 8.4 Port Timeline page | P0 | 8h | 8.2 |
| 8.5 Port Blocks page | P0 | 8h | 8.2 |
| 8.6 Port Task Edit page | P0 | 6h | 8.2 |
| 8.7 Port AI/Search page | P0 | 6h | 8.2 |
| 8.8 Port Settings page | P0 | 4h | 8.2 |
| 8.9 Port Profile page | P0 | 4h | 8.2 |
| 8.10 Mobile-specific adjustments | P1 | 12h | 8.3-8.9 |
| 8.11 Android build & test | P0 | 8h | 8.10 |

**Deliverables:**
- Android APK that matches desktop functionality
- Mobile-optimized touch interactions
- Same features working

**Tests:**
- Manual testing on Android device/emulator
- Detox E2E tests (optional)

---

### Sprint 9: PWA Alignment & Polish (Week 15)

**Goal:** Ensure PWA matches desktop exactly

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 9.1 Audit PWA vs Desktop features | P0 | 4h | Sprint 1-7 |
| 9.2 Fix any PWA gaps | P0 | 12h | 9.1 |
| 9.3 PWA manifest optimization | P1 | 4h | None |
| 9.4 Service worker caching | P1 | 6h | None |
| 9.5 Install prompt | P2 | 4h | None |

**Deliverables:**
- PWA feature-complete with desktop
- Works offline
- Installable

**Playwright Tests:**
- Full test suite against PWA

---

### Sprint 10: Testing & Release Prep (Week 16)

**Goal:** Full test coverage and release preparation

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 10.1 Write missing Playwright tests | P0 | 16h | All sprints |
| 10.2 Run full test suite | P0 | 4h | 10.1 |
| 10.3 Fix failing tests | P0 | 8h | 10.2 |
| 10.4 Performance audit | P1 | 4h | None |
| 10.5 Accessibility audit | P1 | 4h | None |
| 10.6 Update documentation | P0 | 4h | None |
| 10.7 Update CHANGELOG | P0 | 2h | None |
| 10.8 Build release artifacts | P0 | 4h | 10.3 |
| 10.9 Version bump to 0.1.0 | P0 | 1h | 10.8 |

**Deliverables:**
- All tests passing
- Documentation current
- v0.1.0 release ready

---

## Summary Timeline

| Sprint | Weeks | Focus |
|--------|-------|-------|
| 1 | 1-2 | Foundation (Unified Edit, Timeline Drag, Settings) |
| 2 | 3-4 | Time Tracking & Notifications |
| 3 | 5 | Profile & Statistics |
| 4 | 6 | Recurring Tasks & Export |
| 5 | 7-8 | AI Scheduler |
| 6 | 9 | Advanced Features |
| 7 | 10-11 | P2P Sync |
| 8 | 12-14 | Android App |
| 9 | 15 | PWA Alignment |
| 10 | 16 | Testing & Release |

**Total Estimated Time:** 16 weeks to v0.1.0 MVP

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| P2P Sync complexity | Start with simple Yjs setup, iterate |
| Android development time | Reuse maximum code from @blocks/ui |
| AI scheduling accuracy | Iterative prompt engineering |
| Test coverage gaps | Dedicate Sprint 10 to testing |

---

## Success Criteria for v0.1.0

- [ ] All 19 Phase 2 features implemented
- [ ] Win11 Desktop fully functional
- [ ] Android app matches desktop
- [ ] PWA matches desktop
- [ ] Playwright tests >80% pass rate
- [ ] No critical bugs
- [ ] Documentation complete

---

*Start with Sprint 1. Reference BLOCKS_CORE_FUNCTIONALITY.md for detailed specifications.*

