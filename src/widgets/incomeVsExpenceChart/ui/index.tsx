import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.scss";

export type UIPropertyType = {
  option: EChartsOption;
  hideTitle?: boolean;
};

export const UI = ({ option, hideTitle = false }: UIPropertyType) => {
  const { t } = useTranslation();
  const content = (
    <div className={styles.chartContainer}>
      {!hideTitle && (
        <h4 className={`aurora-font-display ${styles.chartTitle}`}>
          {t("incomeVsExpense")}
        </h4>
      )}
      <ReactECharts option={option} className={styles.chart} />
    </div>
  );

  if (hideTitle) return content;
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {content}
    </div>
  );
};
