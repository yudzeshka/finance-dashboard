import { useMemo, useState } from "react";
import type { TransactionFilters } from "../model/types";
import { useFilters, useSetFilters, useResetFilters } from "../model/selectors";
import { GET_CATEGORIES } from "../../../../entities/category";
import type { Category } from "../../../../entities/category";
import { displayToUsd, usdToDisplay, useCurrencyRatesStore } from "@/entities/currency";
import { useAppearanceStore } from "@/features/settings/appearance";
import { useQuery } from "@apollo/client/react";
import type { Dayjs } from "dayjs";
import { useAllTransactions } from "../../../../entities/transaction/model/selectors";
import { initialTransactionFilters } from "../model/constants";

export const useContainer = () => {
  const filters = useFilters();
  const setFilters = useSetFilters();
  const resetFilters = useResetFilters();
  const allTransactions = useAllTransactions();
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  const amountBoundsUsd = useMemo((): [number, number] => {
    if (allTransactions.length === 0) return [0, 100];
    const amounts = allTransactions.map((tx) => tx.amount);
    return [Math.min(...amounts), Math.max(...amounts)];
  }, [allTransactions]);
  const amountBounds = useMemo(
    (): [number, number] => [
      usdToDisplay(amountBoundsUsd[0], currency, rates),
      usdToDisplay(amountBoundsUsd[1], currency, rates),
    ],
    [amountBoundsUsd, currency, rates],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [amountRange, setAmountRange] = useState<number[]>(amountBounds);
  const [filtersValues, setFiltersValues] =
    useState<TransactionFilters>(initialTransactionFilters);
  const { data: categoriesData } = useQuery<{
    categories: Category[];
  }>(GET_CATEGORIES, { fetchPolicy: "cache-and-network" });

  const onResetFilters = () => {
    resetFilters();
    setAmountRange(amountBounds);
    setFiltersValues(initialTransactionFilters);
  };

  const onOpen = () => {
    setFiltersValues(filters);
    setAmountRange([
      usdToDisplay(filters.amountFrom ?? amountBoundsUsd[0], currency, rates),
      usdToDisplay(filters.amountTo ?? amountBoundsUsd[1], currency, rates),
    ]);
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
      amountFrom: displayToUsd(value[0], currency, rates),
      amountTo: displayToUsd(value[1], currency, rates),
    }));
  };
  const onFiltersChange = <K extends keyof TransactionFilters>(
    value: TransactionFilters[K],
    key: K,
  ) => {
    setFiltersValues((prev) => ({ ...prev, [key]: value }));
  };
  const onDateChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    setFiltersValues((prev) => ({
      ...prev,
      dateFrom: value?.[0]?.toISOString() ?? undefined,
      dateTo: value?.[1]?.toISOString() ?? undefined,
    }));
  };
  const onSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };
  const onApplyFilters = () => {
    setFilters(filtersValues);
    onClose();
  };
  const onClearFilters = () => {
    resetFilters();
    setFiltersValues(initialTransactionFilters);
    setAmountRange(amountBounds);
  };

  // do not auto-sync amountRange on each filters change:
  // user must control it, and we reset only via Clear/Reset

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
