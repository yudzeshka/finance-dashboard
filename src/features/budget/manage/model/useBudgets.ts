import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import {
  DELETE_BUDGET_BY_PK,
  GET_BUDGETS,
  INSERT_BUDGET_ONE,
  UPDATE_BUDGET_BY_PK,
  calculateBudgetProgress,
} from "@/entities/budget";
import type { Budget, BudgetProgress } from "@/entities/budget";
import { GET_CATEGORIES } from "@/entities/category";
import type { Category } from "@/entities/category";
import { GET_TRANSACTIONS } from "@/entities/transaction";
import type { Transaction } from "@/entities/transaction";

type GetBudgetsData = { budgets: Budget[] };
type GetTransactionsData = { transactions: Transaction[] };
type GetCategoriesData = { categories: Category[] };

type InsertBudgetData = { insert_budgets_one: Budget | null };
type InsertBudgetVars = { categoryId: string; limitUsd: number };

type UpdateBudgetData = { update_budgets_by_pk: Budget | null };
type UpdateBudgetVars = { id: string; limitUsd: number };

type DeleteBudgetData = { delete_budgets_by_pk: { id: string } | null };
type DeleteBudgetVars = { id: string };

const emptyBudgets: Budget[] = [];
const emptyTransactions: Transaction[] = [];
const emptyCategories: Category[] = [];

export function useBudgets() {
  const {
    data: budgetsData,
    loading,
    error,
    refetch,
  } = useQuery<GetBudgetsData>(GET_BUDGETS, {
    fetchPolicy: "cache-and-network",
  });

  const { data: transactionsData } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);

  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
  });

  const [insertBudget, { loading: createLoading }] = useMutation<
    InsertBudgetData,
    InsertBudgetVars
  >(INSERT_BUDGET_ONE, {
    update(cache, result) {
      const created = result.data?.insert_budgets_one;
      if (!created) return;

      cache.updateQuery<GetBudgetsData>({ query: GET_BUDGETS }, (prev) => {
        const existing = prev?.budgets ?? [];
        if (existing.some((b) => b.id === created.id)) return prev;
        return { budgets: [created, ...existing] };
      });
    },
  });

  const [updateBudget, { loading: editLoading }] = useMutation<
    UpdateBudgetData,
    UpdateBudgetVars
  >(UPDATE_BUDGET_BY_PK, {
    update(cache, result) {
      const edited = result.data?.update_budgets_by_pk;
      if (!edited) return;

      cache.updateQuery<GetBudgetsData>({ query: GET_BUDGETS }, (prev) => {
        const existing = prev?.budgets ?? [];
        if (!existing.some((b) => b.id === edited.id)) return prev;
        return {
          budgets: existing.map((b) => (b.id === edited.id ? edited : b)),
        };
      });
    },
  });

  const [deleteBudget, { loading: deleteLoading }] = useMutation<
    DeleteBudgetData,
    DeleteBudgetVars
  >(DELETE_BUDGET_BY_PK, {
    update(cache, result) {
      const deleted = result.data?.delete_budgets_by_pk;
      if (!deleted) return;

      cache.updateQuery<GetBudgetsData>({ query: GET_BUDGETS }, (prev) => {
        const existing = prev?.budgets ?? [];
        if (!existing.some((b) => b.id === deleted.id)) return prev;
        return { budgets: existing.filter((b) => b.id !== deleted.id) };
      });
    },
  });

  const budgets = budgetsData?.budgets ?? emptyBudgets;
  const transactions = transactionsData?.transactions ?? emptyTransactions;
  const categories = categoriesData?.categories ?? emptyCategories;

  const progress = useMemo<BudgetProgress[]>(
    () => calculateBudgetProgress(budgets, transactions),
    [budgets, transactions],
  );

  // EXPENSE-категории, у которых ещё нет лимита — для Select в модалке create.
  const availableCategories = useMemo<Category[]>(() => {
    const budgetCategoryIds = new Set(budgets.map((b) => b.category_id));
    return categories.filter(
      (category) =>
        category.type === "EXPENSE" && !budgetCategoryIds.has(category.id),
    );
  }, [categories, budgets]);

  const createBudget = async (categoryId: string, limitUsd: number) => {
    await insertBudget({ variables: { categoryId, limitUsd } });
  };

  const editBudget = async (id: string, limitUsd: number) => {
    await updateBudget({ variables: { id, limitUsd } });
  };

  const removeBudget = async (id: string) => {
    await deleteBudget({ variables: { id } });
  };

  return {
    budgets,
    progress,
    availableCategories,
    loading,
    error,
    refetch,
    createBudget,
    editBudget,
    removeBudget,
    createLoading,
    editLoading,
    deleteLoading,
  };
}
