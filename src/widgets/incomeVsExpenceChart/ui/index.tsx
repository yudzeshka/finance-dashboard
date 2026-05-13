import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {useTranslation} from 'react-i18next'

import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
};

export const UI = ({ option }: UIPropertyType) => {
  const {t} = useTranslation()
  return (
    <div className={styles.chartContainer}>
      <h4 className={styles.chartTitle}>{t("incomeVsExpense")}</h4>
      <ReactECharts option={option} className={styles.chart} />
    </div>
  );
};
