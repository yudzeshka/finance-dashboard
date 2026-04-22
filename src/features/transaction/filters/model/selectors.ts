import { useTransactionFiltersStore } from "./store";

export const useFilters = () =>
  useTransactionFiltersStore((state) => state.filters);

export const useSetFilters = () =>
  useTransactionFiltersStore((state) => state.setFilters);

export const useResetFilters = () =>
  useTransactionFiltersStore((state) => state.resetFilters);
