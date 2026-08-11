import { useEffect, useMemo } from "react";
import { useTransactionQueries } from "./useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";

export function useReportsData() {
  const { transactions, loading, error, refetch } = useTransactionQueries();
  const setAllTransactions = useSetAllTransactions();

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const isEmpty = useMemo(
    () => !loading && !error && transactions.length === 0,
    [loading, error, transactions],
  );

  return { loading, error, refetch, isEmpty };
}
