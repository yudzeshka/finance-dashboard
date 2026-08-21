import type { EChartsOption } from "echarts";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useFilters } from "@/features/transaction/filters/model/selectors";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useDebounce } from "@/shared/hooks/UseDebounce";
import { useMedia } from "@/shared/hooks/useMedia";
import { useCurrencyFormatter } from "@/shared/lib/useCurrencyFormatter";
import { getCategoryLabel } from "@/entities/category";
import { calculateExpenceChart } from "../model/lib";
import type { PieDataItemOption } from "echarts/types/src/chart/pie/PieSeries.js";

const COLORS = [
  "#7C3AED", "#0E9F6E", "#E0457B", "#8B5CF6",
  "#F59E0B", "#3B82F6", "#EC4899", "#10B981",
];

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const { transactions } = useTransactionQueries();
  const filters = useFilters();
  const setAllTransactions = useSetAllTransactions();
  const { debouncedValue: debouncedSearch } = useDebounce(filters.search ?? "", 250);
  const { isMobile } = useMedia();
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();

  const reportFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const chartData = useMemo(
    () =>
      calculateExpenceChart(transactions, reportFilters, (category) =>
        getCategoryLabel(category, t),
      ),
    [transactions, reportFilters, t],
  );

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => {
    const radius: [string, string] = isMobile ? ["50%", "70%"] : ["55%", "75%"];
    const center: [string, string] = isMobile ? ["50%", "45%"] : ["50%", "50%"];

    return {
      textStyle: { fontFamily: "'Inter', sans-serif" },
      tooltip: {
        trigger: "item",
        backgroundColor: "#FFFFFF",
        borderColor: "#E8E4F0",
        textStyle: { color: "#1E1B2E", fontSize: 13 },
      },
      title: {
        text: `${t("total")}: ${formatCurrency(chartData.total)}`,
        left: "center",
        top: "center",
        textStyle: {
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "'Sora', 'Inter', sans-serif",
          color: "#1E1B2E",
        },
        subtext: t("total"),
        subtextStyle: { fontSize: 12, color: "#6B6680" },
      },
      series: [
        {
          type: "pie",
          data: chartData.data as PieDataItemOption[],
          radius,
          center,
          color: COLORS,
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{d}%",
            color: "#6B6680",
            fontSize: 12,
          },
          emphasis: { scaleSize: 8, label: { fontSize: 14, fontWeight: "bold" } },
          itemStyle: { borderColor: "#FFFFFF", borderWidth: 2 },
          animationDuration: 600,
          animationEasing: "cubicOut" as const,
        },
      ],
      legend: isMobile
        ? {
            icon: "circle" as const,
            orient: "horizontal" as const,
            bottom: 0,
            left: "center" as const,
            textStyle: { color: "#6B6680", fontSize: 13 },
            itemWidth: 8,
            itemHeight: 8,
          }
        : {
            icon: "circle" as const,
            orient: "vertical" as const,
            right: 10,
            top: "middle",
            textStyle: { color: "#6B6680", fontSize: 13 },
            itemWidth: 8,
            itemHeight: 8,
          },
    };
  }, [chartData, isMobile, t, formatCurrency]);

  return { option };
};
