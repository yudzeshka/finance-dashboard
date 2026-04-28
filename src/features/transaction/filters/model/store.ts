import { create } from "zustand";
import { initialTransactionFilters } from "./constants";
import type { TransactionFilters } from "./types";

type State = {
  filters: TransactionFilters;
};

type Actions = {
  setFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
};

export const useTransactionFiltersStore = create<State & Actions>((set) => ({
  filters: initialTransactionFilters,

  setFilters: (payload) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...payload,
      },
    })),
  resetFilters: () => set({ filters: initialTransactionFilters }),
}));
