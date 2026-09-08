import type { Category } from "@/entities/category";

export type Budget = {
  id: string;
  category_id: string;
  limit_usd: number;
  category: Category;
};

export type BudgetStatus = "ok" | "warning" | "danger";

export type BudgetProgress = {
  budget: Budget;
  spent: number; // USD
  limit: number; // USD
  ratio: number; // spent / limit
  remaining: number; // limit - spent (может быть < 0)
  status: BudgetStatus;
};
