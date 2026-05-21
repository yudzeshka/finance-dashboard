import { Skeleton } from "antd";
import styles from "../ui/styles.module.scss";

export function ReportCardWidgetSkeleton() {
  return (
    <div className={styles.cardsGrid}>
      <Skeleton.Node active={true} style={{ width: "100%" }} />
      <Skeleton.Node active={true} style={{ width: "100%" }} />
      <Skeleton.Node active={true} style={{ width: "100%" }} />
      <Skeleton.Node active={true} style={{ width: "100%" }} />
    </div>
  );
}
