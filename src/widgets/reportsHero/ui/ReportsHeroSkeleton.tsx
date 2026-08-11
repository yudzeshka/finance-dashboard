import { Skeleton } from "antd";
import styles from "./ReportsHero.module.scss";

export function ReportsHeroSkeleton() {
  return (
    <div className={`aurora-card--elevated ${styles.hero}`}>
      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <Skeleton.Input active size="large" style={{ width: 120, marginBottom: 8 }} />
          <Skeleton.Input active size="small" style={{ width: 200, marginBottom: 24 }} />
          <Skeleton.Input active size="large" style={{ width: 180, marginBottom: 8 }} />
          <Skeleton.Input active size="large" style={{ width: 180, marginBottom: 8 }} />
          <Skeleton.Input active size="large" style={{ width: 180 }} />
        </div>
        <div className={styles.heroRight}>
          <Skeleton.Node active style={{ width: "100%", minHeight: 280 }} />
        </div>
      </div>
    </div>
  );
}
