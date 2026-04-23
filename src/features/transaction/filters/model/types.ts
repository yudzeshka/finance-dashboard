export type TransactionType = "income" | "expense";

export type TransactionFilters = {
  search?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  amountFrom?: number;
  amountTo?: number;
};
