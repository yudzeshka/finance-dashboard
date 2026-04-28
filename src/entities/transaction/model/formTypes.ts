import type { Dayjs } from "dayjs";
import type { TransactionType } from "./types";

export type TransactionFormValues = {
  amount: number;
  description?: string;
  category: string;
  date: Dayjs;
  type: TransactionType;
};

export type TransactionCategoryOption = {
  label: string;
  value: string;
  icon: string;
};
