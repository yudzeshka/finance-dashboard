import type { Transaction } from "@/entities/transaction";
import {
  DollarOutlined,
  WalletOutlined,
  PieChartOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { ReportCardConfig } from "./types";

export const reportCardsConfig: ReportCardConfig[] = [
  {
    id: "income",
    titleKey: "totalIncome",
    Icon: DollarOutlined,
    tone: "green",
    getValue: (transactions: Transaction[], _periodDays: number) => {
      void _periodDays;
      return transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME" ? acc + transaction.amount : acc,
        0,
      );
    },
    showPercentage: true,
  },
  {
    id: "expense",
    titleKey: "totalExpense",
    Icon: ArrowDownOutlined,
    tone: "red",
    getValue: (transactions: Transaction[], _periodDays: number) => {
      void _periodDays;
      return transactions.reduce(
        (acc, transaction) =>
          transaction.type === "EXPENSE" ? acc + transaction.amount : acc,
        0,
      );
    },
    showPercentage: true,
  },
  {
    id: "balance",
    titleKey: "balance",
    Icon: WalletOutlined,
    tone: "purple",
    getValue: (transactions: Transaction[], _periodDays: number) => {
      void _periodDays;
      return transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME"
            ? acc + transaction.amount
            : acc - transaction.amount,
        0,
      );
    },
    showPercentage: true,
  },
  {
    id: "savingsRate",
    titleKey: "savingsRate",
    Icon: PieChartOutlined,
    tone: "neutral",
    getValue: (transactions: Transaction[], _periodDays: number) => {
      void _periodDays;
      const income = transactions
        .filter((tx) => tx.type === "INCOME")
        .reduce((acc, tx) => acc + tx.amount, 0);
      const expense = transactions
        .filter((tx) => tx.type === "EXPENSE")
        .reduce((acc, tx) => acc + tx.amount, 0);
      return income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    },
    showPercentage: false,
  },
];
