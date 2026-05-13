import type { ContainerComponentType } from "@/shared/types/types";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useEffect, useMemo } from "react";
import { getLargestTransactions } from "../model/lib";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import type { UIPropertyType } from "../ui";
import type { Transaction } from "@/entities/transaction";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const {
    transactions,
    loading: _loading,
    error: _error,
  } = useTransactionQueries();

  const setAllTransactions = useSetAllTransactions();

  const filters = useFilters();
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

  const rows = useMemo(() => {
    const largestTransactions = getLargestTransactions(
      transactions,
      reportFilters,
    );
    return largestTransactions;
  }, [transactions, reportFilters]);

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  return { rows: rows as unknown as Transaction[] };
};
