import type { ContainerComponentType } from "@/shared/types/types";
import type { EChartsOption } from "echarts";
import type { UIPropertyType } from "../ui";
import { useTransactionQueries } from "@/features/transaction/manage/model/useTransactionQueries";
import { useSetAllTransactions } from "@/entities/transaction/model/selectors";
import { useEffect, useMemo, useState } from "react";
import { getTransactionsByMonth } from "../model/lib";

export const useContainer: ContainerComponentType<UIPropertyType> = () => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const {
    transactions,
    loading: _loading,
    error: _error,
  } = useTransactionQueries();

  const setAllTransactions = useSetAllTransactions();

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

  const option: EChartsOption = {
    xAxis: {
      data: chartData.days,
    },
    yAxis: {},
    series: [
      {
        data: chartData.amounts,
        type: "line",
        smooth: true,
      },
    ],
  };
  return { option, targetDate, onTargetDateChange };
};
