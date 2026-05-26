import { CategoriesPageSkeleton } from "../ui/CategoriesPageSkeleton";
import { CategoriesView } from "../ui/CategoriesView";
import { useContainer } from "./useContainer";

export function CategoriesWidget() {
  const containerProps = useContainer();

  if (containerProps.loading && containerProps.categories.length === 0) {
    return <CategoriesPageSkeleton />;
  }

  return <CategoriesView {...containerProps} />;
}
