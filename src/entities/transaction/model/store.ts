import { create } from "zustand";
import type { Transaction } from "./types";

type State = {
  transactions: Transaction[];
  allTransactions: Transaction[];
};

type Actions = {
  setTransactions: (transactions: Transaction[]) => void;
  setAllTransactions: (transactions: Transaction[]) => void;
};

const initialTransactions: Transaction[] = [];

export const useTransactionsStore = create<State & Actions>((set) => ({
  transactions: initialTransactions,
  allTransactions: initialTransactions,

  setTransactions: (payload) =>
    set(() => ({
      transactions: payload,
    })),

  setAllTransactions: (payload) =>
    set(() => ({
      allTransactions: payload,
    })),
}));
