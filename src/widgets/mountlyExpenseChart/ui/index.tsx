import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import styles from "./styles.module.scss";
import dayjs from "dayjs";
import { Button, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

export type UIPropertyType = {
  option: EChartsOption;
  targetDate: Date;
  onTargetDateChange: (date: Date | null) => void;
};

export const UI = ({
  option,
  targetDate,
  onTargetDateChange,
}: UIPropertyType) => {
  const { t } = useTranslation();
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartTitleContainer}>
        <h4 className={styles.chartTitle}>
          {t("expensesByMonth")} {dayjs(targetDate).format("MMMM YYYY")}
        </h4>{" "}
        <div className={styles.datePickerContainer}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              onTargetDateChange(
                dayjs(targetDate).subtract(1, "month").toDate(),
              )
            }
          />
          <DatePicker
            value={dayjs(targetDate)}
            onChange={(value: Dayjs | null) =>
              onTargetDateChange(value ? value.toDate() : null)
            }
            picker="month"
          />
          <Button
            icon={<ArrowRightOutlined />}
            onClick={() =>
              onTargetDateChange(dayjs(targetDate).add(1, "month").toDate())
            }
          />
        </div>
      </div>

      <ReactECharts option={option} className={styles.chart} />
    </div>
  );
};
