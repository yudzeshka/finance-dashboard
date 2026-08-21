import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "@/entities/category";
import { GET_CATEGORIES, getCategoryLabel } from "@/entities/category";
import type {
  Transaction,
  TransactionCategoryOption,
} from "@/entities/transaction";
import { GET_TRANSACTIONS } from "@/entities/transaction";

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

const emptyTransactions: Transaction[] = [];
const emptyCategories: Category[] = [];

export function useTransactionQueries() {
  const { t } = useTranslation();
  const {
    data: transactionsData,
    loading,
    error,
    refetch,
  } = useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData, refetch: refetchCategories } = useQuery<GetCategoriesData>(
    GET_CATEGORIES,
    { fetchPolicy: "cache-and-network" },
  );

  const transactions = transactionsData?.transactions ?? emptyTransactions;
  const categories = categoriesData?.categories ?? emptyCategories;

  const categoryOptions = useMemo<TransactionCategoryOption[]>(() => {
    return categories.map((category) => ({
      label: getCategoryLabel(category, t),
      value: category.id,
      icon: category.icon,
    }));
  }, [categories, t]);

  return {
    transactions,
    categories,
    categoryOptions,
    loading,
    error,
    refetch: async () => {
      await Promise.all([refetch(), refetchCategories()]);
    },
  };
}
