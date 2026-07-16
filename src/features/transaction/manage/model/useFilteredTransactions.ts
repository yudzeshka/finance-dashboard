import { useEffect, useMemo } from "react";

import type { Transaction } from "@/entities/transaction";
import {
  useSetAllTransactions,
  useSetTransactions,
} from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useFilters } from "../../filters/model/selectors";
import { filterTransactions } from "@/entities/transaction/model/filterTransactions";

export function useFilteredTransactions(transactions: Transaction[]) {
  const filters = useFilters();
  const setTransactions = useSetTransactions();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(
    filters.search ?? "",
    250,
  );

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, {
      ...filters,
      search: debouncedSearch,
    });
  }, [transactions, filters, debouncedSearch]);

  useEffect(() => {
    setTransactions(filteredTransactions);
  }, [filteredTransactions, setTransactions]);

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  return filteredTransactions;
}
