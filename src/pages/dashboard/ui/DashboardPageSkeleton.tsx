import { Skeleton } from "antd";

export function DashboardPageSkeleton() {
  return (
    <div
      className="dashboard-skeleton-grid"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Hero placeholder */}
      <div
        className="aurora-card--elevated"
        style={{ padding: 32, minHeight: 140 }}
      >
        <Skeleton active title={false} paragraph={{ rows: 3 }} />
      </div>

      {/* 3 insight tiles placeholder */}
      <div
        className="dashboard-skeleton-insights"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aurora-card"
            style={{ padding: 20, minHeight: 100 }}
          >
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>

      {/* Table placeholder */}
      <div
        className="aurora-card"
        style={{ padding: 20, minHeight: 300 }}
      >
        <Skeleton
          active
          title={{ width: "30%" }}
          paragraph={{ rows: 10 }}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-skeleton-insights {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
