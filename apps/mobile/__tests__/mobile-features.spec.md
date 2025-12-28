# Blocks Mobile App - Test Specifications

## Overview

This document outlines the test specifications for the Blocks mobile app features.
For React Native/Expo apps, we use **Detox** for E2E testing instead of Playwright.

---

## Test Categories

### 1. Navigation Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| NAV-001 | Bottom tab bar displays all 5 tabs (AI, Kanban, Timeline, Blocks, Add) | P1 |
| NAV-002 | Tapping tab navigates to correct page | P1 |
| NAV-003 | TopBar hamburger menu opens Settings | P1 |
| NAV-004 | TopBar profile icon opens Profile | P1 |
| NAV-005 | Back navigation works on modal pages | P1 |

### 2. Timeline Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| TL-001 | Timeline shows 24-hour view | P1 |
| TL-002 | Current time indicator displays correctly | P1 |
| TL-003 | Scheduled tasks display at correct time positions | P1 |
| TL-004 | Task blocks fill their full duration height | P1 |
| TL-005 | Tapping task opens Task Detail modal | P1 |
| TL-006 | Auto-scroll to current hour on page load | P2 |
| TL-007 | Pull-to-refresh reloads tasks | P2 |
| TL-008 | Empty state shows when no tasks scheduled | P2 |

### 3. Kanban Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| KAN-001 | All 6 columns display (Backlog, Design, To Do, Doing, Review, Done) | P1 |
| KAN-002 | Columns have correct colors | P1 |
| KAN-003 | Tasks grouped by status in correct columns | P1 |
| KAN-004 | Horizontal scroll between columns works | P1 |
| KAN-005 | Tapping task card opens Task Detail | P1 |
| KAN-006 | "Add Task" button in column opens Add Task with status pre-filled | P2 |
| KAN-007 | Task count badges display correctly | P2 |

### 4. Blocks Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| BLK-001 | Quick blocks display in grid layout | P1 |
| BLK-002 | Tapping block opens Placement Picker modal | P1 |
| BLK-003 | Placement Picker shows all 4 options | P1 |
| BLK-004 | "After Current Task" creates task scheduled correctly | P1 |
| BLK-005 | "Next Free Slot" finds gap in timeline | P1 |
| BLK-006 | "End of Day" schedules at work end time | P1 |
| BLK-007 | "Custom Time" navigates to Add Task page | P1 |
| BLK-008 | Success feedback shows on block tap | P2 |
| BLK-009 | Usage count increments after use | P2 |
| BLK-010 | "Create Defaults" initializes default blocks | P2 |
| BLK-011 | Edit mode toggles tile editing state | P3 |

### 5. AI/Search Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| AI-001 | Chat tab displays by default | P1 |
| AI-002 | Tab switcher toggles between Chat and Search | P1 |
| AI-003 | Quick prompts fill input field on tap | P2 |
| AI-004 | Sending message shows user bubble | P1 |
| AI-005 | AI response displays in assistant bubble | P1 |
| AI-006 | Loading indicator shows during API call | P2 |
| AI-007 | Online/Offline status indicator updates | P2 |
| AI-008 | Search tab shows search input | P1 |
| AI-009 | Typing in search filters tasks | P1 |
| AI-010 | Status filter chips work correctly | P2 |
| AI-011 | Priority filter chips work correctly | P2 |
| AI-012 | Tapping search result opens Task Detail | P1 |

### 6. Add Task Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| ADD-001 | Form displays all required fields | P1 |
| ADD-002 | Task name is required for Save | P1 |
| ADD-003 | Block size selector works | P1 |
| ADD-004 | Block count increment/decrement works | P1 |
| ADD-005 | Priority buttons toggle correctly | P1 |
| ADD-006 | Status buttons toggle correctly | P1 |
| ADD-007 | Access context multi-select works | P2 |
| ADD-008 | Tags can be added and removed | P2 |
| ADD-009 | Due date picker opens and selects date | P2 |
| ADD-010 | Color picker selects color | P2 |
| ADD-011 | Subtasks can be added and removed | P2 |
| ADD-012 | Subtasks can be toggled complete | P2 |
| ADD-013 | Save button creates task | P1 |
| ADD-014 | Cancel button dismisses modal | P1 |

### 7. Task Detail/Edit Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| EDIT-001 | Task details display correctly in view mode | P1 |
| EDIT-002 | Edit button toggles to edit mode | P1 |
| EDIT-003 | All fields editable in edit mode | P1 |
| EDIT-004 | Save button updates task | P1 |
| EDIT-005 | Checkbox toggles task complete/incomplete | P1 |
| EDIT-006 | Delete button shows confirmation | P1 |
| EDIT-007 | Confirm delete removes task | P1 |

### 8. Settings Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| SET-001 | Settings page loads from hamburger menu | P1 |
| SET-002 | Theme toggle switches between Dark/Light/System | P1 |
| SET-003 | Work schedule times are editable | P2 |
| SET-004 | Work days toggle on/off | P2 |
| SET-005 | Notification toggles work | P2 |
| SET-006 | AI settings visible and editable | P2 |
| SET-007 | API key input is masked by default | P2 |
| SET-008 | Export JSON triggers file share | P2 |
| SET-009 | Export CSV triggers file share | P2 |
| SET-010 | P2P Sync toggle works | P3 |
| SET-011 | Version info displays correctly | P1 |

### 9. Profile Page Tests

| Test Case | Description | Priority |
|-----------|-------------|----------|
| PRO-001 | Profile page loads from profile icon | P1 |
| PRO-002 | User avatar and name display | P1 |
| PRO-003 | Today's progress stats display | P1 |
| PRO-004 | Weekly bar chart renders | P2 |
| PRO-005 | Statistics list displays all metrics | P1 |
| PRO-006 | Recently completed tasks list shows | P2 |
| PRO-007 | Productivity breakdown displays | P2 |
| PRO-008 | Streak count displays correctly | P2 |

---

## Detox Setup (for future implementation)

```javascript
// detox.config.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6_Pro_API_33',
      },
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
```

---

## Test Priority Legend

| Priority | Description |
|----------|-------------|
| P1 | Critical - Must pass for release |
| P2 | Important - Should pass for release |
| P3 | Nice to have - Can be deferred |

---

## Running Tests

### Manual Testing Checklist

For quick manual testing before release:

1. [ ] App launches without crash
2. [ ] All 5 tabs navigate correctly
3. [ ] Can create a new task
4. [ ] Task appears in Kanban column
5. [ ] Task appears in Timeline when scheduled
6. [ ] Blocks page creates quick tasks
7. [ ] AI chat sends and receives messages
8. [ ] Search finds existing tasks
9. [ ] Settings page loads and saves
10. [ ] Profile page shows stats

### Automated Testing (Future)

```bash
# Install Detox CLI
npm install -g detox-cli

# Build for testing
detox build --configuration android.emu.debug

# Run tests
detox test --configuration android.emu.debug
```

---

*Last Updated: December 28, 2024*
*Version: 0.0.3*

