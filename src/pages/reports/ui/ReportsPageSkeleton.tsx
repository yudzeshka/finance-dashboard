import { Skeleton } from "antd";
import styles from "./ReportsPage.module.scss";
import { ReportsHeroSkeleton } from "@/widgets/reportsHero/ui/ReportsHeroSkeleton";
import { ReportCardWidgetSkeleton } from "@/widgets/reportCard/container/ReportCardWidgetSkeleton";
import { ReportsListsSkeleton } from "@/widgets/reportsLists/ui/ReportsListsSkeleton";

function ChartSkeleton() {
  return (
    <div className="aurora-card" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 320 }}>
      <div style={{ padding: 16 }}>
        <Skeleton.Input active size="small" style={{ width: 160 }} />
      </div>
      <Skeleton.Node active style={{ width: "100%", flex: 1, minHeight: 260 }} />
    </div>
  );
}

export function ReportsPageSkeleton() {
  return (
    <div className={styles.page}>
      {/* Filters skeleton */}
      <div className="aurora-card" style={{ padding: "12px 16px" }}>
        <Skeleton.Input active size="small" style={{ width: "100%" }} />
      </div>

      <ReportsHeroSkeleton />
      <ReportCardWidgetSkeleton />

      {/* Bento skeleton */}
      <div className={styles.bentoGrid}>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ReportsListsSkeleton />
    </div>
  );
}
