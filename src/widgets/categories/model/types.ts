import type { TransactionType } from "@/entities/transaction";

export type CategoryRowViewModel = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  transactionsCount: number;
  isSystem: boolean;
};

export type CategoryFormValues = {
  name: string;
  type: TransactionType;
  icon: string;
};

export type CategoryModalMode = "create" | "edit";
