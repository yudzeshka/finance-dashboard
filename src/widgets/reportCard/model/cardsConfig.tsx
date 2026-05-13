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
    titleKey: "totalIncome",
    Icon: DollarOutlined,
    tone: "green",
    getValue: (transactions: Transaction[], _periodDays: number) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "INCOME" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "expense",
    titleKey: "totalExpense",
    Icon: ArrowDownOutlined,
    tone: "red",
    getValue: (transactions: Transaction[], _periodDays: number) =>
      transactions.reduce(
        (acc, transaction) =>
          transaction.type === "EXPENSE" ? acc + transaction.amount : acc,
        0,
      ),
    showPercentage: true,
  },
  {
    id: "balance",
    titleKey: "balance",
    Icon: WalletOutlined,
    tone: "purple",
    getValue: (transactions: Transaction[], _periodDays: number) =>
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
    titleKey: "averagePerDay",
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
