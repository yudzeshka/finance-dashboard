import { useEffect, useMemo, useRef, useState } from "react";
import type { TransactionFilters } from "../model/types";
import { useFilters, useSetFilters, useResetFilters } from "../model/selectors";
import { GET_CATEGORIES } from "../../../../entities/category";
import type { Category } from "../../../../entities/category";
import { useQuery } from "@apollo/client/react";
import type { Dayjs } from "dayjs";
import { useAllTransactions } from "../../../../entities/transaction/model/selectors";

const initialFilters: TransactionFilters = {
  amountFrom: undefined,
  amountTo: undefined,
  category: undefined,
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const useContainer = () => {
  const filters = useFilters();
  const setFilters = useSetFilters();
  const resetFilters = useResetFilters();
  const allTransactions = useAllTransactions();
  const amountBounds = useMemo((): [number, number] => {
    if (allTransactions.length === 0) return [0, 100];
    const amounts = allTransactions.map((tx) => tx.amount);
    return [Math.min(...amounts), Math.max(...amounts)];
  }, [allTransactions]);

  const [isOpen, setIsOpen] = useState(false);
  const [amountRange, setAmountRange] = useState<number[]>(amountBounds);
  const [filtersValues, setFiltersValues] =
    useState<TransactionFilters>(initialFilters);
  const isAmountInitializedRef = useRef(false);
  const { data: categoriesData } = useQuery<{
    categories: Category[];
  }>(GET_CATEGORIES);

  useEffect(() => {
    // Initialize amount range once when bounds become known.
    if (isAmountInitializedRef.current) return;
    isAmountInitializedRef.current = true;

    setAmountRange(amountBounds);
    setFiltersValues((prev) => ({
      ...prev,
      amountFrom: amountBounds[0],
      amountTo: amountBounds[1],
    }));
  }, [amountBounds]);

  const onResetFilters = () => {
    resetFilters();
    setAmountRange(amountBounds);
    setFiltersValues((prev) => ({
      ...prev,
      amountFrom: amountBounds[0],
      amountTo: amountBounds[1],
    }));
  };
  console.log("filters", filters);
  console.log("amountRange", amountRange);
  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  const onAmountRangeChange = (value: number[]) => {
    // Fast UI update while dragging
    setAmountRange(value);
  };

  const onAmountRangeCommit = (value: number[]) => {
    // Commit to filter state only when drag ends
    setFiltersValues((prev) => ({
      ...prev,
      amountFrom: value[0],
      amountTo: value[1],
    }));
  };
  const onFiltersChange = <K extends keyof TransactionFilters>(
    value: TransactionFilters[K],
    key: K,
  ) => {
    setFiltersValues({ ...filtersValues, [key]: value } as TransactionFilters);
  };
  const onDateChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    setFiltersValues({
      ...filtersValues,
      dateFrom: value?.[0]?.toISOString() ?? undefined,
      dateTo: value?.[1]?.toISOString() ?? undefined,
    });
  };
  const onSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };
  const onApplyFilters = () => {
    setFilters(filtersValues);
    onClose();
  };
  const onClearFilters = () => {
    setFiltersValues(initialFilters);
    setAmountRange(amountBounds);
    setFiltersValues((prev) => ({
      ...prev,
      amountFrom: amountBounds[0],
      amountTo: amountBounds[1],
    }));
  };

  // do not auto-sync amountRange on each filters change:
  // user must control it, and we reset only via Clear/Reset

  console.log(categoriesData);
  return {
    onOpen,
    onClose,
    isOpen,
    amountBounds,
    amountRange,
    onAmountRangeChange,
    onAmountRangeCommit,
    onFiltersChange,
    onSearchChange,
    onDateChange,
    filtersValues,
    filters,
    resetFilters: onResetFilters,
    categories: categoriesData?.categories ?? [],
    onApplyFilters,
    onClearFilters,
  };
};
