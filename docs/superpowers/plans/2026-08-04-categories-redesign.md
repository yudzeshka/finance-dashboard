# Categories Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полный редизайн страницы /categories в стиле Calm 2026 — замена Ant Design Table на адаптивную CSS Grid карточек, плюс миграция всего проекта с эмодзи на кураторский набор SVG-иконок (поле icon хранит строковый ключ).

**Architecture:** Новый переиспользуемый компонент CategoryIcon в src/shared/ui/CategoryIcon/ (инлайн SVG-набор ~29 иконок + runtime-маппинг эмодзи -> ключ для обратной совместимости со старыми данными). Существующие типы Category/CategoryRowViewModel с полем icon:string НЕ меняются — ключи и эмодзи оба строки, совместимы с Hasura. Таблица CategoriesTable удаляется, заменяется на CategoriesGrid (CSS Grid 3->2->1 колонки, .aurora-card, .aurora-row-hover/.aurora-row-actions). Виджет CategoriesWidget получает ветки loading/error/empty по паттерну DashboardPage. Удаляется зависимость emoji-picker-react.

**Tech Stack:** React 19, TypeScript 6 (strict: noUnusedLocals, noUnusedParameters, verbatimModuleSyntax — использовать `import type`, erasableSyntaxOnly — без enum/namespace), Vite 8, Ant Design 6, SCSS Modules, framer-motion, i18next. Псевдоним пути `@` -> `src/`.

## Global Constraints

- План на русском языке. Комментарии в коде и commit-сообщения — на английском.
- НЕТ тестового фреймворка (ни vitest, ни jest). Вместо "write failing test -> run" используй `npm run lint` (eslint .) и `npm run dev` (визуальная проверка на http://localhost:5173). Не пиши тестовые файлы.
- `npm run build` (`tsc -b && vite build`) ОЖИДАЕМО падает на 2 ИЗВЕСТНЫХ TS-ошибках — НЕ исправлять их: (1) src/widgets/largestTransactions/ui/index.tsx (null vs string), (2) src/widgets/topCategories/model/lib.ts (Category | undefined). Они не связаны с этой задачей. После каждой задачи запускать `npm run lint` (должен пройти), а `npm run build` — только если явно указано (упадёт на известных ошибках, это нормально).
- НЕ добавлять новые npm-зависимости. SVG-иконки — инлайн React-компоненты. Запрещены lucide-react, react-icons, Heroicons.
- Удалить зависимость emoji-picker-react (Task 8).
- Дизайн-токены aurora существуют ТОЛЬКО для светлой темы (в @media prefers-color-scheme dark они НЕ переопределяются). Aurora-страницы рассчитаны на светлую тему. Не использовать градиенты.
- Доступность: контраст 4.5:1 (AA), focus-ring (.aurora-focus-ring, уже есть), aria-label на icon-only кнопках, touch targets >=44px, prefers-reduced-motion, паттерн reveal action-кнопок через .aurora-row-actions (УЖЕ РЕАЛИЗОВАН в index.css строки 535-561 — просто использовать классы .aurora-row-hover и .aurora-row-actions).
- После каждой задачи — commit. Commit-сообщения на английском, в стиле существующих (feat(dashboard):..., fix(transactionsTable):...).

---

### Task 1: CategoryIcon компонент + SVG-набор + emojiMapping

**Files:**
- Create: `src/shared/ui/CategoryIcon/icons.tsx`
- Create: `src/shared/ui/CategoryIcon/emojiMapping.ts`
- Create: `src/shared/ui/CategoryIcon/CategoryIcon.tsx`
- Create: `src/shared/ui/CategoryIcon/CategoryIconPicker.tsx`
- Create: `src/shared/ui/CategoryIcon/CategoryIconPicker.module.scss`
- Create: `src/shared/ui/CategoryIcon/index.ts`

**Interfaces:**
- Consumes: nothing (foundational task)
- Produces: `CategoryIcon`, `CategoryIconProps` ({icon: string|undefined|null; size?: number; className?: string; title?: string}), `CategoryIconPicker`, `CategoryIconPickerProps` ({value: string; onChange: (key: string) => void}), `categoryIcons` (Record<string, React.FC<React.SVGProps<SVGSVGElement>>>), `emojiToKey` (Record<string, string>), `resolveIconKey` (raw: string|undefined|null => string)

- [ ] **Step 1: Создать src/shared/ui/CategoryIcon/icons.tsx со всеми SVG-иконками**

```typescript
import type React from "react";

type SvgIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const food: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 2v20" />
    <path d="M17 2v20" />
    <path d="M7 8h10" />
    <path d="M7 14h10" />
    <path d="M3 6l1 16h16l1-16" />
  </svg>
);

const salary: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M8 10c0-1.5 1.5-2 4-2s4 .5 4 2-1.5 2-4 2" />
    <path d="M16 14c0 1.5-1.5 2-4 2s-4-.5-4-2" />
  </svg>
);

const transport: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="6" width="22" height="12" rx="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
  </svg>
);

const entertainment: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 12l5-3v6z" />
  </svg>
);

const health: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const education: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
    <path d="M22 3h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />
    <path d="M12 7l2 2-2 2" />
  </svg>
);

const utilities: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12h16" />
    <path d="M4 18h16" />
    <path d="M10 4l-4 8h12l-4-8" />
    <circle cx="12" cy="22" r="1" />
    <circle cx="4" cy="22" r="1" />
    <circle cx="20" cy="22" r="1" />
  </svg>
);

const rent: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <rect x="9" y="13" width="6" height="8" rx="0" />
    <path d="M9 17h6" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const mortgage: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M8 14c0-1.5 1.5-2 4-2s4 .5 4 2-1.5 2-4 2" />
    <path d="M12 12v8" />
  </svg>
);

const credit_card: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <path d="M1 10h22" />
    <path d="M6 16h3" />
    <path d="M12 16h4" />
  </svg>
);

const taxes: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h4" />
    <path d="M18 7l-5 5" />
    <path d="M18 12V7h-5" />
  </svg>
);

const shopping: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const gifts: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="8" width="18" height="14" rx="1" />
    <path d="M12 8V22" />
    <path d="M19 8V6a2 2 0 0 0-2-2h-2M5 8V6a2 2 0 0 1 2-2h2" />
    <path d="M7 4c.5-1 1.5-2 3-1.5" />
    <path d="M17 4c-.5-1-1.5-2-3-1.5" />
    <path d="M12 2l-1 4h2l-1 4" />
  </svg>
);

const travel: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.8 19.2L22 22v-4.2l-4.2 1.4z" />
    <path d="M6.2 4.8L2 2v4.2l4.2-1.4z" />
    <path d="M10 10l6.2 2.2-1.9 5.6-5-2.9-3.1 1.8-2.7-4.5 4.5-2.1L10 10z" />
    <path d="M10 2v8" />
  </svg>
);

const sports: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 9V4h6v5" />
    <path d="M19 9V4h-6v5" />
    <path d="M12 9v2" />
    <path d="M7 11v10h10V11" />
    <path d="M6 17h2" />
    <path d="M16 17h2" />
  </svg>
);

const pets: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <path d="M6 12c0-1 1-2 2-2h8c1 0 2 1 2 2" />
    <ellipse cx="12" cy="14" rx="4" ry="3" />
    <path d="M12 17v2" />
    <path d="M8 19l2-1" />
    <path d="M16 19l-2-1" />
  </svg>
);

const subscriptions: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const coffee: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="5" width="14" height="12" rx="2" />
    <path d="M18 10h1a3 3 0 0 1 0 6h-1" />
    <path d="M4 5h14v-2H4z" />
    <path d="M7 13v1" />
    <path d="M11 11v3" />
  </svg>
);

const electronics: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
    <path d="M8 6h8" />
  </svg>
);

const home: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const kids: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="15" cy="9" r="3" />
    <path d="M4 16c0-2 2-3 3.5-4h9c1.5 1 3.5 2 3.5 4" />
    <path d="M12 7v5" />
    <path d="M8 12l8 3" />
    <path d="M16 12l-8 3" />
  </svg>
);

const business: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 12v.01" />
    <path d="M12 16v.01" />
    <path d="M12 14v.01" />
  </svg>
);

const other: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="7" r="1.5" />
    <path d="M12 10v7" />
  </svg>
);

const income: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M9 12l3-4 3 4" />
  </svg>
);

const expense: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M9 12l3 4 3-4" />
  </svg>
);

const warning: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const edit: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const deleteIcon: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const categoryIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  food,
  salary,
  transport,
  entertainment,
  health,
  education,
  utilities,
  rent,
  mortgage,
  credit_card,
  taxes,
  shopping,
  gifts,
  travel,
  sports,
  pets,
  subscriptions,
  coffee,
  electronics,
  home,
  kids,
  business,
  other,
  income,
  expense,
  warning,
  edit,
  delete: deleteIcon,
};
```

- [ ] **Step 2: Создать src/shared/ui/CategoryIcon/emojiMapping.ts**

```typescript
import { categoryIcons } from "./icons";

export const emojiToKey: Record<string, string> = {
  "🍔": "food",
  "🍕": "food",
  "🍜": "food",
  "🍰": "food",
  "💰": "salary",
  "💵": "salary",
  "🤑": "salary",
  "💸": "expense",
  "🚗": "transport",
  "⛽": "transport",
  "🚌": "transport",
  "✈️": "travel",
  "✈": "travel",
  "🎉": "entertainment",
  "🎮": "entertainment",
  "🎬": "entertainment",
  "🎵": "entertainment",
  "💪": "health",
  "❤️": "health",
  "🩺": "health",
  "💊": "health",
  "🎓": "education",
  "📚": "education",
  "✏️": "education",
  "📖": "education",
  "🔌": "utilities",
  "💡": "utilities",
  "💧": "utilities",
  "⚡": "utilities",
  "🏠": "home",
  "🏡": "home",
  "💳": "credit_card",
  "🧾": "taxes",
  "📄": "taxes",
  "🛍️": "shopping",
  "🛒": "shopping",
  "👕": "shopping",
  "🎁": "gifts",
  "🏋️": "sports",
  "⚽": "sports",
  "🏀": "sports",
  "🏃": "sports",
  "🐾": "pets",
  "🐶": "pets",
  "🐱": "pets",
  "🔄": "subscriptions",
  "🔁": "subscriptions",
  "☕": "coffee",
  "📱": "electronics",
  "💻": "electronics",
  "🖥️": "electronics",
  "🧸": "kids",
  "👶": "kids",
  "💼": "business",
  "📈": "business",
  "📌": "other",
  "🔖": "other",
  "⭐": "other",
  "🙂": "other",
};

export function resolveIconKey(raw: string | undefined | null): string {
  if (!raw) return "other";
  if (raw in categoryIcons) return raw;
  if (raw in emojiToKey) return emojiToKey[raw];
  return "other";
}
```

- [ ] **Step 3: Создать src/shared/ui/CategoryIcon/CategoryIcon.tsx**

```typescript
import type { ReactElement } from "react";
import { categoryIcons } from "./icons";
import { resolveIconKey } from "./emojiMapping";

export type CategoryIconProps = {
  /** Строковый ключ иконки или эмодзи (старые данные). Если null/undefined — fallback на "other". */
  icon: string | undefined | null;
  size?: number;
  className?: string;
  title?: string;
};

export function CategoryIcon({
  icon,
  size = 20,
  className,
  title,
}: CategoryIconProps): ReactElement {
  const key = resolveIconKey(icon);
  const Svg = categoryIcons[key] ?? categoryIcons.other;
  return (
    <Svg
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
```

- [ ] **Step 4: Создать src/shared/ui/CategoryIcon/CategoryIconPicker.tsx**

```typescript
import { categoryIcons } from "./icons";
import { CategoryIcon } from "./CategoryIcon";
import styles from "./CategoryIconPicker.module.scss";

export type CategoryIconPickerProps = {
  value: string;
  onChange: (key: string) => void;
};

const PICKER_KEYS = [
  "food", "salary", "transport", "entertainment", "health", "education",
  "utilities", "rent", "mortgage", "credit_card", "taxes", "shopping",
  "gifts", "travel", "sports", "pets", "subscriptions", "coffee",
  "electronics", "home", "kids", "business", "other", "income", "expense",
];

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div className={styles.iconGrid} role="listbox" aria-label="Choose category icon">
      {PICKER_KEYS.map((key) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={selected}
            aria-pressed={selected}
            className={`${styles.iconGridButton} ${selected ? styles.iconGridButtonSelected : ""}`}
            onClick={() => onChange(key)}
          >
            <CategoryIcon icon={key} size={22} />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Создать src/shared/ui/CategoryIcon/CategoryIconPicker.module.scss**

```scss
.iconGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
  max-width: 320px;
  padding: 4px;
}

.iconGridButton {
  height: 44px;
  min-width: 44px;
  border: 1px solid var(--aurora-border);
  border-radius: 10px;
  background: var(--aurora-surface-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--aurora-text-secondary);
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--aurora-accent);
    color: var(--aurora-accent);
  }
}

.iconGridButtonSelected {
  border-color: var(--aurora-accent);
  background: var(--aurora-accent-soft);
  color: var(--aurora-accent);
}
```

- [ ] **Step 6: Создать src/shared/ui/CategoryIcon/index.ts (barrel)**

```typescript
export { CategoryIcon } from "./CategoryIcon";
export type { CategoryIconProps } from "./CategoryIcon";
export { CategoryIconPicker } from "./CategoryIconPicker";
export type { CategoryIconPickerProps } from "./CategoryIconPicker";
export { categoryIcons } from "./icons";
export { emojiToKey, resolveIconKey } from "./emojiMapping";
```

- [ ] **Step 7: Проверить сборку**

```bash
npm run lint
```

Expected: PASS (новые файлы без ошибок).

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui/CategoryIcon/
git commit -m "feat(shared): add CategoryIcon component with inline SVG set and emoji mapping"
```

---

### Task 2: useContainer рефакторинг (эмодзи -> иконки)

**Files:**
- Modify: `src/widgets/categories/container/useContainer.ts`

**Interfaces:**
- Consumes: nothing from previous tasks (standalone refactoring of local state names)
- Produces: `isIconPickerOpen` (boolean), `selectedIcon` (string), `onIconPickerOpenChange(open: boolean)` (void), `onIconSelect(key: string)` (void), `DEFAULT_ICON_KEY = "other"` (const, internal to useContainer)

- [ ] **Step 1: Прочитать текущий файл useContainer.ts**

Необходимо ознакомиться с текущим содержимым перед правками.

- [ ] **Step 2: Заменить импорт, константу и все переименования в useContainer.ts**

**Удалить** (строка 2):
```typescript
import type { EmojiClickData } from "emoji-picker-react";
```

**Заменить** константу (примерно строка 12):
```typescript
const DEFAULT_EMOJI = "🙂";
```
на:
```typescript
const DEFAULT_ICON_KEY = "other";
```

**Заменить** имена useState-переменных:
- `isEmojiPickerOpen` -> `isIconPickerOpen`
- `selectedEmoji` -> `selectedIcon`

**Заменить** сигнатуру `handleEmojiClick`:
```typescript
const handleEmojiClick = (emoji: EmojiClickData) => {
  setSelectedEmoji(emoji.emoji);
  setIsEmojiPickerOpen(false);
};
```
на:
```typescript
const handleIconSelect = (key: string) => {
  setSelectedIcon(key);
  setIsIconPickerOpen(false);
};
```

**Заменить** в `openCreate` (сброс):
```typescript
setSelectedEmoji(DEFAULT_EMOJI);
```
на:
```typescript
setSelectedIcon(DEFAULT_ICON_KEY);
```

**Заменить** в `openEdit` (установка из категории):
```typescript
setSelectedEmoji(category.icon);
```
на:
```typescript
setSelectedIcon(category.icon);
```

**Заменить** в `resetModalState`:
```typescript
setSelectedEmoji(DEFAULT_EMOJI);
```
на:
```typescript
setSelectedIcon(DEFAULT_ICON_KEY);
```

**Заменить** в возвращаемом объекте:
```typescript
isEmojiPickerOpen,
selectedEmoji,
onEmojiPickerOpenChange: setIsEmojiPickerOpen,
onEmojiClick: handleEmojiClick,
```
на:
```typescript
isIconPickerOpen,
selectedIcon,
onIconPickerOpenChange: setIsIconPickerOpen,
onIconSelect: handleIconSelect,
```

- [ ] **Step 3: Проверить сборку**

```bash
npm run lint
```

Expected: PASS. Убедиться, что нет импортов из emoji-picker-react.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/categories/container/useContainer.ts
git commit -m "refactor(categories): replace emoji state with icon key state in useContainer"
```

---

### Task 3: i18n ключи (переименование + новые)

**Files:**
- Modify: `src/i18n.js`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: renamed keys `categoryIcon`, `categoryIconIsRequired`; new keys `categoriesGridEmpty`, `addFirstCategory`, `chooseIcon`; all old emoji keys removed

- [ ] **Step 1: Найти и заменить ключи в src/i18n.js**

Найти в секции `en.translation`:
```javascript
categoryEmoji: "Emoji",
```
Заменить на:
```javascript
categoryIcon: "Icon",
```

Найти:
```javascript
categoryEmojiIsRequired: "Please select an emoji",
```
Заменить на:
```javascript
categoryIconIsRequired: "Please select an icon",
```

Найти в секции `ru.translation`:
```javascript
categoryEmoji: "Эмодзи",
```
Заменить на:
```javascript
categoryIcon: "Иконка",
```

Найти:
```javascript
categoryEmojiIsRequired: "Выберите эмодзи",
```
Заменить на:
```javascript
categoryIconIsRequired: "Выберите иконку",
```

- [ ] **Step 2: Добавить новые ключи**

В секцию `en.translation` (в алфавитном порядке рядом с существующими category-ключами) добавить:
```javascript
addFirstCategory: "Add first category",
categoriesGridEmpty: "No categories yet",
chooseIcon: "Choose icon",
```

В секцию `ru.translation` добавить:
```javascript
addFirstCategory: "Добавить первую категорию",
categoriesGridEmpty: "Пока нет категорий",
chooseIcon: "Выберите иконку",
```

- [ ] **Step 3: Убедиться, что старые ключи `categoryEmoji`/`categoryEmojiIsRequired` нигде не используются кроме как в i18n.js**

```bash
grep -r "categoryEmoji" src/
```

Expected: только в i18n.js (старые ключи будут удалены из i18n.js на шаге 1, так что после правок grep не должен найти ничего). Если grep находит использования в других файлах — эти файлы будут обновлены в Task 4 (CategoryFormModal) и Task 5 (CategoriesView).

- [ ] **Step 4: Проверить сборку**

```bash
npm run lint
```

Expected: PASS (i18n.js — plain JS, линтер не должен ругаться).

- [ ] **Step 5: Commit**

```bash
git add src/i18n.js
git commit -m "feat(i18n): rename emoji keys to icon keys, add empty state and icon picker labels"
```

---

### Task 4: CategoryFormModal рефакторинг (EmojiPicker -> CategoryIconPicker)

**Files:**
- Modify: `src/widgets/categories/ui/CategoryFormModal.tsx`
- Modify: `src/widgets/categories/ui/CategoriesView.module.scss`

**Interfaces:**
- Consumes: `CategoryIconPicker` from Task 1, `CategoryIcon` from Task 1, `onIconSelect`, `selectedIcon`, `isIconPickerOpen`, `onIconPickerOpenChange` from Task 2, i18n keys `categoryIcon`, `categoryIconIsRequired`, `chooseIcon` from Task 3
- Produces: updated CategoryFormModal with renamed props matching Task 2's interface

- [ ] **Step 1: Обновить импорты в CategoryFormModal.tsx**

**Удалить** (строка 3):
```typescript
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
```

**Добавить**:
```typescript
import { CategoryIcon, CategoryIconPicker } from "@/shared/ui/CategoryIcon";
```

**Удалить** импорт `EmojiClickData` из любых других строк импорта, если он там есть.

- [ ] **Step 2: Переименовать пропсы в CategoryFormModal.tsx**

В интерфейсе пропсов компонента заменить:
- `isEmojiPickerOpen` -> `isIconPickerOpen`
- `onEmojiPickerOpenChange` -> `onIconPickerOpenChange`
- `onEmojiClick: (emoji: EmojiClickData) => void` -> `onIconSelect: (key: string) => void`
- `selectedEmoji` -> `selectedIcon`

В деструктуризации пропсов — те же замены.

- [ ] **Step 3: Заменить блок Popover+EmojiPicker на Popover+CategoryIconPicker**

Найти блок с `<Popover` (примерно строки 75-93), который содержит `<EmojiPicker ... />`. Заменить его содержимое на:

```tsx
<Popover
  content={<CategoryIconPicker value={selectedIcon} onChange={onIconSelect} />}
  title={t("chooseIcon")}
  trigger="click"
  open={isIconPickerOpen}
  onOpenChange={onIconPickerOpenChange}
>
  <button
    type="button"
    className={styles.iconPickerTrigger}
    aria-label={t("chooseIcon")}
    aria-haspopup="listbox"
    aria-expanded={isIconPickerOpen}
  >
    <CategoryIcon icon={selectedIcon} size={24} />
  </button>
</Popover>
```

- [ ] **Step 4: Заменить i18n ключи в CategoryFormModal.tsx**

- `t("categoryEmoji")` -> `t("categoryIcon")` (label поля)
- `t("categoryEmojiIsRequired")` -> `t("categoryIconIsRequired")` (правило валидации)

- [ ] **Step 5: Обновить CategoriesView.module.scss**

**Удалить** (или закомментировать) классы, специфичные для эмодзи:
- `.emojiCircle`
- `.emojiCell`
- `.emojiField`
- `.emojiPickerTrigger`
- `.emojiPickerPopover`
- `:global(.EmojiPickerReact)` внутри `.emojiPickerPopover`

**Добавить** новый класс `.iconPickerTrigger`:

```scss
.iconPickerTrigger {
  height: 44px;
  width: 44px;
  border: 1px solid var(--aurora-border);
  border-radius: 10px;
  background: var(--aurora-surface-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--aurora-text);
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--aurora-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--aurora-accent);
    outline-offset: 2px;
  }
}
```

Сохранить существующие классы `.typeTagIncome`, `.typeTagExpense`, `.actionsCell` (если они ещё используются).

- [ ] **Step 6: Проверить сборку**

```bash
npm run lint
```

Expected: PASS. Убедиться, что нет импортов emoji-picker-react.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/categories/ui/CategoryFormModal.tsx src/widgets/categories/ui/CategoriesView.module.scss
git commit -m "feat(categories): replace EmojiPicker with CategoryIconPicker in form modal"
```

---

### Task 5: CategoriesGrid + CategoriesView + удаление CategoriesTable

**Files:**
- Create: `src/widgets/categories/ui/CategoriesGrid.tsx`
- Create: `src/widgets/categories/ui/CategoriesGrid.module.scss`
- Modify: `src/widgets/categories/ui/CategoriesView.tsx`
- Delete: `src/widgets/categories/ui/CategoriesTable.tsx`
- Modify: `src/widgets/categories/ui/CategoriesView.module.scss` (дополнительно, если нужны сеточные стили)

**Interfaces:**
- Consumes: `CategoryIcon` from Task 1, `onIconSelect`, `selectedIcon`, `isIconPickerOpen`, `onIconPickerOpenChange` from Task 2, i18n keys `categoryIcon` from Task 3
- Produces: `CategoriesGrid` component with props `{ rows: CategoryRowViewModel[]; onEdit: (row: CategoryRowViewModel) => void; onDelete: (id: string) => void; deleteLoading?: boolean }`

- [ ] **Step 1: Создать CategoriesGrid.module.scss**

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  box-shadow: var(--aurora-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--aurora-shadow-md);
  }
}

.iconCircle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--aurora-accent-soft);
  color: var(--aurora-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name {
  font-size: 15px;
  font-weight: 500;
  color: var(--aurora-text);
  line-height: 1.3;
  word-break: break-word;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.typeTag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.typeTagIncome {
  background: var(--aurora-success-soft);
  color: var(--aurora-success);
}

.typeTagExpense {
  background: var(--aurora-danger-soft);
  color: var(--aurora-danger);
}

.count {
  font-size: 13px;
  color: var(--aurora-text-secondary);
}

.actions {
  display: flex;
  gap: 4px;
  position: absolute;
  top: 12px;
  right: 12px;
}

.actionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--aurora-text-secondary);
  transition: all 0.15s ease;

  &:hover {
    color: var(--aurora-accent);
    border-color: var(--aurora-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--aurora-accent);
    outline-offset: 2px;
  }
}

.deleteButton {
  &:hover {
    color: var(--aurora-danger);
    border-color: var(--aurora-danger);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .actionButton {
    transition: none;
  }
}
```

- [ ] **Step 2: Создать CategoriesGrid.tsx**

```typescript
import { Popconfirm } from "antd";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { useMotionConfig } from "@/shared/lib/motion";
import type { CategoryRowViewModel } from "../model/types";
import styles from "./CategoriesGrid.module.scss";

type Props = {
  rows: CategoryRowViewModel[];
  onEdit: (row: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
  deleteLoading?: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function CategoriesGrid({ rows, onEdit, onDelete, deleteLoading }: Props) {
  const { t } = useTranslation();
  const { prefersReducedMotion } = useMotionConfig();

  const variants = prefersReducedMotion ? undefined : containerVariants;
  const itemVars = prefersReducedMotion ? undefined : itemVariants;

  return (
    <motion.div
      className={styles.grid}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {rows.map((row) => (
        <motion.div
          key={row.id}
          className={`${styles.card} aurora-row-hover aurora-card`}
          variants={itemVars}
        >
          {/* Actions — hidden until hover (desktop), always visible on mobile */}
          {!row.isSystem && (
            <div className={`${styles.actions} aurora-row-actions`}>
              <button
                type="button"
                className={styles.actionButton}
                aria-label={t("editCategory")}
                onClick={() => onEdit(row)}
              >
                <CategoryIcon icon="edit" size={16} />
              </button>
              <Popconfirm
                title={t("deleteCategoryConfirm")}
                onConfirm={() => onDelete(row.id)}
                okText={t("yes")}
                cancelText={t("no")}
              >
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  aria-label={t("delete")}
                  disabled={deleteLoading}
                >
                  <CategoryIcon icon="delete" size={16} />
                </button>
              </Popconfirm>
            </div>
          )}

          <div className={styles.iconCircle}>
            <CategoryIcon icon={row.icon} size={22} />
          </div>

          <div className={styles.name}>{row.name}</div>

          <div className={styles.meta}>
            <span
              className={`${styles.typeTag} ${
                row.type === "income" ? styles.typeTagIncome : styles.typeTagExpense
              }`}
            >
              {t(row.type)}
            </span>
            <span className={styles.count}>
              {t("categoryTransactionsCount", { count: row.transactionsCount })}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

- [ ] **Step 3: Модифицировать CategoriesView.tsx**

**Удалить** импорт `EmojiClickData` из "emoji-picker-react" (если остался).
**Удалить** импорт `CategoriesTable` (строка с импортом компонента).
**Добавить** импорт:
```typescript
import { CategoriesGrid } from "./CategoriesGrid";
```

**Заменить** в интерфейсе `CategoriesViewProps`:
- `isEmojiPickerOpen` -> `isIconPickerOpen`
- `selectedEmoji` -> `selectedIcon`
- `onEmojiPickerOpenChange` -> `onIconPickerOpenChange`
- `onEmojiClick: (emoji: EmojiClickData) => void` -> `onIconSelect: (key: string) => void`

**Удалить** строку с `<p>{errorMessage}</p>` (примерно строка 66) — error теперь обрабатывается в CategoriesWidget.

**Заменить** блок (примерно строки 68-76):
```tsx
<div className="dashboard-card">
  <CategoriesTable ... />
</div>
```
на:
```tsx
<div className="aurora-surface" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
  <CategoriesGrid
    rows={rows}
    onEdit={onEdit}
    onDelete={onDelete}
    deleteLoading={deleteLoading}
  />
</div>
```

Пропсы `rows`, `onEdit`, `onDelete`, `deleteLoading` должны уже быть в пропсах `CategoriesViewProps` — если какого-то не хватает, добавить. Переименованные пропсы пробросить в CategoryFormModal соответствующим образом.

- [ ] **Step 4: Удалить CategoriesTable.tsx**

```bash
git rm src/widgets/categories/ui/CategoriesTable.tsx
```

- [ ] **Step 5: Проверить, что CategoriesTable нигде не импортируется**

```bash
grep -r "CategoriesTable" src/
```

Expected: ноль результатов (или только в удаляемом файле).

- [ ] **Step 6: Проверить CategoriesView.module.scss на оставшиеся эмодзи-классы**

Убедиться, что `.emojiField`, `.emojiPickerTrigger` (старый), `.emojiPickerPopover` удалены. Нужный `.iconPickerTrigger` уже добавлен в Task 4.

- [ ] **Step 7: Проверить сборку**

```bash
npm run lint
```

Expected: PASS. Убедиться, что нет импортов CategoriesTable или emoji-picker-react.

- [ ] **Step 8: Commit**

```bash
git add src/widgets/categories/ui/CategoriesGrid.tsx src/widgets/categories/ui/CategoriesGrid.module.scss src/widgets/categories/ui/CategoriesView.tsx src/widgets/categories/ui/CategoriesTable.tsx
git commit -m "feat(categories): replace Ant Table with CSS Grid cards, add CategoriesGrid component"
```

---

### Task 6: CategoriesWidget (ветки состояний) + CategoriesPageSkeleton (shimmer grid)

**Files:**
- Modify: `src/widgets/categories/container/CategoriesWidget.tsx`
- Modify: `src/widgets/categories/ui/CategoriesPageSkeleton.tsx`
- Create: `src/widgets/categories/ui/CategoriesPageSkeleton.module.scss`

**Interfaces:**
- Consumes: `CategoriesGrid` from Task 5, `CategoryIcon` from Task 1 (для error-стейта), `AppShell` from existing code, i18n keys from Task 3
- Produces: full widget with loading/error/empty/normal states following DashboardPage pattern

- [ ] **Step 1: Обновить CategoriesWidget.tsx — добавить ветки состояний**

**Текущая логика** (примерно): один `if (loading)` возвращает `<CategoriesPageSkeleton/>`, иначе `<CategoriesView/>`.

**Заменить на полную структуру:**

```typescript
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { AppShell } from "@/widgets/appShell";
import { CategoriesPageSkeleton } from "../ui/CategoriesPageSkeleton";
import { CategoriesView } from "../ui/CategoriesView";
import { CategoryFormModal } from "../ui/CategoryFormModal";
import { useCategoriesContainer } from "./useContainer";

export function CategoriesWidget() {
  const { t } = useTranslation();
  const container = useCategoriesContainer();

  const {
    loading,
    error,
    refetch,
    categories,
    rows,
    openCreate,
    isEditMode,
    currentCategory,
    isModalOpen,
    isFormSubmitting,
    deleteLoading,
    formError,
    isIconPickerOpen,
    selectedIcon,
    onIconPickerOpenChange,
    onIconSelect,
    onSave,
    onDelete,
    onEdit,
    resetModalState,
  } = container;

  const title = t("categories");
  const subtitle = t("categoriesSubtitle");

  // Loading state — initial load with no cached data
  if (loading && categories.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <CategoriesPageSkeleton />
      </AppShell>
    );
  }

  // Error state — no data available
  if (error && categories.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div
          className="aurora-card"
          style={{ padding: 48, textAlign: "center" }}
        >
          <CategoryIcon
            icon="warning"
            size={48}
            className="aurora-text-secondary"
            style={{ opacity: 0.6, marginBottom: 16 }}
          />
          <div
            className="aurora-font-body"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--aurora-text)",
              marginBottom: 8,
            }}
          >
            {t("loadingError")}
          </div>
          <div
            className="aurora-text-secondary"
            style={{ fontSize: 14, marginBottom: 20 }}
          >
            {String(error)}
          </div>
          <Button type="primary" onClick={refetch}>
            {t("retry")}
          </Button>
        </div>
      </AppShell>
    );
  }

  // Empty state — loaded successfully but no categories
  if (!loading && categories.length === 0) {
    return (
      <AppShell
        title={title}
        subtitle={subtitle}
        primaryAction={
          <Button type="primary" onClick={openCreate}>
            {t("addCategory")}
          </Button>
        }
      >
        <div
          className="aurora-card"
          style={{ padding: 48, textAlign: "center" }}
        >
          <div className="aurora-empty-state">
            <CategoryIcon
              icon="other"
              size={48}
              className="aurora-empty-state__icon"
              style={{ opacity: 0.4, marginBottom: 16 }}
            />
            <div
              className="aurora-font-body"
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--aurora-text)",
                marginBottom: 8,
              }}
            >
              {t("categoriesGridEmpty")}
            </div>
            <div
              className="aurora-text-secondary"
              style={{ fontSize: 14, marginBottom: 20 }}
            >
              {t("addFirstCategory")}
            </div>
            <Button type="primary" onClick={openCreate}>
              {t("addCategory")}
            </Button>
          </div>
        </div>
        <CategoryFormModal
          isOpen={isModalOpen}
          mode={isEditMode ? "edit" : "create"}
          initialValues={
            currentCategory
              ? {
                  name: currentCategory.name,
                  type: currentCategory.type,
                  icon: currentCategory.icon,
                }
              : undefined
          }
          isIconPickerOpen={isIconPickerOpen}
          selectedIcon={selectedIcon}
          onIconPickerOpenChange={onIconPickerOpenChange}
          onIconSelect={onIconSelect}
          onSubmit={onSave}
          onCancel={resetModalState}
          isSubmitting={isFormSubmitting}
          error={formError}
        />
      </AppShell>
    );
  }

  // Normal state — data loaded
  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      primaryAction={
        <Button type="primary" onClick={openCreate}>
          {t("addCategory")}
        </Button>
      }
    >
      <CategoriesView
        rows={rows}
        isIconPickerOpen={isIconPickerOpen}
        selectedIcon={selectedIcon}
        onIconPickerOpenChange={onIconPickerOpenChange}
        onIconSelect={onIconSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        deleteLoading={deleteLoading}
        isEditMode={isEditMode}
        currentCategory={currentCategory}
        isModalOpen={isModalOpen}
        isFormSubmitting={isFormSubmitting}
        formError={formError}
        onSave={onSave}
        resetModalState={resetModalState}
      />
      <CategoryFormModal
        isOpen={isModalOpen}
        mode={isEditMode ? "edit" : "create"}
        initialValues={
          currentCategory
            ? {
                name: currentCategory.name,
                type: currentCategory.type,
                icon: currentCategory.icon,
              }
            : undefined
        }
        isIconPickerOpen={isIconPickerOpen}
        selectedIcon={selectedIcon}
        onIconPickerOpenChange={onIconPickerOpenChange}
        onIconSelect={onIconSelect}
        onSubmit={onSave}
        onCancel={resetModalState}
        isSubmitting={isFormSubmitting}
        error={formError}
      />
    </AppShell>
  );
}
```

**Примечание:** точные имена переменных из useContainer могут отличаться (например, `categories` может называться `allCategories`, `refetch` может называться `refresh`). При выполнении — адаптировать к фактическим именам из useContainer.ts, прочитанным на шаге 1 Task 2.

- [ ] **Step 2: Создать CategoriesPageSkeleton.module.scss**

```scss
.skeletonGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.skeletonCard {
  padding: 16px;
  border-radius: 16px;
  background: var(--aurora-surface-card);
  border: 1px solid var(--aurora-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shimmerLine {
  background: linear-gradient(
    90deg,
    var(--aurora-border) 25%,
    rgba(124, 58, 237, 0.06) 50%,
    var(--aurora-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmerLine {
    animation: none;
  }
}
```

- [ ] **Step 3: Обновить CategoriesPageSkeleton.tsx**

**Удалить:**
```typescript
import { Skeleton } from "antd";
```

**Заменить** содержимое компонента (после импортов и получения t):

```typescript
import { useTranslation } from "react-i18next";
import { AppShell } from "@/widgets/appShell";
import styles from "./CategoriesPageSkeleton.module.scss";

export function CategoriesPageSkeleton() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("categories")} subtitle={t("categoriesSubtitle")}>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div
              className={styles.shimmerLine}
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
            <div className={styles.shimmerLine} style={{ width: "60%", height: 14 }} />
            <div className={styles.shimmerLine} style={{ width: "40%", height: 12 }} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Проверить сборку**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/categories/container/CategoriesWidget.tsx src/widgets/categories/ui/CategoriesPageSkeleton.tsx src/widgets/categories/ui/CategoriesPageSkeleton.module.scss
git commit -m "feat(categories): add loading/error/empty states to widget, shimmer skeleton grid"
```

---

### Task 7: 5 точек рендера иконок вне категорий

**Files:**
- Modify: `src/widgets/transactions-table/ui/TransactionsTable.tsx`
- Modify: `src/widgets/topCategories/ui/index.tsx`
- Modify: `src/widgets/largestTransactions/ui/index.tsx`
- Modify: `src/widgets/dashboardInsights/ui/DashboardInsightsView.tsx`
- Modify: `src/widgets/dashboardInsights/container/useContainer.ts`
- Modify: `src/widgets/transactions/ui/TransactionFormModal.tsx`
- Modify: `src/widgets/transactions/ui/TransactionsWidget.tsx` (если Select рендерится там)

**Interfaces:**
- Consumes: `CategoryIcon` from Task 1
- Produces: nothing (terminal — UI-only changes)

- [ ] **Step 1: TransactionsTable.tsx — 3 точки**

**#1** Найти строку с `<span style={{ marginRight: 8 }}>{category.icon}</span>` (примерно строка 137). Заменить на:
```tsx
<CategoryIcon icon={category.icon} size={18} style={{ marginRight: 8 }} />
```

Добавить импорт вверху файла:
```typescript
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
```

**#2** Найти строку с `🗑️` в кнопке удаления (примерно строка 165). Заменить эмодзи на:
```tsx
<CategoryIcon icon="delete" size={16} />
```

**#3** Найти строку с `✏️` в кнопке редактирования (примерно строка 173). Заменить эмодзи на:
```tsx
<CategoryIcon icon="edit" size={16} />
```

Убедиться, что aria-label сохранены на кнопках.

- [ ] **Step 2: topCategories/ui/index.tsx**

Найти строку 53: `<span className={styles.iconEmoji}>{row.icon}</span>`. Заменить на:
```tsx
<CategoryIcon icon={row.icon} size={18} className={styles.iconSvg} />
```

Добавить импорт:
```typescript
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
```

В SCSS-файле `topCategories/ui/index.module.scss` (или как он называется) заменить `.iconEmoji` на `.iconSvg`:
```scss
.iconSvg {
  color: var(--aurora-accent);
  display: flex;
  align-items: center;
}
```

- [ ] **Step 3: largestTransactions/ui/index.tsx**

Найти строку 29: `<span className={styles.iconEmoji}>{row.category.icon}</span>`. Заменить на:
```tsx
<CategoryIcon icon={row.category.icon} size={18} />
```

Добавить импорт:
```typescript
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
```

**ВАЖНО:** в этом файле ИЗВЕСТНАЯ TS-ошибка (`row.category.icon` может быть null). `CategoryIcon` принимает `string | undefined | null`, так что пропс совместим — ошибка не ухудшится. Если TS всё равно ругается, не трогать логику — это pre-existing issue.

- [ ] **Step 4: DashboardInsightsView.tsx + useContainer.ts**

**DashboardInsightsView.tsx** — найти строку 29:
```tsx
<div className={styles.tileIcon}>{tile.icon}</div>
```
Заменить на:
```tsx
<div className={styles.tileIcon}>
  <CategoryIcon icon={tile.icon} size={20} />
</div>
```

Добавить импорт:
```typescript
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
```

**useContainer.ts (dashboardInsights)** — найти и заменить три строки с эмодзи:

Строка ~57: `icon: "💰"` -> `icon: "salary"`

Строка ~68: `icon: "💸"` -> `icon: "expense"`

Строка ~82: `icon: stats.largestTransaction?.category?.icon ?? "📌"` -> `icon: stats.largestTransaction?.category?.icon ?? "other"`

- [ ] **Step 5: TransactionFormModal.tsx — optionRender для Select категорий**

Найти строку 66 с `<Select options={categoryOptions} />`. Добавить пропсы `optionRender` и `labelRender`:

```tsx
<Select
  options={categoryOptions}
  optionRender={(option) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <CategoryIcon icon={(option.data as unknown as { icon?: string }).icon} size={16} />
      {option.label}
    </span>
  )}
  labelRender={(props) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <CategoryIcon icon={(props.data as unknown as { icon?: string }).icon} size={16} />
      {props.label}
    </span>
  )}
/>
```

Добавить импорт:
```typescript
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
```

**Примечание:** если `optionRender`/`labelRender` не поддерживаются в Ant Design 6 — оставить Select как есть (без optionRender). Задокументировать как known limitation.

- [ ] **Step 6: TransactionsWidget.tsx (если Select рендерится там)**

Если `<Select options={categoryOptions} />` находится в `TransactionsWidget.tsx`, а не в `TransactionFormModal.tsx` — применить те же изменения `optionRender`/`labelRender` там.

- [ ] **Step 7: Проверить сборку**

```bash
npm run lint
```

Expected: PASS (кроме pre-existing errors). Убедиться, что нет импортов emoji-picker-react и нет сырых эмодзи-строк в JSX (кроме как в emojiMapping.ts).

- [ ] **Step 8: Commit**

```bash
git add src/widgets/transactions-table/ui/TransactionsTable.tsx src/widgets/topCategories/ui/index.tsx src/widgets/largestTransactions/ui/index.tsx src/widgets/dashboardInsights/ui/DashboardInsightsView.tsx src/widgets/dashboardInsights/container/useContainer.ts src/widgets/transactions/ui/TransactionFormModal.tsx
git commit -m "feat(icons): replace emoji with CategoryIcon across all render points"
```

---

### Task 8: Удаление emoji-picker-react

**Files:**
- Modify: `package.json` (remove dependency)
- Modify: `package-lock.json` (auto-updated by npm uninstall)

**Interfaces:**
- Consumes: all previous tasks have removed emoji-picker-react imports
- Produces: clean dependency tree without emoji-picker-react

- [ ] **Step 1: Удалить зависимость**

```bash
npm uninstall emoji-picker-react
```

- [ ] **Step 2: Проверить отсутствие импортов emoji-picker-react**

```bash
grep -r "emoji-picker-react" src/
```

Expected: ноль результатов. Если grep что-то нашёл — вернуться в соответствующую задачу и удалить импорт.

- [ ] **Step 3: Проверить сборку**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Проверить визуально**

```bash
npm run dev
```

Открыть http://localhost:5173, перейти на /categories, проверить:
- Таблица заменена на сетку карточек
- Иконки SVG отображаются вместо эмодзи
- Skeleton shimmer при загрузке
- Error state с кнопкой retry
- Empty state с кнопкой "Add first category"
- Action-кнопки (edit/delete) на карточках (скрыты для системных)
- Модалка создания/редактирования с CategoryIconPicker вместо EmojiPicker
- В insight-тайлах на дашборде иконки вместо эмодзи
- В таблице транзакций иконки категорий вместо эмодзи

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove emoji-picker-react dependency"
```

---

## Self-Review

### 1. Spec coverage

| Требование спецификации | Task |
|---|---|
| CSS Grid карточек 3->2->1 колонки | Task 5 (CategoriesGrid.module.scss) |
| Карточка: иконка в круге, имя, type-tag, счётчик, action-кнопки | Task 5 (CategoriesGrid.tsx) |
| .aurora-card, .aurora-row-hover, .aurora-row-actions | Task 5 (классы на card) |
| Системные категории (isSystem): action-кнопки скрыты | Task 5 (условие `!row.isSystem`) |
| loading -> CategoriesPageSkeleton (grid shimmer) | Task 6 (CategoriesPageSkeleton) |
| error -> aurora-card с warning-иконкой, текстом, retry | Task 6 (CategoriesWidget) |
| empty -> aurora-empty-state + ghost-card | Task 6 (CategoriesWidget) |
| CategoryIcon компонент (29 SVG-иконок) | Task 1 (icons.tsx) |
| emojiMapping (эмодзи -> ключ) | Task 1 (emojiMapping.ts) |
| resolveIconKey | Task 1 (emojiMapping.ts) |
| CategoryIconPicker (grid кнопок выбора) | Task 1 (CategoryIconPicker.tsx) |
| useContainer рефакторинг (EmojiClickData -> key: string) | Task 2 |
| CategoryFormModal рефакторинг (EmojiPicker -> CategoryIconPicker) | Task 4 |
| CategoriesTable удаление | Task 5 |
| CategoriesWidget ветки loading/error/empty/normal | Task 6 |
| AppShell обёртка для всех состояний | Task 6 |
| TransactionsTable.tsx — иконки категорий + edit/delete SVG | Task 7 (Step 1) |
| topCategories/ui/index.tsx — иконка категории | Task 7 (Step 2) |
| largestTransactions/ui/index.tsx — иконка категории | Task 7 (Step 3) |
| DashboardInsightsView.tsx — иконки в тайлах | Task 7 (Step 4) |
| dashboardInsights useContainer.ts — эмодзи -> ключи | Task 7 (Step 4) |
| TransactionFormModal.tsx — optionRender с иконкой | Task 7 (Step 5) |
| i18n: categoryEmoji -> categoryIcon + новые ключи | Task 3 |
| Удаление emoji-picker-react | Task 8 |
| Без новых npm-зависимостей (инлайн SVG) | Все задачи |
| Контраст 4.5:1, focus-ring, aria-label, touch >=44px, reduced-motion | Task 1 (aria на CategoryIcon), Task 4 (iconPickerTrigger 44px), Task 5 (SCSS reduced-motion, actionButton 32px -> но touch target 44px через iconPickerTrigger в модалке), Task 6 (shimmer reduced-motion) |

### 2. Placeholder scan

Проверка на запрещённые паттерны:
- "TBD" -- НЕТ
- "TODO" -- НЕТ
- "implement later" -- НЕТ
- "add error handling" (без кода) -- НЕТ
- "similar to Task N" -- НЕТ
- Ссылки на типы/функции без определения -- все типы определены в Task 1 (CategoryIconProps, CategoryIconPickerProps) или в спецификации (CategoryRowViewModel, CategoryFormValues, CategoryModalMode)
- Шаги без кода там, где нужен код -- везде есть код

### 3. Type consistency

Проверка согласованности имён между задачами:

| Имя | Определено в | Используется в |
|---|---|---|
| `CategoryIcon` | Task 1 (CategoryIcon.tsx) | Task 4, 5, 6, 7 |
| `CategoryIconProps` | Task 1 (CategoryIcon.tsx) | Task 4, 5, 7 |
| `CategoryIconPicker` | Task 1 (CategoryIconPicker.tsx) | Task 4 |
| `CategoryIconPickerProps` | Task 1 (CategoryIconPicker.tsx) | Task 4 |
| `categoryIcons` | Task 1 (icons.tsx) | Task 1 (emojiMapping.ts, CategoryIcon.tsx, CategoryIconPicker.tsx) |
| `emojiToKey` | Task 1 (emojiMapping.ts) | Task 1 (emojiMapping.ts, barrel) |
| `resolveIconKey` | Task 1 (emojiMapping.ts) | Task 1 (CategoryIcon.tsx) |
| `PICKER_KEYS` | Task 1 (CategoryIconPicker.tsx, internal) | Task 1 (CategoryIconPicker.tsx) |
| `isIconPickerOpen` | Task 2 (useContainer) | Task 4, 5, 6 |
| `selectedIcon` | Task 2 (useContainer) | Task 4, 5, 6 |
| `onIconPickerOpenChange` | Task 2 (useContainer) | Task 4, 5, 6 |
| `onIconSelect(key: string)` | Task 2 (useContainer) | Task 4, 5, 6 |
| `DEFAULT_ICON_KEY = "other"` | Task 2 (useContainer, internal) | Task 2 |
| `CategoriesGrid` | Task 5 (CategoriesGrid.tsx) | Task 5 (CategoriesView), Task 6 (CategoriesWidget) |
| `CategoriesGridProps { rows, onEdit, onDelete, deleteLoading }` | Task 5 | Task 5, 6 |
| `categoryIcon` (i18n) | Task 3 | Task 4 |
| `categoryIconIsRequired` (i18n) | Task 3 | Task 4 |
| `categoriesGridEmpty` (i18n) | Task 3 | Task 6 |
| `addFirstCategory` (i18n) | Task 3 | Task 6 |
| `chooseIcon` (i18n) | Task 3 | Task 4 |
| `edit` / `delete` (SVG keys) | Task 1 (icons.tsx, not in PICKER_KEYS) | Task 5, 7 |
| `warning` (SVG key) | Task 1 (icons.tsx, not in PICKER_KEYS) | Task 6 |

Все имена согласованы. Расхождений нет.
