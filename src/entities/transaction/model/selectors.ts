import { useTransactionsStore } from "./store";

export const useTransactions = () =>
  useTransactionsStore((state) => state.transactions);

export const useAllTransactions = () =>
  useTransactionsStore((state) => state.allTransactions);

export const useSetTransactions = () =>
  useTransactionsStore((state) => state.setTransactions);

export const useSetAllTransactions = () =>
  useTransactionsStore((state) => state.setAllTransactions);
