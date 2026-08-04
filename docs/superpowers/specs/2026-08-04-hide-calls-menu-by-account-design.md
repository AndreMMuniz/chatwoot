# Hide Calls Menu by Account

## Goal

Hide the Calls entry from the dashboard sidebar by default while allowing it to be re-enabled for an entire account through Chatwoot's existing account feature management.

## Scope

- Control only the Calls sidebar entry.
- Keep Calls routes, APIs, inbox settings, voice capabilities, and direct URL access unchanged.
- Use account-level control only; do not add user-level exceptions.
- Keep the existing Cloud-or-Enterprise capability check.

## Design

Add a dedicated account feature named `calls_dashboard`. Register it at the end of `config/features.yml` with `enabled: false` and `column: feature_flags_ext_1`, preserving the persisted feature-bit ordering rules. Expose the same key as `FEATURE_FLAGS.CALLS_DASHBOARD` in the frontend feature map.

The sidebar will show Calls only when both conditions are true:

1. The installation supports the Calls dashboard (`isOnChatwootCloud` or Enterprise).
2. The current account has `calls_dashboard` enabled.

The existing `accounts/isFeatureEnabledonAccount` getter will provide the account-level decision. This allows a Super Admin to enable the feature for one account without a deployment or code change.

The visibility flag must not reuse `channel_voice`: that feature controls actual voice capabilities in backend and inbox flows, while `calls_dashboard` controls only navigation visibility.

## Behavior

- Default: Calls is absent from the sidebar for every account.
- Enabled account on Cloud or Enterprise: Calls appears in the sidebar for every user in that account.
- Enabled account on Community: Calls remains hidden because the installation cannot serve the Enterprise Calls API.
- Direct navigation to existing Calls routes remains unchanged regardless of menu visibility.

## Verification

- Validate the feature configuration and its `feature_flags_ext_1` placement.
- Confirm the frontend flag key matches the backend feature name exactly.
- Confirm the sidebar condition requires both platform capability and the account flag.
- Run targeted ESLint for the modified JavaScript and Vue files.
- Run the relevant feature configuration checks and the frontend test suite before integration.

## Out of Scope

- Disabling Calls functionality or APIs.
- Changing `channel_voice` behavior.
- Adding per-user visibility.
- Adding a custom settings screen outside the existing Super Admin account feature controls.
- Changing Captain or visual identity.
