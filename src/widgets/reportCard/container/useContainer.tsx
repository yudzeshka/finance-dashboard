import { useEffect, useMemo } from "react";

import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { calculateReportCards } from "../model/calculateReportCards";

export const useContainer = () => {
  const { transactions, loading, error } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(
    filters.search ?? "",
    250,
  );

  const reportFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const cards = useMemo(
    () => calculateReportCards(transactions, reportFilters),
    [transactions, reportFilters],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  return {
    cards,
    loading,
    error,
  };
};
