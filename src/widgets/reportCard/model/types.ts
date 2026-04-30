import type { ComponentType } from "react";
import type { Transaction } from "@/entities/transaction";

export type ReportCardTone = "green" | "red" | "purple" | "blue";

export type ReportCardConfig = {
  id: "income" | "expense" | "balance" | "averagePerDay";
  title: string;
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
