# Hide Calls Menu by Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the Calls sidebar entry by default and allow a Super Admin to enable it for an entire account through the existing account feature controls.

**Architecture:** Add a disabled-by-default `calls_dashboard` account feature in the extension bitset and expose the exact same key to the frontend. Gate the existing sidebar item with both platform capability and the current account flag, without changing Calls routes or runtime behavior.

**Tech Stack:** Ruby on Rails, FlagShihTzu account feature flags, YAML, Vue 3 Composition API, Vuex, JavaScript, RSpec, ESLint, pnpm

## Global Constraints

- Control only the Calls sidebar entry.
- Keep Calls routes, APIs, inbox settings, voice capabilities, and direct URL access unchanged.
- Use account-level control only; do not add user-level exceptions.
- Keep the existing Cloud-or-Enterprise capability check.
- The feature name must be exactly `calls_dashboard` in backend and frontend.
- The feature must default to disabled and use `feature_flags_ext_1`.
- Do not reuse or change `channel_voice`.
- Do not change Captain or visual identity.

---

### Task 1: Add the account feature contract

**Files:**
- Modify: `spec/models/account_spec.rb:146`
- Modify: `config/features.yml:275`
- Modify: `app/javascript/dashboard/featureFlags.js:45`

**Interfaces:**
- Consumes: `Featurable.feature_flag_mappings_for`, the persisted `feature_flags_ext_1` ordering, and the frontend `FEATURE_FLAGS` map.
- Produces: backend feature `feature_calls_dashboard` at extension bit position 7 and frontend constant `FEATURE_FLAGS.CALLS_DASHBOARD === 'calls_dashboard'`.

- [ ] **Step 1: Extend the existing feature mapping spec**

In `spec/models/account_spec.rb`, update the exact extension-column mapping to append the new flag without changing earlier positions:

```ruby
expect(described_class.flag_mapping['feature_flags_ext_1']).to eq(
  feature_whatsapp_manual_transfer: 1,
  feature_data_import: 1 << 1,
  feature_api_and_webhooks: 1 << 2,
  feature_whatsapp_reconfigure: 1 << 3,
  feature_whatsapp_embedded_signup_inbox_creation: 1 << 4,
  feature_delayed_automations: 1 << 5,
  feature_calls_dashboard: 1 << 6
)
```

Add this explicit persisted-position assertion beside the existing extension assertions:

```ruby
expect(described_class.flag_mapping['feature_flags_ext_1'][:feature_calls_dashboard]).to eq(64)
```

- [ ] **Step 2: Run the mapping spec and verify RED**

Run in an environment initialized with the repository Ruby version and Bundler:

```powershell
bundle exec rspec spec/models/account_spec.rb:146
```

Expected: FAIL because `feature_calls_dashboard` is absent from the actual extension mapping.

- [ ] **Step 3: Append the backend feature definition**

Append this block to the end of `config/features.yml`; do not reorder any existing feature:

```yaml
- name: calls_dashboard
  display_name: Calls Dashboard
  enabled: false
  column: feature_flags_ext_1
```

- [ ] **Step 4: Expose the matching frontend feature key**

Add this entry beside `CHANNEL_VOICE` in `app/javascript/dashboard/featureFlags.js`:

```js
CALLS_DASHBOARD: 'calls_dashboard',
```

- [ ] **Step 5: Run the feature contract checks**

Run:

```powershell
bundle exec rspec spec/models/account_spec.rb:146
pnpm exec eslint app/javascript/dashboard/featureFlags.js
```

Expected: the RSpec example passes and ESLint exits with code 0.

- [ ] **Step 6: Inspect and commit the feature contract**

Run:

```powershell
git diff --check
git diff -- spec/models/account_spec.rb config/features.yml app/javascript/dashboard/featureFlags.js
git add -- spec/models/account_spec.rb config/features.yml app/javascript/dashboard/featureFlags.js
git commit -m "feat(accounts): add Calls dashboard feature flag"
```

Expected: one commit containing only the backend feature definition, its mapping assertion, and the matching frontend key.

---

### Task 2: Gate the Calls sidebar item by account

**Files:**
- Modify: `app/javascript/dashboard/components-next/sidebar/Sidebar.vue:50-54`
- Modify: `app/javascript/dashboard/components-next/sidebar/Sidebar.vue:66-70`

**Interfaces:**
- Consumes: `FEATURE_FLAGS.CALLS_DASHBOARD`, `accountId`, `accounts/isFeatureEnabledonAccount`, `isOnChatwootCloud`, and `isEnterprise`.
- Produces: `isCallsAvailable`, a computed boolean that is true only when the installation supports Calls and the current account enables `calls_dashboard`.

- [ ] **Step 1: Move and strengthen the Calls availability computation**

Remove the current `isCallsAvailable` declaration above the account getters. Immediately after the `isFeatureEnabledonAccount` getter, add:

```js
// Calls rely on the enterprise API. Keep the menu hidden unless the
// installation supports it and the current account explicitly enables it.
const isCallsAvailable = computed(() => {
  const hasPlatformSupport = isOnChatwootCloud.value || isEnterprise;
  const isEnabledForAccount = isFeatureEnabledonAccount.value(
    accountId.value,
    FEATURE_FLAGS.CALLS_DASHBOARD
  );

  return hasPlatformSupport && isEnabledForAccount;
});
```

Do not change the existing Calls menu object or its route.

- [ ] **Step 2: Verify the visibility contract structurally**

Run:

```powershell
$sidebarPath = 'app\javascript\dashboard\components-next\sidebar\Sidebar.vue'
$sidebar = Get-Content -Raw $sidebarPath
if ($sidebar -notmatch 'FEATURE_FLAGS\.CALLS_DASHBOARD') { throw 'Calls account feature is not checked' }
if ($sidebar -notmatch 'isOnChatwootCloud\.value \|\| isEnterprise') { throw 'Calls platform capability check is missing' }
if ($sidebar -notmatch "name: 'Calls'") { throw 'Calls menu object was removed instead of gated' }
if ($sidebar -notmatch "calls_dashboard_index") { throw 'Calls route was changed or removed' }
```

Expected: command exits successfully, proving the menu object and route remain while both visibility conditions are present.

- [ ] **Step 3: Run targeted frontend lint**

Run:

```powershell
pnpm exec eslint app/javascript/dashboard/components-next/sidebar/Sidebar.vue
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 4: Inspect and commit the sidebar gate**

Run:

```powershell
git diff --check
git diff -- app/javascript/dashboard/components-next/sidebar/Sidebar.vue
git add -- app/javascript/dashboard/components-next/sidebar/Sidebar.vue
git commit -m "chore(sidebar): gate Calls menu by account"
```

Expected: one commit changing only the Calls availability computation; the Calls menu object, route, and direct access remain unchanged.

---

### Task 3: Verify the completed branch

**Files:**
- Verify: `config/features.yml`
- Verify: `spec/models/account_spec.rb`
- Verify: `app/javascript/dashboard/featureFlags.js`
- Verify: `app/javascript/dashboard/components-next/sidebar/Sidebar.vue`

**Interfaces:**
- Consumes: the completed account feature contract and sidebar availability computation.
- Produces: verification evidence that the feature is disabled by default, account-scoped, and does not remove Calls functionality.

- [ ] **Step 1: Run focused backend and frontend checks**

Run:

```powershell
bundle exec rspec spec/models/account_spec.rb:146
pnpm exec eslint app/javascript/dashboard/featureFlags.js app/javascript/dashboard/components-next/sidebar/Sidebar.vue
```

Expected: all focused checks pass.

- [ ] **Step 2: Run the frontend suite**

On Windows, use the PowerShell-compatible equivalent of the repository test script:

```powershell
$env:TZ='UTC'
pnpm exec vitest --no-watch --no-cache --no-coverage --logHeapUsage --reporter=dot
```

Expected: exit code 0.

- [ ] **Step 3: Verify final scope and history**

Run:

```powershell
git diff --check
git status --short --branch
git log --oneline -5
```

Expected: clean worktree with the two implementation commits following the design and plan commits; no Calls route, API, inbox setting, voice capability, Captain, or identity files changed.
