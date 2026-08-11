# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-tab Settings page (`/settings`) with Profile, Appearance, Security, and Data tabs using Ant Design Tabs styled in Aurora Halo.

**Architecture:** FSD layers — `entities/settings` (types), `features/settings/*` (business-logic hooks), `widgets/settings` (container + dumb View with Tabs), `pages/settings` (thin wrapper). Global `useAppearanceStore` (Zustand + persist) for language/currency. Shared `useCurrencyFormatter` hook replacing hardcoded formatters across 5 widgets.

**Tech Stack:** React 19, TypeScript 6, Ant Design 6, Apollo Client 4, Zustand 5, i18next, Nhost Auth v4, Framer Motion

## Global Constraints

- Follow FSD conventions: logic/UI split, barrel exports, `.Widget` object-export for widgets
- Use Aurora Halo CSS tokens from `src/index.css` (no new hardcoded colors)
- All i18n keys in `src/i18n.js` with both `en` and `ru` translations
- `verbatimModuleSyntax` in tsconfig — use `import type` for type-only imports
- Commit messages in English, Co-Authored-By: Claude <noreply@anthropic.com>
- Currency defaults to `'USD'`, language defaults to current `i18n.language`
- Nhost operations via `useAuth().nhost` — no direct Nhost client imports outside AuthProvider
- Apollo mutations for data operations follow existing Hasura-style naming
- Delete account: use `nhost.auth.deleteSelf()` — assumes DB cascade (if fails, manual cleanup first)

---

## File Structure

### New files:
```
src/entities/settings/model/types.ts          — AppearanceSettings, profile types
src/features/settings/appearance/model/store.ts — Zustand useAppearanceStore (persist)
src/features/settings/profile/model/useProfile.ts — displayName read/save hook
src/features/settings/security/model/useSecurity.ts — password reset, delete account hook
src/features/settings/data/model/useDataManagement.ts — CSV export, clear data hook
src/shared/lib/useCurrencyFormatter.ts         — shared currency formatter hook
src/pages/settings/ui/SettingsPage.tsx         — thin page wrapper
src/pages/settings/index.ts                    — barrel export
src/widgets/settings/index.ts                  — barrel export { SettingsWidget }
src/widgets/settings/ui/SettingsView.tsx       — Tabs + tab panels (dumb UI)
src/widgets/settings/ui/Settings.module.scss   — settings-specific styles
src/widgets/settings/container/useContainer.ts — activeTab state, error/success handlers
```

### Modified files:
```
src/i18n.js                                    — add ~35 new settings keys (en + ru)
src/main.tsx                                   — add /settings route + import
src/widgets/dashboardHero/ui/DashboardHeroView.tsx — replace formatCurrency with useCurrencyFormatter
src/widgets/reportCard/ui/ReportCard.tsx        — replace formatCurrency with useCurrencyFormatter
src/widgets/topCategories/container/useContainer.tsx — replace currencyFormatter with useCurrencyFormatter
src/widgets/reportsHero/ui/ReportsHeroView.tsx  — replace formatCurrencyUSD with useCurrencyFormatter
src/widgets/expenseChart/container/useContainer.tsx — replace $ total text with useCurrencyFormatter
src/index.css                                  — add .settings-* and .settings-dangerCard classes
```

---

### Task 1: Types and i18n Keys

**Files:**
- Create: `src/entities/settings/model/types.ts`
- Modify: `src/i18n.js`

**Interfaces:**
- Produces: `AppearanceSettings { language: 'en' | 'ru'; currency: 'USD' | 'RUB' | 'EUR' | 'BYN' }`

**Purpose:** Foundation — type definitions and all user-facing strings.

- [ ] **Step 1: Create types file**

```typescript
// src/entities/settings/model/types.ts

export type Language = 'en' | 'ru';

export type Currency = 'USD' | 'RUB' | 'EUR' | 'BYN';

export interface AppearanceSettings {
  language: Language;
  currency: Currency;
}

export interface ProfileFormValues {
  displayName: string;
}

export interface SecurityFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteConfirmValues {
  confirmText: string;
}
```

- [ ] **Step 2: Add settings i18n keys to `src/i18n.js`**

Insert into the `en.translation` object after the `loadingError` key (line 175). Add these keys:

```javascript
// Settings page
settingsTitle: "Settings",
settingsSubtitle: "Manage profile and app preferences",
settingsProfile: "Profile",
settingsAppearance: "Appearance",
settingsSecurity: "Security",
settingsData: "Data",
// Profile
settingsName: "Name",
settingsEmail: "Email",
settingsEmailHint: "Email cannot be changed",
settingsSave: "Save",
settingsNameRequired: "Name is required",
settingsProfileSaved: "Profile updated",
settingsProfileError: "Failed to save profile",
// Appearance
settingsLanguage: "Language",
settingsCurrency: "Currency",
// Security
settingsChangePassword: "Change Password",
settingsNewPassword: "New password",
settingsConfirmPassword: "Confirm password",
settingsPasswordMinLength: "Minimum 8 characters",
settingsPasswordsDoNotMatch: "Passwords do not match",
settingsPasswordResetSent: "Password reset link sent to your email",
settingsPasswordResetError: "Failed to send reset link",
settingsDangerZone: "Danger Zone",
settingsDeleteAccount: "Delete Account",
settingsDeleteAccountDesc: "Account deletion is irreversible. All your transactions and categories will be permanently deleted.",
settingsDeleteAccountConfirm: "Type DELETE to confirm",
settingsDeleteAccountSuccess: "Account deleted",
settingsDeleteAccountError: "Failed to delete account",
// Data
settingsExport: "Export",
settingsExportDesc: "Download all your transactions as a CSV file",
settingsExportCsv: "Export to CSV",
settingsExportSuccess: "File downloaded",
settingsExportError: "Failed to export data",
settingsClearData: "Clear All Data",
settingsClearDataDesc: "Clear all data. This action is irreversible. All your transactions and user categories will be permanently deleted.",
settingsClearDataConfirm: "Type CLEAR to confirm",
settingsClearDataSuccess: "All data cleared",
settingsClearDataError: "Failed to clear data",
settingsProcessing: "Processing...",
```

Then add the same keys to `ru.translation` after line 333:

```javascript
// Настройки
settingsTitle: "Настройки",
settingsSubtitle: "Управление профилем и приложением",
settingsProfile: "Профиль",
settingsAppearance: "Оформление",
settingsSecurity: "Безопасность",
settingsData: "Данные",
// Профиль
settingsName: "Имя",
settingsEmail: "Email",
settingsEmailHint: "Email нельзя изменить",
settingsSave: "Сохранить",
settingsNameRequired: "Имя обязательно",
settingsProfileSaved: "Профиль обновлён",
settingsProfileError: "Не удалось сохранить профиль",
// Оформление
settingsLanguage: "Язык",
settingsCurrency: "Валюта",
// Безопасность
settingsChangePassword: "Смена пароля",
settingsNewPassword: "Новый пароль",
settingsConfirmPassword: "Подтвердите пароль",
settingsPasswordMinLength: "Минимум 8 символов",
settingsPasswordsDoNotMatch: "Пароли не совпадают",
settingsPasswordResetSent: "Ссылка для сброса пароля отправлена на ваш email",
settingsPasswordResetError: "Не удалось отправить ссылку",
settingsDangerZone: "Опасная зона",
settingsDeleteAccount: "Удалить аккаунт",
settingsDeleteAccountDesc: "Удаление аккаунта — необратимое действие. Все ваши транзакции и категории будут удалены.",
settingsDeleteAccountConfirm: "Введите УДАЛИТЬ для подтверждения",
settingsDeleteAccountSuccess: "Аккаунт удалён",
settingsDeleteAccountError: "Не удалось удалить аккаунт",
// Данные
settingsExport: "Экспорт",
settingsExportDesc: "Скачайте все транзакции в формате CSV",
settingsExportCsv: "Экспорт в CSV",
settingsExportSuccess: "Файл скачан",
settingsExportError: "Не удалось экспортировать данные",
settingsClearData: "Очистить все данные",
settingsClearDataDesc: "Очистка всех данных. Это действие необратимо. Все транзакции и пользовательские категории будут удалены без возможности восстановления.",
settingsClearDataConfirm: "Введите ОЧИСТИТЬ для подтверждения",
settingsClearDataSuccess: "Все данные удалены",
settingsClearDataError: "Не удалось очистить данные",
settingsProcessing: "Обработка...",
```

- [ ] **Step 3: Commit**

```bash
git add src/entities/settings/model/types.ts src/i18n.js
git commit -m "feat(settings): add types and i18n keys for settings page

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Appearance Store (Zustand)

**Files:**
- Create: `src/features/settings/appearance/model/store.ts`
- Create: `src/features/settings/appearance/index.ts`

**Interfaces:**
- Produces: `useAppearanceStore` — Zustand store with `language`, `currency`, `setLanguage(lang)`, `setCurrency(curr)`, persisted to localStorage key `appearance-settings`

- [ ] **Step 1: Create the Zustand store**

```typescript
// src/features/settings/appearance/model/store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";
import type { Language, Currency } from "@/entities/settings/model/types";

interface AppearanceState {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      language: (i18n.language as Language) ?? "en",
      currency: "USD",
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "appearance-settings",
    },
  ),
);
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/features/settings/appearance/index.ts
export { useAppearanceStore } from "./model/store";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/appearance/
git commit -m "feat(settings): add appearance store with language and currency persistence

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Shared Currency Formatter Hook

**Files:**
- Create: `src/shared/lib/useCurrencyFormatter.ts`

**Interfaces:**
- Produces: `useCurrencyFormatter() → (value: number) => string`

- [ ] **Step 1: Create the hook**

```typescript
// src/shared/lib/useCurrencyFormatter.ts

import { useAppearanceStore } from "@/features/settings/appearance";

export function useCurrencyFormatter(): (value: number) => string {
  const currency = useAppearanceStore((s) => s.currency);
  return (value: number) => {
    const locale = currency === "RUB" ? "ru-RU" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "RUB" ? 0 : 2,
      maximumFractionDigits: currency === "RUB" ? 0 : 2,
    }).format(value);
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/lib/useCurrencyFormatter.ts
git commit -m "feat(settings): add shared useCurrencyFormatter hook

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Refactor Currency Formatters in Widgets

**Files:**
- Modify: `src/widgets/dashboardHero/ui/DashboardHeroView.tsx`
- Modify: `src/widgets/reportCard/ui/ReportCard.tsx`
- Modify: `src/widgets/topCategories/container/useContainer.tsx`
- Modify: `src/widgets/reportsHero/ui/ReportsHeroView.tsx`
- Modify: `src/widgets/expenseChart/container/useContainer.tsx`

**Interfaces:**
- Consumes: `useCurrencyFormatter` from `@/shared/lib/useCurrencyFormatter`
- Produces: No new surface — internal refactor only. All 5 widgets now use user-selected currency instead of hardcoded RUB/USD.

- [ ] **Step 1: Refactor DashboardHeroView.tsx**

Replace lines 15–22 (`formatCurrency` function) with:

```typescript
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";

// Inside the component body (after useMotionConfig):
const formatCurrency = useCurrencyFormatter();
```

The `formatCurrency` is already called inside `CountUpBalance` which is a child of `DashboardHeroView`. Since `CountUpBalance` is a `FC` defined in the same file, pass `formatCurrency` as a prop or move it to the parent scope. Replace the `CountUpBalance` component to accept an additional `format` prop:

```typescript
const CountUpBalance: FC<{ value: number; duration: number; format: (v: number) => string }> = ({
  value,
  duration,
  format: fmt,
}) => {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const display = useTransform(rounded, (v) => fmt(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, motionVal]);

  return <motion.span>{display}</motion.span>;
};
```

Then in `DashboardHeroView`, pass `formatCurrency`:

```tsx
<CountUpBalance
  value={Math.abs(balance)}
  duration={config.countUpDuration}
  format={formatCurrency}
/>
```

- [ ] **Step 2: Refactor ReportCard.tsx**

Replace lines 11–18 (`formatCurrency` function) with:

```typescript
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";

// Inside the component body:
const formatCurrency = useCurrencyFormatter();
```

- [ ] **Step 3: Refactor topCategories/useContainer.tsx**

Replace lines 8–11 (`currencyFormatter`) with:

Inside the `useContainer` function body (since hooks must be called in component/hook context):

```typescript
// Remove the module-level `const currencyFormatter = new Intl.NumberFormat(...)`
// Inside useContainer:
const formatCurrency = useCurrencyFormatter();
```

Then replace line 31 `currencyFormatter.format(item.amount)` with `formatCurrency(item.amount)`.

Since `useContainer` is a hook (not a React component, but follows hook naming), it can call `useCurrencyFormatter` directly.

- [ ] **Step 4: Refactor ReportsHeroView.tsx**

Replace lines 15–22 (`formatCurrencyUSD` function) with:

```typescript
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";

// Inside the component body:
const formatCurrency = useCurrencyFormatter();
```

Then replace all uses of `formatCurrencyUSD` (lines 86, 94, 107 for format props) with `formatCurrency`.

- [ ] **Step 5: Refactor expenseChart/useContainer.tsx**

The chart title currently shows `$${chartData.total.toLocaleString()}` (line 54). Import and use `useCurrencyFormatter`:

```typescript
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";

// Inside useContainer:
const formatCurrency = useCurrencyFormatter();
```

Then replace the title text line 54:
```typescript
text: `${t("total")}: ${formatCurrency(chartData.total)}`,
```

- [ ] **Step 6: Commit**

```bash
git add src/widgets/dashboardHero/ui/DashboardHeroView.tsx \
        src/widgets/reportCard/ui/ReportCard.tsx \
        src/widgets/topCategories/container/useContainer.tsx \
        src/widgets/reportsHero/ui/ReportsHeroView.tsx \
        src/widgets/expenseChart/container/useContainer.tsx
git commit -m "refactor(settings): replace hardcoded currency formatters with useCurrencyFormatter

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: useProfile Hook

**Files:**
- Create: `src/features/settings/profile/model/useProfile.ts`
- Create: `src/features/settings/profile/index.ts`

**Interfaces:**
- Consumes: `useAuth()` from `@/app/providers/AuthProvider` → `user.displayName`, `user.email`, `nhost`
- Produces: `useProfile() → { displayName, email, saving, error, updateProfile(name: string) => Promise<void> }`

- [ ] **Step 1: Create the hook**

```typescript
// src/features/settings/profile/model/useProfile.ts

import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { message } from "antd";
import { useTranslation } from "react-i18next";

interface UseProfileResult {
  displayName: string;
  email: string;
  saving: boolean;
  error: string | null;
  updateProfile: (name: string) => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { user, nhost } = useAuth();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = user?.displayName ?? "";
  const email = user?.email ?? "";

  const updateProfile = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setError(t("settingsNameRequired"));
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const user = nhost.getUserSession();
        if (!user) throw new Error("Not authenticated");
        const { error: updateError } = await nhost.auth.updateUser({
          displayName: name.trim(),
        });
        if (updateError) throw updateError;
        message.success(t("settingsProfileSaved"));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        setError(msg);
        message.error(t("settingsProfileError"));
      } finally {
        setSaving(false);
      }
    },
    [nhost, t],
  );

  return { displayName, email, saving, error, updateProfile };
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/features/settings/profile/index.ts
export { useProfile } from "./model/useProfile";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/profile/
git commit -m "feat(settings): add useProfile hook for displayName editing

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: useSecurity Hook

**Files:**
- Create: `src/features/settings/security/model/useSecurity.ts`
- Create: `src/features/settings/security/index.ts`

**Interfaces:**
- Consumes: `useAuth()` → `user.email`, `nhost`
- Produces: `useSecurity() → { resettingPassword, deletingAccount, passwordError, resetPassword() => Promise<void>, deleteAccount() => Promise<void> }`

- [ ] **Step 1: Create the hook**

```typescript
// src/features/settings/security/model/useSecurity.ts

import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { purgeApolloCache } from "@/app/providers/apollo";
import { useNavigate } from "react-router-dom";

interface UseSecurityResult {
  resettingPassword: boolean;
  deletingAccount: boolean;
  passwordError: string | null;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export function useSecurity(): UseSecurityResult {
  const { user, nhost } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const resetPassword = useCallback(
    async (newPassword: string, confirmPassword: string) => {
      setPasswordError(null);
      if (newPassword.length < 8) {
        setPasswordError(t("settingsPasswordMinLength"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError(t("settingsPasswordsDoNotMatch"));
        return;
      }
      setResettingPassword(true);
      try {
        const email = user?.email;
        if (!email) throw new Error("No email found");
        const { error } = await nhost.auth.resetPassword({ email });
        if (error) throw error;
        message.success(t("settingsPasswordResetSent"));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        setPasswordError(msg);
        message.error(t("settingsPasswordResetError"));
      } finally {
        setResettingPassword(false);
      }
    },
    [nhost, user, t],
  );

  const deleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      const session = nhost.getUserSession();
      if (!session) throw new Error("Not authenticated");

      // Try deleting the auth user directly (relies on DB cascade)
      const { error: deleteError } = await nhost.auth.deleteSelf();
      if (deleteError) throw deleteError;

      // Clean up local state
      await purgeApolloCache();
      message.success(t("settingsDeleteAccountSuccess"));
      navigate("/auth", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err);
      message.error(t("settingsDeleteAccountError"));
      throw err; // re-throw so modal can close on success
    } finally {
      setDeletingAccount(false);
    }
  }, [nhost, navigate, t]);

  return {
    resettingPassword,
    deletingAccount,
    passwordError,
    resetPassword,
    deleteAccount,
  };
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/features/settings/security/index.ts
export { useSecurity } from "./model/useSecurity";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/security/
git commit -m "feat(settings): add useSecurity hook for password reset and account deletion

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: useDataManagement Hook

**Files:**
- Create: `src/features/settings/data/model/useDataManagement.ts`
- Create: `src/features/settings/data/index.ts`

**Interfaces:**
- Consumes: Apollo `useQuery` from `@/entities/transaction/api/graphql` (GET_TRANSACTIONS), `useQuery` from `@/entities/category/api/graphql` (GET_CATEGORIES), `useMutation` for DELETE_TRANSACTION and DELETE_CATEGORY
- Produces: `useDataManagement() → { exporting, clearing, exportToCsv() => Promise<void>, clearAllData() => Promise<void> }`

- [ ] **Step 1: Create the hook**

```typescript
// src/features/settings/data/model/useDataManagement.ts

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import {
  GET_TRANSACTIONS,
  DELETE_TRANSACTION,
} from "@/entities/transaction/api/graphql";
import {
  GET_CATEGORIES,
  DELETE_CATEGORY,
} from "@/entities/category/api/graphql";
import type { Transaction } from "@/entities/transaction/model/types";
import type { Category } from "@/entities/category/model/types";

function generateCsv(transactions: Transaction[]): string {
  const BOM = "﻿";
  const headers = ["date", "type", "category", "amount", "description"];
  const escapeCsv = (val: string | null | undefined) => {
    if (val == null) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = transactions.map((tx) =>
    [
      tx.date ? new Date(tx.date).toISOString().slice(0, 10) : "",
      tx.type,
      tx.category?.name ?? "",
      tx.amount.toString(),
      tx.description ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  return BOM + [headers.join(","), ...rows].join("\n");
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface UseDataManagementResult {
  exporting: boolean;
  clearing: boolean;
  exportToCsv: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export function useDataManagement(): UseDataManagementResult {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { data: txData, refetch } = useQuery(GET_TRANSACTIONS, {
    fetchPolicy: "cache-first",
  });
  const { data: catData, refetch: refetchCategories } = useQuery(
    GET_CATEGORIES,
    { fetchPolicy: "cache-first" },
  );

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const exportToCsv = useCallback(async () => {
    setExporting(true);
    try {
      const { data: freshData } = await refetch();
      const transactions: Transaction[] =
        freshData?.transactions ?? [];
      if (transactions.length === 0) {
        message.info(t("reportsNoData"));
        return;
      }
      const csv = generateCsv(transactions);
      downloadCsv(csv, `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      message.success(t("settingsExportSuccess"));
    } catch (err: unknown) {
      message.error(t("settingsExportError"));
    } finally {
      setExporting(false);
    }
  }, [refetch, t]);

  const clearAllData = useCallback(async () => {
    setClearing(true);
    try {
      // Delete all user transactions
      const { data: freshTx } = await refetch();
      const transactions: Transaction[] = freshTx?.transactions ?? [];
      for (const tx of transactions) {
        await deleteTransaction({ variables: { id: tx.id } });
      }

      // Delete all user categories (user_id IS NOT NULL)
      const { data: freshCat } = await refetchCategories();
      const categories: Category[] = freshCat?.categories ?? [];
      const userCategories = categories.filter((c) => c.user_id != null);
      for (const cat of userCategories) {
        await deleteCategory({ variables: { id: cat.id } });
      }

      message.success(t("settingsClearDataSuccess"));
    } catch (err: unknown) {
      message.error(t("settingsClearDataError"));
    } finally {
      setClearing(false);
    }
  }, [refetch, refetchCategories, deleteTransaction, deleteCategory, t]);

  return { exporting, clearing, exportToCsv, clearAllData };
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/features/settings/data/index.ts
export { useDataManagement } from "./model/useDataManagement";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/data/
git commit -m "feat(settings): add useDataManagement hook for CSV export and data clearing

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Settings Page CSS

**Files:**
- Modify: `src/index.css` (append new classes at the end)

- [ ] **Step 1: Add CSS classes to `src/index.css`**

Append after the last line of the file:

```css
/* === Settings Page === */

.settings-tabs.ant-tabs {
  font-family: 'Inter', system-ui, sans-serif;
}

.settings-tabs .ant-tabs-nav {
  margin-bottom: 0;
}

.settings-tabs .ant-tabs-nav::before {
  border-bottom-color: var(--aurora-border);
}

.settings-tabs .ant-tabs-tab {
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--aurora-text-secondary);
  transition: color 0.15s;
}

.settings-tabs .ant-tabs-tab:hover {
  color: var(--aurora-accent);
}

.settings-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: var(--aurora-accent);
  font-weight: 600;
}

.settings-tabs .ant-tabs-ink-bar {
  background: var(--aurora-accent);
  height: 2px;
}

.settings-tabContent {
  padding: 28px 24px;
}

.settings-card {
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  border-radius: 16px;
  box-shadow: var(--aurora-shadow-sm);
  padding: 28px 24px;
}

.settings-card__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
}

.settings-row__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--aurora-text);
  line-height: 1.4;
}

.settings-row--stacked {
  flex-direction: column;
  align-items: flex-start;
}
.settings-row--stacked .settings-row__label {
  margin-bottom: -8px;
}

.settings-dangerCard {
  background: var(--aurora-danger-soft);
  border: 1px solid var(--aurora-danger);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
}

.settings-dangerCard__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-dangerCard__icon {
  color: var(--aurora-danger);
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.settings-dangerCard__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--aurora-danger);
}

.settings-dangerCard__desc {
  font-size: 13px;
  color: var(--aurora-text-secondary);
  line-height: 1.5;
}

.settings-modal .ant-modal-content {
  border-radius: 16px;
  border: 1px solid var(--aurora-border);
}

/* Confirm delete input in modal */
.settings-confirmInput {
  margin-top: 4px;
}
.settings-confirmInput .ant-input {
  border-color: var(--aurora-danger);
}
.settings-confirmInput .ant-input:focus {
  border-color: var(--aurora-danger);
  box-shadow: 0 0 0 3px rgba(224, 69, 123, 0.15);
}

/* Divider in settings */
.settings-divider {
  height: 1px;
  background: var(--aurora-border);
  margin: 4px 0 12px;
}

@media (max-width: 768px) {
  .settings-tabContent {
    padding: 16px;
  }
  .settings-card {
    padding: 20px 16px;
  }
  .settings-card__section {
    max-width: 100%;
  }
  .settings-dangerCard {
    max-width: 100%;
  }
  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat(settings): add settings page CSS classes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: SettingsView (Dumb UI + Container)

**Files:**
- Create: `src/widgets/settings/ui/SettingsView.tsx`
- Create: `src/widgets/settings/ui/Settings.module.scss`
- Create: `src/widgets/settings/container/useContainer.ts`
- Create: `src/widgets/settings/index.ts`

**Interfaces:**
- Consumes: `useProfile`, `useSecurity`, `useDataManagement`, `useAppearanceStore`, `useTranslation`
- Produces: `SettingsView(props: SettingsViewProps)`, `useSettingsContainer()`, `SettingsWidget = { Widget: Container }`

- [ ] **Step 1: Create the SCSS module**

```scss
// src/widgets/settings/ui/Settings.module.scss

.settingsPanel {
  display: flex;
  flex-direction: column;
}

.settingsTabs {
  :global(.ant-tabs-nav) {
    padding: 0 24px;
  }

  :global(.ant-tabs-tab) {
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--aurora-text-secondary);
    transition: color 0.15s;

    &:hover {
      color: var(--aurora-accent);
    }
  }

  :global(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: var(--aurora-accent);
    font-weight: 600;
  }

  :global(.ant-tabs-ink-bar) {
    background: var(--aurora-accent);
    height: 2px;
  }

  :global(.ant-tabs-nav::before) {
    border-bottom-color: var(--aurora-border);
  }
}

.fieldHint {
  display: block;
  font-size: 12px;
  color: var(--aurora-text-secondary);
  margin-top: 2px;
}

.errorAlert {
  margin-bottom: 8px;
}
```

- [ ] **Step 2: Create the dumb SettingsView component**

```typescript
// src/widgets/settings/ui/SettingsView.tsx

import { Tabs, Input, Button, Select, Divider, Modal } from "antd";
import {
  DownloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useState, useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useMotionConfig } from "@/shared/lib/motion";
import { motion } from "framer-motion";
import type { Language, Currency } from "@/entities/settings/model/types";
import styles from "./Settings.module.scss";

// ─── Types ───────────────────────────────────────────

export interface ProfileTabProps {
  displayName: string;
  email: string;
  saving: boolean;
  error: string | null;
  onSave: (name: string) => void;
}

export interface AppearanceTabProps {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
}

export interface SecurityTabProps {
  resettingPassword: boolean;
  deletingAccount: boolean;
  passwordError: string | null;
  onResetPassword: (pw: string, confirm: string) => void;
  onDeleteAccount: () => void;
}

export interface DataTabProps {
  exporting: boolean;
  clearing: boolean;
  onExportCsv: () => void;
  onClearData: () => void;
}

export interface SettingsViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: ProfileTabProps;
  appearance: AppearanceTabProps;
  security: SecurityTabProps;
  data: DataTabProps;
}

// ─── Sub-components ──────────────────────────────────

const ProfileTab: FC<ProfileTabProps> = ({
  displayName,
  email,
  saving,
  error,
  onSave,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(displayName);

  const handleSave = () => {
    onSave(name);
  };

  return (
    <div className="settings-card__section">
      {error && (
        <div className={styles.errorAlert}>
          <span className="aurora-text-danger" style={{ fontSize: 13 }}>
            {error}
          </span>
        </div>
      )}
      <div className="settings-row--stacked" style={{ gap: 6 }}>
        <label className="settings-row__label">{t("settingsName")}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("settingsName")}
          onPressEnter={handleSave}
          maxLength={100}
        />
      </div>
      <div className="settings-row--stacked" style={{ gap: 6 }}>
        <label className="settings-row__label">{t("settingsEmail")}</label>
        <Input value={email} disabled />
        <span className={styles.fieldHint}>{t("settingsEmailHint")}</span>
      </div>
      <Button
        type="primary"
        onClick={handleSave}
        loading={saving}
        style={{ alignSelf: "flex-start" }}
      >
        {t("settingsSave")}
      </Button>
    </div>
  );
};

const AppearanceTab: FC<AppearanceTabProps> = ({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="settings-card__section" style={{ maxWidth: 360 }}>
      <div className="settings-row">
        <span className="settings-row__label">{t("settingsLanguage")}</span>
        <Select
          value={language}
          onChange={(v) => onLanguageChange(v as Language)}
          style={{ width: 140 }}
          options={[
            { value: "en", label: "English" },
            { value: "ru", label: "Русский" },
          ]}
        />
      </div>
      <div className="settings-row">
        <span className="settings-row__label">{t("settingsCurrency")}</span>
        <Select
          value={currency}
          onChange={(v) => onCurrencyChange(v as Currency)}
          style={{ width: 140 }}
          options={[
            { value: "USD", label: "USD ($)" },
            { value: "RUB", label: "RUB (₽)" },
            { value: "EUR", label: "EUR (€)" },
            { value: "BYN", label: "BYN (Br)" },
          ]}
        />
      </div>
    </div>
  );
};

const SecurityTab: FC<SecurityTabProps> = ({
  resettingPassword,
  deletingAccount,
  passwordError,
  onResetPassword,
  onDeleteAccount,
}) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleReset = () => {
    onResetPassword(newPassword, confirmPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteConfirm = () => {
    onDeleteAccount();
    setDeleteModalOpen(false);
    setConfirmDelete("");
  };

  return (
    <div className="settings-card__section">
      {/* Password reset */}
      {passwordError && (
        <div className={styles.errorAlert}>
          <span className="aurora-text-danger" style={{ fontSize: 13 }}>
            {passwordError}
          </span>
        </div>
      )}
      <div className="settings-row--stacked" style={{ gap: 6 }}>
        <label className="settings-row__label">
          {t("settingsNewPassword")}
        </label>
        <Input.Password
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("settingsPasswordMinLength")}
        />
      </div>
      <div className="settings-row--stacked" style={{ gap: 6 }}>
        <label className="settings-row__label">
          {t("settingsConfirmPassword")}
        </label>
        <Input.Password
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("settingsConfirmPassword")}
          onPressEnter={handleReset}
        />
      </div>
      <Button
        type="primary"
        onClick={handleReset}
        loading={resettingPassword}
        disabled={!newPassword || !confirmPassword}
        style={{ alignSelf: "flex-start" }}
      >
        {t("settingsChangePassword")}
      </Button>

      {/* Divider */}
      <Divider style={{ margin: "8px 0" }} />

      {/* Danger zone */}
      <div className="settings-dangerCard">
        <div className="settings-dangerCard__header">
          <WarningOutlined className="settings-dangerCard__icon" />
          <span className="settings-dangerCard__title">
            {t("settingsDangerZone")}
          </span>
        </div>
        <p className="settings-dangerCard__desc">
          {t("settingsDeleteAccountDesc")}
        </p>
        <Button
          danger
          onClick={() => setDeleteModalOpen(true)}
          style={{ alignSelf: "flex-start" }}
        >
          {t("settingsDeleteAccount")}
        </Button>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        title={t("settingsDeleteAccount")}
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setConfirmDelete("");
        }}
        onOk={handleDeleteConfirm}
        okText={t("settingsDeleteAccount")}
        okButtonProps={{
          danger: true,
          disabled: confirmDelete !== "DELETE",
          loading: deletingAccount,
        }}
        cancelText={t("cancel")}
        centered
        className="settings-modal"
      >
        <p style={{ marginBottom: 12 }}>{t("settingsDeleteAccountConfirm")}</p>
        <Input
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          placeholder="DELETE"
          className="settings-confirmInput"
        />
      </Modal>
    </div>
  );
};

const DataTab: FC<DataTabProps> = ({
  exporting,
  clearing,
  onExportCsv,
  onClearData,
}) => {
  const { t } = useTranslation();
  const [confirmClear, setConfirmClear] = useState("");
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const handleClearConfirm = () => {
    onClearData();
    setClearModalOpen(false);
    setConfirmClear("");
  };

  return (
    <div className="settings-card__section">
      {/* Export section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="settings-row__label">{t("settingsExport")}</span>
        <p
          style={{
            fontSize: 13,
            color: "var(--aurora-text-secondary)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {t("settingsExportDesc")}
        </p>
        <Button
          icon={<DownloadOutlined />}
          onClick={onExportCsv}
          loading={exporting}
          style={{ alignSelf: "flex-start" }}
        >
          {t("settingsExportCsv")}
        </Button>
      </div>

      {/* Divider */}
      <Divider style={{ margin: "8px 0" }} />

      {/* Danger zone */}
      <div className="settings-dangerCard">
        <div className="settings-dangerCard__header">
          <WarningOutlined className="settings-dangerCard__icon" />
          <span className="settings-dangerCard__title">
            {t("settingsDangerZone")}
          </span>
        </div>
        <p className="settings-dangerCard__desc">
          {t("settingsClearDataDesc")}
        </p>
        <Button
          danger
          onClick={() => setClearModalOpen(true)}
          loading={clearing}
          style={{ alignSelf: "flex-start" }}
        >
          {t("settingsClearData")}
        </Button>
      </div>

      {/* Clear data confirmation modal */}
      <Modal
        title={t("settingsClearData")}
        open={clearModalOpen}
        onCancel={() => {
          setClearModalOpen(false);
          setConfirmClear("");
        }}
        onOk={handleClearConfirm}
        okText={t("settingsClearData")}
        okButtonProps={{
          danger: true,
          disabled: confirmClear !== "CLEAR",
          loading: clearing,
        }}
        cancelText={t("cancel")}
        centered
        className="settings-modal"
      >
        <p style={{ marginBottom: 12 }}>{t("settingsClearDataConfirm")}</p>
        <Input
          value={confirmClear}
          onChange={(e) => setConfirmClear(e.target.value)}
          placeholder="CLEAR"
          className="settings-confirmInput"
        />
      </Modal>
    </div>
  );
};

// ─── Main SettingsView ────────────────────────────────

export function SettingsView({
  activeTab,
  onTabChange,
  profile,
  appearance,
  security,
  data,
}: SettingsViewProps) {
  const { t } = useTranslation();
  const config = useMotionConfig();

  const tabItems = [
    { key: "profile", label: t("settingsProfile") },
    { key: "appearance", label: t("settingsAppearance") },
    { key: "security", label: t("settingsSecurity") },
    { key: "data", label: t("settingsData") },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab {...profile} />;
      case "appearance":
        return <AppearanceTab {...appearance} />;
      case "security":
        return <SecurityTab {...security} />;
      case "data":
        return <DataTab {...data} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={styles.settingsPanel}
      initial={{ opacity: 0, y: config.heroEnterY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: config.heroEnterDuration,
        ease: config.easeOut as [number, number, number, number],
      }}
    >
      <div className="aurora-card" style={{ overflow: "hidden" }}>
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={tabItems}
          className={styles.settingsTabs}
          tabBarStyle={{ padding: "0 24px", marginBottom: 0 }}
        />
        <div className="settings-tabContent">{renderTabContent()}</div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create the container hook**

```typescript
// src/widgets/settings/container/useContainer.ts

import { useCallback, useState } from "react";
import { useProfile } from "@/features/settings/profile";
import { useSecurity } from "@/features/settings/security";
import { useDataManagement } from "@/features/settings/data";
import { useAppearanceStore } from "@/features/settings/appearance";
import type { Language, Currency } from "@/entities/settings/model/types";
import type {
  ProfileTabProps,
  AppearanceTabProps,
  SecurityTabProps,
  DataTabProps,
  SettingsViewProps,
} from "../ui/SettingsView";

export function useSettingsContainer(): SettingsViewProps {
  const [activeTab, setActiveTab] = useState("profile");

  const profile = useProfile();
  const security = useSecurity();
  const dataMgmt = useDataManagement();
  const { language, currency, setLanguage, setCurrency } =
    useAppearanceStore();

  const onTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  const handleSaveName = useCallback(
    (name: string) => {
      profile.updateProfile(name);
    },
    [profile],
  );

  const handleResetPassword = useCallback(
    (pw: string, confirm: string) => {
      security.resetPassword(pw, confirm);
    },
    [security],
  );

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage],
  );

  const handleCurrencyChange = useCallback(
    (curr: Currency) => {
      setCurrency(curr);
    },
    [setCurrency],
  );

  const profileProps: ProfileTabProps = {
    displayName: profile.displayName,
    email: profile.email,
    saving: profile.saving,
    error: profile.error,
    onSave: handleSaveName,
  };

  const appearanceProps: AppearanceTabProps = {
    language,
    currency,
    onLanguageChange: handleLanguageChange,
    onCurrencyChange: handleCurrencyChange,
  };

  const securityProps: SecurityTabProps = {
    resettingPassword: security.resettingPassword,
    deletingAccount: security.deletingAccount,
    passwordError: security.passwordError,
    onResetPassword: handleResetPassword,
    onDeleteAccount: security.deleteAccount,
  };

  const dataProps: DataTabProps = {
    exporting: dataMgmt.exporting,
    clearing: dataMgmt.clearing,
    onExportCsv: dataMgmt.exportToCsv,
    onClearData: dataMgmt.clearAllData,
  };

  return {
    activeTab,
    onTabChange,
    profile: profileProps,
    appearance: appearanceProps,
    security: securityProps,
    data: dataProps,
  };
}
```

- [ ] **Step 4: Create barrel export**

```typescript
// src/widgets/settings/index.ts

import { SettingsView } from "./ui/SettingsView";
import { useSettingsContainer } from "./container/useContainer";

function Container() {
  const props = useSettingsContainer();
  return <SettingsView {...props} />;
}

export const SettingsWidget = { Widget: Container };
export type { SettingsViewProps } from "./ui/SettingsView";
```

- [ ] **Step 5: Commit**

```bash
git add src/widgets/settings/
git commit -m "feat(settings): add SettingsWidget with 4-tab UI and container logic

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: SettingsPage and Route Registration

**Files:**
- Create: `src/pages/settings/ui/SettingsPage.tsx`
- Create: `src/pages/settings/index.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create the SettingsPage wrapper**

```typescript
// src/pages/settings/ui/SettingsPage.tsx

import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { SettingsWidget } from "@/widgets/settings";
import { useTranslation } from "react-i18next";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <AppShell
      title={t("settingsTitle")}
      subtitle={t("settingsSubtitle")}
    >
      <SettingsWidget.Widget />
    </AppShell>
  );
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/pages/settings/index.ts
export { SettingsPage } from "./ui/SettingsPage";
```

- [ ] **Step 3: Register route in main.tsx**

In `src/main.tsx`, after the import for `CategoriesPage` (line 11), add:

```typescript
import { SettingsPage } from "./pages/settings";
```

Inside the `<Route element={<ProtectedRoute />}>` block (after the `/categories` route on line 33), add:

```tsx
<Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/settings/ src/main.tsx
git commit -m "feat(settings): add SettingsPage and register /settings route

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: Verification and Cleanup

**Purpose:** Run the dev server and smoke-test the settings page, then fix any issues.

- [ ] **Step 1: Start dev server and check for build errors**

```bash
npm run dev
```

- [ ] **Step 2: Manual smoke test checklist**

1. Navigate to `/settings` — page should load with "Settings" header and 4 tabs
2. Profile tab: name field populated, email disabled, Save button works
3. Appearance tab: language switch changes UI language, currency changes format on Dashboard/Reports
4. Security tab: password reset button enabled only with valid input, delete account shows modal
5. Data tab: CSV export downloads file, clear data with modal confirmation
6. Mobile: tabs scroll horizontally, cards full-width, buttons full-width
7. Dark mode: all cards and tabs have correct contrast

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc -b --noEmit 2>&1 | head -40
```

Fix any type errors that are introduced by this feature (ignore pre-existing known issues).

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix(settings): resolve issues found during smoke testing

Co-Authored-By: Claude <noreply@anthropic.com>"
```
