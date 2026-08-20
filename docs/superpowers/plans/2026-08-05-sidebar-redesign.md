# Sidebar Aurora Halo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the app sidebar to the "Aurora Halo" variant (V3) — premium, branded, calm — consistent with the already-redesigned dashboard/categories/reports pages.

**Architecture:** Rewrite the sidebar markup in `AppShell.tsx` (replace emoji icons with inline SVG line icons, restructure logo/nav/user blocks) and replace the legacy-token sidebar CSS in `src/index.css` with aurora-token-based styles. Add a subtle radial-blur aurora orb glow behind the logo, render the active nav item as an elevated white "floating card", and move the user/logout block into a small shadowed card. Keep the `/settings` nav item as a placeholder (no route yet — user will add functionality later). No new dependencies; no gradients (the orb is a radial-blur glow, the only permitted exception, matching the dashboard hero motif).

**Tech Stack:** React 19, Ant Design 6 (`Layout.Sider` wrapper kept), react-router-dom 7 (`NavLink`), inline SVG icons, global CSS in `src/index.css` using `--aurora-*` tokens, i18next, Sora + Inter fonts (already loaded by redesigned pages — verify).

## Global Constraints

- Light theme only. No dark-mode work (aurora tokens have no dark variants; this matches all three prior redesign specs).
- ONE chromatic accent: `#7C3AED` (`--aurora-accent`). No gradients except the single radial-blur orb glow behind the logo.
- Tokens: use `--aurora-*` set (`--aurora-surface #F7F5FB`, `--aurora-surface-card #FFFFFF`, `--aurora-accent #7C3AED`, `--aurora-accent-soft #EDE9FE`, `--aurora-text #1E1B2E`, `--aurora-text-secondary #6B6680`, `--aurora-border #E8E4F0`, `--aurora-shadow-sm/md/lg`).
- Radii: 16px cards, 12px buttons/nav rows, 999px pills. Shadows from aurora tokens only.
- Typography: Sora 600/700 for logo wordmark + numbers; Inter 400/500/600 for nav labels. `tabular-nums` not needed in sidebar (no numbers except none here) — skip.
- Icons: inline SVG, stroke 1.5px, `currentColor`, 20px box. NO emoji.
- Touch targets >= 44px. Focus ring: 2px `--aurora-accent` outline, 2px offset.
- Ant Design `colorPrimary` stays `#aa3bff` globally (do not change `AppAntdProvider`).
- No test framework exists — verification is visual + `npm run build` type-check + `npm run lint`.
- `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly` are enforced.
- Mobile breakpoint stays 768px (via `useMedia`). Mobile sidebar stays an overlay; the redesign must keep working in mobile mode.
- Communicate with the user in Russian; code/comments follow existing conventions.

---

## File Structure

**Modify:**
- `src/widgets/app-shell/ui/AppShell.tsx` — restructure Sider JSX: logo block, nav items (4, SVG icons), user card block. Keep Header/Content/Footer/offline banners untouched. Keep `useMedia`/`mobileOpen` logic.
- `src/index.css` — replace sidebar CSS classes (`.dashboard-sider*`, `.dashboard-navItem*`) with aurora-token-based rules. Add `.aurora-sider*` classes. Keep the mobile overlay rules but update selectors. Leave header/content/footer CSS as-is unless a shared token breaks.
- `src/main.tsx` — no change (the `/settings` route is intentionally absent; the NavLink stays as a placeholder).

**No new files** (keeps the single-global-CSS convention; introducing SCSS modules for one component would break the established pattern).

**Decisions already made by orchestrator:**
- Variant: V3 "Aurora Halo" (user-approved).
- Keep `Layout.Sider` as the wrapper (do not replace with a plain `<aside>` — collapse logic depends on it).
- Keep `NavLink` for nav items (active state via `isActive`).
- Inline SVG icons, not `@ant-design/icons` nav icons (the only Ant icons kept: `LogoutOutlined`, `MenuOutlined`, `WifiOutlined`).
- Logo monogram "FD" in a 36px accent-filled rounded square (solid `--aurora-accent`, white Sora-700 "FD") — the only solid-accent filled element.
- Active nav item = elevated white card (white bg, `--aurora-shadow-sm`, hairline `--aurora-border`, radius 12px, 3px accent left-bar, accent icon, primary text). Inactive = transparent, secondary text, secondary icon; hover = faint `--aurora-surface` fill.
- Aurora orb = single `radial-gradient(circle at 50% 0%, rgba(124,58,237,0.12), transparent 60%)` positioned behind the logo, `pointer-events:none`, low opacity.
- User block = small white card (radius 12px, `--aurora-shadow-sm`, hairline border) with avatar initials + name + logout ghost icon button.
- `/settings`: KEEP the nav item as a placeholder. No route exists yet — that is intentional; the user will add functionality later. Nav has 4 items: Dashboard, Reports, Categories, Settings.

---

### Task 1: Verify font loading and aurora token presence

**Files:**
- Read: `src/index.css:1-30`
- Read: `index.html` (font `<link>` for Sora + Inter)

**Interfaces:**
- Consumes: none
- Produces: confirmation that Sora + Inter are loaded and `--aurora-*` tokens exist in `:root`. If fonts are NOT loaded, Task 4 will add the `<link>`.

- [ ] **Step 1: Check index.html for Sora + Inter Google Fonts links**

Open `index.html`. Look for `<link>` tags loading `Sora` and `Inter` from Google Fonts. Record whether each is present.

- [ ] **Step 2: Confirm aurora tokens in src/index.css:14-30**

Confirm `--aurora-surface`, `--aurora-accent`, `--aurora-accent-soft`, `--aurora-text`, `--aurora-text-secondary`, `--aurora-border`, `--aurora-shadow-sm/md/lg` are all defined in `:root`.

- [ ] **Step 3: Record findings**

If Sora/Inter are missing from index.html, note it for Task 4. If aurora tokens are missing, STOP and report — the plan assumes they exist (they do, per research).

- [ ] **Step 4: Commit if any change** (likely none in this task — verification only)

---

### Task 2: Rewrite the Sider JSX in AppShell.tsx

**Files:**
- Modify: `src/widgets/app-shell/ui/AppShell.tsx:55-143`

**Interfaces:**
- Consumes: `useMedia`, `useState`, `NavLink`, `useNavigate`, `useAuth`, `useTranslation`, `LogoutOutlined`, `MenuOutlined`, `WifiOutlined` (existing imports — no new imports needed except none).
- Produces: a Sider with classes `aurora-sider`, `aurora-sider__logo`, `aurora-sider__nav`, `aurora-navItem`, `aurora-navItem--active`, `aurora-sider__userCard`. Nav items are 3 (Dashboard, Reports, Categories). Icons are inline SVG.

- [ ] **Step 1: Replace the logo block (lines 63-70)**

Replace with a logo block that includes the orb glow and accent monogram:

```tsx
<div className="aurora-sider__logo">
  <span className="aurora-sider__orb" aria-hidden="true" />
  <span className="aurora-sider__logoMark">FD</span>
  {(!isMobile || mobileOpen) ? (
    <span className="aurora-sider__logoText">{t("financeDashboard")}</span>
  ) : null}
</div>
```

- [ ] **Step 2: Define inline SVG icon components (add above the AppShell component, after imports)**

Add four small SVG icon components (stroke 1.5, currentColor, 20x20):

```tsx
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const IconReports = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 5-6" />
  </svg>
);
const IconCategories = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.2" />
  </svg>
);
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
```

- [ ] **Step 3: Replace the nav items block (lines 71-128)**

Replace the four NavLinks with four, using the SVG icons. Keep the `onClick` mobile-close behavior. Structure:

```tsx
<nav className="aurora-sider__nav">
  <NavLink
    to="/"
    end
    className={({ isActive }) =>
      `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
    }
    onClick={() => isMobile && setMobileOpen(false)}
  >
    <span className="aurora-navItem__icon"><IconDashboard /></span>
    {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("dashboard")}</span> : null}
  </NavLink>
  <NavLink
    to="/reports"
    className={({ isActive }) =>
      `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
    }
    onClick={() => isMobile && setMobileOpen(false)}
  >
    <span className="aurora-navItem__icon"><IconReports /></span>
    {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("reports")}</span> : null}
  </NavLink>
  <NavLink
    to="/categories"
    className={({ isActive }) =>
      `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
    }
    onClick={() => isMobile && setMobileOpen(false)}
  >
    <span className="aurora-navItem__icon"><IconCategories /></span>
    {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("categories")}</span> : null}
  </NavLink>
  <NavLink
    to="/settings"
    className={({ isActive }) =>
      `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
    }
    onClick={() => isMobile && setMobileOpen(false)}
  >
    <span className="aurora-navItem__icon"><IconSettings /></span>
    {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("settings")}</span> : null}
  </NavLink>
</nav>
```

Note: `end` prop on the Dashboard NavLink (`to="/"`) prevents it from being active on every route.

- [ ] **Step 4: Replace the user/logout block (lines 129-142)**

Replace with a user card:

```tsx
<div className="aurora-sider__userCard">
  <span className="aurora-sider__avatar">{userLabel}</span>
  {(!isMobile || mobileOpen) ? (
    <span className="aurora-sider__userMeta">
      <span className="aurora-sider__userName">{userName}</span>
      <Button
        type="text"
        size="small"
        className="aurora-sider__logoutBtn"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      />
    </span>
  ) : null}
</div>
```

Where `userName` and `userLabel` are derived from the auth user (see existing code lines 129-142 — keep the same derivation, just rename the wrapping classes). `handleLogout` is the existing logout handler (keep as-is).

- [ ] **Step 5: Update the Sider className (line 56)**

Change `className="dashboard-sider"` to `className="aurora-sider"`. Keep all Sider props (`collapsed`, `collapsible`, `collapsedWidth`, `trigger={null}`, `width={240}`) unchanged.

- [ ] **Step 6: Verify the file still type-checks**

Run: `npx tsc -b --noEmit`
Expected: no NEW errors beyond the two known pre-existing ones (`largestTransactions/ui/index.tsx`, `topCategories/model/lib.ts`). If new errors appear (e.g. unused `Tag`/`Typography` imports that were only used by removed code), remove them.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/app-shell/ui/AppShell.tsx
git commit -m "feat(app-shell): rewrite Sider JSX to aurora-halo structure with SVG icons"
```

---

### Task 3: Replace sidebar CSS with aurora-token-based rules

**Files:**
- Modify: `src/index.css:107-194` (sider + nav classes) and `:336-357` (user classes) and mobile overlay `:402-423`.

**Interfaces:**
- Consumes: `--aurora-*` tokens (verified in Task 1).
- Produces: `.aurora-sider`, `.aurora-sider__logo`, `.aurora-sider__orb`, `.aurora-sider__logoMark`, `.aurora-sider__logoText`, `.aurora-sider__nav`, `.aurora-navItem`, `.aurora-navItem--active`, `.aurora-navItem__icon`, `.aurora-navItem__label`, `.aurora-sider__userCard`, `.aurora-sider__avatar`, `.aurora-sider__userMeta`, `.aurora-sider__userName`, `.aurora-sider__logoutBtn`.

- [ ] **Step 1: Replace `.dashboard-sider` and logo/nav/user blocks with aurora classes**

Replace lines 107-194 and 336-357 with:

```css
.aurora-sider {
  background: var(--aurora-surface-card) !important;
  border-right: 1px solid var(--aurora-border);
  position: relative;
  overflow: visible;
}

.aurora-sider .ant-layout-sider-children {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 16px;
  gap: 16px;
}

.aurora-sider__logo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 8px;
}

.aurora-sider__orb {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 120px;
  background: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.12), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.aurora-sider__logoMark {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--aurora-accent);
  color: #fff;
  font-family: 'Sora', system-ui, sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.aurora-sider__logoText {
  position: relative;
  z-index: 1;
  font-family: 'Sora', system-ui, sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--aurora-text);
  white-space: nowrap;
}

.aurora-sider__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.aurora-navItem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  color: var(--aurora-text-secondary);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  min-height: 44px;
}

.aurora-navItem:hover {
  background: var(--aurora-surface);
  color: var(--aurora-text);
}

.aurora-navItem:focus-visible {
  outline: 2px solid var(--aurora-accent);
  outline-offset: 2px;
}

.aurora-navItem__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.aurora-navItem__label {
  white-space: nowrap;
}

.aurora-navItem--active {
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  box-shadow: var(--aurora-shadow-sm);
  color: var(--aurora-accent);
  font-weight: 600;
}

.aurora-navItem--active::before {
  content: "";
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 999px;
  background: var(--aurora-accent);
}

.aurora-navItem--active:hover {
  background: var(--aurora-surface-card);
  color: var(--aurora-accent);
}

.aurora-sider__userCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  box-shadow: var(--aurora-shadow-sm);
}

.aurora-sider__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--aurora-accent-soft);
  color: var(--aurora-accent);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.aurora-sider__userMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.aurora-sider__userName {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--aurora-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aurora-sider__logoutBtn {
  color: var(--aurora-text-secondary) !important;
  flex-shrink: 0;
}

.aurora-sider__logoutBtn:hover {
  color: var(--aurora-danger) !important;
}
```

- [ ] **Step 2: Update the mobile overlay rules (lines 402-423)**

Find the `@media (max-width: 768px)` block. Update selectors that reference `.dashboard-sider` to `.aurora-sider` and `.dashboard-sider-overlay` stays or is updated to match. Keep the overlay backdrop and the fixed-position Sider behavior. Replace `.dashboard-sider` references inside the media query with `.aurora-sider`.

- [ ] **Step 3: Remove now-unused legacy sidebar classes**

After replacing, the old `.dashboard-sider*` and `.dashboard-navItem*` classes are unused. Remove them to avoid dead CSS. Search the file for any remaining `.dashboard-sider` or `.dashboard-navItem` references (header/content classes like `.dashboard-header`, `.dashboard-content` are KEPT — only remove sider/nav/user ones).

- [ ] **Step 4: Verify no other code references removed classes**

Run: search `src/` for `dashboard-sider` and `dashboard-navItem`. Expected: zero hits outside `index.css` (AppShell.tsx was updated in Task 2). If hits remain, update them.

- [ ] **Step 5: Run build + lint**

Run: `npm run build`
Expected: type-check passes (modulo the two known pre-existing errors) and Vite build succeeds.
Run: `npm run lint`
Expected: no new lint errors.

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "feat(app-shell): aurora-halo sidebar styles with orb glow and elevated active card"
```

---

### Task 4: Fonts — ensure Sora + Inter are loaded

**Files:**
- Modify (only if Task 1 found them missing): `index.html`

**Interfaces:**
- Consumes: Task 1 findings.
- Produces: Sora (600/700) + Inter (400/500/600) available to the sidebar.

- [ ] **Step 1: If Sora/Inter are already loaded, skip this task**

If Task 1 confirmed both fonts are present in `index.html`, mark this task done and skip to Task 5.

- [ ] **Step 2: If missing, add the Google Fonts links to index.html `<head>`**

Add (respecting the existing CSP — if CSP blocks fonts.googleapis.com, instead self-host or use the same font loading mechanism the redesigned pages already use; check how dashboard/categories load Sora first):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet" />
```

IMPORTANT: The project has a strict CSP in `index.html`. If `fonts.googleapis.com` is not whitelisted, do NOT add external links — instead check how the already-redesigned dashboard page loads Sora (it must, since the spec uses Sora for display). Match that mechanism exactly. If no mechanism exists, fall back to `system-ui` (the font stacks already include `system-ui` as fallback) and note this as a risk rather than weakening CSP.

- [ ] **Step 3: Commit (only if changed)**

```bash
git add index.html
git commit -m "feat: load Sora + Inter fonts for aurora sidebar"
```

---

### Task 5: Verify the `/settings` nav item is kept as a placeholder

**Files:**
- Read: `src/widgets/app-shell/ui/AppShell.tsx` (already handled in Task 2 — Settings NavLink with `to="/settings"` and `IconSettings`).
- Read: `src/main.tsx` — confirm no `/settings` route exists (expected: none — intentional).

**Interfaces:**
- Consumes: Task 2 result (4 NavLinks including Settings).
- Produces: nav has exactly 4 items: Dashboard, Reports, Categories, Settings. Settings has no route yet (placeholder by user decision).

- [ ] **Step 1: Confirm Task 2 kept the settings NavLink**

Open `src/widgets/app-shell/ui/AppShell.tsx`. Confirm there IS a `to="/settings"` NavLink with the `IconSettings` icon and label `t("settings")`. If it is missing, add it per Task 2 Step 3.

- [ ] **Step 2: Confirm no `/settings` route in main.tsx (intentional)**

Open `src/main.tsx`. Confirm no `/settings` route is defined. This is EXPECTED and intentional — do NOT add a route. The NavLink stays as a placeholder; clicking it will render no matching route (blank content) until the user adds the settings page later.

- [ ] **Step 3: No commit needed** — this is a verification task only; no files change.

---

### Task 6: Visual verification and polish

**Files:**
- Read/verify: none modified (verification only); minor tweaks to `src/index.css` if needed.

**Interfaces:**
- Consumes: Tasks 1-5.
- Produces: a visually correct aurora-halo sidebar matching the V3 mockup at `docs/superpowers/specs/2026-08-05-sidebar-redesign-mockups.html`.

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`
Open `http://localhost:5173` in a browser.

- [ ] **Step 2: Verify desktop sidebar against the V3 mockup**

Check each:
- Logo: accent-filled "FD" monogram (36px, rounded 10px) + wordmark "Finance Dashboard" in Sora 600. Subtle orb glow visible behind the logo (faint violet radial blur at top).
- Nav: 4 items (Dashboard, Reports, Categories, Settings) with SVG line icons.
- Active item (Dashboard): elevated white card with hairline border, shadow-sm, 3px accent left-bar, accent icon + accent bold text.
- Inactive items: secondary text/icon; hover shows faint `#F7F5FB` fill.
- User card at bottom: white card, hairline border, shadow-sm, avatar initials in accent-soft circle, name, logout icon button (turns danger-red on hover).
- No gradients except the orb glow. No emoji.

- [ ] **Step 3: Verify mobile (<=768px)**

Resize to <=768px (or use devtools mobile view). Check:
- Hamburger button in header toggles the sidebar overlay.
- Sidebar slides in as an overlay with backdrop.
- Tapping a nav item closes the overlay.
- Logo wordmark and nav labels show when overlay is open (collapsed state hides them).
- User card shows full meta when open.

- [ ] **Step 4: Verify each route's active state**

Navigate to `/`, `/reports`, `/categories`. Confirm only the matching nav item is active (elevated card). Confirm Dashboard is NOT active on `/reports` or `/categories` (the `end` prop handles this). Note: `/settings` has no route, so navigating there shows blank content — that is expected (placeholder).

- [ ] **Step 5: Verify focus states**

Tab through nav items. Confirm the 2px accent focus ring appears on each.

- [ ] **Step 6: Fix any visual deviations**

If anything differs from the mockup, make small adjustments in `src/index.css` (aurora classes only). Re-verify.

- [ ] **Step 7: Final build + lint**

Run: `npm run build` and `npm run lint`.
Expected: both pass (modulo known pre-existing errors).

- [ ] **Step 8: Commit any polish changes**

```bash
git add src/index.css src/widgets/app-shell/ui/AppShell.tsx
git commit -m "polish(app-shell): aurora-halo sidebar visual refinements"
```

---

## Self-Review

**1. Spec coverage:**
- Aurora Halo variant features (orb glow, accent monogram, elevated active card, user card) → Task 2 (JSX) + Task 3 (CSS). ✓
- Aurora tokens used, legacy tokens dropped → Task 3. ✓
- SVG icons, no emoji → Task 2. ✓
- `/settings` nav item KEPT as placeholder (user decision) → Task 2 + Task 5. ✓
- Mobile overlay preserved → Task 3 Step 2 + Task 6 Step 3. ✓
- Fonts (Sora/Inter) → Task 1 + Task 4. ✓
- Light theme only, one accent, no gradients (except orb) → Global Constraints + Task 3. ✓

**2. Placeholder scan:** No TBD/TODO. All steps have concrete code or exact instructions. The one conditional (Task 4 fonts) has an explicit decision tree. ✓

**3. Type consistency:** Class names match between Task 2 (JSX) and Task 3 (CSS): `aurora-sider`, `aurora-sider__logo`, `aurora-sider__orb`, `aurora-sider__logoMark`, `aurora-sider__logoText`, `aurora-sider__nav`, `aurora-navItem`, `aurora-navItem--active`, `aurora-navItem__icon`, `aurora-navItem__label`, `aurora-sider__userCard`, `aurora-sider__avatar`, `aurora-sider__userMeta`, `aurora-sider__userName`, `aurora-sider__logoutBtn`. ✓
