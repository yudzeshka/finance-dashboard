import { DashboardInsightsView } from "../ui/DashboardInsightsView";
import { useDashboardInsights } from "./useContainer";

export function DashboardInsightsContainer() {
  const { tiles } = useDashboardInsights();
  return <DashboardInsightsView tiles={tiles} />;
}
