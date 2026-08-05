import type { EChartsOption } from "echarts";
import { useMemo, useEffect, useState } from "react";
import type { ContainerComponentType } from "@/shared/types/types";
import type { UIPropertyType } from "../ui";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useMedia } from "@/shared/hooks/useMedia";
import { getTransactionsByMonth } from "../model/lib";

const LINE_COLOR = "#7C3AED";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const { transactions } = useTransactionQueries();
  const setAllTransactions = useSetAllTransactions();
  const { isMobile } = useMedia();

  const chartData = useMemo(
    () => getTransactionsByMonth(transactions, targetDate),
    [transactions, targetDate],
  );

  const onTargetDateChange = (date: Date | null) => {
    if (date) setTargetDate(date);
  };

  useEffect(() => {
    setAllTransactions(transactions);
  }, [transactions, setAllTransactions]);

  const option: EChartsOption = useMemo(() => ({
    textStyle: { fontFamily: "'Inter', sans-serif" },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#FFFFFF",
      borderColor: "#E8E4F0",
      textStyle: { color: "#1E1B2E", fontSize: 13 },
      extraCssText: "box-shadow: 0 4px 12px rgba(76,29,149,0.10); border-radius: 12px; padding: 10px 14px;",
    },
    grid: {
      left: 16,
      right: 16,
      bottom: isMobile ? 36 : 32,
      top: 8,
      containLabel: true,
    },
    xAxis: {
      data: chartData.days,
      axisLabel: {
        color: "#6B6680",
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      axisLabel: { color: "#6B6680", fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#E8E4F0", type: "dashed" } },
    },
    series: [
      {
        type: "line",
        data: chartData.amounts,
        smooth: true,
        color: LINE_COLOR,
        lineStyle: { width: 2.5 },
        symbol: "circle",
        symbolSize: isMobile ? 4 : 6,
        areaStyle: {
          color: "rgba(124, 58, 237, 0.08)",
        },
        animationDuration: 600,
        animationEasing: "cubicOut" as const,
      },
    ],
  }), [chartData, isMobile]);

  return { option, targetDate, onTargetDateChange };
};
