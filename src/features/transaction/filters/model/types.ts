import type { TransactionType } from "../../../../entities/transaction";

export type TransactionFilters = {
  search?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  amountFrom?: number;
  amountTo?: number;
};
