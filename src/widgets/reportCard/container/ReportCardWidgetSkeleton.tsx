import { Skeleton } from "antd";
import styles from "../ui/styles.module.scss";

function ShimmerCard() {
  return (
    <div className={`aurora-card--insight ${styles.card}`}>
      <div className={styles.cardInner}>
        <Skeleton.Node
          active
          style={{ width: 40, height: 40, borderRadius: 12 }}
        />
        <Skeleton.Input active size="small" style={{ width: "60%" }} />
        <Skeleton.Input active size="large" style={{ width: "80%" }} />
        <Skeleton.Input active size="small" style={{ width: "50%" }} />
      </div>
    </div>
  );
}

export function ReportCardWidgetSkeleton() {
  return (
    <div className={styles.cardsGrid}>
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </div>
  );
}
