import { Skeleton } from "antd";

export function ReportsListsSkeleton() {
  return (
    <div className="aurora-card" style={{ padding: 16 }}>
      <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 16 }} />
      <Skeleton.Input active size="small" style={{ width: 120, marginLeft: 16, marginBottom: 16 }} />
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
}
