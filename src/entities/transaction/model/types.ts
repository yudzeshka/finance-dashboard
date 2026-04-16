import type { Category } from "../../category/model/types";

export type TransactionType = "INCOME" | "EXPENSE";

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date?: string | null;
  description?: string | null;
};

