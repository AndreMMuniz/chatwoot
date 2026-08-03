# Hide Captain From the Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Captain navigation group from the dashboard sidebar while preserving all Captain functionality and direct URL access.

**Architecture:** Make one localized change to the `menuItems` computed array in the shared Vue sidebar component. Delete only the Captain group object; do not alter routes, feature flags, APIs, translations, Enterprise behavior, or the adjacent Calls entry.

**Tech Stack:** Vue 3 Composition API, JavaScript, Tailwind CSS, ESLint, pnpm

## Global Constraints

- Captain routes, pages, APIs, permissions, feature flags, and backend behavior must remain unchanged.
- Direct URL access to Captain pages must remain unchanged.
- Calls and visual branding are out of scope.
- Do not use CSS hiding or add a configuration flag.
- Do not add a new spec for this declarative removal; verify structurally and with targeted ESLint, following the repository instruction to avoid specs unless explicitly requested.

---

### Task 1: Remove the Captain navigation group

**Files:**
- Modify: `app/javascript/dashboard/components-next/sidebar/Sidebar.vue:495`

**Interfaces:**
- Consumes: the existing `menuItems` computed array returned by `Sidebar.vue`.
- Produces: the same menu item object structure, with the Captain group omitted and the Calls item left unchanged.

- [ ] **Step 1: Confirm the baseline menu declarations**

Run:

```powershell
Select-String -Path 'app\javascript\dashboard\components-next\sidebar\Sidebar.vue' -Pattern "name: 'Captain'|name: 'Calls'" -Context 2,3
```

Expected: one Captain group declaration and one Calls item declaration are present.

- [ ] **Step 2: Remove only the Captain group object**

In `app/javascript/dashboard/components-next/sidebar/Sidebar.vue`, delete the complete object beginning with:

```js
{
  name: 'Captain',
  icon: 'i-woot-captain',
  label: t('SIDEBAR.CAPTAIN'),
```

and ending after its `children` array with:

```js
  ],
},
```

The next array entry must remain the existing Calls conditional:

```js
...(isCallsAvailable.value
  ? [
      {
        name: 'Calls',
        label: t('SIDEBAR.CALLS'),
        icon: 'i-lucide-phone',
        to: accountScopedRoute('calls_dashboard_index'),
        activeOn: ['calls_dashboard_index'],
      },
    ]
  : []),
```

- [ ] **Step 3: Verify the structural result**

Run:

```powershell
$sidebarPath = 'app\javascript\dashboard\components-next\sidebar\Sidebar.vue'
$captainMenu = Select-String -Path $sidebarPath -Pattern "name: 'Captain'"
$callsMenu = Select-String -Path $sidebarPath -Pattern "name: 'Calls'"
if ($captainMenu) { throw 'Captain menu entry still exists' }
if (-not $callsMenu) { throw 'Calls menu entry was removed unexpectedly' }
```

Expected: command exits successfully with Captain absent and Calls present.

- [ ] **Step 4: Run targeted frontend lint**

Run:

```powershell
pnpm exec eslint app/javascript/dashboard/components-next/sidebar/Sidebar.vue
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 5: Inspect the final diff**

Run:

```powershell
git diff --check
git diff -- app/javascript/dashboard/components-next/sidebar/Sidebar.vue
```

Expected: no whitespace errors; the diff deletes only the Captain menu group.

- [ ] **Step 6: Commit the implementation**

Run:

```powershell
git add -- app/javascript/dashboard/components-next/sidebar/Sidebar.vue
git commit -m "chore(sidebar): hide Captain navigation"
```

Expected: one implementation commit containing only the sidebar component change.
