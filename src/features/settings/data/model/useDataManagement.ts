import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import {
  GET_TRANSACTIONS,
  DELETE_TRANSACTION,
} from "@/entities/transaction/api/graphql";
import {
  GET_CATEGORIES,
  DELETE_CATEGORY,
} from "@/entities/category/api/graphql";
import { formatAmount, useCurrencyRatesStore } from "@/entities/currency";
import type { CurrencyRates } from "@/entities/currency";
import { useAppearanceStore } from "@/features/settings/appearance";
import type { Currency } from "@/entities/settings";
import type { Transaction } from "@/entities/transaction/model/types";
import type { Category } from "@/entities/category/model/types";

type GetTransactionsData = { transactions: Transaction[] };
type GetCategoriesData = { categories: Category[] };

function generateCsv(
  transactions: Transaction[],
  currency: Currency,
  rates: CurrencyRates | null,
): string {
  const BOM = "﻿";
  const headers = ["date", "type", "category", "amount", "description"];
  const escapeCsv = (val: string | null | undefined) => {
    if (val == null) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = transactions.map((tx) =>
    [
      tx.date ? new Date(tx.date).toISOString().slice(0, 10) : "",
      tx.type,
      tx.category?.name ?? "",
      formatAmount(tx.amount, currency, rates),
      tx.description ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  return BOM + [headers.join(","), ...rows].join("\n");
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface UseDataManagementResult {
  exporting: boolean;
  clearing: boolean;
  exportToCsv: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export function useDataManagement(): UseDataManagementResult {
  const { t } = useTranslation();
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { refetch } = useQuery<GetTransactionsData>(GET_TRANSACTIONS, {
    fetchPolicy: "cache-first",
  });
  const { refetch: refetchCategories } = useQuery<GetCategoriesData>(
    GET_CATEGORIES,
    { fetchPolicy: "cache-first" },
  );

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const exportToCsv = useCallback(async () => {
    setExporting(true);
    try {
      const { data: freshData } = await refetch();
      const transactions: Transaction[] = freshData?.transactions ?? [];
      if (transactions.length === 0) {
        message.info(t("reportsNoData"));
        return;
      }
      const csv = generateCsv(transactions, currency, rates);
      downloadCsv(
        csv,
        `transactions_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      message.success(t("settingsExportSuccess"));
    } catch {
      message.error(t("settingsExportError"));
    } finally {
      setExporting(false);
    }
  }, [refetch, t, currency, rates]);

  const clearAllData = useCallback(async () => {
    setClearing(true);
    try {
      const { data: freshTx } = await refetch();
      const transactions: Transaction[] = freshTx?.transactions ?? [];
      for (const tx of transactions) {
        await deleteTransaction({ variables: { id: tx.id } });
      }

      const { data: freshCat } = await refetchCategories();
      const categories: Category[] = freshCat?.categories ?? [];
      const userCategories = categories.filter((c) => c.user_id != null);
      for (const cat of userCategories) {
        await deleteCategory({ variables: { id: cat.id } });
      }

      message.success(t("settingsClearDataSuccess"));
    } catch {
      message.error(t("settingsClearDataError"));
    } finally {
      setClearing(false);
    }
  }, [refetch, refetchCategories, deleteTransaction, deleteCategory, t]);

  return { exporting, clearing, exportToCsv, clearAllData };
}
