import { DashboardHeroView } from "../ui/DashboardHeroView";
import { useDashboardHero } from "./useContainer";

export function DashboardHeroContainer() {
  const props = useDashboardHero();
  return <DashboardHeroView {...props} />;
}
