import { create } from "zustand";
import type { TransactionFilters } from "./types";

type State = {
  filters: TransactionFilters;
};

type Actions = {
  setFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
};

const initialFilters: TransactionFilters = {
  search: "",
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  category: undefined,
  amountFrom: undefined,
  amountTo: undefined,
};

export const useTransactionFiltersStore = create<State & Actions>((set) => ({
  filters: initialFilters,

  setFilters: (payload) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...payload,
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
