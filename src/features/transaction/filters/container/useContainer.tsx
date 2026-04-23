import { useState } from "react";
import type { TransactionFilters } from "../model/types";
import { useFilters, useSetFilters, useResetFilters } from "../model/selectors";
import { GET_CATEGORIES } from "../../../../entities/category";
import type { Category } from "../../../../entities/category";
import { useQuery } from "@apollo/client/react";

const initialFilters: TransactionFilters = {
  amountFrom: undefined,
  amountTo: undefined,
  category: undefined,
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const useContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amountRange, setAmountRange] = useState<number[]>([0, 100]);
  const [filtersValues, setFiltersValues] =
    useState<TransactionFilters>(initialFilters);
  const { data: categoriesData } = useQuery<{
    categories: Category[];
  }>(GET_CATEGORIES);

  const filters = useFilters();
  const setFilters = useSetFilters();
  const resetFilters = useResetFilters();

  const onResetFilters = () => {
    resetFilters();
    setAmountRange([0, 100]);
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
    setAmountRange(value);
    setFiltersValues({
      ...filtersValues,
      amountFrom: value[0],
      amountTo: value[1],
    });
  };
  const onFiltersChange = <K extends keyof TransactionFilters>(
    value: TransactionFilters[K],
    key: K,
  ) => {
    setFiltersValues({ ...filtersValues, [key]: value } as TransactionFilters);
  };
  const onDateChange = (value: [string, string]) => {
    setFiltersValues({
      ...filtersValues,
      dateFrom: value[0] || undefined,
      dateTo: value[1] || undefined,
    });
  };
  const onApplyFilters = () => {
    setFilters(filtersValues);
    onClose();
  };
  const onClearFilters = () => {
    setFiltersValues(initialFilters);
    setAmountRange([0, 100]);
  };

  console.log(categoriesData);
  return {
    onOpen,
    onClose,
    isOpen,
    amountRange,
    onAmountRangeChange,
    onFiltersChange,
    onDateChange,
    filtersValues,
    filters,
    resetFilters: onResetFilters,
    categories: categoriesData?.categories ?? [],
    onApplyFilters,
    onClearFilters,
  };
};
