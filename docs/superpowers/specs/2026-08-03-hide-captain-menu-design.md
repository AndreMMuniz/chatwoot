# Hide Captain From the Sidebar

## Goal

Remove the Captain entry and all of its nested navigation items from the main dashboard sidebar in this fork.

## Scope

- Remove only the Captain navigation group from the sidebar menu configuration.
- Keep Captain routes, pages, APIs, permissions, feature flags, and backend behavior unchanged.
- Keep direct URL access to Captain pages unchanged.
- Do not change Calls or visual branding in this subtask.

## Design

The Captain group is declared directly in the `menuItems` computed value in `app/javascript/dashboard/components-next/sidebar/Sidebar.vue`. Remove that group from the returned menu array. Do not hide it with CSS and do not add a new configuration flag, because this fork always intends to omit the menu entry.

This keeps the customization small and localized while avoiding changes to Captain's internal behavior or public contracts. No Enterprise override is needed because the sidebar declaration lives in the shared dashboard component and no corresponding Enterprise sidebar override exists.

## Verification

- Confirm the sidebar menu configuration no longer contains the Captain group.
- Run the frontend linter against the modified component.
- Verify the surrounding menu remains structurally valid and Calls remains unchanged.

## Out of Scope

- Disabling or deleting Captain functionality.
- Blocking direct navigation to Captain routes.
- Removing Captain-related settings, APIs, translations, or backend code.
- Removing Calls from the menu.
- Changing logos, colors, typography, names, or other visual identity elements.
