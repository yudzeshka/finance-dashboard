import type { Transaction } from "@/entities/transaction";
import {
  DollarOutlined,
  WalletOutlined,
  RiseOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { ReportCardConfig } from "./types";

export const reportCardsConfig: ReportCardConfig[] = [
  {
    id: "income",
    title: "Total Income",
    Icon: DollarOutlined,
    tone: "green",
    getValue: (transactions: Transaction[]) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "expense",
    title: "Total Expense",
    Icon: ArrowDownOutlined,
    tone: "red",
    getValue: (transactions: Transaction[]) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "EXPENSE" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "balance",
    title: "Balance",
    Icon: WalletOutlined,
    tone: "purple",
    getValue: (transactions: Transaction[]) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME"
            ? acc + transaction.amount
            : acc - transaction.amount,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "averagePerDay",
    title: "Average per day",
    Icon: RiseOutlined,
    tone: "blue",
    getValue: (transactions: Transaction[], periodDays: number) => {
      const balance = transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME"
            ? acc + transaction.amount
            : acc - transaction.amount,
        0,
      );

      return periodDays > 0 ? balance / periodDays : 0;
    },
    showPercentage: false,
  },
];
