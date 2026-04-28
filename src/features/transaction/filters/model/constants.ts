import type { TransactionFilters } from "./types";

export const initialTransactionFilters: TransactionFilters = {
  search: "",
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  category: undefined,
  amountFrom: undefined,
  amountTo: undefined,
};
