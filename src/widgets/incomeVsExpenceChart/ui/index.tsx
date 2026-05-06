import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
};

export const UI = ({ option }: UIPropertyType) => {
  return (
    <div className={styles.chartContainer}>
      <h4 className={styles.chartTitle}>Income vs Expense</h4>
      <ReactECharts option={option} className={styles.chart} />
    </div>
  );
};
