import { Skeleton } from "antd";

export function DashboardPageSkeleton() {
  return <Skeleton active title={false} paragraph={{ rows: 18 }} />;
}
