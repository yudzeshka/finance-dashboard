import { ReportsHeroView } from "../ui/ReportsHeroView";
import { useReportsHero } from "./useContainer";

export function ReportsHeroContainer() {
  const props = useReportsHero();
  return <ReportsHeroView {...props} />;
}
