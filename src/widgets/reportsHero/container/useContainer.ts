import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactionsStore } from "@/entities/transaction/model/store";

export function useReportsHero() {
  const allTransactions = useTransactionsStore((s) => s.allTransactions);
  const { t } = useTranslation();

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = allTransactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = allTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [allTransactions]);

  return { totalIncome, totalExpense, balance, t };
}
