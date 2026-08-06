import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useEffect, useMemo, useState } from "react";
import { getTopCategories } from "../model/lib";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const formatCurrency = useCurrencyFormatter();
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const { transactions, loading, error: _error } = useTransactionQueries();

  const setAllTransactions = useSetAllTransactions();

  const rows = useMemo(() => {
    const categories = getTopCategories(transactions, targetDate);
    const totalAmount = Math.max(
      1,
      categories.reduce((sum, item) => sum + item.amount, 0),
    );

    return categories
      .map((item) => ({
        id: item.category.id,
        name: item.category.name,
        icon: item.category.icon,
        amountLabel: formatCurrency(item.amount),
        percent: Math.round((item.amount / totalAmount) * 100),
      }))
      .slice(0, 3);
  }, [transactions, targetDate, formatCurrency]);

  const onTargetDateChange = (date: Date | null) => {
    if (date) setTargetDate(date);
  };

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  return { targetDate, onTargetDateChange, rows, loading };
};
