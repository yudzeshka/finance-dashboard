import { Button } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";

import type { CategoryFormValues, CategoryRowViewModel } from "../model/types";
import { CategoryFormModal } from "./CategoryFormModal";
import { CategoriesGrid } from "./CategoriesGrid";

export type CategoriesViewProps = {
  categories: CategoryRowViewModel[];
  loading?: boolean;
  errorMessage?: string | null;
  deleteLoading?: boolean;

  isModalOpen: boolean;
  modalTitle: string;
  confirmLoading?: boolean;
  form: FormInstance<CategoryFormValues>;
  isIconPickerOpen: boolean;
  selectedIcon: string;

  onAddClick: () => void;
  onEdit: (category: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
  onModalOk: () => void;
  onModalCancel: () => void;
  onIconPickerOpenChange: (open: boolean) => void;
  onIconSelect: (key: string) => void;
};

export function CategoriesView({
  categories,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loading: _loading,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMessage: _errorMessage,
  deleteLoading,
  isModalOpen,
  modalTitle,
  confirmLoading,
  form,
  isIconPickerOpen,
  selectedIcon,
  onAddClick,
  onEdit,
  onDelete,
  onModalOk,
  onModalCancel,
  onIconPickerOpenChange,
  onIconSelect,
}: CategoriesViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <AppShell
        title={t("categories")}
        subtitle={t("categoriesSubtitle")}
        primaryAction={
          <Button type="primary" onClick={onAddClick}>
            {t("addCategory")}
          </Button>
        }
      >
        <div className="aurora-surface" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <CategoriesGrid
            rows={categories}
            onEdit={onEdit}
            onDelete={onDelete}
            deleteLoading={deleteLoading}
          />
        </div>
      </AppShell>

      <CategoryFormModal
        open={isModalOpen}
        title={modalTitle}
        confirmLoading={confirmLoading}
        form={form}
        isIconPickerOpen={isIconPickerOpen}
        onIconPickerOpenChange={onIconPickerOpenChange}
        onIconSelect={onIconSelect}
        selectedIcon={selectedIcon}
        onOk={onModalOk}
        onCancel={onModalCancel}
      />
    </>
  );
}
