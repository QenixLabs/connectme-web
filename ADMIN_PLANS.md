# Admin Plans screen

URL: `/admin/plans`

This screen manages subscription plan families and their versions. A family groups related versions of a plan. The newest version is shown on the card; older versions can be expanded below it.

## Page-level controls

| Control | What it does |
| --- | --- |
| **Refresh All Razorpay Plans** | Opens a confirmation dialog. The confirmed action creates a new Razorpay-backed version for every active paid plan family using the backend's current Razorpay credentials. New signups use the new versions. Existing versions and subscriptions are preserved and are not migrated. The button is disabled while plans are loading, while a refresh is running, or when no plans exist. |
| **Cancel** (refresh dialog) | Closes the refresh confirmation without changing any plans. |
| **Create New Versions** (refresh dialog) | Confirms the bulk Razorpay refresh described above. The dialog shows a loading state while the operation runs and reports created and failed families afterward. |
| **Create Plan** | Opens the create-plan form. The form creates a new plan family and then refreshes the list. |
| **Retry** | Appears when loading plans fails. Requests the plan list again. |
| **All plans / Talent / Recruiter / Provider / Shared** | Filters the list by target role. The count beside each tab is the number of matching plan families. |
| **Search** | Filters by plan name, key, description, or feature text. |
| **Status** | Filters by **All statuses**, **Active**, **Inactive**, or **Sunsetting**. A plan is considered sunsetting when it has a sunset date or does not accept new subscriptions. |
| **Sort** | Orders cards by configured order, name Aâ€“Z, price low-to-high, or price high-to-low. |
| **Reset filters** | Clears the search, role filter, status filter, and non-default sort order. It only appears when a filter or non-default sort is active. |
| **Expand versions / Collapse versions** | Expands or hides older versions for every visible family. It is disabled when no visible family has older versions. |
| **Clear filters** | Appears when no cards match the current filters and performs the same reset as **Reset filters**. |
| **Older versions / Hide versions** | On an individual card, expands or hides only that family's older versions. |

## Actions on the current version card

| Button | What it does |
| --- | --- |
| **Edit** | Opens the plan editor. Saves display name, description, monthly/yearly prices, active status, popular badge, target role, quotas, and sort order. Changing price creates a new Razorpay plan/version; existing subscribers are not affected. Benefits are intentionally managed through **Family Benefits**. |
| **Save Changes** | Validates and sends the plan edits. On success, the admin and public plan lists are refreshed. While saving, it changes to **Saving...** and is disabled. |
| **Add** (Features in the editor) | Currently disabled in this editor. Feature editing is available through **Family Benefits**. |
| **Remove feature** (X icon in the editor) | Currently disabled in this editor for the same reason. |
| **New Version** | Opens a form for a new version in the current family. It is intended for changing version-specific values such as price, interval/pricing metadata, and activation state while keeping family benefits shared. Existing versions and subscribers remain in place. |
| **Create Version** | Creates the new version and refreshes the plan list. While submitting, it changes to **Creating...** and is disabled. |
| **Family Benefits** | Opens the family-level benefits editor. Changes apply to all versions in the family, including features, permissions, message quota, campaign quota, maximum images, and maximum videos. |
| **Add** (Features in Family Benefits) | Adds an empty feature row for editing. |
| **Remove feature** (X icon in Family Benefits) | Removes that feature row from the pending family-benefits update. |
| **Update Family Benefits** | Saves the family-wide benefits and refreshes the plan list. While submitting, it changes to **Saving...** and is disabled. |
| **Sunset** | Opens the sunset dialog. A sunset date stops the plan from accepting new subscriptions after that date; it does not automatically cancel existing subscriptions. The dialog checks the number of active subscribers first. |
| **Schedule Sunset** | Saves the selected sunset date. While submitting, it changes to **Scheduling...** and is disabled. |
| **Schedule Sunset & Migrate** | Saves the sunset date and bulk-schedules migrations for eligible subscribers to the selected target plan using the selected reason. It is available after enabling migration and completing the target-plan and reason fields. |
| **Migrate** | Opens a migration form for one subscription on the current plan. It lists eligible active, trialing, grace-period, or paused subscriptions. |
| **Schedule Migration** | Schedules the selected subscription to move to the target plan at the chosen effective date, with the selected reason. While submitting, it changes to **Scheduling...** and is disabled. |

## Actions on older versions

When **Older versions** is expanded, each older version has **Edit**, **Sunset**, and **Migrate**. They work the same way as the current-version actions, but target that specific version. Older versions do not show **New Version** or **Family Benefits** because those actions are offered from the familyâ€™s current version.

## Create Plan form

**Create Plan** opens a form with these inputs:

- **Plan Key**: unique technical identifier.
- **Family Key**: groups versions together; if left blank, the plan key is used.
- **Display Name** and **Description**: customer-facing plan text.
- **Monthly Price (paise)** and **Yearly Price (paise)**: integer amounts in paise; for example, `99900` is â‚¹999.
- **Target Role**: Talent Only, Recruiter Only, Provider Only, or Both.
- **Sort Order**: display ordering on pricing screens.
- **Features** and **Feature Permissions**: customer-visible benefits and internal permission keys.
- **Message Quota**, **Campaign Quota**, **Max Images**, and **Max Videos**: numeric limits.
- **Active**: controls whether the plan is available; inactive plans are hidden from the pricing page.
- **Most Popular**: shows the popular badge. Only one plan per role should be marked popular.

| Button | What it does |
| --- | --- |
| **Add** | Adds a feature row. |
| **Remove feature** (X icon) | Removes a feature row. |
| **Create Plan** | Validates and creates the plan family. While submitting, it changes to **Creating...** and is disabled. |

## New Version form

The **New Version** form has the same pricing, identity, role, metadata, quotas, permissions, active-state, and feature inputs as the create form, except that it is attached to the existing family. The form warns that benefits are shared across the family. **Add**, **Remove feature**, and **Create Version** have the meanings described above.

## Sunset and migration fields

- **Sunset Date**: date/time when the plan should stop accepting new subscriptions.
- **Migrate existing subscribers**: enables bulk migration during sunset.
- **Target Plan**: destination plan for bulk or individual migration; incompatible roles are filtered out.
- **Reason**: audit reason. Options include upgrade, downgrade, account review, or Custom.
- **Custom reason**: required when **Custom** is selected.
- **Effective Date**: when an individual migration takes effect.

## Important behavior

- Prices are entered in paise, not rupees.
- Editing shared benefits changes every version in the family.
- Creating a new version does not migrate existing subscribers.
- There is no Delete button on this screen, even though the API exposes a delete operation; plans must therefore be deactivated or sunset from the UI.

## Implementation references

- Page and card actions: `src/app/(admin-app)/admin/plans/page.tsx`
- Create form: `src/components/admin/create-plan-sheet.tsx`
- Version form: `src/components/admin/create-plan-version-sheet.tsx`
- Sunset dialog: `src/components/admin/sunset-plan-dialog.tsx`
- Family benefits form: `src/components/admin/edit-family-benefits-sheet.tsx`
- Migration form: `src/components/admin/schedule-migration-sheet.tsx`
- Plan API calls: `src/lib/api/plans.ts`


