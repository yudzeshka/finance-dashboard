import type { ComponentType } from "react";
import type { Transaction } from "@/entities/transaction";

export type ReportCardTone = "green" | "red" | "purple" | "blue";

/** Keys under the default `translation` namespace in i18n */
export type ReportCardTitleKey =
  | "totalIncome"
  | "totalExpense"
  | "balance"
  | "averagePerDay";

export type ReportCardConfig = {
  id: "income" | "expense" | "balance" | "averagePerDay";
  titleKey: ReportCardTitleKey;
  Icon: ComponentType<{ className?: string }>;
  tone: ReportCardTone;
  getValue: (transactions: Transaction[], periodDays: number) => number;
  showPercentage: boolean;
};

export type ReportCardViewModel = {
  id: ReportCardConfig["id"];
  title: string;
  value: number;
  percentage?: number;
  positive?: boolean;
  description: string;
  Icon: ReportCardConfig["Icon"];
  tone: ReportCardTone;
};
