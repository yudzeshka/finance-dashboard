import type { CategoryRowViewModel } from "../model/types";
import { CategoriesGrid } from "./CategoriesGrid";

export type CategoriesViewProps = {
  categories: CategoryRowViewModel[];
  deleteLoading?: boolean;
  onEdit: (category: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
};

export function CategoriesView({
  categories,
  deleteLoading,
  onEdit,
  onDelete,
}: CategoriesViewProps) {
  return (
    <div className="aurora-surface" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <CategoriesGrid
        rows={categories}
        onEdit={onEdit}
        onDelete={onDelete}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}
