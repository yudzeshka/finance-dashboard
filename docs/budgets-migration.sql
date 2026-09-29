-- =============================================================================
-- Бюджеты по категориям — ручная миграция Nhost/Hasura
-- =============================================================================
-- Feature: feat/budgets (docs/plan-budgets-by-category.md, Фаза 1)
-- Спека: docs/superpowers/specs/2026-09-08-budgets-by-category-design.md
--
-- КАК ПРИМЕНИТЬ:
--   1. Nhost Console → Hasura → вкладка «SQL» (Data → SQL).
--   2. Вставьте и выполните блок CREATE TABLE ниже.
--   3. Отследите таблицу (Data → budgets → «Track»).
--   4. Настройте права Hasura (role `user`) — ШАГ 2 ниже.
--   5. Проверьте relationships — ШАГ 3 ниже.
--
-- ВАЖНО: права Hasura и relationships задаются НЕ SQL, а через консоль
-- (Data → budgets → Permissions / Relationships). SQL-блок только создаёт
-- таблицу. См. также HANDOFF.md (раздел про categories — тот же паттерн).
-- =============================================================================

CREATE TABLE budgets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  limit_usd   numeric NOT NULL CHECK (limit_usd > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

-- =============================================================================
-- ШАГ 2. Права Hasura (role `user`) — Data → budgets → Permissions
-- =============================================================================
-- Для роли `user` задайте (по образцу таблицы categories):
--
--   Select
--     Row select permissions: With custom check →
--       { "user_id": { "_eq": "X-Hasura-User-Id" } }
--     Columns: id, category_id, limit_usd, user_id
--
--   Insert
--     Columns: category_id, limit_usd
--     Column presets: user_id = X-Hasura-User-Id
--
--   Update
--     Row update permissions: With custom check →
--       { "user_id": { "_eq": "X-Hasura-User-Id" } }
--     Columns: category_id, limit_usd
--
--   Delete
--     Row delete permissions: With custom check →
--       { "user_id": { "_eq": "X-Hasura-User-Id" } }
--
-- Примечание (как и для categories): под ролью `admin` preset `user_id` не
-- применяется — тестировать под `user` + JWT.
-- =============================================================================

-- =============================================================================
-- ШАГ 3. Relationships — Data → budgets → Relationships (и categories)
-- =============================================================================
--   budgets.category   (object): category_id → categories.id
--   categories.budgets (array):  обратная связь
--
-- Hasura обычно предлагает их автоматически по внешнему ключу category_id —
-- достаточно нажать «Track» / «Add relationship».
-- =============================================================================
